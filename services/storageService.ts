import { SavedSession, ReportData, ChatMessage, Language } from '../types';

const STORAGE_KEY = 'strengths_coach_sessions';

export const saveSession = (session: SavedSession): void => {
  const sessions = getAllSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const getAllSessions = (): SavedSession[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse sessions from storage", e);
    return [];
  }
};

export const deleteSession = (id: string): void => {
  const sessions = getAllSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const renameSession = (id: string, newTitle: string): void => {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.title = newTitle;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
};

export const createNewSession = (reportData: ReportData, messages: ChatMessage[], language: Language): SavedSession => {
  const title = reportData.userName ? `Report: ${reportData.userName}` : `Session ${new Date().toLocaleDateString()}`;
  return {
    id: crypto.randomUUID(),
    title,
    timestamp: Date.now(),
    reportData,
    messages,
    language
  };
};