import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Advocate, Client, Earning } from '../types';

/**
 * Draws the official Advocate Bands Seal Logo vectorially in the PDF.
 * Consists of:
 * 1. Dark circular outer background
 * 2. Concentric white inner ring
 * 3. Classic white advocate collar/bowtie
 * 4. Dual white legal neck bands
 */
export function drawAdvocateLogoInPdf(doc: jsPDF, cx: number, cy: number, radius: number): void {
  // Dark circle background
  doc.setFillColor(34, 34, 34); // #222222
  doc.circle(cx, cy, radius, 'F');

  // White inner concentric ring
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(Math.max(0.2, radius * 0.05));
  doc.circle(cx, cy, radius * 0.92, 'S');

  // Scaling factor based on standard 512x512 viewBox centered at (256, 256)
  const s = radius / 256;
  const ox = cx - radius;
  const oy = cy - radius;
  const px = (x: number) => ox + x * s;
  const py = (y: number) => oy + y * s;

  doc.setFillColor(255, 255, 255);

  // Collar / Bowtie
  doc.triangle(px(256), py(142), px(164), py(92), px(138), py(202), 'F');
  doc.triangle(px(256), py(142), px(138), py(202), px(208), py(170), 'F');
  doc.triangle(px(256), py(142), px(208), py(170), px(256), py(170), 'F');
  doc.triangle(px(256), py(142), px(256), py(170), px(304), py(170), 'F');
  doc.triangle(px(256), py(142), px(304), py(170), px(374), py(202), 'F');
  doc.triangle(px(256), py(142), px(374), py(202), px(348), py(92), 'F');

  // Left Band
  doc.triangle(px(208), py(170), px(248), py(170), px(218), py(422), 'F');
  doc.triangle(px(208), py(170), px(218), py(422), px(142), py(422), 'F');

  // Right Band
  doc.triangle(px(264), py(170), px(304), py(170), px(370), py(422), 'F');
  doc.triangle(px(264), py(170), px(370), py(422), px(294), py(422), 'F');
}

/**
 * Loads image as data URL for embedding in jsPDF (safely handling CORS/offline)
 */
async function getImageUrlAsDataUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 120;
        canvas.height = img.naturalHeight || 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateAdvocateIDCardPDF(advocate: Advocate): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98] // Standard CR80 ID Card dimensions (ISO/IEC 7810)
  });

  // Generate QR Code data URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://barballia.com';
  const verifyUrl = `${origin}/#verify/${encodeURIComponent((advocate.barNo || '').replace(/\//g, '_'))}`;
  
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QR Code generation failed, using vector fallback', err);
  }

  // Pre-fetch advocate photo if available
  const photoDataUrl = await getImageUrlAsDataUrl(advocate.photoUrl);

  // FRONT SIDE
  // Background Header & Body
  doc.setFillColor(15, 23, 42); // #0f172a Navy
  doc.rect(0, 0, 85.6, 14, 'F');

  // Official Advocate Bands Logo in Header (Left)
  drawAdvocateLogoInPdf(doc, 7.5, 7, 5);

  // Gold accent line
  doc.setFillColor(212, 175, 55); // #d4af37 Gold
  doc.rect(0, 14, 85.6, 1.2, 'F');

  // Header Title
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('CRIMINAL & REVENUE BAR ASSOCIATION', 48, 5, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.text('DISTRICT COURT CAMPUS, BALLIA (U.P.) - ESTD. 1950', 48, 9, { align: 'center' });
  
  doc.setTextColor(190, 200, 220);
  doc.setFontSize(4.5);
  doc.text('AFFILIATED TO BAR COUNCIL OF UTTAR PRADESH', 48, 12.5, { align: 'center' });

  // Body Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 15.2, 85.6, 38.78, 'F');

  // Photo Box Left
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.roundedRect(4, 17.5, 19, 24.5, 1, 1, 'FD');

  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, 'JPEG', 4, 17.5, 19, 24.5);
    } catch {
      // Fallback text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.setTextColor(100, 116, 139);
      doc.text('PHOTO', 13.5, 30, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.setTextColor(100, 116, 139);
    doc.text('PHOTO', 13.5, 30, { align: 'center' });
  }

  // Real Verification QR Code Box (Right Side)
  doc.setDrawColor(212, 175, 55);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(63.5, 17.5, 18, 18, 1, 1, 'FD');

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 64, 18, 17, 17);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SCAN TO VERIFY', 72.5, 38, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(3);
  doc.setTextColor(100, 116, 139);
  doc.text(`BAR: ${advocate.barNo}`, 72.5, 40.5, { align: 'center' });

  // Advocate Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text((advocate.name || '').toUpperCase(), 25, 20.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(71, 85, 105);
  doc.text(`S/o: ${advocate.fatherName || '---'}`, 25, 24);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`BAR COUNCIL NO: ${advocate.barNo || ''}`, 25, 27.5);
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`COP NO: ${advocate.copNo || 'COP/UP/VERIFIED'}`, 25, 31);
  doc.text(`DOB: ${advocate.dob || ''} (Age: ${advocate.age || 40} Yrs)`, 25, 34);
  doc.text(`MOBILE: +91-${advocate.mobile || ''}`, 25, 37);

  // Address & Chamber
  const addrText = `${advocate.address?.village || ''}, Tahsil: ${advocate.address?.tahsil || 'Ballia Sadar'}, Ballia`;
  doc.text(`ADDRESS: ${addrText.slice(0, 30)}`, 25, 40);
  doc.text(`CHAMBER: ${advocate.chamberNo || 'District Court Bar Hall, Ballia'}`, 25, 43);

  // Footer Validity Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 47, 85.6, 7, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(212, 175, 55);
  doc.text(`VALID TILL: ${advocate.validTill || '31/12/2026'}`, 5, 51.5);
  
  doc.setTextColor(255, 255, 255);
  doc.text('GEN. SECRETARY', 55, 51.5);
  doc.text('PRESIDENT', 72, 51.5);

  // BACK SIDE (Page 2)
  doc.addPage([85.6, 53.98], 'landscape');
  
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 85.6, 8, 'F');

  // Draw Advocate Logo on Back Header
  drawAdvocateLogoInPdf(doc, 5.5, 4, 3);

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('IMPORTANT TERMS & BAR RULES', 42.8, 5.5, { align: 'center' });

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 8, 85.6, 46, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. This card is official identification of member of Ballia Bar Association.', 4, 13);
  doc.text('2. Entitles advocate to practice in District & Revenue Courts of Ballia.', 4, 17);
  doc.text('3. Loss of this card must be immediately reported to the Bar Office.', 4, 21);
  doc.text('4. In emergency or police station inquiries, verify at: barballia.com/verify', 4, 25);
  doc.text(`5. Practice Areas: ${advocate.specialization.join(', ') || 'ALL COURTS'}`, 4, 29);
  doc.text(`6. Chamber: ${advocate.chamberNo || 'District Court Bar Hall, Ballia'}`, 4, 33);

  // Association Contact Block
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(4, 36, 77.6, 12, 1, 1, 'F');

  // Advocate Logo inside Association Contact Block
  drawAdvocateLogoInPdf(doc, 9, 42, 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CRIMINAL & REVENUE BAR ASSOCIATION, BALLIA (U.P.)', 45, 40, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Helpline: +91 9415988800 | Web: sahayogifoundation.in', 45, 44, { align: 'center' });

  doc.save(`Ballia_Bar_ID_Card_${advocate.barNo.replace(/\//g, '_')}.pdf`);
}

// Module 5: Advocate Slip Generator
export function generateAdvocateSlipPDF(advocate: Advocate, client: Client): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Outer Legal Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);

  // Header Letterhead
  doc.setFillColor(15, 23, 42);
  doc.rect(13, 13, 184, 28, 'F');

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CRIMINAL & REVENUE BAR ASSOCIATION, BALLIA', 105, 23, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('DISTRICT & SESSIONS COURT / REVENUE COURTS CAMPUS, BALLIA (U.P.)', 105, 30, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('ADVOCATE CASE SLIP & ENGAGEMENT MEMO (अधिवक्ता वाद पर्ची)', 105, 36, { align: 'center' });

  // Advocate Details Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(13, 43, 184, 18, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ADVOCATE: ${(advocate.name || '').toUpperCase()}`, 18, 50);
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text(`BAR REGISTRATION NO: ${advocate.barNo || ''}`, 18, 57);
  
  doc.setTextColor(15, 23, 42);
  doc.text(`COP NO: ${advocate.copNo || 'VERIFIED'}`, 110, 50);
  doc.text(`MOBILE: +91-${advocate.mobile || ''}`, 110, 57);

  // Date & Slip Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString('en-GB')}`, 18, 68);
  doc.text(`Slip Reference: SLIP/BALLIA/${Date.now().toString().slice(-6)}`, 110, 68);

  // Separator Line
  doc.setDrawColor(203, 213, 225);
  doc.line(18, 72, 192, 72);

  // Case Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. CASE & FORUM PARTICULARS (वाद विवरण):', 18, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (client.caseTitle || client.caseNameVsName) {
    doc.text(`Case Title (पक्षकार):`, 22, 88);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.caseTitle || client.caseNameVsName}`, 70, 88);
    doc.setFont('helvetica', 'normal');
    doc.text(`Court Name / Forum:`, 22, 96);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.courtName}`, 70, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(`Case Number / Year:`, 22, 104);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.caseNo}`, 70, 104);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nature of Case:`, 22, 112);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${client.caseNature} (दीवानी / फौजदारी / राजस्व / वैवाहिक / एम.ए.सी.टी.)`, 70, 112);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Current Stage of Case:`, 22, 120);
    doc.text(`${client.caseStage || 'Pending Hearing'}`, 70, 120);
    doc.text(`Next Hearing Date:`, 22, 128);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`${client.nextHearingDate} (अगली पेशी दिनांक)`, 70, 128);
  } else {
    doc.text(`Court Name / Forum:`, 22, 90);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.courtName}`, 70, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Case Number / Year:`, 22, 98);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client.caseNo}`, 70, 98);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nature of Case:`, 22, 106);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${client.caseNature} (दीवानी / फौजदारी / राजस्व / वैवाहिक / एम.ए.सी.टी.)`, 70, 106);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Current Stage of Case:`, 22, 114);
    doc.text(`${client.caseStage || 'Pending Hearing'}`, 70, 114);
    doc.text(`Next Hearing Date:`, 22, 122);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`${client.nextHearingDate} (अगली पेशी दिनांक)`, 70, 122);
  }

  // Client Details Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. CLIENT (ENGAGER) PARTICULARS (मुवक्किल विवरण):', 18, 136);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Client Full Name:`, 22, 146);
  doc.setFont('helvetica', 'bold');
  doc.text(`${client.clientName}`, 70, 146);

  doc.setFont('helvetica', 'normal');
  doc.text(`Father's / Husband's Name:`, 22, 154);
  doc.text(`${client.clientFatherName || 'As per record'}`, 70, 154);

  doc.text(`Contact Mobile:`, 22, 162);
  doc.text(`+91-${client.clientMobile}`, 70, 162);

  const fullAddr = `${client.address.village}, Post: ${client.address.post}, Tahsil: ${client.address.tahsil}, Dist: ${client.address.district} - ${client.address.pincode}`;
  doc.text(`Residential Address:`, 22, 170);
  doc.text(fullAddr, 70, 170, { maxWidth: 120 });

  // Fee Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. FEE STRUCTURE & RECEIPT STATUS (शुल्क विवरण):', 18, 186);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Agreed Professional Fee: Rs. ${client.totalFees.toLocaleString('en-IN')}`, 22, 196);
  doc.text(`Amount Received: Rs. ${client.feesReceived.toLocaleString('en-IN')}`, 90, 196);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(client.feesPending > 0 ? 220 : 22, client.feesPending > 0 ? 38 : 101, client.feesPending > 0 ? 38 : 52);
  doc.text(`Balance Due: Rs. ${client.feesPending.toLocaleString('en-IN')}`, 145, 196);

  // Declaration & Verification
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text('Note: This slip confirms legal representation before the court of law in Ballia. Client is requested to bring this slip and all documentary records on every scheduled court date.', 18, 215, { maxWidth: 174 });

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Signature / LTI of Client', 30, 260);
  doc.text('(मुवक्किल का हस्ताक्षर / अंगूठा निशान)', 25, 265);

  doc.text('Signature of Advocate', 140, 260);
  doc.text(`Adv. ${advocate.name}`, 140, 265);
  doc.text(`Bar No: ${advocate.barNo}`, 140, 270);

  doc.save(`Advocate_Slip_${client.clientName.replace(/\s+/g, '_')}_${client.caseNo.replace(/\//g, '-')}.pdf`);
}

// Module 5: Vakalatnama Generator (वकालतनामा - High Court & District Court Bilingual Format)
export function generateVakalatnamaPDF(advocate: Advocate, client: Client): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Decorative Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, 186, 273);

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('VAKALATNAMA / वकालतनामा', 105, 22, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('IN THE DISTRICT & SESSIONS COURT / REVENUE COURTS, BALLIA (U.P.)', 105, 28, { align: 'center' });

  // Case particulars
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 33, 182, 28, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 33, 182, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`COURT: ${(client.courtName || '').toUpperCase()}`, 18, 40);
  doc.text(`CASE NUMBER: ${client.caseNo || ''}`, 18, 47);
  doc.text(`NATURE OF CASE: ${client.caseNature || ''}`, 18, 54);

  doc.text(`DATE OF ENGAGEMENT: ${new Date().toLocaleDateString('en-GB')}`, 120, 40);
  doc.text(`NEXT HEARING: ${client.nextHearingDate || ''}`, 120, 47);

  // Cause Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Petitioner / Complainant / Plaintiff:`, 18, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(`${client.clientName || ''} S/o ${client.clientFatherName || '---'} R/o ${client.address?.village || ''}, Tahsil ${client.address?.tahsil || 'Ballia Sadar'}, Ballia`, 18, 74, { maxWidth: 174 });

  doc.setFont('helvetica', 'bold');
  doc.text('VERSUS / बनाम', 105, 82, { align: 'center' });

  doc.text(`Opposite Party / Respondent / Accused:`, 18, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`State of Uttar Pradesh / Other Party (As per Case Record)`, 18, 96);

  // Legal Body of Vakalatnama (Hindi & English legal text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LEGAL ENGAGEMENT AUTHORIZATION / अधिकार पत्र:', 18, 108);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const legalTextEnglish = `I / We, the undersigned client(s) named above, do hereby appoint, retain and authorize Advocate ${advocate.name} (Bar Council Registration No: ${advocate.barNo}, COP No: ${advocate.copNo || 'COP/UP/VERIFIED'}), Member of Criminal & Revenue Bar Association Ballia, as my/our true and lawful Advocate and Legal Counsel in the aforesaid case.
I/We authorize the said Advocate to appear, act, plead, sign plaints, written statements, affidavits, bail bonds, revisions, appeals, compromise petitions, withdraw or deposit court monies, inspect records, obtain certified copies, and perform all necessary judicial acts as if I/we were personally present.`;

  doc.text(legalTextEnglish, 18, 115, { maxWidth: 174, align: 'justify', lineHeightFactor: 1.4 });

  const legalTextHindi = `मैं/हम मुवक्किल उपरोक्त मामले में विद्वान अधिवक्ता श्री ${advocate.name}, बार काउंसिल पंजीकरण संख्या ${advocate.barNo} को अपने वाद की समस्त पैरवी, बहस, वकालतनामा दाखिला, बयान, साक्ष्य, सुलहनामा व अपील/निगरानी हेतु अपना अधिकृत अधिवक्ता नियुक्त करता हूँ। उनके द्वारा की गई समस्त वैधानिक कार्यवाही मुझे पूर्ण रूपेण मान्य व स्वीकार्य होगी।`;

  doc.setFont('helvetica', 'italic');
  doc.text(legalTextHindi, 18, 146, { maxWidth: 174, align: 'justify', lineHeightFactor: 1.4 });

  // Bar Association Stamp Block
  doc.setDrawColor(212, 175, 55);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(18, 172, 174, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text('CRIMINAL & REVENUE BAR ASSOCIATION, BALLIA (U.P.) - VERIFIED MEMBER', 105, 179, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Advocate Name: ${advocate.name} | Bar No: ${advocate.barNo} | Chamber: ${advocate.chamberNo || 'Bar Block, Ballia'}`, 105, 185, { align: 'center' });
  doc.text(`Mobile: +91-${advocate.mobile} | Valid Membership Certified by Bar Association Office`, 105, 191, { align: 'center' });

  // Signatures Area
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Signature / LTI of Client (मुवक्किल)', 22, 245);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Name: ${client.clientName}`, 22, 251);
  doc.text(`Mob: +91-${client.clientMobile}`, 22, 256);
  doc.text(`Address: ${client.address.village}, Ballia`, 22, 261);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Accepted by Advocate (स्वीकृत)', 130, 245);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Adv. ${advocate.name}`, 130, 251);
  doc.text(`Bar Council No: ${advocate.barNo}`, 130, 256);
  doc.text(`Chamber: ${advocate.chamberNo || 'Ballia Court'}`, 130, 261);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 130, 266);

  doc.save(`Vakalatnama_${client.clientName.replace(/\s+/g, '_')}_${client.caseNo.replace(/\//g, '-')}.pdf`);
}

// Module 5: Affidavit Generator (शपथ पत्र / Affidavit Format)
export function generateAffidavitPDF(advocate: Advocate, client: Client): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Outer Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('BEFORE THE HON\'BLE COURT AT BALLIA (U.P.)', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`IN THE MATTER OF: ${client.caseNo || ''} (${client.caseNature || ''})`, 105, 28, { align: 'center' });
  doc.text(`COURT: ${(client.courtName || '').toUpperCase()}`, 105, 34, { align: 'center' });

  // Parties
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${client.clientName} S/o ${client.clientFatherName || '---'} ... DEPONENT / APPLICANT`, 20, 46);
  doc.text('VERSUS', 105, 52, { align: 'center' });
  doc.text('State of Uttar Pradesh / Other Party ... OPPOSITE PARTY', 20, 58);

  // Title Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 64, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text('AFFIDAVIT / शपथ पत्र', 105, 71, { align: 'center' });

  // Affidavit Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const intro = `I, ${client.clientName}, aged about 42 years, Son/Wife of ${client.clientFatherName || 'Late Shri Kedar Rai'}, Resident of Village ${client.address.village}, Post ${client.address.post}, Police Station ${client.address.policeStation}, Tahsil ${client.address.tahsil}, District Ballia (U.P.), do hereby solemnly affirm and state on oath as under:`;

  doc.text(intro, 20, 82, { maxWidth: 170, align: 'justify', lineHeightFactor: 1.4 });

  const points = [
    `1. That the Deponent is the bona fide applicant / plaintiff / complainant in the above-captioned matter and is well acquainted with the facts and circumstances of the case, and as such is fully competent to depose this affidavit.`,
    `2. That the contents of the accompanying petition / application under ${client.caseNature} before the Hon'ble Court have been read over and explained to the Deponent in Hindi, which I have understood and admit to be true and correct.`,
    `3. That the facts stated in the petition are true to my personal knowledge, documentary evidence on record, and information believed to be true, and no material fact has been suppressed or concealed from this Hon'ble Court.`,
    `4. That the Deponent has engaged Advocate ${advocate.name} (Bar Registration No: ${advocate.barNo}), practicing at District Court Ballia, for the prosecution and defense of the present matter.`,
    `5. That this affidavit is filed bona fide in the interest of substantial justice.`
  ];

  let y = 104;
  points.forEach(pt => {
    doc.text(pt, 20, y, { maxWidth: 170, align: 'justify', lineHeightFactor: 1.35 });
    y += 18;
  });

  // Verification Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('VERIFICATION / सत्यापन', 105, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const verifText = `I, the Deponent above named, do hereby verify and declare that the contents of paragraphs 1 to 5 of this affidavit are true to my personal knowledge, belief and records. Nothing stated herein is false. Verified at Ballia on this ${new Date().toLocaleDateString('en-GB')}.`;

  doc.text(verifText, 20, y + 14, { maxWidth: 170, align: 'justify', lineHeightFactor: 1.4 });

  // Deponent & Advocate Identification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DEPONENT (शपथकर्ता)', 140, y + 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`(${client.clientName})`, 140, y + 47);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IDENTIFIED BY ADVOCATE:', 20, y + 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Advocate: ${advocate.name}`, 20, y + 47);
  doc.text(`Bar Council No: ${advocate.barNo}`, 20, y + 52);
  doc.text(`Ballia Bar Association (U.P.)`, 20, y + 57);

  // Oath Commissioner Stamp
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(80, y + 36, 50, 24, 2, 2);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('OATH COMMISSIONER / NOTARY', 105, y + 44, { align: 'center' });
  doc.text('DISTRICT COURT BALLIA', 105, y + 49, { align: 'center' });
  doc.text('SEAL & SIGNATURE', 105, y + 54, { align: 'center' });

  doc.save(`Affidavit_${client.clientName.replace(/\s+/g, '_')}_${client.caseNo.replace(/\//g, '-')}.pdf`);
}

// Module 3 & 6: Fee Receipt PDF
export function generateFeeReceiptPDF(earning: Earning, advocate?: Advocate): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Outer Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);

  // Header Letterhead
  doc.setFillColor(15, 23, 42);
  doc.rect(13, 13, 184, 32, 'F');

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CRIMINAL & REVENUE BAR ASSOCIATION, BALLIA', 105, 24, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('DISTRICT COURT CAMPUS, BAHADURPUR, BALLIA (U.P.) - 277001', 105, 31, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('OFFICIAL MEMBERSHIP SUBSCRIPTION & FEE RECEIPT', 105, 38, { align: 'center' });

  // Receipt Number & Date
  doc.setFillColor(241, 245, 249);
  doc.rect(13, 48, 184, 14, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`RECEIPT NO: CRBA/REC/${(earning.id || '').toUpperCase()}`, 18, 57);
  doc.text(`DATE: ${earning.date || ''}`, 145, 57);

  // Member Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MEMBER DETAILS (सदस्य विवरण):', 18, 74);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Member Advocate Name:', 22, 84);
  doc.setFont('helvetica', 'bold');
  doc.text(`${earning.advocateName}`, 80, 84);

  doc.setFont('helvetica', 'normal');
  doc.text('Bar Council Registration No:', 22, 93);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${earning.barNo}`, 80, 93);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Purpose / Description:', 22, 102);
  doc.setFont('helvetica', 'bold');
  doc.text(`${earning.purpose} - ${earning.notes || 'Annual Bar Membership 2026-2027'}`, 80, 102);

  doc.setFont('helvetica', 'normal');
  doc.text('Payment Mode:', 22, 111);
  doc.text(`${earning.mode} (Razorpay / Digital Gateway)`, 80, 111);

  doc.text('Transaction / Reference ID:', 22, 120);
  doc.setFont('courier', 'bold');
  doc.text(`${earning.txnId}`, 80, 120);

  // Amount Box
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(212, 175, 55);
  doc.roundedRect(18, 130, 174, 24, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(146, 64, 14);
  doc.text('TOTAL AMOUNT RECEIVED (कुल प्राप्त धनराशि):', 25, 141);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${earning.amount.toLocaleString('en-IN')}/- (INR Twelve Hundred Only)`, 25, 149);

  // Validity Extension Certificate
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(18, 162, 174, 22, 2, 2, 'FD');
  
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ MEMBERSHIP & DIGITAL ID CARD STATUS: ACTIVE (सक्रिय)', 25, 171);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Your Digital Bar ID card validity has been extended up to 31/12/2027. Access ID anytime at /verify/${earning.barNo}`, 25, 178);

  // Authorized Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Treasurer (कोषाध्यक्ष)', 30, 240);
  doc.text('Criminal & Revenue Bar Association', 30, 246);

  doc.text('President / General Secretary', 130, 240);
  doc.text('Ballia Bar Association (U.P.)', 130, 246);

  // Verification Seal
  doc.setDrawColor(212, 175, 55);
  doc.circle(105, 242, 16);
  doc.setFontSize(6.5);
  doc.setTextColor(212, 175, 55);
  doc.text('SEAL OF THE', 105, 239, { align: 'center' });
  doc.text('BAR ASSOCIATION', 105, 243, { align: 'center' });
  doc.text('BALLIA (U.P.)', 105, 247, { align: 'center' });

  doc.save(`Fee_Receipt_Ballia_Bar_${earning.barNo.replace(/\//g, '_')}_${earning.id}.pdf`);
}
