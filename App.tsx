import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import ReportSummary from './components/ReportSummary';
import ChatInterface from './components/ChatInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SessionHistory from './components/SessionHistory';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import { AppState, ReportData, Language, SavedSession, ChatMessage } from './types';
import { translations } from './translations';
import { Zap, Target, Sparkles, BrainCircuit, Rocket, Lightbulb } from 'lucide-react';
import { AbstractShape } from './components/Icons';
import { getAllSessions, saveSession, createNewSession } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Landing);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<'chat' | 'analytics'>('chat');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [pendingActionPrompt, setPendingActionPrompt] = useState<string | null>(null);
  
  const t = translations[language];

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Load sessions on mount
  useEffect(() => {
    setSavedSessions(getAllSessions());
  }, []);

  const handleReportLoaded = (data: ReportData) => {
    const newSession = createNewSession(data, [], language);
    setReportData(data);
    setCurrentSessionId(newSession.id);
    setActiveMessages([]);
    saveSession(newSession);
    setSavedSessions(getAllSessions());
    setAppState(AppState.Dashboard);
  };

  const handleSelectSession = (session: SavedSession) => {
    setReportData(session.reportData);
    setCurrentSessionId(session.id);
    setActiveMessages(session.messages);
    setLanguage(session.language);
    setAppState(AppState.Dashboard);
  };

  const handleMessagesUpdate = useCallback((messages: ChatMessage[]) => {
    if (currentSessionId && reportData) {
      setActiveMessages(messages);
      const session = getAllSessions().find(s => s.id === currentSessionId);
      if (session) {
        saveSession({
          ...session,
          messages,
          timestamp: Date.now()
        });
      }
    }
  }, [currentSessionId, reportData]);

  // For manual save trigger
  const forceSaveSession = (messages: ChatMessage[]) => {
     if (currentSessionId && reportData) {
        handleMessagesUpdate(messages);
        setSavedSessions(getAllSessions());
     }
  };

  const handleReset = () => {
    setReportData(null);
    setAppState(AppState.Landing);
    setCurrentView('chat');
    setCurrentSessionId(null);
    setActiveMessages([]);
    setSavedSessions(getAllSessions());
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleQuickAction = (prompt: string) => {
    setPendingActionPrompt(prompt);
    setCurrentView('chat');
  };

  const Features = [
    { icon: <Rocket size={20} />, title: t.features.launch.title, desc: t.features.launch.desc },
    { icon: <Target size={20} />, title: t.features.target.title, desc: t.features.target.desc },
    { icon: <Sparkles size={20} />, title: t.features.shine.title, desc: t.features.shine.desc }
  ];

  // Progress logic
  const currentStep = useMemo((): 1 | 2 | 3 | 4 => {
    if (appState === AppState.Landing) return 1;
    if (appState === AppState.Dashboard) {
       return activeMessages.length > 0 ? 4 : 3;
    }
    return 1;
  }, [appState, activeMessages]);

  // Daily Tip Logic
  const dailyTip = useMemo(() => {
    const tips = t.insights.dailyTips;
    const dayIndex = new Date().getDate() % tips.length;
    return tips[dayIndex];
  }, [t]);

  return (
    <div 
      className={`h-screen w-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans relative ${theme}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Global Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <div className={`absolute top-[-20%] left-[10%] w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse-slow ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-200/20'}`}></div>
         <div className={`absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-teal-900/10' : 'bg-teal-200/20'}`}></div>
      </div>

      <Header 
        appState={appState}
        language={language}
        onToggleLanguage={toggleLanguage}
        onReset={handleReset}
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full relative z-10 flex flex-col min-h-0 pt-24 pb-0">
        
        {/* Universal Progress Bar */}
        <ProgressBar currentStep={currentStep} language={language} />

        {appState === AppState.Landing && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-12">
              
              {/* HERO */}
              <div className="flex flex-col lg:flex-row gap-16 items-center mb-16 animate-fade-in">
                <div className="flex-1 text-center lg:text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-brand-500 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md mb-8">
                    <Zap size={12} fill="currentColor" /> {t.badge}
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6">
                    {language === 'ar' ? t.heroTitle.split(' ').reverse().join(' ') : t.heroTitle} <br/>
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)] to-gray-500">
                      {t.heroHighlight}
                    </span>
                  </h1>
                  
                  <p className="text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                    {t.heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-8 justify-center lg:justify-start items-center opacity-60">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full bg-brand-500/10 border border-[var(--border-color)] backdrop-blur-sm"></div>
                        ))}
                     </div>
                     <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">{t.trustedBy}</span>
                  </div>
                </div>

                <div className="w-full lg:max-w-md relative perspective-1000 group">
                   <div className="absolute -top-20 -right-20 pointer-events-none opacity-60 scale-75 lg:scale-100">
                      <AbstractShape size={300} color="#10a37f" />
                   </div>
                   <div className="relative transform transition-all duration-700 hover:rotate-1 hover:scale-[1.01] z-10 flex flex-col gap-6">
                      <FileUpload onReportLoaded={handleReportLoaded} language={language} />
                      
                      {/* Daily Tip Card */}
                      <div className="glass-panel p-6 rounded-[24px] border-brand-500/20 bg-brand-500/[0.02] relative overflow-hidden group/tip">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/tip:opacity-20 transition-opacity">
                            <Lightbulb size={48} className="text-brand-400" />
                         </div>
                         <h4 className="text-xs font-black text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Lightbulb size={14} /> {t.insights.dailyTipTitle}
                         </h4>
                         <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                           "{dailyTip}"
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Session History Section */}
              <SessionHistory 
                sessions={savedSessions} 
                onSelect={handleSelectSession} 
                onRefresh={() => setSavedSessions(getAllSessions())}
                language={language}
              />

              {/* FEATURES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-24 mb-24">
                 <div className="md:col-span-7 glass-panel rounded-[32px] p-10 relative overflow-hidden group min-h-[300px] flex flex-col justify-end">
                    <div className={`absolute inset-0 bg-gradient-to-tr opacity-50 ${theme === 'dark' ? 'from-purple-500/10' : 'from-purple-200/20'}`}></div>
                    <div className="absolute top-10 right-10 opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                       <BrainCircuit size={120} strokeWidth={0.5} />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{t.features.visualIntelligence.title}</h3>
                       <p className="text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed">
                          {t.features.visualIntelligence.desc}
                       </p>
                    </div>
                 </div>

                 <div className="md:col-span-5 glass-panel rounded-[32px] p-10 relative overflow-hidden group flex flex-col justify-between">
                    <div className={`absolute inset-0 bg-gradient-to-bl ${theme === 'dark' ? 'from-brand-500/10' : 'from-brand-500/5'}`}></div>
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-4 text-brand-500">
                       <Sparkles size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{t.features.personalCoach.title}</h3>
                       <p className="text-[var(--text-secondary)] text-sm">{t.features.personalCoach.desc}</p>
                    </div>
                 </div>

                 {Features.map((feat, i) => (
                   <div key={i} className="md:col-span-4 glass-panel rounded-[24px] p-6 flex flex-col gap-3 hover:bg-[var(--bg-panel)] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-brand-500/5 flex items-center justify-center text-brand-500">
                         {feat.icon}
                      </div>
                      <div>
                         <h4 className="font-semibold text-[var(--text-primary)] text-sm">{feat.title}</h4>
                         <p className="text-xs text-[var(--text-secondary)] mt-1">{feat.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>

            </div>
          </div>
        )}

        {appState === AppState.Dashboard && reportData && (
          <div className="w-full h-full flex overflow-hidden">
            {currentView === 'chat' ? (
              <>
                <div className="hidden lg:block h-full relative z-20 pl-6 py-6 w-auto">
                   <ReportSummary 
                    data={reportData} 
                    language={language} 
                    onQuickAction={handleQuickAction}
                   />
                </div>
                <div className="flex-1 h-full relative z-10 p-0 lg:p-6 lg:pl-0">
                   <div className="w-full h-full lg:rounded-3xl overflow-hidden glass-panel border-0 lg:border">
                     <ChatInterface 
                        reportData={reportData} 
                        language={language} 
                        initialMessages={activeMessages}
                        onMessagesUpdate={handleMessagesUpdate}
                        pendingActionPrompt={pendingActionPrompt}
                        onActionHandled={() => setPendingActionPrompt(null)}
                        onSave={forceSaveSession}
                     />
                   </div>
                </div>
              </>
            ) : (
              // Note: We need to pass language here properly in next iteration, 
              // currently relying on internal fallback
              <div className="w-full h-full relative z-10">
                <AnalyticsDashboard data={{...reportData, language} as any} />
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;