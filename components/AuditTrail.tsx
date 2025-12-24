import React from 'react';
import { AuditEntry } from '../types';
import { Clock, User, ShieldCheck, FileEdit, Trash2 } from 'lucide-react';

interface AuditTrailProps {
  entries: AuditEntry[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ entries }) => {
  const getIcon = (action: string) => {
    if (action.includes('APPROVED')) return <ShieldCheck className="text-green-500" size={16} />;
    if (action.includes('EDIT')) return <FileEdit className="text-amber-500" size={16} />;
    if (action.includes('DELETE')) return <Trash2 className="text-red-500" size={16} />;
    return <Clock className="text-slate-400" size={16} />;
  };

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h1>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Governance & Action Logs</p>
      </header>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-sm">No activity recorded yet.</div>
          ) : (
            entries.slice().reverse().map(entry => (
              <div key={entry.id} className="relative pl-10">
                <div className="absolute left-1.5 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center z-10 shadow-sm">
                  {getIcon(entry.action)}
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-sm">{entry.action}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <User size={12} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-600">{entry.performedBy}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                      {entry.role}
                    </span>
                  </div>
                  {entry.remarks && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded italic">
                      "{entry.remarks}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-300 mt-2">Target ID: {entry.targetId}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
