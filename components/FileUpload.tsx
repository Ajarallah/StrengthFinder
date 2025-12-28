import React, { useRef, useState } from 'react';
import { Loader2, AlertCircle, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { extractTextFromPdf } from '../services/pdfService';
import { parseReport } from '../services/geminiService';
import { ReportData, Language } from '../types';
import { translations } from '../translations';
import { UploadIcon3D, MascotAvatar } from './Icons';

interface FileUploadProps {
  onReportLoaded: (data: ReportData) => void;
  language: Language;
}

const FileUpload: React.FC<FileUploadProps> = ({ onReportLoaded, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'extracting' | 'analyzing'>('extracting');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const t = translations[language].upload;

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError(t.error);
      return;
    }

    setIsProcessing(true);
    setLoadingPhase('extracting');
    setError(null);

    try {
      const text = await extractTextFromPdf(file);
      if (!text || text.length < 50) {
        throw new Error("Could not extract enough text. Is the PDF scanned?");
      }

      setLoadingPhase('analyzing');
      const reportData = await parseReport(text);
      if (!reportData) {
        throw new Error("Could not identify CliftonStrengths data in this file.");
      }

      onReportLoaded(reportData);
    } catch (err: any) {
      setError(err.message || "An error occurred while processing the file.");
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = () => setIsDragging(false);
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full mx-auto relative">
      {/* Privacy Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/5 border border-brand-500/10 text-brand-500 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
          <Lock size={12} /> {t.secureBadge}
        </div>
      </div>

      {/* Premium Glass Dropzone */}
      <div 
        className={`
          relative group cursor-pointer transition-all duration-500 transform
          rounded-[32px] p-10 flex flex-col items-center justify-center gap-6
          glass-panel overflow-hidden
          ${isDragging ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-500/5' : 'hover:border-brand-500/30 hover:bg-brand-500/5'}
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{ minHeight: '280px' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
        
        {/* Mascot Peeking */}
        <div className="absolute -bottom-10 -right-6 pointer-events-none transition-transform duration-700 group-hover:translate-y-0 translate-y-4 opacity-80 group-hover:opacity-100">
            <MascotAvatar size={110} pose={isProcessing ? "thinking" : "happy"} />
        </div>
        
        {/* Center Icon */}
        <div className={`relative z-10 transition-transform duration-500 ${isProcessing ? 'scale-90' : 'group-hover:scale-110 group-hover:-translate-y-2'}`}>
          {isProcessing ? (
             <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-500 blur-xl opacity-40 animate-pulse"></div>
                  <Loader2 size={64} className="text-brand-500 animate-spin relative z-10" />
                </div>
                {/* Skeleton Loader Simulation */}
                <div className="w-32 h-2 bg-black/10 rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div className="h-full bg-brand-500 animate-shine w-full"></div>
                </div>
             </div>
          ) : (
             <UploadIcon3D size={88} />
          )}
        </div>

        <div className="text-center space-y-2 relative z-10 max-w-[280px]">
          <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {isProcessing ? (loadingPhase === 'extracting' ? t.extracting : t.analyzing) : t.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            {isProcessing ? (language === 'ar' ? 'تحليل الأنماط والسمات...' : 'Parsing strengths and patterns...') : t.subtitle}
          </p>
        </div>

        {/* Glass Button */}
        {!isProcessing && (
          <div className="mt-2 px-8 py-2.5 bg-brand-500 text-white rounded-full text-sm font-bold backdrop-blur-md transition-all relative z-10 hover:shadow-glow hover:scale-105">
            {t.button}
          </div>
        )}
      </div>

      {/* Enhanced Error Feedback */}
      {error && (
        <div className="mt-8 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="glass-panel rounded-[24px] p-6 border-red-500/20 bg-red-500/[0.02]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                <span className="text-2xl">🤔</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">{t.errorFriendlyTitle}</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{t.errorFriendlyBody}</p>
                
                <div className="space-y-2">
                  {t.errorSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-red-500/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/40"></div>
                      {suggestion}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;