
// Domain Types

export type Role = 'WORKER' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN' | 'OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Pending' | 'Inactive';
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  PENDING_APPROVAL = 'Pending Approval',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string; // User ID
  status: TaskStatus;
  dueDate: string;
  completionDate?: string;
  supervisorRemarks?: string;
  relatedDprId?: string;
  // Added to fix property access errors in storage.ts and Projects.tsx
  approvalStatus?: string;
  isDelayed?: boolean;
  delayReason?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Completed' | 'On Hold';
  budget: number;
  startDate: string;
  stateCode: string;
  milestones: string[];
  billingRules: {
    retentionPercent: number;
    gstRequirement: boolean;
  };
}

export interface DPR {
  id: string;
  projectId: string;
  date: string;
  description: string;
  weather: string;
  workforceCount: number;
  photoUrl?: string; 
  submittedBy: string; // User Name
  submittedById: string; // User ID
  timestamp: number;
  completedTaskIds?: string[];
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approverId?: string;
  approverRemarks?: string;
  materialsUsed: {
    itemName: string;
    quantityUsed: number;
  }[];
  leakageAlert?: boolean;
  leakageExcess?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  checkInTime: number;
  checkOutTime?: number;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  date: string;
}

export enum MaterialStatus {
  REQUESTED = 'Requested',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DELIVERED = 'Delivered'
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: MaterialStatus;
  requestedBy: string;
  requestDate: string;
  estimatedCost: number;
  usedQuantity: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  role: Role;
  timestamp: number;
  targetId: string;
  remarks?: string;
}

export type ViewState = 'DASHBOARD' | 'PROJECTS' | 'DPR' | 'ATTENDANCE' | 'PROCUREMENT' | 'INVOICES' | 'AUDIT' | 'ADMIN';

// Added missing interfaces for Billing and Invoicing functionality
export interface Party {
  id: string;
  name: string;
  gstin: string;
  address: string;
  stateCode: string;
  type: 'Client' | 'Contractor';
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  recipientId: string;
  placeOfSupply: string;
  items: InvoiceLineItem[];
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  retentionAmount: number;
  advanceAdjustment: number;
  totalAmount: number;
  status: 'Draft' | 'Issued' | 'Paid';
  billType: 'Composite';
}
