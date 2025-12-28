import React, { useMemo, useState } from 'react';
import { ReportData, Language } from '../types';
import { Award, Target, Rocket, Briefcase, Users, List, PieChart, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { translations } from '../translations';
import { DomainIcon3D } from './Icons';
import { STRENGTH_TO_DOMAIN_MAP } from '../constants';

interface ReportSummaryProps {
  data: ReportData;
  language: Language;
  onQuickAction: (prompt: string) => void;
}

const DOMAIN_COLORS: Record<string, string> = {
  'Executing': '#623B87',
  'Influencing': '#F6A622',
  'Relationship Building': '#0095D9',
  'Strategic Thinking': '#00A859'
};

const ReportSummary: React.FC<ReportSummaryProps> = ({ data, language, onQuickAction }) => {
  const t = translations[language];
  const profileT = t.profile;
  const insightsT = t.insights;
  const sidebarT = t.sidebar;
  const isRtl = language === 'ar';
  
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [isActionsOpen, setIsActionsOpen] = useState(true);

  // --- Real Data Analysis ---
  const stats = useMemo(() => {
    // Only use the top 5 for the sidebar summary to be accurate to "Authentic Profile"
    // or use full if available but distinct. Usually, "Top 5" is the core.
    // Let's use whatever is displayed in the list.
    const items = data.full34 && data.full34.length > 0 ? data.full34 : data.top5;
    
    const counts: Record<string, number> = {
      'Executing': 0, 'Influencing': 0, 'Relationship Building': 0, 'Strategic Thinking': 0
    };
    
    items.forEach(s => {
      // Map strength name to domain using constant map if domain is missing or just to be safe
      const domain = STRENGTH_TO_DOMAIN_MAP[s.name] || s.domain;
      if (domain && counts[domain] !== undefined) {
        counts[domain]++;
      }
    });

    const total = items.length;

    return { counts, total };
  }, [data]);

  const getDomainLabel = (key: string) => {
    switch(key) {
      case 'Executing': return t.domains.executing;
      case 'Influencing': return t.domains.influencing;
      case 'Relationship Building': return t.domains.relationship;
      case 'Strategic Thinking': return t.domains.strategic;
      default: return key;
    }
  };

  return (
    <div className="h-full flex flex-col glass-panel border-r border-[var(--border-color)] w-full lg:w-[380px] z-20 relative backdrop-blur-2xl bg-[var(--bg-panel)]">
      
      {/* 1. Header & Identity */}
      <div className="p-6 pb-2">
         <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow">
              <span className="text-lg font-black">{data.userName ? data.userName.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div>
               <h2 className="text-xl font-bold text-[var(--text-primary)] leading-tight truncate max-w-[200px]">
                  {data.userName || "User"}
               </h2>
               <div className="flex items-center gap-1.5 mt-1">
                  <Activity size={12} className="text-brand-500" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
                    {data.full34 ? "Strengths 34" : "Top 5"}
                  </span>
               </div>
            </div>
         </div>

         {/* 2. View Toggle */}
         <div className="flex bg-black/10 rounded-xl p-1 border border-[var(--border-color)] mb-6">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title={profileT.listView}
            >
              <List size={14} /> {profileT.listView}
            </button>
            <button 
              onClick={() => setViewMode('chart')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title={profileT.chartView}
            >
              <PieChart size={14} /> {profileT.chartView}
            </button>
         </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-2"></div>
      
      {/* 4. Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {viewMode === 'list' ? (
          <>
            {/* Top 5 Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-color)] text-yellow-500">
                   <Award size={14} />
                 </div>
                 <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{profileT.top5}</h3>
              </div>
              
              <div className="space-y-3">
                {data.top5.map((strength) => {
                  const domain = STRENGTH_TO_DOMAIN_MAP[strength.name] || strength.domain;
                  return (
                    <div 
                      key={strength.name} 
                      className="group relative overflow-hidden rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] hover:border-brand-500/30 transition-all duration-300 p-3 flex items-center gap-3 animate-fade-in"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: DOMAIN_COLORS[domain || ''] }}></div>
                      <div className="relative z-10 p-1 rounded-full bg-black/10 group-hover:scale-110 transition-transform">
                         <DomainIcon3D domain={domain} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">{strength.name}</span>
                            <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-50">#{strength.rank}</span>
                         </div>
                         <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-tighter">{getDomainLabel(domain || '')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Actions Panel */}
            <section className="animate-fade-in">
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="w-full flex items-center justify-between mb-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-color)] text-brand-500">
                     <Target size={14} />
                   </div>
                   {insightsT.quickActions}
                </div>
                {isActionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {isActionsOpen && (
                <div className="grid grid-cols-1 gap-2 animate-fade-in">
                   {insightsT.actions.map((action, i) => (
                      <button 
                        key={i}
                        onClick={() => onQuickAction(action.prompt)}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-left text-xs hover:border-brand-500/30 hover:bg-brand-500/5 transition-all relative overflow-hidden"
                      >
                         <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-all">
                            {i === 0 ? <Rocket size={14} /> : i === 1 ? <Briefcase size={14} /> : <Users size={14} />}
                         </div>
                         <div className="flex-1">
                            <span className="block font-semibold text-[var(--text-primary)]">{action.label}</span>
                         </div>
                      </button>
                   ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="space-y-8 animate-fade-in">
             {/* 1. Domain Counts (Authentic Visualization) */}
             <div>
                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">{profileT.domainDistribution}</h3>
                <div className="space-y-4">
                  {Object.entries(stats.counts).map(([domain, count]) => (
                    <div key={domain}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{getDomainLabel(domain)}</span>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">{count} {t.themes}</span>
                      </div>
                      <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div 
                          className="h-full transition-all duration-1000 ease-out"
                          style={{ width: `${(count / stats.total) * 100}%`, backgroundColor: DOMAIN_COLORS[domain] }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* 2. Strength Sequence Visualization */}
             <div>
                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">{t.profile.listView}</h3>
                <div className="flex flex-wrap gap-2">
                   {data.top5.map((s) => {
                     const domain = STRENGTH_TO_DOMAIN_MAP[s.name] || s.domain;
                     return (
                       <div 
                        key={s.name}
                        title={`${s.name} (#${s.rank})`}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm transition-transform hover:scale-110 cursor-help"
                        style={{ backgroundColor: DOMAIN_COLORS[domain || ''] }}
                       >
                          {s.rank}
                       </div>
                     );
                   })}
                </div>
                <p className="mt-4 text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  Hover ranks to see details.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Insight Widget */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-panel)]">
         <div className="flex gap-3 items-start p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <Info size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
               <p className="text-[10px] text-brand-500 font-bold uppercase mb-1">{sidebarT.authenticProfile}</p>
               <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {sidebarT.profileDescription.replace('{count}', stats.total.toString())}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportSummary;