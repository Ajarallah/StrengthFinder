import React from 'react';
import { FileText, FileCode, Clipboard, X, Check } from 'lucide-react';
import { Language, ChatMessage, ReportData } from '../types';
import { translations } from '../translations';

// Declaration for jspdf
declare const jspdf: any;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  messages: ChatMessage[];
  reportData: ReportData;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, language, messages, reportData }) => {
  if (!isOpen) return null;

  const t = translations[language].exportModal;
  const isRtl = language === 'ar';
  const [success, setSuccess] = React.useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleCopy = async () => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    showSuccess(t.copySuccess);
  };

  const handleMarkdown = () => {
    const text = messages.map(m => `### ${m.role.toUpperCase()}\n\n${m.content}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Coaching_Session_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    showSuccess(t.mdSuccess);
  };

  const handlePDF = () => {
    try {
        if (typeof jspdf === 'undefined') {
            alert('PDF library not loaded');
            return;
        }
        
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("StrengthsCoach AI Session", 10, 10);
        
        doc.setFontSize(12);
        doc.text(`User: ${reportData.userName || 'Guest'}`, 10, 20);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 28);
        
        let y = 40;
        const pageWidth = 180;
        const margin = 10;
        const pageHeight = 280;

        messages.forEach((msg) => {
            if (y > pageHeight) {
                doc.addPage();
                y = 10;
            }
            
            doc.setFont(undefined, 'bold');
            doc.setTextColor(msg.role === 'model' ? '#10a37f' : '#000000');
            doc.text(`${msg.role.toUpperCase()}:`, margin, y);
            y += 7;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor('#000000');
            
            // Clean markdown roughly for PDF readability
            const cleanContent = msg.content.replace(/\*\*/g, '').replace(/###/g, '');
            const lines = doc.splitTextToSize(cleanContent, pageWidth);
            
            doc.text(lines, margin, y);
            y += (lines.length * 7) + 10;
        });
        
        doc.save(`Coaching_Session_${new Date().toISOString().slice(0, 10)}.pdf`);
        showSuccess(t.pdfSuccess);
    } catch (e) {
        console.error(e);
        alert('Failed to generate PDF');
    }
  };

  const options = [
    { id: 'pdf', label: t.pdf, icon: FileText, color: 'text-red-400', action: handlePDF },
    { id: 'markdown', label: t.markdown, icon: FileCode, color: 'text-blue-400', action: handleMarkdown },
    { id: 'copy', label: t.copy, icon: Clipboard, color: 'text-brand-400', action: handleCopy },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass-panel w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6 flex justify-between items-center border-b border-[var(--border-color)]">
          <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{t.title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
            >
              <div className={`p-3 rounded-xl bg-black/10 ${option.color} group-hover:scale-110 transition-transform`}>
                <option.icon size={24} />
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{option.label}</span>
            </button>
          ))}
        </div>

        {success && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-brand-500 text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-glow">
                    <Check size={18} /> {success}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;