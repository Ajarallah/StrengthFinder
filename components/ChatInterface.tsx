import React, { useState, useRef, useEffect } from 'react';
import { Send, User, BrainCircuit, Paperclip, Sparkles, Mic, PhoneOff, Download, Save, MessageCircle, Square, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, OutputMode, ReportData, Language } from '../types';
import { sendMessageStream, generateSummary, connectLiveSession } from '../services/geminiService';
import { translations } from '../translations';
import { MascotAvatar, PrismLogo, AbstractShape } from './Icons';
import ExportModal from './ExportModal';

interface ChatInterfaceProps {
  reportData: ReportData;
  language: Language;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  pendingActionPrompt?: string | null;
  onActionHandled?: () => void;
  onSave?: (messages: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  reportData, 
  language, 
  initialMessages = [], 
  onMessagesUpdate,
  pendingActionPrompt,
  onActionHandled,
  onSave
}) => {
  // --- Text Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(initialMessages.length === 0);
  const [outputMode, setOutputMode] = useState<OutputMode>(OutputMode.Detailed); // Default Detailed
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Thinking UI State
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(initialMessages.length > 0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // --- Live Voice State ---
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const liveSessionRef = useRef<any>(null);

  const t = translations[language].chat;
  const tButtons = translations[language].buttons;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isInitializing, isLiveMode, expandedThoughts]);

  useEffect(() => {
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  // Handle pending actions from App
  useEffect(() => {
    if (pendingActionPrompt && !isLoading && !isInitializing) {
      handleSend(pendingActionPrompt);
      if (onActionHandled) onActionHandled();
    }
  }, [pendingActionPrompt, isLoading, isInitializing]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      setIsInitializing(true);
      try {
        const summary = await generateSummary(reportData, language);
        setMessages([{ id: 'intro', role: 'model', content: summary }]);
      } catch (e) {
        setMessages([{ id: 'intro', role: 'model', content: "Ready to coach. Do you want a concise or detailed analysis?" }]);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [reportData, language]);

  const handleSend = async (customText?: string) => {
    const messageText = customText || input;
    if (!messageText.trim() || isLoading || isInitializing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const tempId = (Date.now() + 1).toString();
    const botMessagePlaceholder: ChatMessage = {
      id: tempId,
      role: 'model',
      content: '',
      isThinking: isThinkingMode
    };
    
    setMessages(prev => [...prev, botMessagePlaceholder]);

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let fullText = '';

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const streamResponse = await sendMessageStream({
        history,
        message: userMessage.content,
        reportContext: reportData.rawText,
        reportData: reportData,
        outputMode,
        isThinkingMode,
        language,
        signal: abortController.signal
      });

      for await (const chunk of streamResponse) {
        if (abortController.signal.aborted) break;

        // @ts-ignore - Handle candidates if text is not direct property on chunk in some versions
        const textChunk = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, content: fullText } : msg));
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError' || abortController.signal.aborted) {
         console.log('Generation stopped by user');
      } else {
         console.error("Chat error:", error);
         setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, content: fullText || t.error } : msg));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveSession = () => {
    if (onSave) {
      onSave(messages);
      // Optional: Add visual feedback toast here
      const btn = document.getElementById('save-btn');
      if (btn) {
         const originalText = btn.innerText;
         btn.innerText = t.saved;
         setTimeout(() => btn.innerText = originalText, 2000);
      }
    }
  };

  const startLiveSession = async () => {
    setIsLiveMode(true);
    setIsLiveConnected(false);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;
      source.connect(processor);
      processor.connect(audioCtx.destination);

      const session = await connectLiveSession({
        reportData: reportData,
        onAudioData: (audioFloat32) => {
          if (!audioCtx) return;
          const playBuffer = audioCtx.createBuffer(1, audioFloat32.length, 24000);
          playBuffer.getChannelData(0).set(audioFloat32);
          const source = audioCtx.createBufferSource();
          source.buffer = playBuffer;
          source.connect(audioCtx.destination);
          if (nextStartTimeRef.current < audioCtx.currentTime) {
            nextStartTimeRef.current = audioCtx.currentTime;
          }
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += playBuffer.duration;
        },
        onClose: stopLiveSession,
        onError: stopLiveSession
      });

      liveSessionRef.current = session;
      setIsLiveConnected(true);

      processor.onaudioprocess = (e) => {
        if (!liveSessionRef.current) return;
        liveSessionRef.current.sendAudioChunk(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
    } catch (err) {
      console.error("Failed to start live session", err);
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    if (processorNodeRef.current) { processorNodeRef.current.disconnect(); processorNodeRef.current.onaudioprocess = null; }
    if (sourceNodeRef.current) { sourceNodeRef.current.disconnect(); sourceNodeRef.current.mediaStream.getTracks().forEach(t => t.stop()); }
    if (audioContextRef.current) { audioContextRef.current.close(); }
    if (liveSessionRef.current) { liveSessionRef.current = null; }
    setIsLiveMode(false);
    setIsLiveConnected(false);
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatScenarioText = (text: string) => {
    // Add line breaks before section headers
    let formattedText = text.replace(/السيناريو (الأول|الثاني|الثالث|الرابع):/g, '\n\n**$&**\n');
    formattedText = formattedText.replace(/Scenario (1|2|3|4):/g, '\n\n**$&**\n');
    
    // Add spacing before "الموقف" / "Situation"
    formattedText = formattedText.replace(/الموقف:/g, '\n\n**الموقف:**\n');
    formattedText = formattedText.replace(/Situation:/g, '\n\n**Situation:**\n');
    
    // Add spacing before "الإجراء" / "Action"
    formattedText = formattedText.replace(/الإجراء:/g, '\n**الإجراء:**\n');
    formattedText = formattedText.replace(/Action:/g, '\n**Action:**\n');
    
    // Add spacing before "النتيجة" / "Result"
    formattedText = formattedText.replace(/النتيجة:/g, '\n**النتيجة:**\n');
    formattedText = formattedText.replace(/Result:/g, '\n**Result:**\n');
    
    return formattedText;
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[var(--bg-secondary)]/[0.5]">
      
      {/* Top Floating Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-20 pointer-events-none">
         <div className="pointer-events-auto flex gap-2">
            {isLiveMode && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold animate-pulse backdrop-blur-md">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                LIVE SESSION
              </div>
            )}
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-color)] rounded-full text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-lg"
              title={tButtons.exportChat}
            >
              <Download size={14} />
              <span className="hidden sm:inline">{tButtons.exportChat}</span>
            </button>
            <button 
              id="save-btn"
              onClick={handleSaveSession}
              className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-color)] rounded-full text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-lg"
              title={tButtons.saveSession}
            >
              <Save size={14} />
              <span className="hidden sm:inline">{tButtons.saveSession}</span>
            </button>
         </div>

         <div className="pointer-events-auto flex items-center gap-2 bg-[var(--bg-panel)] backdrop-blur-xl px-2 py-1.5 rounded-full border border-[var(--border-color)] shadow-lg">
            <button 
              onClick={() => setIsThinkingMode(!isThinkingMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isThinkingMode ? 'bg-brand-500/20 text-brand-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
            >
               <BrainCircuit size={14} />
               <span className="hidden sm:inline">{tButtons.deepThink}</span>
            </button>
            <div className="w-px h-4 bg-[var(--border-color)] mx-1"></div>
            
            {/* Detailed Mode Toggle */}
            <button
              onClick={() => setOutputMode(prev => prev === OutputMode.Concise ? OutputMode.Detailed : OutputMode.Concise)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${outputMode === OutputMode.Detailed ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
               <span>{outputMode === OutputMode.Detailed ? tButtons.detailed : tButtons.concise}</span>
               <div className={`w-8 h-4 rounded-full relative transition-colors ${outputMode === OutputMode.Detailed ? 'bg-brand-500' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${outputMode === OutputMode.Detailed ? (language === 'ar' ? 'right-[calc(100%-14px)]' : 'left-[calc(100%-14px)]') : (language === 'ar' ? 'right-0.5' : 'left-0.5')}`}></div>
               </div>
            </button>
         </div>
      </div>

      {isLiveMode ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 animate-fade-in">
           <div className="relative">
              <div className={`absolute inset-0 bg-brand-500 blur-[80px] opacity-20 rounded-full transition-all duration-1000 ${isLiveConnected ? 'scale-150' : 'scale-50'}`}></div>
              <div className={`w-56 h-56 rounded-full glass-panel flex items-center justify-center relative z-10 transition-all duration-700 ${isLiveConnected ? 'animate-float-fast ring-2 ring-brand-500/30' : 'scale-95 grayscale opacity-50'}`}>
                 {isLiveConnected ? <AbstractShape size={140} /> : <LoaderIcon />}
              </div>
           </div>
           <h3 className="text-3xl font-bold text-[var(--text-primary)] mt-12 mb-2 tracking-tight">{isLiveConnected ? "Listening..." : "Connecting..."}</h3>
           <button onClick={stopLiveSession} className="mt-8 group flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-full font-bold transition-all border border-red-500/30 backdrop-blur-md">
             <PhoneOff size={18} /> <span>End Session</span>
           </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-24 pb-4 px-4 sm:px-0 z-10">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full py-6 px-4 sm:px-8 border-b border-transparent">
              <div className="max-w-4xl mx-auto flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'user' ? (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white border border-[var(--border-color)] shadow-lg">
                      <User size={18} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center drop-shadow-xl hover:scale-110 transition-transform cursor-pointer">
                      <PrismLogo size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Thinking Process UI */}
                  {msg.isThinking && msg.role === 'model' && (
                     <div className="mb-4">
                        <button 
                           onClick={() => toggleThought(msg.id)}
                           className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]"
                        >
                           <BrainCircuit size={12} />
                           {t.thinkingProcess}
                           {expandedThoughts[msg.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        
                        {expandedThoughts[msg.id] && (
                           <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-xs font-mono text-[var(--text-secondary)] animate-fade-in">
                              <span className="opacity-50 italic">Analyzing context... Identifying key themes... Structuring response...</span>
                           </div>
                        )}
                     </div>
                  )}

                  <div className={`prose prose-invert max-w-none text-[var(--text-primary)] text-[16px] font-light leading-relaxed
                    ${msg.role === 'user' ? 'bg-[var(--bg-panel)] p-4 rounded-2xl rounded-tl-none border border-[var(--border-color)]' : ''}
                  `}>
                    {msg.isThinking && !msg.content ? (
                      <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs font-bold animate-pulse uppercase tracking-wide px-2">
                        <Sparkles size={14} className="text-brand-500" /> {t.thinking}
                      </div>
                    ) : (
                      <ReactMarkdown 
                        components={{
                          strong: ({node, ...props}) => <strong style={{color: 'var(--accent)', display: 'block', marginTop: '1rem', marginBottom: '0.5rem'}} {...props} />,
                          p: ({node, ...props}) => <p style={{marginBottom: '1rem', lineHeight: '1.8'}} {...props} />
                        }}
                      >
                        {formatScenarioText(msg.content)}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Starter Questions Empty State */}
          {messages.length === 1 && !isLoading && !isInitializing && (
            <div className="max-w-4xl mx-auto px-8 py-10 animate-fade-in">
               <div className="flex items-center gap-2 mb-6 text-brand-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <MessageCircle size={14} /> Recommended Topics
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left p-4 rounded-2xl glass-panel border border-[var(--border-color)] hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] group"
                    >
                      {q}
                    </button>
                  ))}
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}

      {!isLiveMode && (
        <div className="w-full pt-4 pb-8 px-4 z-20">
          <div className="max-w-3xl mx-auto relative">
            <div className={`
              relative flex items-end glass-panel rounded-[32px] transition-all 
              ${isLoading ? 'opacity-100' : 'hover:border-white/20 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/30'}
            `}>
              <button 
                onClick={startLiveSession} 
                disabled={isLoading}
                className="ml-2 mb-2 p-3 text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white transition-all rounded-full hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed" 
                title={t.startVoice}
              >
                <Mic size={20} />
              </button>
              <button disabled={isLoading} className="ml-1 my-3.5 p-2 text-gray-500 hover:text-white transition-colors rounded-full" title="Attach File">
                <Paperclip size={20} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? t.placeholderWaiting : t.inputPlaceholder}
                className="flex-1 max-h-[200px] py-4 px-3 bg-transparent text-[var(--text-primary)] placeholder-gray-500 resize-none focus:outline-none text-[15px] leading-relaxed custom-scrollbar font-medium"
                rows={1}
                style={{ minHeight: '56px' }}
                disabled={isLoading || isInitializing}
              />
              
              {isLoading ? (
                  <button
                    onClick={stopGeneration}
                    className="mr-3 mb-3 p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-glow"
                    title={t.stopGeneration}
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
              ) : (
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isInitializing}
                    className={`mr-3 mb-3 p-3 rounded-full transition-all duration-300 ${input.trim() ? 'bg-brand-500 text-white shadow-glow hover:scale-105' : 'bg-gray-500 opacity-20 cursor-default'}`}
                  >
                    <Send size={18} fill={input.trim() ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
              )}
            </div>
            
            {/* Keyboard Hint */}
            <div className="mt-3 flex justify-center">
               <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                 {t.shortcutHint}
               </span>
            </div>
          </div>
        </div>
      )}

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        language={language}
        messages={messages}
        reportData={reportData}
      />
    </div>
  );
};

const LoaderIcon = () => (
  <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default ChatInterface;