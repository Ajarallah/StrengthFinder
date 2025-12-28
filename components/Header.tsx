import React from 'react';
import { ArrowLeft, BarChart2, MessageSquare, Sun, Moon } from 'lucide-react';
import { AppState, Language } from '../types';
import { translations } from '../translations';
import { PrismLogo } from './Icons';

interface HeaderProps {
  appState: AppState;
  language: Language;
  onToggleLanguage: () => void;
  onReset: () => void;
  currentView: 'chat' | 'analytics';
  onViewChange: (view: 'chat' | 'analytics') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  appState, 
  language, 
  onToggleLanguage, 
  onReset,
  currentView,
  onViewChange,
  theme,
  onToggleTheme
}) => {
  const t = translations[language];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none">
      <header className="pointer-events-auto w-full max-w-5xl mx-auto glass-panel rounded-full px-4 py-2 sm:py-3 flex items-center justify-between transition-all duration-500 hover:bg-white/[0.07]">
        
        {/* Brand */}
        <div className="flex items-center gap-3 select-none cursor-default pl-2">
           <div className="relative group">
              <div className="absolute inset-0 bg-brand-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
              <PrismLogo size={32} />
           </div>
           
           <div className="hidden sm:flex flex-col justify-center h-full">
             <h1 className="font-semibold text-lg text-[var(--text-primary)] tracking-tight leading-none">
               {t.appTitle}
             </h1>
           </div>
        </div>
        
        {/* Center Toggle (Visible only in Dashboard) */}
        {appState === AppState.Dashboard && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-md">
                <button
                    onClick={() => onViewChange('chat')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                        currentView === 'chat' 
                        ? 'bg-brand-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <MessageSquare size={14} />
                    <span className="hidden sm:inline">Coach</span>
                </button>
                <button
                    onClick={() => onViewChange('analytics')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                        currentView === 'analytics' 
                        ? 'bg-brand-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <BarChart2 size={14} />
                    <span className="hidden sm:inline">Insights</span>
                </button>
            </div>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
           {appState === AppState.Dashboard && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 sm:px-4 py-2 rounded-full uppercase tracking-wider transition-colors"
              title={t.uploadNew}
            >
              <ArrowLeft size={14} className={language === 'ar' ? 'rotate-180' : ''} /> 
              <span className="hidden sm:inline">{t.uploadNew}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title={theme === 'dark' ? t.themeToggle.light : t.themeToggle.dark}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="text-[10px] font-bold tracking-widest px-3 py-2 rounded-full min-w-[40px] text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;