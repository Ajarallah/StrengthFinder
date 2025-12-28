import React, { useMemo, useState, useEffect } from 'react';
import { ReportData, Strength, Language, AnalyticsInsights } from '../types';
import { DomainIcon3D } from './Icons';
import { TrendingUp, AlertTriangle, Target, Zap, Users, Briefcase, Map, ShieldCheck, Star, BrainCircuit } from 'lucide-react';
import { translations } from '../translations';
import { generateAnalyticsInsights } from '../services/geminiService';
import { STRENGTH_TO_DOMAIN_MAP } from '../constants';

interface AnalyticsDashboardProps {
  data: ReportData;
}

const DOMAIN_COLORS: Record<string, string> = {
  'Executing': '#623B87',
  'Influencing': '#F6A622',
  'Relationship Building': '#0095D9',
  'Strategic Thinking': '#00A859'
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  // Use passed language or fallback
  const language = (data as any).language || 'en'; 
  const t = translations[language as Language];
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'deep' | 'roadmap'>('overview');
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // --- 1. CORRECT DATA CALCULATION ---
  const analysis = useMemo(() => {
    // Only count what we ACTUALLY have. 
    // If full34 is present, use it for distribution stats, otherwise top5.
    const sourceItems = data.full34 && data.full34.length > 0 ? data.full34 : data.top5;
    const totalItems = sourceItems.length;

    const counts: Record<string, number> = {
      'Executing': 0, 'Influencing': 0, 'Relationship Building': 0, 'Strategic Thinking': 0
    };

    sourceItems.forEach(s => {
      const domain = STRENGTH_TO_DOMAIN_MAP[s.name] || s.domain;
      if (domain && counts[domain] !== undefined) {
        counts[domain]++;
      }
    });

    const sortedDomains = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const dominant = sortedDomains[0][0];

    return { counts, totalItems, dominant, sortedDomains };
  }, [data]);

  // --- 2. FETCH AI INSIGHTS ---
  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const result = await generateAnalyticsInsights(data, language as Language);
      if (result) {
        setInsights(result);
      }
      setLoadingInsights(false);
    };

    fetchInsights();
  }, [data, language]);

  const getDomainLabel = (key: string) => {
    switch(key) {
      case 'Executing': return t.domains.executing;
      case 'Influencing': return t.domains.influencing;
      case 'Relationship Building': return t.domains.relationship;
      case 'Strategic Thinking': return t.domains.strategic;
      default: return key;
    }
  };

  const getBasedOnText = () => {
    if (language === 'ar') {
      return `بناءً على ${analysis.totalItems} ${analysis.totalItems === 1 ? 'سمة' : 'سمات'}`;
    }
    return `Based on ${analysis.totalItems} theme${analysis.totalItems === 1 ? '' : 's'}`;
  };

  // --- SUB-COMPONENTS ---

  const DonutChart = () => {
    const total = analysis.totalItems;
    let accumulatedDeg = 0;
    
    // Fallback if no data
    if (total === 0) return null;

    return (
      <div className="relative w-48 h-48 mx-auto my-6">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {Object.entries(analysis.counts).map(([domain, count], i) => {
            if (count === 0) return null;
            
            // stroke-dasharray method: value + space
            // circumference of circle with r=15.915 is approx 100.
            const radius = 15.91549430918954;
            const percentage = (count / total) * 100;
            const offset = accumulatedDeg;
            accumulatedDeg += percentage;

            return (
               <circle
                key={domain}
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke={DOMAIN_COLORS[domain]}
                strokeWidth="8"
                strokeDasharray={`${percentage} 100`}
                strokeDashoffset={-offset}
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-2xl font-bold text-[var(--text-primary)]">{analysis.totalItems}</span>
           <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{t.themes}</span>
        </div>
      </div>
    );
  };

  const InsightSkeleton = () => (
    <div className="animate-pulse space-y-4 w-full">
       <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4"></div>
       <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2"></div>
       <div className="h-32 bg-[var(--bg-secondary)] rounded-xl w-full"></div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER TABS */}
      <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-6 pt-6 pb-0">
        <div className="max-w-6xl mx-auto flex items-end gap-8 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
           >
             {t.insights.overview}
           </button>
           <button 
             onClick={() => setActiveTab('deep')}
             className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'deep' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
           >
             {t.insights.deepDive}
           </button>
           <button 
             onClick={() => setActiveTab('roadmap')}
             className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'roadmap' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
           >
             {t.insights.roadmap}
           </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-10">
        
        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
             
             {/* LEFT COL: PROFILE SUMMARY */}
             <div className="lg:col-span-5 space-y-6">
                
                {/* Identity Card */}
                <div className="glass-panel rounded-[32px] p-8 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
                   <div className="w-20 h-20 mx-auto rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4 ring-1 ring-brand-500/20">
                      <Users size={32} />
                   </div>
                   {loadingInsights ? (
                     <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/2 mx-auto animate-pulse"></div>
                   ) : (
                     <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {insights?.pattern?.title || t.profile.authenticProfile}
                     </h2>
                   )}
                   <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                     {loadingInsights ? t.insights.generating : insights?.pattern?.description || t.profile.authenticProfileDesc.replace('{count}', analysis.totalItems.toString())}
                   </p>
                </div>

                {/* Distribution */}
                <div className="glass-panel rounded-[32px] p-8">
                   <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t.profile.domainDistribution}</h3>
                      <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
                         {getBasedOnText()}
                      </span>
                   </div>
                   
                   <DonutChart />

                   <div className="space-y-4">
                      {analysis.sortedDomains.map(([domain, count]) => (
                        <div key={domain} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] }}></div>
                              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{getDomainLabel(domain)}</span>
                           </div>
                           <div className="text-sm font-bold font-mono">
                              {count} <span className="text-[10px] text-[var(--text-tertiary)] font-normal">{t.themes}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

             </div>

             {/* RIGHT COL: INSIGHTS & TOP 5 */}
             <div className="lg:col-span-7 space-y-6">
                
                {/* Smart Insight: Core Advantage */}
                <div className="glass-panel rounded-[24px] p-6 relative overflow-hidden border-l-4 border-l-brand-500">
                   <div className="absolute top-4 right-4 text-brand-500 opacity-20">
                      <Zap size={48} />
                   </div>
                   <h3 className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Star size={14} fill="currentColor" /> {t.profile.coreAdvantage}
                   </h3>
                   {loadingInsights ? <InsightSkeleton /> : (
                      <p className="text-[var(--text-primary)] leading-relaxed text-sm md:text-base">
                         {insights?.advantage}
                      </p>
                   )}
                </div>

                {/* Top 5 Cards */}
                <div>
                   <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 ml-1">{t.insights.topThemes}</h3>
                   <div className="space-y-3">
                      {data.top5.map((s) => {
                         const domain = STRENGTH_TO_DOMAIN_MAP[s.name] || s.domain;
                         return (
                           <div key={s.name} className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-brand-500/30 transition-all group">
                              <div className="text-lg font-black text-[var(--text-tertiary)] w-8 text-center">{s.rank}</div>
                              <div className="p-2 rounded-lg bg-[var(--bg-secondary)] group-hover:scale-110 transition-transform">
                                 <DomainIcon3D domain={domain} size={24} />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-[var(--text-primary)]">{s.name}</h4>
                                 <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]" style={{ color: DOMAIN_COLORS[domain || ''] }}>
                                    {getDomainLabel(domain || '')}
                                 </span>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>

             </div>
          </div>
        )}

        {/* --- TAB: DEEP DIVE --- */}
        {activeTab === 'deep' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              
              {/* Combinations */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                    <BrainCircuit size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.insights.combinations}</h3>
                 </div>
                 
                 {loadingInsights ? (
                    <>
                     <div className="glass-panel h-40 rounded-2xl animate-pulse bg-[var(--bg-secondary)]"></div>
                     <div className="glass-panel h-40 rounded-2xl animate-pulse bg-[var(--bg-secondary)]"></div>
                    </>
                 ) : (
                    insights?.combinations.map((combo, i) => (
                       <div key={i} className="glass-panel rounded-[24px] p-6 group hover:bg-[var(--bg-secondary)]/[0.5] transition-colors relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                             <BrainCircuit size={80} />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[var(--text-tertiary)]">
                             <span className="px-2 py-1 rounded bg-[var(--bg-secondary)]">{combo.strength1}</span>
                             <span>+</span>
                             <span className="px-2 py-1 rounded bg-[var(--bg-secondary)]">{combo.strength2}</span>
                          </div>
                          
                          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                             "{combo.archetype}"
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                             {combo.description}
                          </p>
                          
                          <div>
                             <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{t.insights.idealFor}</span>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {combo.applications.map((app, j) => (
                                   <span key={j} className="text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                                      {app}
                                   </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>

              {/* Team Compatibility & Blind Spots */}
              <div className="space-y-8">
                 
                 {/* Blind Spot */}
                 <div className="glass-panel rounded-[24px] p-6 border-l-4 border-l-orange-500">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <AlertTriangle size={14} /> {t.profile.blindSpot}
                    </h3>
                    {loadingInsights ? <InsightSkeleton /> : (
                       <p className="text-[var(--text-primary)] leading-relaxed text-sm">
                          {insights?.blindSpot}
                       </p>
                    )}
                 </div>

                 {/* Team Fit */}
                 <div>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Users size={16} /> {t.insights.teamFit}
                    </h3>
                    
                    <div className="glass-panel rounded-[24px] p-6 space-y-6">
                       {loadingInsights ? <InsightSkeleton /> : (
                          <>
                             <div>
                                <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-3">{t.insights.complements}</h4>
                                <div className="space-y-3">
                                   {insights?.teamCompatibility.complements.map((item, i) => (
                                      <div key={i} className="flex items-start gap-3 text-sm">
                                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                         <div>
                                            <span className="font-bold text-[var(--text-primary)] block">{item.strength}</span>
                                            <span className="text-[var(--text-secondary)] text-xs">{item.reason}</span>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             <div className="h-px bg-[var(--border-color)]"></div>

                             <div>
                                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">{t.insights.conflicts}</h4>
                                <div className="space-y-3">
                                   {insights?.teamCompatibility.conflicts.map((item, i) => (
                                      <div key={i} className="flex items-start gap-3 text-sm">
                                         <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                                         <div>
                                            <span className="font-bold text-[var(--text-primary)] block">{item.strength}</span>
                                            <span className="text-[var(--text-secondary)] text-xs">{item.reason}</span>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </>
                       )}
                    </div>
                 </div>
              </div>

           </div>
        )}

        {/* --- TAB: ROADMAP --- */}
        {activeTab === 'roadmap' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Careers */}
              <div className="lg:col-span-4">
                 <div className="glass-panel rounded-[32px] p-8 sticky top-24">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                       <Briefcase size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{t.insights.careerAlignment}</h3>
                    
                    {loadingInsights ? <InsightSkeleton /> : (
                       <ul className="space-y-3">
                          {insights?.careers.map((career, i) => (
                             <li key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                                <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                                   <Target size={14} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">{career}</span>
                             </li>
                          ))}
                       </ul>
                    )}
                 </div>
              </div>

              {/* Development Roadmap */}
              <div className="lg:col-span-8">
                 <div className="flex items-center gap-3 mb-6">
                    <Map size={20} className="text-[var(--text-primary)]" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">{t.insights.roadmap}</h3>
                 </div>

                 <div className="space-y-6 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[var(--border-color)]"></div>
                    
                    {loadingInsights ? (
                       <div className="space-y-6">
                          <div className="glass-panel h-24 rounded-2xl animate-pulse bg-[var(--bg-secondary)]"></div>
                          <div className="glass-panel h-24 rounded-2xl animate-pulse bg-[var(--bg-secondary)]"></div>
                          <div className="glass-panel h-24 rounded-2xl animate-pulse bg-[var(--bg-secondary)]"></div>
                       </div>
                    ) : (
                       insights?.roadmap.map((step, i) => (
                          <div key={i} className="relative pl-12 group">
                             <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--bg-secondary)] flex items-center justify-center z-10 group-hover:border-brand-500 transition-colors">
                                <span className="text-xs font-bold text-[var(--text-secondary)]">{i+1}</span>
                             </div>
                             
                             <div className="glass-panel rounded-[24px] p-6 hover:-translate-y-1 transition-transform duration-300">
                                <h4 className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">{step.phase}</h4>
                                <p className="text-[var(--text-primary)] text-sm leading-relaxed">
                                   {step.action}
                                </p>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

           </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsDashboard;