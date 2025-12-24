import { Project, Task, DPR, AttendanceRecord, MaterialRequest, Invoice, TaskStatus, MaterialStatus, AuditEntry, Role } from '../types';

const KEYS = {
  PROJECTS: 'sm_projects',
  TASKS: 'sm_tasks',
  DPRS: 'sm_dprs',
  ATTENDANCE: 'sm_attendance',
  MATERIALS: 'sm_materials',
  INVOICES: 'sm_invoices',
  AUDIT: 'sm_audit',
};

const get = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultVal;
  }
};

const set = <T>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const storageService = {
  getProjects: () => get<Project[]>(KEYS.PROJECTS, [
    { 
      id: 'p1', 
      name: 'Skyline Towers', 
      location: 'Mumbai', 
      status: 'Active', 
      budget: 50000000, 
      startDate: '2023-01-15', 
      stateCode: '27',
      milestones: ['Foundation', 'Basement', 'Level 1'],
      billingRules: { retentionPercent: 5, gstRequirement: true }
    }
  ]),
  
  saveProjects: (data: Project[]) => set(KEYS.PROJECTS, data),

  getTasks: () => {
    const tasks = get<Task[]>(KEYS.TASKS, [
      { id: 't1', projectId: 'p1', title: 'Foundation Pouring', assignedTo: 'Ramesh', status: TaskStatus.IN_PROGRESS, dueDate: '2023-11-01', approvalStatus: 'Pending' }
    ]);
    const materials = get<MaterialRequest[]>(KEYS.MATERIALS, []);
    
    return tasks.map(t => {
      const isPastDue = new Date(t.dueDate) < new Date();
      const materialShortage = materials.some(m => m.projectId === t.projectId && m.status === MaterialStatus.REQUESTED);
      
      let delayReason: string | undefined = undefined;
      if (isPastDue && t.status !== TaskStatus.COMPLETED) {
        delayReason = 'Deadline Exceeded';
      } else if (materialShortage) {
        delayReason = 'Material Shortage';
      }

      return {
        ...t,
        isDelayed: !!delayReason,
        delayReason: delayReason || t.delayReason
      };
    });
  },

  saveTasks: (data: Task[]) => set(KEYS.TASKS, data),

  getDPRs: () => get<DPR[]>(KEYS.DPRS, []),
  saveDPRs: (dprs: DPR[]) => {
    const materials = get<MaterialRequest[]>(KEYS.MATERIALS, []);
    
    const enrichedDPRs = dprs.map(dpr => {
      let leakageAlert = false;
      let leakageExcess = '';
      
      dpr.materialsUsed.forEach(used => {
        const req = materials.find(m => m.projectId === dpr.projectId && m.itemName === used.itemName);
        if (req && used.quantityUsed > req.quantity * 1.1) {
          leakageAlert = true;
          const excess = ((used.quantityUsed - req.quantity) / req.quantity * 100).toFixed(0);
          leakageExcess = `${excess}% above request`;
        }
      });

      return { ...dpr, leakageAlert, leakageExcess };
    });
    
    set(KEYS.DPRS, enrichedDPRs);
  },

  getAttendance: () => get<AttendanceRecord[]>(KEYS.ATTENDANCE, []),
  saveAttendance: (data: AttendanceRecord[]) => set(KEYS.ATTENDANCE, data),

  getMaterials: () => get<MaterialRequest[]>(KEYS.MATERIALS, []),
  saveMaterials: (data: MaterialRequest[]) => set(KEYS.MATERIALS, data),

  getInvoices: () => get<Invoice[]>(KEYS.INVOICES, []),
  saveInvoices: (data: Invoice[]) => set(KEYS.INVOICES, data),

  getAuditTrail: () => get<AuditEntry[]>(KEYS.AUDIT, []),
  addAudit: (action: string, performedBy: string, role: Role, targetId: string, remarks?: string) => {
    const audit = get<AuditEntry[]>(KEYS.AUDIT, []);
    audit.push({
      id: Date.now().toString(),
      action,
      performedBy,
      role,
      timestamp: Date.now(),
      targetId,
      remarks
    });
    set(KEYS.AUDIT, audit);
  }
};