import React, { useState } from 'react';
import { Clock, Trash2, Edit2, ChevronRight, Check, X } from 'lucide-react';
import { SavedSession, Language } from '../types';
import { deleteSession, renameSession } from '../services/storageService';

interface SessionHistoryProps {
  sessions: SavedSession[];
  onSelect: (session: SavedSession) => void;
  onRefresh: () => void;
  language: Language;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onSelect, onRefresh, language }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    onRefresh();
  };

  const startEdit = (e: React.MouseEvent, session: SavedSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const saveEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    renameSession(id, editValue);
    setEditingId(null);
    onRefresh();
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  if (sessions.length === 0) return null;

  return (
    <div className="w-full mt-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Clock size={16} className="text-gray-500" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Sessions</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSelect(session)}
            className="group relative glass-panel p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-white/5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#10a37f] group-hover:scale-110 transition-transform">
               <Clock size={18} />
            </div>
            
            <div className="flex-1 min-w-0">
              {editingId === session.id ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input 
                    autoFocus
                    className="bg-black/20 border border-white/10 rounded px-2 py-0.5 text-sm text-white w-full focus:outline-none focus:border-[#10a37f]"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(e as any, session.id);
                        if (e.key === 'Escape') cancelEdit(e as any);
                    }}
                  />
                  <button onClick={e => saveEdit(e, session.id)} className="p-1 hover:text-[#10a37f]"><Check size={14}/></button>
                  <button onClick={cancelEdit} className="p-1 hover:text-red-400"><X size={14}/></button>
                </div>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-white truncate">{session.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => startEdit(e, session)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={(e) => handleDelete(e, session.id)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight size={16} className="text-gray-600 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;