import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Mic,
  Square,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Save,
  Trash2,
  Settings2,
  FileSignature,
  FileDown,
  Layers,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  Info,
  Sliders,
  Ruler,
  Layout,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { LEGAL_DRAFT_TEMPLATES, LegalDraftTemplate } from '../lib/legalDraftTemplates';
import { mergeTranscripts, cleanRepetitiveSpeech } from '../lib/speechDeduplication';

type PaperType = 'GREEN_LEDGER' | 'WHITE' | 'STAMP_HEADER';
type PaperSize = 'LEGAL' | 'A4';
type VoiceLanguage = 'hi-IN' | 'en-IN';
type FontSize = '13' | '14' | '15' | '16' | '18';
type LineHeight = '1.2' | '1.5' | '1.8' | '2.0';
type TextAlign = 'left' | 'center' | 'justify';

interface SavedDraftItem {
  id: string;
  title: string;
  updatedAt: string;
  content: string;
  paperType: PaperType;
  paperSize?: PaperSize;
  margins?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  paragraphIndent?: number;
}

export const LegalDraftingView: React.FC = () => {
  // Main Draft Content & Metadata
  const [docTitle, setDocTitle] = useState<string>('प्रार्थना पत्र / Legal Draft');
  const [content, setContent] = useState<string>(LEGAL_DRAFT_TEMPLATES[0].defaultContent);
  const contentRef = useRef<string>(LEGAL_DRAFT_TEMPLATES[0].defaultContent);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(LEGAL_DRAFT_TEMPLATES[0].id);

  // Paper & Formatting
  const [paperType, setPaperType] = useState<PaperType>('GREEN_LEDGER');
  const [paperSize, setPaperSize] = useState<PaperSize>('LEGAL');
  const [fontSize, setFontSize] = useState<FontSize>('14');
  const [lineHeight, setLineHeight] = useState<LineHeight>('1.5');
  const [textAlign, setTextAlign] = useState<TextAlign>('justify');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Page Setup & Margins (in inches)
  const [leftMargin, setLeftMargin] = useState<number>(1.75); // Court standard 1.75 inch for punching
  const [rightMargin, setRightMargin] = useState<number>(1.0); // Court standard 1.0 inch
  const [topMargin, setTopMargin] = useState<number>(1.5); // Court standard 1.5 inch
  const [bottomMargin, setBottomMargin] = useState<number>(1.0); // Court standard 1.0 inch
  const [paragraphIndent, setParagraphIndent] = useState<number>(0.5); // 0.5 inch first line indent
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [isPageSetupOpen, setIsPageSetupOpen] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Saved Drafts Management
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftItem[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Voice to Type
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('hi-IN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [silenceSecondsLeft, setSilenceSecondsLeft] = useState<number>(15);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<any>(null);
  const accumulatedVoiceTextRef = useRef<string>('');
  const currentSessionTranscriptRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);
  const lastCursorPosRef = useRef<number | null>(null);

  // Synchronize contentRef whenever content state updates
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Load saved drafts & active draft & page setup from localStorage on mount
  useEffect(() => {
    try {
      const activeDraft = localStorage.getItem('ballia_court_active_draft');
      if (activeDraft) {
        const parsed = JSON.parse(activeDraft);
        if (parsed.content) setContent(parsed.content);
        if (parsed.title) setDocTitle(parsed.title);
        if (parsed.paperType) setPaperType(parsed.paperType);
        if (parsed.paperSize) setPaperSize(parsed.paperSize);
        if (parsed.margins) {
          if (typeof parsed.margins.left === 'number') setLeftMargin(parsed.margins.left);
          if (typeof parsed.margins.right === 'number') setRightMargin(parsed.margins.right);
          if (typeof parsed.margins.top === 'number') setTopMargin(parsed.margins.top);
          if (typeof parsed.margins.bottom === 'number') setBottomMargin(parsed.margins.bottom);
        }
        if (typeof parsed.paragraphIndent === 'number') setParagraphIndent(parsed.paragraphIndent);
      }

      const savedSetup = localStorage.getItem('ballia_court_page_setup');
      if (savedSetup) {
        const s = JSON.parse(savedSetup);
        if (typeof s.leftMargin === 'number') setLeftMargin(s.leftMargin);
        if (typeof s.rightMargin === 'number') setRightMargin(s.rightMargin);
        if (typeof s.topMargin === 'number') setTopMargin(s.topMargin);
        if (typeof s.bottomMargin === 'number') setBottomMargin(s.bottomMargin);
        if (s.paperSize) setPaperSize(s.paperSize);
        if (typeof s.paragraphIndent === 'number') setParagraphIndent(s.paragraphIndent);
        if (typeof s.showMarginGuides === 'boolean') setShowMarginGuides(s.showMarginGuides);
      }

      const allSaved = localStorage.getItem('ballia_court_saved_drafts');
      if (allSaved) {
        setSavedDrafts(JSON.parse(allSaved));
      }
    } catch (e) {
      console.error('Error loading drafts from storage', e);
    }
  }, []);

  // Auto-save active draft every 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'ballia_court_active_draft',
          JSON.stringify({
            title: docTitle,
            content,
            paperType,
            paperSize,
            margins: {
              left: leftMargin,
              right: rightMargin,
              top: topMargin,
              bottom: bottomMargin
            },
            paragraphIndent,
            updatedAt: new Date().toISOString()
          })
        );
        const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
        setLastAutoSavedTime(timeStr);
      } catch {
        // ignore
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [content, docTitle, paperType, paperSize, leftMargin, rightMargin, topMargin, bottomMargin, paragraphIndent]);

  // Persist Page Setup settings independently
  useEffect(() => {
    try {
      localStorage.setItem(
        'ballia_court_page_setup',
        JSON.stringify({
          leftMargin,
          rightMargin,
          topMargin,
          bottomMargin,
          paperSize,
          paragraphIndent,
          showMarginGuides
        })
      );
    } catch {
      // ignore
    }
  }, [leftMargin, rightMargin, topMargin, bottomMargin, paperSize, paragraphIndent, showMarginGuides]);

  // Voice Recognition Setup
  const stopVoiceInput = (notice?: string) => {
    shouldListenRef.current = false;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    accumulatedVoiceTextRef.current = '';
    currentSessionTranscriptRef.current = '';
    setIsListening(false);
    if (notice) {
      setVoiceNotice(notice);
      setTimeout(() => setVoiceNotice(null), 3500);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('⚠️ आपके ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है। Chrome/Edge का उपयोग करें।');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    // Stop previous if any
    stopVoiceInput();

    const startSession = () => {
      if (!shouldListenRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = voiceLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          const langLabel = voiceLang === 'hi-IN' ? 'हिन्दी' : 'English';
          setVoiceNotice(`🔴 माइक सक्रिय है (${langLabel}) — बोलें, ड्राफ्ट में टाइप हो रहा है...`);
        };

        recognition.onresult = (event: any) => {
          lastSpeechTimeRef.current = Date.now();
          setSilenceSecondsLeft(15);

          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              sessionFinal += transcript + ' ';
            } else {
              sessionInterim += transcript + ' ';
            }
          }

          const rawSpeech = `${sessionFinal} ${sessionInterim}`.trim();
          const cleanSpeech = cleanRepetitiveSpeech(rawSpeech);
          currentSessionTranscriptRef.current = cleanSpeech;

          if (cleanSpeech) {
            setVoiceNotice(`🎙️ सुना गया: "${cleanSpeech}"`);
          }

          // Append completed speech phrase permanently without overwriting or deleting previous text
          const finalPhrase = cleanRepetitiveSpeech(sessionFinal.trim()).trim();
          if (finalPhrase) {
            insertTextAtCursor(finalPhrase + ' ');
            accumulatedVoiceTextRef.current = '';
            currentSessionTranscriptRef.current = '';
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            return;
          }
          if (event.error === 'not-allowed') {
            stopVoiceInput('❌ माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।');
          }
        };

        recognition.onend = () => {
          // If speech was interrupted but user hasn't stopped, keep listening continuously
          if (shouldListenRef.current) {
            const elapsed = (Date.now() - lastSpeechTimeRef.current) / 1000;
            if (elapsed < 15) {
              setTimeout(() => {
                if (shouldListenRef.current) {
                  startSession();
                }
              }, 100);
              return;
            } else {
              stopVoiceInput('⏱️ 15 सेकंड शांत रहने पर वॉयस टाइपिंग स्वतः रोकी गई।');
              return;
            }
          }
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    };

    shouldListenRef.current = true;
    lastSpeechTimeRef.current = Date.now();
    setSilenceSecondsLeft(15);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      if (!shouldListenRef.current) {
        clearInterval(countdownIntervalRef.current);
        return;
      }
      const elapsed = Math.floor((Date.now() - lastSpeechTimeRef.current) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setSilenceSecondsLeft(remaining);

      if (remaining <= 0) {
        stopVoiceInput('⏱️ 15 सेकंड शांत रहने पर वॉयस टाइपिंग रोकी गई।');
      }
    }, 1000);

    startSession();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput('⏹️ वॉयस टाइपिंग रोकी गई।');
    } else {
      startVoiceInput();
    }
  };

  // Helper to insert text at textarea cursor position or append cleanly without overwriting prior work
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    const currentFullText = contentRef.current;

    let startPos = currentFullText.length;
    let endPos = currentFullText.length;

    if (textarea) {
      const activeEl = document.activeElement;
      const isTextareaActive = activeEl === textarea;

      if (isTextareaActive && typeof textarea.selectionStart === 'number') {
        startPos = textarea.selectionStart;
        endPos = textarea.selectionEnd ?? startPos;
        lastCursorPosRef.current = startPos;
      } else if (lastCursorPosRef.current !== null && lastCursorPosRef.current <= currentFullText.length) {
        // Use user's last known caret position
        startPos = lastCursorPosRef.current;
        endPos = lastCursorPosRef.current;
      } else {
        // Default to appending at the end of the draft
        startPos = currentFullText.length;
        endPos = currentFullText.length;
      }
    }

    // Safety check: Never delete large blocks of existing draft if an unexpected selection range occurred
    // In voice typing, text should be inserted/appended, not replace hundreds of characters accidentally
    if (endPos - startPos > 50) {
      endPos = startPos;
    }

    const before = currentFullText.substring(0, startPos);
    const after = currentFullText.substring(endPos);

    // Ensure appropriate spacing when inserting between words
    let formattedInsert = textToInsert;
    if (before && !before.endsWith(' ') && !before.endsWith('\n') && !formattedInsert.startsWith(' ') && !formattedInsert.startsWith('\n')) {
      formattedInsert = ' ' + formattedInsert;
    }

    const newContent = before + formattedInsert + after;
    contentRef.current = newContent;
    setContent(newContent);

    const nextPos = before.length + formattedInsert.length;
    lastCursorPosRef.current = nextPos;

    if (textarea) {
      setTimeout(() => {
        try {
          textarea.setSelectionRange(nextPos, nextPos);
        } catch {
          // ignore
        }
      }, 0);
    }
  };

  // Quick Insertion Helpers
  const handleInsertPhrase = (phrase: string) => {
    insertTextAtCursor(phrase);
  };

  // Switch Template
  const handleSelectTemplate = (tpl: LegalDraftTemplate) => {
    if (content.trim() && content !== tpl.defaultContent) {
      const confirmChange = window.confirm(
        'क्या आप वर्तमान ड्राफ्ट को बदलकर नया प्रारूप लोड करना चाहते हैं? (वर्तमान कार्य सुरक्षित करने हेतु पहले सेव कर लें)'
      );
      if (!confirmChange) return;
    }
    setSelectedTemplateId(tpl.id);
    setDocTitle(tpl.hindiTitle || tpl.title);
    setContent(tpl.defaultContent);
  };

  // Preset Margin and Spacing Configs
  const applyPreset = (presetName: 'BALLIA_COURT' | 'HIGH_COURT' | 'STAMP_HEADER' | 'BALANCED_A4') => {
    if (presetName === 'BALLIA_COURT') {
      setLeftMargin(1.75);
      setRightMargin(1.0);
      setTopMargin(1.5);
      setBottomMargin(1.0);
      setPaperSize('LEGAL');
      setLineHeight('1.5');
      setParagraphIndent(0.5);
      if (paperType === 'STAMP_HEADER') setPaperType('GREEN_LEDGER');
    } else if (presetName === 'HIGH_COURT') {
      setLeftMargin(2.0);
      setRightMargin(1.0);
      setTopMargin(1.5);
      setBottomMargin(1.25);
      setPaperSize('LEGAL');
      setLineHeight('2.0'); // High Court double spaced standard
      setParagraphIndent(0.5);
      if (paperType === 'STAMP_HEADER') setPaperType('GREEN_LEDGER');
    } else if (presetName === 'STAMP_HEADER') {
      setLeftMargin(1.75);
      setRightMargin(1.0);
      setTopMargin(3.5);
      setBottomMargin(1.0);
      setPaperSize('LEGAL');
      setPaperType('STAMP_HEADER');
    } else if (presetName === 'BALANCED_A4') {
      setLeftMargin(1.0);
      setRightMargin(1.0);
      setTopMargin(1.0);
      setBottomMargin(1.0);
      setPaperSize('A4');
      setLineHeight('1.5');
      setParagraphIndent(0.5);
      if (paperType === 'STAMP_HEADER') setPaperType('WHITE');
    }
  };

  const handlePaperTypeChange = (newType: PaperType) => {
    setPaperType(newType);
    if (newType === 'STAMP_HEADER') {
      setTopMargin(3.5);
    } else if (topMargin === 3.5) {
      setTopMargin(1.5);
    }
  };

  // Save current draft to list
  const handleSaveToMyDrafts = () => {
    const newDraft: SavedDraftItem = {
      id: 'draft_' + Date.now(),
      title: docTitle.trim() || 'ड्राफ्ट सं० ' + (savedDrafts.length + 1),
      updatedAt: new Date().toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      content,
      paperType,
      paperSize,
      margins: {
        left: leftMargin,
        right: rightMargin,
        top: topMargin,
        bottom: bottomMargin
      },
      paragraphIndent
    };

    const updated = [newDraft, ...savedDrafts.filter(d => d.title !== newDraft.title)];
    setSavedDrafts(updated);
    try {
      localStorage.setItem('ballia_court_saved_drafts', JSON.stringify(updated));
    } catch {
      // ignore
    }
    alert(`✅ ड्राफ्ट "${newDraft.title}" सफलतापूर्वक सुरक्षित कर लिया गया है।`);
  };

  const handleLoadSavedDraft = (draft: SavedDraftItem) => {
    setDocTitle(draft.title);
    setContent(draft.content);
    setPaperType(draft.paperType);
    if (draft.paperSize) setPaperSize(draft.paperSize);
    if (draft.margins) {
      setLeftMargin(draft.margins.left);
      setRightMargin(draft.margins.right);
      setTopMargin(draft.margins.top);
      setBottomMargin(draft.margins.bottom);
    }
    if (typeof draft.paragraphIndent === 'number') {
      setParagraphIndent(draft.paragraphIndent);
    }
    setIsSavedModalOpen(false);
  };

  const handleDeleteSavedDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    try {
      localStorage.setItem('ballia_court_saved_drafts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Copy Content
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // DIRECT PRINT (Authentic Court Legal Paper Print)
  const handleDirectPrint = () => {
    window.print();
  };

  // DOWNLOAD AS WORD DOCUMENT (.doc)
  const handleDownloadWord = () => {
    const escapedContent = content
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<p style="margin:0 0 12pt 0;">&nbsp;</p>';
        return `<p style="margin:0 0 8pt 0; text-align:${textAlign}; line-height:${lineHeight}; font-size:${fontSize}pt; text-indent:${paragraphIndent > 0 ? `${paragraphIndent}in` : '0'};">${line.replace(/ /g, '&nbsp;')}</p>`;
      })
      .join('');

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: ${paperSize === 'LEGAL' ? '8.5in 14.0in' : '8.27in 11.69in'};
            margin: ${topMargin}in ${rightMargin}in ${bottomMargin}in ${leftMargin}in;
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Times New Roman', 'Noto Serif Devanagari', 'Kruti Dev 010', serif;
            font-size: ${fontSize}pt;
            line-height: ${lineHeight};
            color: #000000;
          }
          p {
            text-indent: ${paragraphIndent > 0 ? `${paragraphIndent}in` : '0'};
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${escapedContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
    const fileName = `${docTitle.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}_Legal_Draft.doc`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice(`✅ MS Word फाइल '${fileName}' आपके डिवाइस में डाउनलोड हो गई है!`);
    setTimeout(() => setDownloadSuccessNotice(null), 5000);
  };

  // DOWNLOAD AS PDF (High-Resolution Multi-page Devanagari Hindi / English Rendering with Consistent Margins on All Pages)
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      // Dimensions in PostScript points:
      // Legal: 8.5in x 14in = 612 x 1008 pt
      // A4: 8.27in x 11.69in = 595.28 x 841.89 pt
      const isLegal = paperSize === 'LEGAL';
      const pdfWidthPt = isLegal ? 612 : 595.28;
      const pdfHeightPt = isLegal ? 1008 : 841.89;

      // 96 DPI pixel dimensions
      // Legal: 8.5in * 96 = 816px, 14in * 96 = 1344px
      // A4: 8.27in * 96 = 794px, 11.69in * 96 = 1123px
      const pageWidthPx = isLegal ? 816 : 794;
      const pageHeightPx = isLegal ? 1344 : 1123;

      const leftMarginPx = Math.round(leftMargin * 96);
      const rightMarginPx = Math.round(rightMargin * 96);
      const bottomMarginPx = Math.round(bottomMargin * 96);

      // Page 1 Top Margin
      const page1TopMarginPx =
        paperType === 'STAMP_HEADER' ? Math.round(0.4 * 96) : Math.round(topMargin * 96);

      // Subsequent pages (Page 2, Page 3, etc.) Top Margin - ensures page 2 has proper top margin!
      const pageNTopMarginPx = Math.round(Math.max(1.0, topMargin) * 96);

      const bgHex = paperType === 'GREEN_LEDGER' ? '#edf5ec' : '#ffffff';
      const textHex = paperType === 'GREEN_LEDGER' ? '#142315' : '#111111';
      const fontStack =
        fontFamily === 'serif'
          ? "'Noto Serif Devanagari', 'Times New Roman', serif"
          : "'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif";

      // Create an isolated iframe to prevent html2canvas from reading Tailwind CSS v4 oklch colors
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = `${pageWidthPx + 50}px`;
      iframe.style.height = '3000px';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        throw new Error('Iframe document not available');
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              background-color: transparent;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .pdf-page {
              width: ${pageWidthPx}px;
              height: ${pageHeightPx}px;
              max-height: ${pageHeightPx}px;
              min-height: ${pageHeightPx}px;
              box-sizing: border-box;
              background-color: ${bgHex};
              color: ${textHex};
              font-family: ${fontStack};
              position: relative;
              overflow: hidden;
              page-break-after: always;
            }
            .pdf-page-content {
              width: 100%;
              box-sizing: border-box;
            }
            p {
              margin: 0 0 10px 0;
              font-size: ${fontSize}pt;
              line-height: ${lineHeight};
              text-align: ${textAlign};
              ${paragraphIndent > 0 ? `text-indent: ${paragraphIndent}in;` : ''}
              word-break: break-word;
              white-space: pre-wrap;
            }
            .stamp-header-block {
              height: ${Math.round(topMargin * 96)}px;
              border-bottom: 2px dashed #d97706;
              margin-bottom: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #92400e;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .page-number-indicator {
              position: absolute;
              top: 18px;
              left: 0;
              width: 100%;
              text-align: center;
              font-size: 11px;
              font-weight: 600;
              color: ${textHex};
              opacity: 0.7;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div id="pages-container"></div>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Ensure fonts are loaded before calculating heights
      if (iframeDoc.fonts) {
        await iframeDoc.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      const pagesContainer = iframeDoc.getElementById('pages-container') || iframeDoc.body;

      // Helper to create a new page element with precise margins
      const createPage = (pageNum: number) => {
        const pageDiv = iframeDoc.createElement('div');
        pageDiv.className = 'pdf-page';
        pageDiv.id = `pdf-page-${pageNum}`;

        const currentTopPad = pageNum === 1 ? page1TopMarginPx : pageNTopMarginPx;
        pageDiv.style.paddingTop = `${currentTopPad}px`;
        pageDiv.style.paddingLeft = `${leftMarginPx}px`;
        pageDiv.style.paddingRight = `${rightMarginPx}px`;
        pageDiv.style.paddingBottom = `${bottomMarginPx}px`;

        // Add page number at top center for page 2 and onwards
        if (pageNum > 1) {
          const pageNumEl = iframeDoc.createElement('div');
          pageNumEl.className = 'page-number-indicator';
          pageNumEl.textContent = `- ${pageNum} -`;
          pageDiv.appendChild(pageNumEl);
        }

        const contentDiv = iframeDoc.createElement('div');
        contentDiv.className = 'pdf-page-content';
        pageDiv.appendChild(contentDiv);

        // If Stamp paper on page 1, add Stamp header placeholder
        if (pageNum === 1 && paperType === 'STAMP_HEADER') {
          const stampNotice = iframeDoc.createElement('div');
          stampNotice.className = 'stamp-header-block';
          stampNotice.innerText = `[ NON-JUDICIAL E-STAMP HEADER SPACE - ${topMargin} INCH ]`;
          contentDiv.appendChild(stampNotice);
        }

        pagesContainer.appendChild(pageDiv);

        const availableContentHeight = pageHeightPx - currentTopPad - bottomMarginPx;
        return { pageDiv, contentDiv, availableContentHeight };
      };

      const createParagraphEl = (text: string) => {
        const p = iframeDoc.createElement('p');
        if (!text.trim()) {
          p.innerHTML = '&nbsp;';
        } else {
          p.textContent = text;
        }
        return p;
      };

      // Paginate paragraphs across pages cleanly
      let currentPageNum = 1;
      let currentPage = createPage(currentPageNum);

      const rawLines = content.split('\n');

      const splitLongParagraph = (longText: string) => {
        const words = longText.split(' ');
        let accumulatedText = '';

        for (let w = 0; w < words.length; w++) {
          const testText = accumulatedText ? `${accumulatedText} ${words[w]}` : words[w];
          const testP = createParagraphEl(testText);
          currentPage.contentDiv.appendChild(testP);

          if (currentPage.contentDiv.scrollHeight > currentPage.availableContentHeight) {
            currentPage.contentDiv.removeChild(testP);
            if (accumulatedText) {
              currentPage.contentDiv.appendChild(createParagraphEl(accumulatedText));
              currentPageNum++;
              currentPage = createPage(currentPageNum);
              accumulatedText = words[w];
            } else {
              currentPage.contentDiv.appendChild(testP);
              currentPageNum++;
              currentPage = createPage(currentPageNum);
              accumulatedText = '';
            }
          } else {
            currentPage.contentDiv.removeChild(testP);
            accumulatedText = testText;
          }
        }

        if (accumulatedText) {
          currentPage.contentDiv.appendChild(createParagraphEl(accumulatedText));
        }
      };

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const p = createParagraphEl(line);
        currentPage.contentDiv.appendChild(p);

        // If the paragraph exceeds available content height on the current page
        if (currentPage.contentDiv.scrollHeight > currentPage.availableContentHeight) {
          // Check if page already has other lines
          if (currentPage.contentDiv.children.length > 1) {
            currentPage.contentDiv.removeChild(p);
            currentPageNum++;
            currentPage = createPage(currentPageNum);

            // Try adding to the fresh page
            const freshP = createParagraphEl(line);
            currentPage.contentDiv.appendChild(freshP);

            // If it exceeds an entire blank page by itself, split across pages
            if (currentPage.contentDiv.scrollHeight > currentPage.availableContentHeight) {
              currentPage.contentDiv.removeChild(freshP);
              splitLongParagraph(line);
            }
          } else {
            // Single massive paragraph on a fresh page
            currentPage.contentDiv.removeChild(p);
            splitLongParagraph(line);
          }
        }
      }

      // Small pause to ensure layout stabilization before rasterizing
      await new Promise((resolve) => setTimeout(resolve, 150));

      const pageElements = Array.from(iframeDoc.querySelectorAll('.pdf-page')) as HTMLElement[];

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [pdfWidthPt, pdfHeightPt]
      });

      // Render each page into its own exact PDF page
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          doc.addPage([pdfWidthPt, pdfHeightPt], 'portrait');
        }

        const pageEl = pageElements[i];
        const pageCanvas = await html2canvas(pageEl, {
          scale: 2.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgHex,
          logging: false,
          width: pageWidthPx,
          height: pageHeightPx,
          windowWidth: pageWidthPx,
          windowHeight: pageHeightPx
        });

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidthPt, pdfHeightPt, undefined, 'FAST');
      }

      // Remove iframe from DOM
      document.body.removeChild(iframe);

      const cleanFileName = docTitle.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_') || 'Legal_Draft';
      const fileName = `${cleanFileName}_${paperSize}.pdf`;

      // Save PDF directly and trigger download safely
      doc.save(fileName);

      setDownloadSuccessNotice(
        `✅ PDF फाइल '${fileName}' (${pageElements.length} पेज) डाउनलोड हो गई है! (आपके Downloads फोल्डर में सुरक्षित)`
      );
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } catch (err) {
      console.error('High-definition PDF generation error:', err);
      // Fallback to browser print if canvas generation fails
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 380));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ============================================================== */}
      {/* 1. TOP DRAFTING STUDIO BAR (Controls, Voice Switcher, Print)     */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border-b border-amber-500/20 px-4 sm:px-6 py-3 sticky top-18 z-30 shadow-lg no-print">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Left: Title & Legal Badge */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-md">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="ड्राफ्ट का शीर्षक लिखें..."
                  className="bg-transparent font-bold text-sm sm:text-base text-slate-100 focus:outline-none focus:border-b border-amber-500 w-full truncate"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-amber-400 font-semibold">{paperSize === 'LEGAL' ? 'LEGAL (8.5" × 14")' : 'A4 (8.27" × 11.69")'}</span>
                <span>•</span>
                <span className="text-slate-300 font-mono">L:{leftMargin}" R:{rightMargin}" T:{topMargin}"</span>
                <span>•</span>
                <span>{wordCount} शब्द</span>
                <span>•</span>
                <span>अनुमानित: {estimatedPages} पृष्ठ</span>
                {lastAutoSavedTime && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 text-[10px]">स्वतः सुरक्षित: {lastAutoSavedTime}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center / Right: Voice Bar & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* Voice Language Selector */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => {
                  setVoiceLang('hi-IN');
                  if (isListening) startVoiceInput();
                }}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  voiceLang === 'hi-IN'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="हिन्दी में बोलें"
              >
                हिन्दी (hi-IN)
              </button>
              <button
                onClick={() => {
                  setVoiceLang('en-IN');
                  if (isListening) startVoiceInput();
                }}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  voiceLang === 'en-IN'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Speak in English"
              >
                English (en-IN)
              </button>
            </div>

            {/* Mic Toggle Button */}
            <button
              onClick={toggleVoiceInput}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
              }`}
              title={isListening ? 'वॉयस टाइपिंग रोकें' : 'बोलकर टाइप करना शुरू करें'}
            >
              {isListening ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>बोलना रोकें ({silenceSecondsLeft}s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>बोलकर लिखें (Voice Type)</span>
                </>
              )}
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handleDirectPrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 hover:border-amber-500/50 flex items-center gap-1.5 transition-all shadow-sm"
              title="लीगल पेपर पर सीधे प्रिंट करें (Ctrl + P)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>प्रिंट (Print)</span>
            </button>

            {/* Direct Word Download */}
            <button
              onClick={handleDownloadWord}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs border border-blue-500/40 flex items-center gap-1.5 transition-all"
              title="MS Word (.doc) में तुरंत डाउनलोड करें"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Word (.doc)</span>
            </button>

            {/* Direct PDF Download */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition-all shadow-md ${
                isGeneratingPDF
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-500/60'
              }`}
              title="PDF फाइल तुरंत डाउनलोड करें (हिंदी व इंग्लिश देवनागरी)"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF बन रहा है...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF डाउनलोड</span>
                </>
              )}
            </button>

            {/* Saved Drafts Manager */}
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 flex items-center gap-1"
              title="सहेजे गए ड्राफ्ट देखें"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">सहेजे ड्राफ्ट</span>
              {savedDrafts.length > 0 && (
                <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {savedDrafts.length}
                </span>
              )}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveToMyDrafts}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs border border-slate-700 flex items-center gap-1"
              title="ड्राफ्ट सुरक्षित करें"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">सेव</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
              title="ड्राफ्ट कॉपी करें"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Download Success Confirmation Toast */}
        {downloadSuccessNotice && (
          <div className="mt-2 text-xs font-bold py-2 px-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 flex items-center justify-between shadow-lg animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {downloadSuccessNotice}
            </span>
            <button
              onClick={() => setDownloadSuccessNotice(null)}
              className="text-emerald-400 hover:text-white text-xs underline font-normal ml-3"
            >
              हटाएं
            </button>
          </div>
        )}

        {/* Live Voice Status Notification */}
        {voiceNotice && (
          <div className="mt-2 text-xs font-medium py-1.5 px-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between animate-fadeIn">
            <span className="truncate">{voiceNotice}</span>
            {isListening && (
              <span className="text-[11px] font-mono text-amber-400 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30 ml-2">
                ठहराव टाइमर: {silenceSecondsLeft}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-TOOLBAR: Paper Setup, Formatting, Templates, Quick Inserts*/}
      {/* ============================================================== */}
      <div className="bg-slate-900/70 border-b border-slate-800 px-4 sm:px-6 py-2.5 no-print text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Paper Type Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> पेपर:
            </span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
              <button
                onClick={() => handlePaperTypeChange('GREEN_LEDGER')}
                className={`px-2.5 py-1 rounded transition-all ${
                  paperType === 'GREEN_LEDGER'
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-600/50'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="उत्तर प्रदेश दीवानी व फौजदारी कचहरी का पारंपरिक हरा कानूनी लेजर पेपर"
              >
                🟢 हरा लेजर
              </button>
              <button
                onClick={() => handlePaperTypeChange('WHITE')}
                className={`px-2.5 py-1 rounded transition-all ${
                  paperType === 'WHITE'
                    ? 'bg-slate-700 text-slate-100 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="मानक सफेद कानूनी पृष्ठ"
              >
                ⚪ सफेद लीगल
              </button>
              <button
                onClick={() => handlePaperTypeChange('STAMP_HEADER')}
                className={`px-2.5 py-1 rounded transition-all ${
                  paperType === 'STAMP_HEADER'
                    ? 'bg-amber-950 text-amber-300 font-bold border border-amber-600/50'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="ई-स्टाम्प पेपर के लिए शीर्ष पर 3.5 इंच खाली स्थान छोड़ें"
              >
                📜 ई-स्टाम्प
              </button>
            </div>
          </div>

          {/* Page Setup & Margins Trigger Button */}
          <button
            onClick={() => setIsPageSetupOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm group"
            title="पेज सेटअप व मार्जिन बदलें (Left, Right, Top, Bottom Spacing & Page Size)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>📐 पेज सेटअप (Margins)</span>
            <span className="text-[10px] text-amber-200/90 font-mono bg-slate-900/80 px-1.5 py-0.2 rounded border border-amber-500/30">
              L:{leftMargin}" R:{rightMargin}"
            </span>
          </button>

          {/* Margin Guides Toggle Button */}
          <button
            onClick={() => setShowMarginGuides(!showMarginGuides)}
            className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              showMarginGuides
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={showMarginGuides ? 'स्क्रीन पर लाल मार्जिन गाइड रेखाएं छुपाएं' : 'स्क्रीन पर लाल मार्जिन गाइड रेखाएं दिखाएं'}
          >
            {showMarginGuides ? <Eye className="w-3.5 h-3.5 text-red-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">गाइड लाइन</span>
          </button>

          {/* Typography Controls: Font Size, Line Spacing, Align */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Font Size */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">फॉन्ट:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as FontSize)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="13">13 pt (कॉम्पैक्ट)</option>
                <option value="14">14 pt (न्यायालय मानक)</option>
                <option value="15">15 pt</option>
                <option value="16">16 pt (बड़ा)</option>
                <option value="18">18 pt (शीर्षक)</option>
              </select>
            </div>

            {/* Line Spacing */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">दूरी:</span>
              <select
                value={lineHeight}
                onChange={(e) => setLineHeight(e.target.value as LineHeight)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="1.2">1.2x (सिंगल)</option>
                <option value="1.5">1.5x (कचहरी मानक)</option>
                <option value="1.8">1.8x</option>
                <option value="2.0">2.0x (डबल स्पेस्ड - HC/SC)</option>
              </select>
            </div>

            {/* Alignment */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setTextAlign('justify')}
                className={`p-1 rounded ${textAlign === 'justify' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'}`}
                title="जस्टिफाई (न्यायालय मानक)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('left')}
                className={`p-1 rounded ${textAlign === 'left' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'}`}
                title="बायां संरेखण (Left)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-1 rounded ${textAlign === 'center' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'}`}
                title="मध्य संरेखण (Center)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font family */}
            <button
              onClick={() => setFontFamily(prev => (prev === 'serif' ? 'sans' : 'serif'))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300"
              title="फॉन्ट स्टाइल बदलें (सेरिफ कोर्ट स्टाइल / सेंस)"
            >
              {fontFamily === 'serif' ? '🏛️ देवनागरी सेरिफ' : '🔤 आधुनिक सेंस'}
            </button>
          </div>

          {/* Templates Quick Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">कानूनी प्रारूप:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                const tpl = LEGAL_DRAFT_TEMPLATES.find(t => t.id === e.target.value);
                if (tpl) handleSelectTemplate(tpl);
              }}
              className="bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 font-medium"
            >
              {LEGAL_DRAFT_TEMPLATES.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.hindiTitle}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Voice Punctuation & Legal Phrases Insertion Strip */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 mt-2">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mr-1">त्वरित कानूनी प्रविष्टियां:</span>
          
          <button
            onClick={() => handleInsertPhrase('। ')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-bold"
            title="पूर्णविराम लगाएं"
          >
            । (पूर्णविराम)
          </button>
          <button
            onClick={() => handleInsertPhrase(', ')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-bold"
            title="अल्पविराम (कॉमा) लगाएं"
          >
            , (Comma)
          </button>
          <button
            onClick={() => handleInsertPhrase('\n\n')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px]"
            title="नया पैरा बनाएं"
          >
            ↵ नया पैरा (Enter)
          </button>
          <button
            onClick={() => handleInsertPhrase('\nन्यायालय श्रीमान ........................................................................, बलिया\n')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-[11px]"
          >
            + न्यायालय श्रीमान...
          </button>
          <button
            onClick={() => handleInsertPhrase('\n                                                        ................... प्रार्थी / अभियुक्त\nबनाम\n                                                        ................... विपक्षी / राज्य\n')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px]"
          >
            + प्रार्थी बनाम विपक्षी
          </button>
          <button
            onClick={() => handleInsertPhrase('\nदिनांक: ....................\nस्थान: दीवानी कचहरी, बलिया\n\nद्वारा अधिवक्ता:\n(हस्ताक्षर एवं मुहर)\nदीवानी एवं फौजदारी बार एसोसिएशन, बलिया\n')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px]"
          >
            + अधिवक्ता हस्ताक्षर व दिनांक
          </button>
          <button
            onClick={() => setContent('')}
            className="px-2 py-0.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800/40 rounded text-[11px] ml-auto"
            title="पूरा ड्राफ्ट साफ करें"
          >
            <Trash2 className="w-3 h-3 inline mr-1" />
            साफ करें
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LEGAL PAGE CANVAS (True Legal Size 8.5" x 14" Proportions)   */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950">
        
        {/* The Authentic Legal Sheet Container */}
        <div
          ref={printContainerRef}
          id="legal-printable-sheet"
          className={`relative shadow-2xl transition-all duration-200 w-full ${
            paperSize === 'LEGAL' ? 'max-w-[850px]' : 'max-w-[816px]'
          } border ${
            paperType === 'GREEN_LEDGER'
              ? 'bg-[#edf5ec] text-[#142315] border-[#b2cfb0]'
              : paperType === 'STAMP_HEADER'
              ? 'bg-[#fffdf9] text-[#1a1a1a] border-amber-300'
              : 'bg-[#ffffff] text-[#111111] border-slate-300'
          }`}
          style={{
            minHeight: paperSize === 'LEGAL' ? '14in' : '11.69in', // Standard Legal or A4 height
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Dynamic Court Margin Guide Lines (Visual Red Lines) */}
          {showMarginGuides && (
            <>
              {/* Left Punching & Binding Guide Line */}
              <div
                className="absolute top-0 bottom-0 border-r border-dashed border-red-400/50 pointer-events-none hidden sm:block z-10"
                style={{ left: `${leftMargin}in` }}
                title={`बायां मार्जिन (${leftMargin} इंच - नत्थी/पंचिंग गाइड)`}
              >
                <span className="absolute top-2 -left-1 -translate-x-full text-[9px] font-mono text-red-700 font-semibold bg-red-100/90 px-1 py-0.5 rounded shadow-sm select-none border border-red-300">
                  बायां: {leftMargin}"
                </span>
              </div>

              {/* Right Margin Guide Line */}
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-red-400/50 pointer-events-none hidden sm:block z-10"
                style={{ right: `${rightMargin}in` }}
                title={`दायां मार्जिन (${rightMargin} इंच)`}
              >
                <span className="absolute top-2 -right-1 translate-x-full text-[9px] font-mono text-red-700 font-semibold bg-red-100/90 px-1 py-0.5 rounded shadow-sm select-none border border-red-300">
                  दायां: {rightMargin}"
                </span>
              </div>

              {/* Top Margin Guide Line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-red-400/50 pointer-events-none hidden sm:block z-10"
                style={{ top: `${topMargin}in` }}
                title={`शीर्ष मार्जिन (${topMargin} इंच)`}
              >
                <span className="absolute -top-4 left-6 text-[9px] font-mono text-red-700 font-semibold bg-red-100/90 px-1 py-0.5 rounded shadow-sm select-none border border-red-300">
                  शीर्ष (Top): {topMargin}"
                </span>
              </div>

              {/* Bottom Margin Guide Line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-red-400/50 pointer-events-none hidden sm:block z-10"
                style={{ bottom: `${bottomMargin}in` }}
                title={`निचला मार्जिन (${bottomMargin} इंच)`}
              >
                <span className="absolute -bottom-4 left-6 text-[9px] font-mono text-red-700 font-semibold bg-red-100/90 px-1 py-0.5 rounded shadow-sm select-none border border-red-300">
                  निचला (Bottom): {bottomMargin}"
                </span>
              </div>
            </>
          )}

          {/* Stamp Header Notice Banner (If Stamp Mode Active) */}
          {paperType === 'STAMP_HEADER' && (
            <div
              className="border-b-2 border-dashed border-amber-400 bg-amber-50/70 p-6 flex flex-col items-center justify-center text-center select-none text-amber-800"
              style={{ height: `${topMargin}in` }}
            >
              <div className="border border-amber-300 rounded-xl px-4 py-3 bg-white/80 max-w-md shadow-sm">
                <p className="font-bold text-xs uppercase tracking-wider text-amber-900">
                  🏛️ NON-JUDICIAL E-STAMP PAPER HEADER SPACE ({topMargin} INCH)
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  शीर्ष पर {topMargin} इंच खाली स्थान स्टाम्प पेपर के लिए छोड़ा गया है। इस शीट पर प्रिंट लेकर सीधे स्टाम्प के नीचे ड्राफ्ट छापें।
                </p>
                <p className="text-[10px] text-amber-600 font-mono mt-0.5">
                  (यह बॉक्स केवल स्क्रीन पर मार्गदर्शन हेतु है, प्रिंट में नहीं आएगा)
                </p>
              </div>
            </div>
          )}

          {/* Official Court Watermark for Green Ledger */}
          {paperType === 'GREEN_LEDGER' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
              <div className="text-center">
                <div className="text-9xl font-serif">⚖️</div>
                <div className="text-3xl font-serif font-bold uppercase tracking-widest mt-4">
                  CRIMINAL &amp; REVENUE BAR ASSOCIATION BALLIA
                </div>
                <div className="text-xl font-serif">COURT LEGAL DRAFT</div>
              </div>
            </div>
          )}

          {/* The Active Legal Drafting Textarea Area with Exact Court Margins */}
          <div
            id="legal-sheet-content-wrapper"
            className="transition-all duration-150"
            style={{
              paddingTop: paperType === 'STAMP_HEADER' ? '1.0rem' : `${topMargin}in`,
              paddingLeft: `${leftMargin}in`,
              paddingRight: `${rightMargin}in`,
              paddingBottom: `${bottomMargin}in`
            }}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                contentRef.current = e.target.value;
                lastCursorPosRef.current = e.target.selectionStart;
              }}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                lastCursorPosRef.current = target.selectionStart;
              }}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                lastCursorPosRef.current = target.selectionStart;
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLTextAreaElement;
                lastCursorPosRef.current = target.selectionStart;
              }}
              placeholder="यहाँ कानूनी ड्राफ्ट टाइप करें अथवा ऊपर दिए गए 'बोलकर लिखें (Voice Type)' बटन को दबाकर हिन्दी या अंग्रेजी में बोलें..."
              className={`w-full bg-transparent resize-y focus:outline-none border-none leading-relaxed ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
              style={{
                fontSize: `${fontSize}pt`,
                lineHeight: lineHeight,
                textAlign: textAlign,
                textIndent: paragraphIndent > 0 ? `${paragraphIndent}in` : undefined,
                minHeight: paperSize === 'LEGAL' ? '11.5in' : '9.5in',
                color: paperType === 'GREEN_LEDGER' ? '#112211' : '#111111'
              }}
              spellCheck={false}
            />
          </div>

          {/* Bottom Court Footer (Page count & Bar credential) */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-500 font-serif select-none pointer-events-none px-8 flex justify-between items-center">
            <span>District &amp; Sessions Court Campus, Ballia (U.P.)</span>
            <span>
              {paperSize === 'LEGAL' ? 'Legal Paper • 8.5" × 14"' : 'A4 Paper • 8.27" × 11.69"'} (मार्जिन: बायां {leftMargin}", दायां {rightMargin}", शीर्ष {topMargin}")
            </span>
            <span>पृष्ठ 1 of {estimatedPages}</span>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. PAGE SETUP & MARGINS MODAL                                  */}
      {/* ============================================================== */}
      {isPageSetupOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    पृष्ठ सेटअप एवं मार्जिन (Page Setup & Margins)
                  </h3>
                  <p className="text-xs text-slate-400">
                    कचहरी में नत्थी, सिलाई, स्टाम्प एवं प्रिंटिंग हेतु पेपर मार्जिन व स्पेसिंग सेट करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPageSetupOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="बंद करें"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
              {/* Quick Court Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Layout className="w-3.5 h-3.5 text-amber-400" />
                  न्यायालय त्वरित प्रीसेट्स (1-Click Court Presets):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPreset('BALLIA_COURT')}
                    className="p-2.5 text-left rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 group-hover:text-amber-300">
                        🏛️ जिला न्यायालय बलिया (U.P.)
                      </span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600/40">
                        मानक
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      बायां: 1.75" (नत्थी) • दायां: 1.0" • शीर्ष: 1.5" • लीगल पेपर
                    </p>
                  </button>

                  <button
                    onClick={() => applyPreset('HIGH_COURT')}
                    className="p-2.5 text-left rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 group-hover:text-amber-300">
                        ⚖️ इलाहाबाद उच्च न्यायालय (High Court)
                      </span>
                      <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-600/40">
                        HC मानक
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      बायां: 2.0" (बाइंडिंग) • दायां: 1.0" • डबल स्पेसिंग (2.0x)
                    </p>
                  </button>

                  <button
                    onClick={() => applyPreset('STAMP_HEADER')}
                    className="p-2.5 text-left rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 group-hover:text-amber-300">
                        📜 ई-स्टाम्प पेपर मोड (E-Stamp Paper)
                      </span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/40">
                        3.5" स्पेस
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      शीर्ष: 3.5" खाली स्टाम्प स्पेस • बायां: 1.75"
                    </p>
                  </button>

                  <button
                    onClick={() => applyPreset('BALANCED_A4')}
                    className="p-2.5 text-left rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 group-hover:text-amber-300">
                        📄 सामान्य ऑफिस / A4 नोटिस
                      </span>
                      <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded">
                        A4 साइज
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      चारों तरफ 1.0" संतुलित मार्जिन • A4 मानक पेपर
                    </p>
                  </button>
                </div>
              </div>

              {/* Custom Margin Sliders & Direct Inputs */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4" />
                    कस्टम मार्जिन स्पेसिंग (Custom Margins in Inches):
                  </span>
                  <button
                    onClick={() => applyPreset('BALLIA_COURT')}
                    className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                  >
                    कचहरी डिफ़ॉल्ट रीसेट करें
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Margin */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        बायां मार्जिन (Left Margin):
                      </span>
                      <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {leftMargin.toFixed(2)}"
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={leftMargin}
                      onChange={(e) => setLeftMargin(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5" (न्यूनतम)</span>
                      <span className="text-amber-300 font-semibold">1.75" (नत्थी मानक)</span>
                      <span>2.5" (अधिकतम)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * कचहरी में फाइल सिलाई धागा व पंचिंग हेतु 1.75" से 2.0" सर्वोत्तम है।
                    </p>
                  </div>

                  {/* Right Margin */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        दायां मार्जिन (Right Margin):
                      </span>
                      <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {rightMargin.toFixed(2)}"
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={rightMargin}
                      onChange={(e) => setRightMargin(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5"</span>
                      <span className="text-amber-300 font-semibold">1.0" (मानक)</span>
                      <span>2.0"</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * पृष्ठ के दाहिनी ओर रिक्त स्थान।
                    </p>
                  </div>

                  {/* Top Margin */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        शीर्ष मार्जिन (Top Margin):
                      </span>
                      <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {topMargin.toFixed(2)}"
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="4.5"
                      step="0.1"
                      value={topMargin}
                      onChange={(e) => setTopMargin(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5"</span>
                      <span className="text-amber-300 font-semibold">1.5" (कोर्ट फीस)</span>
                      <span>3.5" (ई-स्टाम्प)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * कोर्ट फीस टिकट अथवा ई-स्टाम्प के नीचे स्थान के लिए।
                    </p>
                  </div>

                  {/* Bottom Margin */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        निचला मार्जिन (Bottom Margin):
                      </span>
                      <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {bottomMargin.toFixed(2)}"
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={bottomMargin}
                      onChange={(e) => setBottomMargin(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5"</span>
                      <span className="text-amber-300 font-semibold">1.0" (मानक)</span>
                      <span>2.0"</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * पृष्ठ संख्या व पाद लेख (Footer) के लिए सुरक्षित स्थान।
                    </p>
                  </div>
                </div>
              </div>

              {/* Paper Size, Indent, & Visual Guide Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Paper Size */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <label className="font-semibold text-slate-200 block">
                    कागज का आकार (Paper Size):
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="paperSizeOption"
                        checked={paperSize === 'LEGAL'}
                        onChange={() => setPaperSize('LEGAL')}
                        className="accent-amber-500"
                      />
                      <span>लीगल (8.5" × 14") - कोर्ट मानक</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="paperSizeOption"
                        checked={paperSize === 'A4'}
                        onChange={() => setPaperSize('A4')}
                        className="accent-amber-500"
                      />
                      <span>A4 (8.27" × 11.69") - नोटिस/ऑफिस</span>
                    </label>
                  </div>
                </div>

                {/* Paragraph First-Line Indent */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <label className="font-semibold text-slate-200 block">
                    पैराग्राफ पहली लाइन स्पेस (Indent):
                  </label>
                  <select
                    value={paragraphIndent}
                    onChange={(e) => setParagraphIndent(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>0" - सपाट (No Indent)</option>
                    <option value={0.5}>0.5" - आधा इंच (कोर्ट पैरा मानक)</option>
                    <option value={0.75}>0.75" - बड़ा इंडेंट</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    प्रत्येक पैराग्राफ की पहली पंक्ति अंदर से शुरू होगी।
                  </p>
                </div>

                {/* Guide Lines Toggle */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <label className="font-semibold text-slate-200 block">
                    मार्जिन गाइड रेखाएं:
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={showMarginGuides}
                      onChange={(e) => setShowMarginGuides(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>लाल मार्जिन रेखाएं दिखाएं</span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    यह स्क्रीन पर संरेखण हेतु हैं, प्रिंट में स्वतः हट जाती हैं।
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <div className="text-slate-400 text-[11px] font-mono">
                सक्रिय: L:{leftMargin.toFixed(2)}" • R:{rightMargin.toFixed(2)}" • T:{topMargin.toFixed(2)}" • B:{bottomMargin.toFixed(2)}" ({paperSize})
              </div>
              <button
                onClick={() => setIsPageSetupOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-all"
              >
                सेटिंग्स लागू करें (Apply &amp; Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SAVED DRAFTS MODAL DRAWER                                   */}
      {/* ============================================================== */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">सहेजे गए कानूनी ड्राफ्ट (Saved Drafts)</h3>
              </div>
              <button
                onClick={() => setIsSavedModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {savedDrafts.length > 0 ? (
                savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadSavedDraft(draft)}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 truncate">
                        {draft.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        संशोधित: {draft.updatedAt} • {draft.content.length} अक्षर
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteSavedDraft(draft.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                        title="ड्राफ्ट हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  कोई सहेजा गया ड्राफ्ट नहीं मिला। ऊपर दिए गए "सेव" बटन से वर्तमान ड्राफ्ट सुरक्षित करें।
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px]">कुल {savedDrafts.length} ड्राफ्ट सहेजे गए हैं</span>
              <button
                onClick={() => setIsSavedModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. PRINT CSS STYLES FOR EXACT LEGAL OR A4 PAPER OUTPUT         */}
      {/* ============================================================== */}
      <style>{`
        @media print {
          /* Force standard Legal Paper or A4 in portrait mode */
          @page {
            size: ${paperSize === 'LEGAL' ? 'legal' : 'a4'} portrait;
            margin: 0;
          }

          body {
            background: white !important;
            color: black !important;
            font-size: ${fontSize}pt !important;
            line-height: ${lineHeight} !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide all application chrome, navigation, headers, footers */
          header,
          footer,
          .no-print,
          nav,
          aside {
            display: none !important;
          }

          /* Ensure the printable sheet occupies full legal paper */
          #legal-printable-sheet {
            width: ${paperSize === 'LEGAL' ? '8.5in' : '8.27in'} !important;
            min-height: ${paperSize === 'LEGAL' ? '14in' : '11.69in'} !important;
            max-width: ${paperSize === 'LEGAL' ? '8.5in' : '8.27in'} !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: ${paperType === 'GREEN_LEDGER' ? '#edf5ec' : '#ffffff'} !important;
            page-break-after: always;
          }

          #legal-sheet-content-wrapper {
            padding-top: ${paperType === 'STAMP_HEADER' ? '1.0rem' : `${topMargin}in`} !important;
            padding-left: ${leftMargin}in !important;
            padding-right: ${rightMargin}in !important;
            padding-bottom: ${bottomMargin}in !important;
          }

          textarea {
            overflow: visible !important;
            height: auto !important;
            border: none !important;
            color: black !important;
            text-indent: ${paragraphIndent > 0 ? `${paragraphIndent}in` : '0'} !important;
            font-family: 'Times New Roman', 'Noto Serif Devanagari', serif !important;
          }
        }
      `}</style>
    </div>
  );
};
