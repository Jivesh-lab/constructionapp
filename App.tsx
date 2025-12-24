import React, { useEffect, useState } from 'react';
import { ViewState, Project, Task, DPR, AttendanceRecord, MaterialRequest, Invoice, TaskStatus, Role, User, AuditEntry, Party } from './types';
import { storageService } from './services/storage';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import DPRView from './components/DPR';
import Attendance from './components/Attendance';
import Materials from './components/Materials';
import AuditTrail from './components/AuditTrail';
import Invoices from './components/Invoices';
import AdminPortal from './components/AdminPortal';
import { WifiOff, HardHat, Briefcase, ChevronRight, LogOut, Package, ClipboardList, LayoutDashboard, ReceiptText, Building2, Settings, Clock } from 'lucide-react';

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L61.2 38.8H95L67.6 59.6L78.8 93.4L50 72.6L21.2 93.4L32.4 59.6L5 38.8H38.8L50 5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="10" fill="white" />
    <path d="M50 25 V40 M50 60 V75 M25 50 H40 M60 50 H75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Added mock users for task assignment
const MOCK_USERS: User[] = [
  { id: 'w1', name: 'Ramesh Kumar', role: 'WORKER', email: 'ramesh@site.com', status: 'Active' },
  { id: 'w2', name: 'Suresh Singh', role: 'WORKER', email: 'suresh@site.com', status: 'Active' },
  { id: 'w3', name: 'Amit Jha', role: 'WORKER', email: 'amit@site.com', status: 'Active' },
  { id: 's1', name: 'Vikram Mehta', role: 'SUPERVISOR', email: 'vikram@site.com', status: 'Active' },
];

const App: React.FC = () => {
  const [roleSelected, setRoleSelected] = useState<boolean>(false);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dprs, setDprs] = useState<DPR[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const parties: Party[] = [
    { id: 'p1', name: 'Global Infra Corp', gstin: '27AABCU1234F1Z1', address: 'Bandra, Mumbai', stateCode: '27', type: 'Client' },
    { id: 'p2', name: 'Sitemaster Contractors', gstin: '27AABCV5678G1Z2', address: 'Pune, Maharashtra', stateCode: '27', type: 'Contractor' }
  ];

  useEffect(() => {
    loadData();
    const handleConnectivity = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleConnectivity);
    window.addEventListener('offline', handleConnectivity);
    return () => {
      window.removeEventListener('online', handleConnectivity);
      window.removeEventListener('offline', handleConnectivity);
    };
  }, []);

  const loadData = () => {
    setProjects(storageService.getProjects());
    setTasks(storageService.getTasks());
    setDprs(storageService.getDPRs());
    setAttendance(storageService.getAttendance());
    setMaterials(storageService.getMaterials());
    setInvoices(storageService.getInvoices());
    setAuditTrail(storageService.getAuditTrail());
  };

  const handleRoleSelection = (role: Role) => {
    const user: User = MOCK_USERS.find(u => u.role === role) || {
      id: role.toLowerCase() + '_' + Math.floor(Math.random() * 1000),
      name: role.charAt(0) + role.slice(1).toLowerCase() + ' User',
      email: `${role.toLowerCase()}@sitemaster.com`,
      role: role,
      status: 'Active'
    };
    setCurrentUser(user);
    setRoleSelected(true);
    setView(role === 'WORKER' ? 'ATTENDANCE' : 'DASHBOARD');
  };

  const handleAudit = (action: string, targetId: string, remarks?: string) => {
    if (!currentUser) return;
    storageService.addAudit(action, currentUser.name, currentUser.role, targetId, remarks);
    setAuditTrail(storageService.getAuditTrail());
  };

  const saveInvoice = (inv: Invoice) => {
    const updated = [...invoices.filter(i => i.id !== inv.id), inv];
    setInvoices(updated);
    storageService.saveInvoices(updated);
    handleAudit(inv.status === 'Draft' ? 'INVOICE_DRAFT_CREATED' : 'INVOICE_UPDATED', inv.id);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    setInvoices(updated);
    storageService.saveInvoices(updated);
    handleAudit(`INVOICE_STATUS_${status.toUpperCase()}`, id);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus, remarks?: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status, supervisorRemarks: remarks } : t);
    setTasks(updated);
    storageService.saveTasks(updated);
    handleAudit(`TASK_STATUS_${status.toUpperCase()}`, taskId, remarks);
  };

  const handleAddDPR = (dpr: DPR) => {
    const updatedDPRs = [...dprs, dpr];
    storageService.saveDPRs(updatedDPRs);
    
    if (dpr.completedTaskIds && dpr.completedTaskIds.length > 0) {
      const updatedTasks = tasks.map(t => 
        dpr.completedTaskIds?.includes(t.id) 
          ? { ...t, status: TaskStatus.PENDING_APPROVAL, relatedDprId: dpr.id } 
          : t
      );
      setTasks(updatedTasks);
      storageService.saveTasks(updatedTasks);
      handleAudit('DPR_TASK_COMPLETION_REQUESTED', dpr.id);
    }

    setDprs(storageService.getDPRs());
    handleAudit('DPR_SUBMITTED', dpr.id);
  };

  const handleApproveDPR = (id: string, status: 'Approved' | 'Rejected', remarks?: string) => {
    const updatedDPRs = dprs.map(d => d.id === id ? { ...d, approvalStatus: status, approverRemarks: remarks, approverId: currentUser?.id } : d);
    setDprs(updatedDPRs);
    storageService.saveDPRs(updatedDPRs);

    const dpr = dprs.find(d => d.id === id);
    if (dpr?.completedTaskIds) {
       const taskStatus = status === 'Approved' ? TaskStatus.COMPLETED : TaskStatus.REJECTED;
       const updatedTasks = tasks.map(t => 
         dpr.completedTaskIds?.includes(t.id) ? { ...t, status: taskStatus, supervisorRemarks: remarks } : t
       );
       setTasks(updatedTasks);
       storageService.saveTasks(updatedTasks);
    }
    handleAudit(`DPR_${status.toUpperCase()}`, id, remarks);
  };

  const renderView = () => {
    if (!currentUser) return null;
    switch (view) {
      case 'DASHBOARD': return <Dashboard projects={projects} tasks={tasks} materials={materials} dprs={dprs} />;
      case 'PROJECTS': return <Projects projects={projects} tasks={tasks} users={MOCK_USERS} role={currentUser.role} onAddTask={(t) => { storageService.saveTasks([...tasks, t]); loadData(); }} onUpdateTaskStatus={handleUpdateTaskStatus} onRequestCompletion={(id) => setView('DPR')} />;
      case 'DPR': return <DPRView dprs={dprs} projects={projects} tasks={tasks} materials={materials} onAddDPR={handleAddDPR} onApproveDPR={handleApproveDPR} role={currentUser.role} userId={currentUser.name} />;
      case 'ATTENDANCE': return <Attendance attendanceHistory={attendance} projects={projects} userName={currentUser.name} onCheckIn={(r) => { storageService.saveAttendance([...attendance, r]); loadData(); }} onCheckOut={(id, t) => { storageService.saveAttendance(attendance.map(a => a.id === id ? {...a, checkOutTime: t} : a)); loadData(); }} />;
      case 'PROCUREMENT': return <Materials materials={materials} projects={projects} onAddRequest={(r) => { storageService.saveMaterials([...materials, r]); loadData(); }} onUpdateStatus={(id, s) => { storageService.saveMaterials(materials.map(m => m.id === id ? {...m, status: s} : m)); loadData(); }} />;
      case 'INVOICES': return <Invoices invoices={invoices} projects={projects} parties={parties} role={currentUser.role} onSaveInvoice={saveInvoice} onUpdateStatus={updateInvoiceStatus} />;
      case 'AUDIT': return <AuditTrail entries={auditTrail} />;
      case 'ADMIN': return <AdminPortal projects={projects} users={MOCK_USERS} onUpdateProject={() => {}} onUpdateBillingRules={() => {}} role={currentUser.role} />;
      default: return <Dashboard projects={projects} tasks={tasks} materials={materials} dprs={dprs} />;
    }
  };

  if (!roleSelected || !currentUser) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm sm:max-w-md space-y-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 text-[#FDFCF0] mx-auto mb-6 transform hover:rotate-6 transition-transform">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-4xl font-black text-[#FDFCF0] tracking-tight sm:text-5xl uppercase">SITEMASTER</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Quality Construction, Lasting Value</p>
          </div>

          <div className="grid gap-4">
            {(['WORKER', 'SUPERVISOR', 'MANAGER', 'ADMIN'] as Role[]).map(role => (
              <button key={role} onClick={() => handleRoleSelection(role)} className="group bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between transition-all active:scale-95 text-left">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white">
                      {role === 'ADMIN' ? <Settings size={20}/> : role === 'WORKER' ? <HardHat size={20}/> : role === 'SUPERVISOR' ? <Briefcase size={20}/> : <Building2 size={20}/>}
                   </div>
                   <div>
                     <span className="font-black text-slate-200 uppercase text-sm tracking-widest block">{role} Portal</span>
                     <span className="text-[10px] text-zinc-500 font-bold uppercase">
                       {role === 'WORKER' ? 'Execution & Attendance' : role === 'SUPERVISOR' ? 'Site Management' : role === 'MANAGER' ? 'Project Oversight' : 'Global Control'}
                     </span>
                   </div>
                </div>
                <ChevronRight className="text-zinc-600 group-hover:text-white" size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0 md:pl-20">
      <div className="sticky top-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 sm:px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
            <Logo className="w-7 h-7" />
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-slate-900 text-lg tracking-tighter uppercase">SITEMASTER</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden xs:flex flex-col items-end mr-2">
            <span className="text-xs font-black text-slate-900 uppercase">{currentUser.name}</span>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{currentUser.role}</span>
          </div>
          {!isOnline && <WifiOff className="text-red-500" size={20} />}
          <button onClick={() => setRoleSelected(false)} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 md:top-0 md:left-0 md:w-20 md:h-full md:border-t-0 md:border-r z-[70] px-2 py-3 md:py-8 flex md:flex-col justify-around md:justify-start md:gap-8 items-center">
        {currentUser.role !== 'WORKER' && <NavButton active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} icon={<LayoutDashboard size={24} />} label="Dash" />}
        <NavButton active={view === (currentUser.role === 'WORKER' ? 'ATTENDANCE' : 'PROCUREMENT')} onClick={() => setView(currentUser.role === 'WORKER' ? 'ATTENDANCE' : 'PROCUREMENT')} icon={currentUser.role === 'WORKER' ? <Clock size={24} /> : <Package size={24} />} label={currentUser.role === 'WORKER' ? 'Time' : 'Stock'} />
        <NavButton active={view === 'PROJECTS'} onClick={() => setView('PROJECTS')} icon={<ClipboardList size={24} />} label="Tasks" />
        <NavButton active={view === 'DPR'} onClick={() => setView('DPR')} icon={<HardHat size={24} />} label="Report" />
        {currentUser.role !== 'WORKER' && <NavButton active={view === 'INVOICES'} onClick={() => setView('INVOICES')} icon={<ReceiptText size={24} />} label="Bills" />}
        {currentUser.role === 'ADMIN' && <NavButton active={view === 'ADMIN'} onClick={() => setView('ADMIN')} icon={<Settings size={24} />} label="System" />}
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
    {icon}
    <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;