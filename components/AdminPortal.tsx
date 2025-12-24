
import React, { useState } from 'react';
import { Project, Role, User } from '../types';
import { Settings, Users, Building2, Receipt, ShieldCheck, Key, Plus, Trash2, Edit } from 'lucide-react';

interface AdminPortalProps {
  projects: Project[];
  users: User[];
  onUpdateProject: (p: Project) => void;
  onUpdateBillingRules: (projectId: string, rules: any) => void;
  role: Role;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ projects, users, onUpdateProject, onUpdateBillingRules, role }) => {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'ROLES' | 'BILLING'>('PROJECTS');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck size={64} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mt-2">Admin privilege required for this portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Enterprise Administration</p>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-max">
        <TabButton active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')} icon={<Building2 size={14}/>} label="Sites" />
        <TabButton active={activeTab === 'ROLES'} onClick={() => setActiveTab('ROLES')} icon={<Users size={14}/>} label="Access" />
        <TabButton active={activeTab === 'BILLING'} onClick={() => setActiveTab('BILLING')} icon={<Receipt size={14}/>} label="Billing" />
      </div>

      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <button onClick={() => setEditingProject(p)} className="text-slate-300 hover:text-slate-950 transition-colors">
                  <Edit size={20} />
                </button>
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl mb-1">{p.name}</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-6">{p.location}</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-50">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State Code</span>
                    <span className="font-black text-slate-900">{p.stateCode}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</span>
                    <span className="font-black text-indigo-600">₹{(p.budget / 1000000).toFixed(1)}M</span>
                 </div>
              </div>
            </div>
          ))}
          <button className="h-64 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-indigo-400 hover:border-indigo-100 transition-all">
            <Plus size={48} />
            <span className="font-black uppercase tracking-widest text-xs">New Project Site</span>
          </button>
        </div>
      )}

      {activeTab === 'ROLES' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Staff Directory</h3>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Plus size={14} /> Invite Member
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {users.map(u => (
              <div key={u.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{u.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{u.email} • {u.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-indigo-600"><Settings size={18}/></button>
                  <button className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BILLING' && (
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center">
                <Receipt size={32} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">GST & Billing Logic</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global invoicing constraints</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Retention %</label>
                   <input type="number" defaultValue={5} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GST Requirement</label>
                   <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-slate-200" />
                     <span className="text-xs font-bold text-slate-700 uppercase">Enforce GST validation on all RA bills</span>
                   </div>
                 </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                 <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-4">Invoice Serial Format</h4>
                 <div className="space-y-2">
                   <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold flex justify-between">
                     <span className="text-slate-400">Format:</span>
                     <span>INV/[YEAR]/[AUTO_INC]</span>
                   </div>
                   <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold flex justify-between">
                     <span className="text-slate-400">Current Index:</span>
                     <span>0241</span>
                   </div>
                 </div>
              </div>
           </div>
         </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Site Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" value={editingProject.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State Code</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" value={editingProject.stateCode} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold" value={editingProject.status}>
                     <option>Active</option>
                     <option>On Hold</option>
                     <option>Completed</option>
                   </select>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingProject(null)} className="flex-1 py-4 text-slate-500 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest">Discard</button>
                <button className="flex-1 py-4 text-white bg-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Apply Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
  >
    {icon} {label}
  </button>
);

export default AdminPortal;
