import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Scale, Mic, Square, Copy, Check, Minimize2, Maximize2, AlertCircle, ExternalLink } from 'lucide-react';
import { mergeTranscripts, cleanRepetitiveSpeech } from '../lib/speechDeduplication';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const INITIAL_MESSAGES: ChatEntry[] = [
  {
    role: 'assistant',
    content: '⚖️ **नमस्कार! मैं बार एसोसिएशन बलिया का एआई विधि सहायक (AI Legal Assistant) हूँ।**\n\nआप मुझसे भारतीय कानून व उत्तर प्रदेश अदालती प्रक्रियाओं से संबंधित कोई भी सवाल पूछ सकते हैं, जैसे:\n• **चेक बाउंस (Sec 138 NI Act)**: कानूनी नोटिस प्रारूप व वाद प्रक्रिया\n• **आपराधिक कानून**: BNS 2023, BNSS में जमानत (Bail Sec 480/483)\n• **उ०प्र० राजस्व संहिता 2006**: धारा 24 (मेड़बन्दी), धारा 34 (दाखिल खारिज), धारा 116 (बंटवारा)\n• **दीवानी प्रक्रिया**: Order 39 (स्टे आर्डर), कैविएट\n\n*माइक 🎙️ बटन दबाकर बोलें या नीचे प्रश्न टाइप करें।*',
    time: 'Just now'
  }
];

const SUGGESTIONS = [
  'चेक बाउंस धारा 138 NI Act का कानूनी नोटिस प्रारूप',
  'धारा 34 राजस्व संहिता नामांतरण प्रक्रिया व समय',
  'BNSS 483 / CrPC 439 में सेशन कोर्ट से जमानत का आधार',
  'धारा 24 उ०प्र० राजस्व संहिता (खेत की पैमाइश/मेड़बन्दी)',
  'BNS 2023 में IPC 302 और 420 के नए प्रावधान क्या हैं?',
  'Order 39 Rule 1&2 CPC में स्टे कैसे मिलता है?'
];

export const AILegalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [silenceSecondsLeft, setSilenceSecondsLeft] = useState<number>(15);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<string>('');
  const shouldListenRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<any>(null);
  const initialInputTextRef = useRef<string>('');
  const accumulatedVoiceTextRef = useRef<string>('');
  const currentSessionTranscriptRef = useRef<string>('');

  // Keep inputRef constantly in sync with state to prevent stale closures
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Cleanup timers and recognition on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  // Gracefully stop voice input and clear state
  const stopVoiceInput = (notice?: string) => {
    shouldListenRef.current = false;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    accumulatedVoiceTextRef.current = '';
    currentSessionTranscriptRef.current = '';
    initialInputTextRef.current = '';
    setIsListening(false);
    if (notice) {
      setVoiceNotice(notice);
      setTimeout(() => setVoiceNotice(null), 3500);
    }
  };

  // Dedicated speech session starter with fresh instance to prevent InvalidStateError
  const startSessionRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !shouldListenRef.current) return;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'hi-IN'; // Recognizes Hindi and conversational Hinglish
      recognition.continuous = true; // Enables continuous dictation across pauses
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('🔴 माइक चालू है — बोलिए, शब्द दोहराए बिना साफ टाइप होंगे...');
      };

      recognition.onresult = (event: any) => {
        // Reset 15-second silence timer whenever any speech arrives
        lastSpeechTimeRef.current = Date.now();
        setSilenceSecondsLeft(15);

        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            sessionFinal += `${transcriptPiece.trim()} `;
          } else {
            sessionInterim += transcriptPiece;
          }
        }

        const rawSessionText = `${sessionFinal} ${sessionInterim}`.trim();
        const cleanSessionText = cleanRepetitiveSpeech(rawSessionText);
        currentSessionTranscriptRef.current = cleanSessionText;

        // Intelligently merge previous text chunks with current speech chunk without word duplications
        const fullVoiceText = mergeTranscripts(accumulatedVoiceTextRef.current, cleanSessionText);
        const cleanFullVoiceText = cleanRepetitiveSpeech(fullVoiceText);

        const totalDisplay = initialInputTextRef.current
          ? `${initialInputTextRef.current} ${cleanFullVoiceText}`.trim()
          : cleanFullVoiceText;

        if (totalDisplay) {
          setInput(totalDisplay);
          inputRef.current = totalDisplay;
        }

        if (cleanSessionText) {
          setVoiceNotice(`🎙️ सुना गया: "${cleanSessionText}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event/error:', event?.error);
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          stopVoiceInput('⚠️ माइक की अनुमति अस्वीकृत (Denied) है। कृपया ब्राउज़र में माइक "Allow" करें।');
        } else if (event?.error === 'audio-capture') {
          stopVoiceInput('⚠️ माइक हार्डवेयर व्यस्त है या उपलब्ध नहीं है।');
        } else if (event?.error === 'no-speech') {
          // Normal pause by user - do not shut down, auto-restart or keep-alive keeps mic active
        }
      };

      recognition.onend = () => {
        // Commit current session transcript into accumulatedVoiceTextRef with deduplication
        if (currentSessionTranscriptRef.current) {
          accumulatedVoiceTextRef.current = cleanRepetitiveSpeech(
            mergeTranscripts(accumulatedVoiceTextRef.current, currentSessionTranscriptRef.current)
          );
          currentSessionTranscriptRef.current = '';
        }

        // If user hasn't explicitly stopped and 15 seconds haven't elapsed, keep listening!
        if (shouldListenRef.current) {
          const elapsed = (Date.now() - lastSpeechTimeRef.current) / 1000;
          if (elapsed < 15) {
            setTimeout(() => {
              if (shouldListenRef.current) {
                startSessionRecognition();
              }
            }, 150);
            return;
          }
        }
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition session:', e);
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) startSessionRecognition();
        }, 300);
      }
    }
  };

  // Voice Input Speech-to-Text Support with 15-second Silence Keep-Alive
  const toggleVoiceInput = () => {
    setVoiceNotice(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice('आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया नीचे लिखकर सवाल पूछें।');
      return;
    }

    if (isListening || shouldListenRef.current) {
      stopVoiceInput('✅ माइक बंद किया गया। आप प्रश्न भेज सकते हैं।');
      return;
    }

    shouldListenRef.current = true;
    initialInputTextRef.current = inputRef.current.trim();
    accumulatedVoiceTextRef.current = '';
    currentSessionTranscriptRef.current = '';
    lastSpeechTimeRef.current = Date.now();
    setSilenceSecondsLeft(15);

    // 15-second silence countdown interval
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      if (!shouldListenRef.current) {
        clearInterval(countdownIntervalRef.current);
        return;
      }
      const elapsed = Math.floor((Date.now() - lastSpeechTimeRef.current) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setSilenceSecondsLeft(remaining);

      if (remaining <= 0) {
        stopVoiceInput('⏱️ 15 सेकंड तक आवाज़ न आने पर माइक स्वतः बंद हुआ। अब आप "भेजें" दबा सकते हैं।');
      }
    }, 1000);

    startSessionRecognition();
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    stopVoiceInput();
    inputRef.current = '';
    setVoiceNotice(null);

    const userMsg: ChatEntry = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-legal-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      
      const assistantMsg: ChatEntry = {
        role: 'assistant',
        content: data.reply || 'विधि परामर्श प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatEntry = {
        role: 'assistant',
        content: `⚖️ **विधि परामर्श एवं विधिक संदर्भ ("${text}"):**\n\n1. **सुसंगत विधि**: भारतीय न्याय संहिता (BNS 2023) / BNSS अथवा उ०प्र० राजस्व संहिता 2006 के तहत जिला न्यायालय बलिया / संबंधित तहसील में क्षेत्राधिकार है।\n2. **प्रक्रिया**: आवश्यक खतौनी / पत्रावली एवं शपथ-पत्र के साथ संबंधित मजिस्ट्रेट या उपजिलाधिकारी न्यायालय में वाद योजित करें।\n3. **विधिक राय**: विस्तृत ड्राफ्टिंग हेतु बार एसोसिएशन के वरिष्ठ अधिवक्ता से परामर्श लें।`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render formatted text with styled draft blocks
  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```(?:text)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', code: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.substring(lastIndex) });
    }

    return (
      <div className="space-y-2">
        {parts.map((p, pIdx) => {
          if (p.type === 'code') {
            return (
              <div key={pIdx} className="my-2 p-3 bg-slate-900 border border-amber-500/30 rounded-lg text-slate-100 font-mono text-[11px] leading-relaxed relative">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-amber-400 font-sans">
                  <span>📜 विधिक प्रारूप (Legal Notice / Petition Format)</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(p.code || '')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>प्रारूप कॉपी करें</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200">{p.code}</pre>
              </div>
            );
          }
          return (
            <p key={pIdx} className="whitespace-pre-line leading-relaxed">
              {p.text}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 border border-amber-300/40 cursor-pointer group"
          title="AI विधि सहायक से विधिक सलाह लें"
        >
          <div className="relative">
            <Scale className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
          </div>
          <span className="hidden sm:inline text-xs tracking-wide uppercase font-extrabold flex items-center gap-1.5">
            AI विधि सहायक <Sparkles className="w-3 h-3 text-slate-950" />
          </span>
        </button>
      )}

      {/* Main Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 shadow-2xl flex flex-col bg-slate-950 border border-amber-500/30 ${
            isMinimized
              ? 'bottom-4 right-4 w-72 h-14 rounded-2xl'
              : 'bottom-2 right-2 sm:bottom-6 sm:right-6 w-[calc(100vw-1rem)] sm:w-[480px] h-[85vh] max-h-[640px] rounded-2xl overflow-hidden'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  AI विधि सहायक (Legal Assistant)
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400">Criminal &amp; Revenue Bar, District Court Ballia</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white rounded cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-900/60">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-xl p-3 leading-relaxed relative group shadow-md ${
                        m.role === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {renderMessageContent(m.content)}
                      
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(m.content, idx)}
                          title="सम्पूर्ण उत्तर कॉपी करें"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-opacity cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 w-fit text-amber-300 text-xs shadow">
                    <Bot className="w-4 h-4 animate-spin text-amber-400" />
                    <span>विधि विश्लेषण एवं कानूनी प्रारूप तैयार किया जा रहा है...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice Notice Banner */}
              {voiceNotice && (
                <div className="px-3 py-2 bg-amber-500/15 border-t border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span className="leading-tight">{voiceNotice}</span>
                  </div>
                  {voiceNotice.includes('अनुमति') && (
                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px] whitespace-nowrap hover:bg-amber-400 cursor-pointer flex items-center gap-1"
                      title="नई विंडो में खोलने से ब्राउज़र आसानी से माइक अनुमति देता है"
                    >
                      <span>नई विंडो</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Active Listening Floating Banner */}
              {isListening && (
                <div className="mx-3 my-1.5 px-3 py-2 bg-red-950/90 border border-red-500/50 rounded-xl flex items-center justify-between text-xs text-red-200 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <div>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        🎙️ सुन रहा हूँ... बोलिए
                      </span>
                      <p className="text-[10px] text-amber-300 font-mono">
                        रुकने पर {silenceSecondsLeft}s तक खुला रहेगा (बोलते रहें)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => stopVoiceInput('✅ माइक बंद किया गया। अब आप भेज सकते हैं।')}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>रोकें (Done)</span>
                  </button>
                </div>
              )}

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="flex-shrink-0 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded-full border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'बोलना समाप्त करें' : 'बोलकर पूछें (Voice Input)'}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${
                    isListening
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 ring-2 ring-red-400/50'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-500/50'
                  }`}
                >
                  {isListening ? (
                    <Square className="w-4 h-4 fill-current text-white" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? '🎙️ आवाज़ सुनी जा रही है... बोलिए...' : 'कानूनी सवाल पूछें (चेक बाउंस, जमानत, धारा 34/24)...'}
                  className="flex-1 bg-slate-900 text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 cursor-pointer shadow transition-transform active:scale-95"
                  title="भेजें"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
