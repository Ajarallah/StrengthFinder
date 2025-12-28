import React from 'react';
import { Upload, FileSearch, LineChart, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  language: Language;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, language }) => {
  const t = translations[language].progressSteps;
  const isRtl = language === 'ar';

  const steps = [
    { id: 1, label: t.upload, icon: Upload },
    { id: 2, label: t.extract, icon: FileSearch },
    { id: 3, label: t.analyze, icon: LineChart },
    { id: 4, label: t.coach, icon: MessageSquare },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            [isRtl ? 'right' : 'left']: 0,
            [isRtl ? 'left' : 'right']: 'auto'
          }}
        ></div>

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${isActive ? 'bg-brand-500 text-white shadow-glow' : 'bg-[#1a1a1a] text-gray-600 border border-white/5'}
                  ${isCurrent ? 'ring-4 ring-brand-500/20 scale-110' : ''}
                `}
                title={step.label}
              >
                <Icon size={18} />
              </div>
              <span 
                className={`
                  text-[10px] font-bold uppercase tracking-widest transition-colors duration-500
                  ${isActive ? 'text-brand-400' : 'text-gray-600'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;