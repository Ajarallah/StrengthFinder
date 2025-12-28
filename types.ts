
export interface Strength {
  rank: number;
  name: string;
  description?: string;
  domain?: 'Executing' | 'Influencing' | 'Relationship Building' | 'Strategic Thinking';
}

export interface ReportData {
  top5: Strength[];
  full34?: Strength[]; 
  rawText: string;
  userName?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isThinking?: boolean;
  thinkingContent?: string;
}

export interface SavedSession {
  id: string;
  title: string;
  timestamp: number;
  reportData: ReportData;
  messages: ChatMessage[];
  language: Language;
}

export interface AnalyticsInsights {
  pattern: {
    title: string;
    description: string;
  };
  advantage: string;
  blindSpot: string;
  careers: string[];
  combinations: Array<{
    strength1: string;
    strength2: string;
    archetype: string;
    description: string;
    applications: string[];
  }>;
  teamCompatibility: {
    complements: Array<{ strength: string; reason: string }>;
    conflicts: Array<{ strength: string; reason: string }>;
  };
  roadmap: Array<{
    phase: string;
    action: string;
  }>;
}

export enum OutputMode {
  Concise = 'Concise',
  Detailed = 'Detailed'
}

export enum AppState {
  Landing,
  Processing,
  Dashboard
}

export type Language = 'en' | 'ar';
