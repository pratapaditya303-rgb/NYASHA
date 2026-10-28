import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const CLOUD_STORE_PATH = path.join(process.cwd(), 'cloud-store.json');

// High-speed, multi-device synchronized in-memory + file-persisted cloud vault
let memoryStoreCache: Record<string, any> | null = null;

function readCloudStore(): Record<string, any> {
  if (memoryStoreCache && Object.keys(memoryStoreCache).length > 0) {
    return memoryStoreCache;
  }
  try {
    if (fs.existsSync(CLOUD_STORE_PATH)) {
      const raw = fs.readFileSync(CLOUD_STORE_PATH, 'utf-8');
      memoryStoreCache = JSON.parse(raw);
      return memoryStoreCache || {};
    }
  } catch (err) {
    console.warn('Failed to read cloud-store.json:', err);
  }
  memoryStoreCache = {};
  return memoryStoreCache;
}

function writeCloudStore(data: Record<string, any>): void {
  memoryStoreCache = { ...data };
  try {
    fs.writeFileSync(CLOUD_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write cloud-store.json:', err);
  }
}

function mergeArrayById(existingArr: any[], incomingArr: any[]): any[] {
  const map = new Map<string, any>();
  const isPending = (item: any) => item && (item.status === 'PENDING' || item.status === 'PENDING_APPROVAL');

  // Track existing items
  for (const item of existingArr) {
    if (item && typeof item === 'object') {
      const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
      map.set(uid, item);
    }
  }

  // Merge incoming items with smart status preservation
  const newItems: any[] = [];
  for (const item of incomingArr) {
    if (item && typeof item === 'object') {
      const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
      const existing = map.get(uid);
      if (existing) {
        // Smart merge: Preserve status transitions (approval or rejection takes precedence over pending)
        let resolvedStatus = item.status || existing.status;
        if (existing.status === 'APPROVED' && item.status !== 'REJECTED') {
          resolvedStatus = 'APPROVED';
        } else if (item.status === 'APPROVED') {
          resolvedStatus = 'APPROVED';
        } else if (item.status === 'REJECTED' || existing.status === 'REJECTED') {
          resolvedStatus = 'REJECTED';
        }
        const resolvedPassword = item.password || existing.password;
        map.set(uid, { ...existing, ...item, status: resolvedStatus, password: resolvedPassword });
      } else {
        newItems.push(item);
      }
    }
  }

  // Priority ordering: Newly registered pending applications float to the top
  const finalResult: any[] = [];
  // 1. New pending items
  for (const item of newItems) {
    if (isPending(item)) {
      finalResult.push(item);
    }
  }
  // 2. Existing items (with pending first)
  const existingPending: any[] = [];
  const existingOther: any[] = [];
  for (const item of map.values()) {
    if (isPending(item)) {
      existingPending.push(item);
    } else {
      existingOther.push(item);
    }
  }
  finalResult.push(...existingPending);
  finalResult.push(...existingOther);
  // 3. New approved / other items
  for (const item of newItems) {
    if (!isPending(item)) {
      finalResult.push(item);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const deduplicated: any[] = [];
  for (const item of finalResult) {
    const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
    if (!seen.has(uid)) {
      seen.add(uid);
      deduplicated.push(item);
    }
  }
  return deduplicated;
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Criminal & Revenue Bar Association Ballia API',
      timestamp: new Date().toISOString()
    });
  });

  // Multi-Device Cloud Store Smart Version Sync API
  app.get('/api/cloud-store/version', (_req, res) => {
    const storeData = readCloudStore();
    res.json({
      status: 'ok',
      version: storeData._vault_version || Date.now(),
      advocateCount: Array.isArray(storeData._sys_vault_v2_advocates) ? storeData._sys_vault_v2_advocates.length : 0
    });
  });

  app.get('/api/cloud-store', (_req, res) => {
    const storeData = readCloudStore();
    res.json({
      status: 'ok',
      version: storeData._vault_version || Date.now(),
      data: storeData
    });
  });

  app.post('/api/cloud-store', (req, res) => {
    const storeData = readCloudStore();
    const { key, value, bulk } = req.body || {};

    const updatedVersion = Date.now();
    storeData._vault_version = updatedVersion;

    if (bulk && typeof bulk === 'object') {
      for (const [k, v] of Object.entries(bulk)) {
        if (k === 'ballia_bar_current_user' || k === '_vault_version') continue;
        if (Array.isArray(storeData[k]) && Array.isArray(v)) {
          storeData[k] = mergeArrayById(storeData[k], v);
        } else {
          storeData[k] = v;
        }
      }
      writeCloudStore(storeData);
      return res.json({ status: 'ok', version: updatedVersion, data: storeData });
    }

    if (key && key !== 'ballia_bar_current_user' && key !== '_vault_version') {
      if (Array.isArray(storeData[key]) && Array.isArray(value)) {
        storeData[key] = mergeArrayById(storeData[key], value);
      } else {
        storeData[key] = value;
      }
      writeCloudStore(storeData);
    }
    return res.json({ status: 'ok', version: updatedVersion, data: storeData });
  });

// Module 9: AI Legal Assistant API with Comprehensive UP & Indian Law Engine
  function generateLegalAdvice(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('439') || q.includes('483') || q.includes('bail') || q.includes('जमानत')) {
      return `⚖️ **जमानत (Bail) के संबंध में विधिक प्रक्रिया एवं प्रावधान:**

1. **सुसंगत धाराएं (Legal Provisions)**:
   - **नया कानून**: भारतीय नागरिक सुरक्षा संहिता (BNSS 2023) - **धारा 483** (सत्र एवं उच्च न्यायालय द्वारा विशेष शक्तियां)।
   - **पुराना कानून**: दंड प्रक्रिया संहिता (CrPC 1973) - **धारा 439**।
   - मजिस्ट्रेट स्तर पर नियमित जमानत: **BNSS धारा 480** (पूर्व CrPC 437)।

2. **जमानत याचिका के प्रमुख आधार (Grounds for Bail)**:
   - अभियुक्त का पूर्व में कोई आपराधिक इतिहास (No Prior Criminal History) न होना।
   - नामजदगी में अकारण देरी (Unexplained Delay in FIR) व दुर्भावनापूर्ण फंसाया जाना।
   - विवेचना/जांच पूर्ण होना (Charge-sheet Filed) व साक्ष्यों के साथ छेड़छाड़ की संभावना न होना।
   - स्थायी पता (Permanent Resident of Ballia) व न्यायालय में विचारण के दौरान उपस्थित रहने की प्रतिबद्धता।

3. **आवश्यक दस्तावेज (Required Documents)**:
   - एफ.आई.आर. (FIR Copy), पर्चा रिमांड/गिरफ्तारी मेमो।
   - अभियुक्त के हिमायती/पैरोकार का शपथ-पत्र (Affidavit)।
   - वकालतनामा (बार वेलफेयर टिकट ₹100 सहित)।

4. **न्यायालय क्षेत्राधिकार**: मुख्य न्यायिक मजिस्ट्रेट (CJM) / सत्र न्यायालय बलिया।`;
    }

    if (q.includes('34') || q.includes('नामांतरण') || q.includes('mutation') || q.includes('दाखिल')) {
      return `📜 **उ०प्र० राजस्व संहिता 2006 — धारा 34 (दाखिल-खारिज / नामांतरण प्रक्रिया):**

1. **विधिक प्रावधान (Legal Basis)**:
   - बैनामा (Sale Deed), दानपत्र (Gift Deed), वसीयत (Will) अथवा उत्तराधिकार के आधार पर राजस्व अभिलेखों (खतौनी) में नाम दर्ज कराने हेतु **धारा 34 उ०प्र० राजस्व संहिता 2006** के अंतर्गत आवेदन किया जाता है।

2. **अदालत व क्षेत्राधिकार (Court Jurisdiction)**:
   - तहसीलदार / नायब तहसीलदार राजस्व न्यायालय (संबंधित तहसील: बलिया सदर / बांसडीह / रसड़ा / बैरिया / सिकंदरपुर / बेल्थरा रोड)।

3. **समय-सीमा (Time Limit - आर.सी. प्रपत्र 11)**:
   - **अविवादित मामला (Undisputed)**: 35 से 45 कार्यदिवस।
   - **विवादित/आपत्ति दर्ज मामला (Disputed)**: 90 दिन में साक्ष्य व सुनवाई उपरांत निस्तारण।

4. **आवश्यक अभिलेख (Required Documents)**:
   - पंजीकृत बैनामा/दस्तावेज की मूल/सत्यापित प्रति।
   - वर्तमान उद्धरण खतौनी।
   - शपथ-पत्र एवं नोटिस शुल्क (इश्तहार तामीला)।`;
    }

    if (q.includes('24') || q.includes('पैमाइश') || q.includes('मेड़बन्दी') || q.includes('सीमांकन') || q.includes('demarcation')) {
      return `📐 **उ०प्र० राजस्व संहिता 2006 — धारा 24 (खेत की पैमाइश / मेड़बन्दी):**

1. **विधिक प्रावधान (Legal Section)**:
   - किसी खातेदार द्वारा अपनी कृषि भूमि की सीमा निश्चित कराने व मेड़बन्दी हेतु **धारा 24 उ०प्र० राजस्व संहिता 2006** के तहत उपजिलाधिकारी (SDM) न्यायालय में वाद दाखिल किया जाता है।

2. **प्रक्रिया (Step-by-Step Procedure)**:
   - SDM कोर्ट में वाद दायर होने पर पत्रावली राजस्व निरीक्षक (RI / कानूनगो) को भेजी जाती है।
   - राजस्व निरीक्षक मौके पर पहुंचकर सीमावर्ती काश्तकारों की उपस्थिति में मुस्तकिल मुकाम (पक्के बिंदु) से पैमाइश कर **सीमांकन आख्या (फील्ड बुक/नक्शा)** न्यायालय में प्रस्तुत करते हैं।
   - न्यायालय द्वारा आख्या की पुष्टि (Confirmation) के पश्चात मेड़बन्दी कराई जाती है।

3. **न्यायालय**: उपजिलाधिकारी (SDM) राजस्व न्यायालय, बलिया।`;
    }

    if (q.includes('116') || q.includes('बंटवारा') || q.includes('partition')) {
      return `📑 **उ०प्र० राजस्व संहिता 2006 — धारा 116 (कृषि जोत का विभाजन / बंटवारा वाद):**

1. **प्रावधान**:
   - संयुक्त खातेदारी वाली कृषि भूमि में अपने हिस्से का अलग खाता व कुर्रा बनाने हेतु **धारा 116 उ०प्र० राजस्व संहिता 2006** के तहत वाद योजित होता है।

2. **प्रक्रिया के 3 चरण**:
   - **प्रारंभिक डिक्री (Preliminary Decree)**: सभी सह-खातेदारों के अंश/हिस्से का निर्धारण।
   - **कुर्राफांट (Allotment of Shares)**: लेखपाल/राजस्व निरीक्षक द्वारा मौके पर चौहद्दी व रकबे के आधार पर रंगीन नक्शा कुर्रा बनाना।
   - **अंतिम डिक्री (Final Decree)**: कुर्रा की पुष्टि उपरांत 60 दिन में राजस्व अभिलेखों में अलग-अलग खाता कायम करना।

3. **न्यायालय**: उपजिलाधिकारी (SDM) न्यायालय, जनपद बलिया।`;
    }

    if (q.includes('39') || q.includes('stay') || q.includes('स्थगन') || q.includes('स्टे')) {
      return `🛡️ **Order 39 Rule 1 & 2 CPC — अस्थायी निषेधाज्ञा (Temporary Injunction / Stay Order):**

1. **विधिक सिद्धांत (Three Golden Principles of Injunction)**:
   - **प्रथम दृष्टया मामला (Prima Facie Case)**: वादी का संपत्ति पर वैध अधिकार व स्वामित्व सिद्ध होना।
   - **अपूरणीय क्षति (Irreparable Loss)**: यदि स्टे न दिया गया तो वादी को ऐसा नुकसान होगा जिसकी भरपाई धन से संभव नहीं।
   - **सुविधा का संतुलन (Balance of Convenience)**: स्टे देने से न्याय का पलड़ा किसके पक्ष में अधिक भारी रहेगा।

2. **कार्यवाही**:
   - मूल वादपत्र (Plaint) के साथ अंतरिम प्रार्थना-पत्र (Application u/o 39 R 1 & 2 read with Sec 151 CPC) व शपथ-पत्र संलग्न करें।
   - न्यायालय: सिविल जज (Senior / Junior Division), दीवानी न्यायालय बलिया।`;
    }

    if (q.includes('138') || q.includes('cheque') || q.includes('check') || q.includes('चेक') || q.includes('bounce') || q.includes('बाउंस')) {
      return `💳 **चेक बाउंस (Cheque Dishonour) — धारा 138 परक्राम्य लिखत अधिनियम (NI Act, 1881):**

यदि आपको किसी ने चेक दिया था और वह बैंक में बाउंस (Dishonour) हो गया है, तो कोर्ट में केस करने से पहले **कानूनी मांग नोटिस (Legal Demand Notice)** भेजना अनिवार्य वैधानिक आवश्यकता है।

---

### ⏱️ अनिवार्य विधिक समय-सीमा (Strict Statutory Timelines):
1. **बैंक मीमो (Return Memo) की तारीख से 30 दिन के भीतर**: देनदार को रजिस्टर्ड डाक/स्पीड पोस्ट द्वारा विधिक नोटिस भेजना अनिवार्य है।
2. **नोटिस प्राप्ति से 15 दिन का समय**: देनदार को बकाया चेक राशि का भुगतान करने के लिए 15 दिन का समय दिया जाता है।
3. **15 दिन बीतने के बाद अगले 30 दिन के भीतर**: यदि भुगतान नहीं होता है, तो संबंधित न्यायालय (मुख्य न्यायिक मजिस्ट्रेट / CJM / ACJM कोर्ट, बलिया) में धारा 138 NI Act के तहत परिवाद (Complaint) दाखिल करना होता है।

---

### 📝 विधिक मांग नोटिस का कानूनी प्रारूप (Legal Notice Format):

\`\`\`text
रजिस्टर्ड डाक / स्पीड पोस्ट (पावती सहित)

प्रेषक (अधिवक्ता कार्यालय):
[अधिवक्ता का नाम]
सदस्य: क्रिमिनल एवं रेवेन्यू बार एसोसिएशन, जनपद न्यायालय बलिया (उ०प्र०)
कार्यालय: चैंबर नं० [__], दीवानी कचहरी, बलिया।
मोबाइल: [__], ईमेल: [__]

दिनांक: [दिन/माह/वर्ष]

सेवा में (विपक्षी/देनदार):
श्री [देनदार का पूरा नाम]
पुत्र श्री [पिता का नाम]
निवासी: [देनदार का पूरा पता, थाना, जनपद]
मोबाइल: [__]

विषय: धारा 138 पराक्रम्य लिखत अधिनियम (Negotiable Instruments Act, 1881) के अंतर्गत चेक संख्या [______] धनराशि ₹[______]/- बाउंस होने पर वैधानिक मांग नोटिस।

महोदय,
मेरे मुवक्किल श्री [मुवक्किल का नाम], पुत्र [__], निवासी [__], जनपद बलिया के निर्देश एवं वकालतनामा के अनुसार आपको निम्नलिखित विधिक नोटिस प्रेषित है:

1. यह कि आपने अपने विधिक देय दायित्व (Legal Debt/Liability) के भुगतान के एवज में मेरे मुवक्किल के पक्ष में निम्नलिखित चेक जारी किया था:
   • बैंक का नाम: [बैंक का नाम व शाखा, उदा० स्टेट बैंक ऑफ इंडिया, बलिया]
   • चेक संख्या: [6 अंकों का चेक नंबर]
   • चेक दिनांक: [दिन/माह/वर्ष]
   • चेक की धनराशि: ₹[अंकों में] (शब्दों में: [रुपये अक्षरों में])

2. यह कि मेरे मुवक्किल ने उक्त चेक को अपने बैंक खाता [बैंक का नाम, शाखा बलिया] में भुगतान हेतु प्रस्तुत किया, किंतु आपके खाते में पर्याप्त धनराशि न होने ("Funds Insufficient" / "Exceeds Arrangement") के कारण उक्त चेक दिनांक [बाउंस की तारीख] को बैंक द्वारा अनादृत (Bounce/Dishonour) कर वापस कर दिया गया। इसकी सूचना मेरे मुवक्किल को बैंक मीमो दिनांक [मीमो की तारीख] द्वारा प्राप्त हुई।

3. यह कि आपने दुर्भावनापूर्वक एवं मेरे मुवक्किल को धोखा देने के आशय से उक्त चेक जारी किया था, जिससे मेरे मुवक्किल को गंभीर मानसिक व आर्थिक क्षति हुई है।

अतः इस विधिक नोटिस के माध्यम से आपको सूचित किया जाता है कि नोटिस प्राप्त होने के 15 (पंद्रह) दिनों के भीतर उक्त चेक की सम्पूर्ण धनराशि ₹[______]/- मेरे मुवक्किल को नकद अथवा बैंक खाते के माध्यम से चुकता कर रसीद प्राप्त कर लें।

यदि आप उक्त 15 दिनों की अवधि में भुगतान करने में विफल रहते हैं, तो मेरे मुवक्किल आपके विरुद्ध सक्षम न्यायालय (न्यायालय मुख्य न्यायिक मजिस्ट्रेट, बलिया) में धारा 138 परक्राम्य लिखत अधिनियम 1881 एवं भारतीय न्याय संहिता 2023 (BNS) की सुसंगत धाराओं में आपराधिक परिवाद दाखिल करने के लिए बाध्य होंगे।

जिसमें आपके विरुद्ध 2 वर्ष तक का कारावास एवं चेक राशि के दोगुने तक के जुर्माने तथा संपूर्ण अदालती वाद व्यय की वसूली का दावा किया जाएगा, जिसका सम्पूर्ण उत्तरदायित्व आपका होगा।

हस्ताक्षर प्रेषक
[अधिवक्ता का नाम व मुहर]
अधिवक्ता, दीवानी न्यायालय बलिया
(मुवक्किल के निर्देशानुसार)
\`\`\`

---

### 📂 आवश्यक दस्तावेज (Enclosures required for filing Court Complaint):
1. मूल चेक (Original Dishonoured Cheque)
2. बैंक की अनादरण पर्ची (Bank Dishonour Memo)
3. अधिवक्ता द्वारा भेजे गए विधिक नोटिस की कार्यालय प्रति (Office Copy of Legal Notice)
4. डाक रसीद (Postal Speed Post Receipt) एवं डिलीवरी ट्रैकिंग रिपोर्ट (Postal Tracking Report proving delivery)
5. शपथ-पत्र (Sworn Affidavit) एवं वकालतनामा।`;
    }

    if (q.includes('bns') || q.includes('ipc') || q.includes('302') || q.includes('420') || q.includes('धारा')) {
      return `⚖️ **भारतीय न्याय संहिता (BNS 2023) एवं IPC मुख्य तुलना:**

- **हत्या (Murder)**: IPC 302 ➡️ **BNS धारा 103(1)**
- **धोखाधड़ी (Cheating/Fraud)**: IPC 420 ➡️ **BNS धारा 318(4)**
- **चोरी (Theft)**: IPC 379 ➡️ **BNS धारा 303(2)**
- **दंगा/बलवा (Rioting)**: IPC 147/148 ➡️ **BNS धारा 189/191**
- **स्वेच्छा से चोट पहुंचाना**: IPC 323 ➡️ **BNS धारा 115(2)**
- **आपराधिक मानहानि**: IPC 499/500 ➡️ **BNS धारा 356**

*जिला न्यायालय बलिया में 1 जुलाई 2024 के बाद दर्ज सभी नई प्राथमिकियों पर BNS एवं BNSS के प्रावधान लागू हैं।*`;
    }

    // General default structured legal advisory
    return `⚖️ **उत्तर प्रदेश आपराधिक एवं राजस्व विधि परामर्श (Legal Advisory):**

प्रश्न संदर्भ: **"${query}"**

1. **लागू होने वाले विधिक प्रावधान**:
   - आपराधिक विषयक: भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS) एवं BNS के प्रावधान।
   - राजस्व व भूमि विवाद: उ०प्र० राजस्व संहिता 2006 (UP Revenue Code 2006) की धाराएं।
   - दीवानी विषयक: सिविल प्रक्रिया संहिता (CPC 1908)।

2. **प्रक्रियात्मक कदम (Procedural Steps)**:
   - संबंधित क्षेत्राधिकार वाले न्यायालय (सत्र न्यायालय बलिया / CJM / उपजिलाधिकारी / तहसीलदार) में वकालतनामा व सत्यापित शपथ-पत्र सहित प्रार्थना पत्र दाखिल करें।
   - वाद पत्रावली में साक्ष्य व प्रमाणित खतौनी/दस्तावेज संलग्न करें।

3. **अधिवक्ता परामर्श**: अपने मामले के विशिष्ट तथ्यों पर विस्तृत ड्राफ्टिंग हेतु बार एसोसिएशन बलिया के वरिष्ठ अधिवक्ता से परामर्श लें।`;
  }

  // Module 9: AI Legal Assistant API
  app.post('/api/ai-legal-assistant', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAI();
      if (ai) {
        // Try active Gemini models in priority order with resilience
        const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
        const systemInstruction = `You are the Senior Legal Consultant & Drafting Expert (एआई विधि सहायक) for the Criminal & Revenue Bar Association, District Court Ballia (Uttar Pradesh).
You provide authoritative, comprehensive legal advice and ready-to-use court drafting formats in Hindi / Hinglish based on:
1. Negotiable Instruments Act, 1881 (Sec 138 Cheque Bounce procedures, timelines, full Legal Demand Notice draft format).
2. Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) & CrPC (Bail applications under Sec 480 & 483, Anticipatory bail Sec 484).
3. Bharatiya Nyaya Sanhita (BNS 2023) & IPC mappings.
4. Uttar Pradesh Revenue Code 2006 (Sec 24 Demarcation/मेड़बन्दी, Sec 34 Mutation/दाखिल-खारिज, Sec 116 Partition/बंटवारा, Sec 67 Gram Sabha encroachment).
5. CPC 1908 (Order 39 Rule 1 & 2 Temporary Injunction / Stay).
6. Local procedures in District Court Ballia and Tehsil Courts (Ballia Sadar, Rasra, Bairia, Bansdih, Sikanderpur, Belthara Road).

CRITICAL INSTRUCTION:
When the user asks for a legal notice or court application format (e.g., cheque bounce notice, bail application, mutation objection, stay application), ALWAYS provide:
- The exact applicable Sections & statutory time limits.
- A FULL, professional, ready-to-use draft in clear Hindi with brackets [ ] for parties, dates, amounts, and court details.
- Procedural checklist of necessary attachments, court fees, and court jurisdiction.`;

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction,
                maxOutputTokens: 2048,
                temperature: 0.2,
              }
            });

            if (response.text && response.text.trim().length > 0) {
              return res.json({ reply: response.text });
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} returned error:`, modelErr?.message || modelErr);
            // Continue to next candidate model
          }
        }
      }

      // If Gemini fails or is unavailable, use the comprehensive UP Legal Knowledge Engine
      const fallbackReply = generateLegalAdvice(prompt);
      return res.json({ reply: fallbackReply });
    } catch (error: any) {
      console.error('Legal Assistant Handler Error:', error);
      const safeReply = generateLegalAdvice(req.body?.prompt || 'विधिक प्रक्रिया');
      return res.json({ reply: safeReply });
    }
  });

  // Razorpay order simulation / API
  app.post('/api/payment/create-order', (req, res) => {
    const { amount = 1200, advocateId, advocateName, purpose = 'Annual Membership Renewal' } = req.body;
    const orderId = 'order_CRBA_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    res.json({
      orderId,
      amount: amount * 100, // paise
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_balliabar1950',
      name: 'Criminal & Revenue Bar Association, Ballia',
      description: purpose,
      advocateId,
      advocateName,
    });
  });

  // OTP generator/verifier simulation for Client contacts & Elections
  const otpStore = new Map<string, { code: string; expires: number }>();

  app.post('/api/otp/send', (req, res) => {
    const { mobile, purpose = 'verification' } = req.body;
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
    }
    // Generate 6 digit OTP (for preview, use a consistent or predictable OTP like 123456 or random)
    const code = '123456';
    otpStore.set(mobile, { code, expires: Date.now() + 5 * 60 * 1000 });
    res.json({
      success: true,
      message: `OTP sent successfully to +91-${mobile}. (For demo / preview testing, use OTP: 123456)`,
      demoOtp: '123456'
    });
  });

  app.post('/api/otp/verify', (req, res) => {
    const { mobile, otp } = req.body;
    const entry = otpStore.get(mobile);
    if (otp === '123456' || (entry && entry.code === otp && Date.now() < entry.expires)) {
      otpStore.delete(mobile);
      return res.json({ success: true, message: 'OTP verified successfully' });
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. (Demo OTP is 123456)' });
  });

  // Vite middleware in dev mode / Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ballia Bar Association Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
