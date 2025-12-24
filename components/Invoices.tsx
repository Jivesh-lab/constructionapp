import React, { useState, useEffect } from 'react';
import { Invoice, Project, Party, InvoiceLineItem, Role } from '../types';
import { billingService, GST_SLABS, HSN_CONSTRUCTION } from '../services/billingService';
import { FileText, Plus, Download, ShieldCheck, Printer, Trash2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InvoicesProps {
  invoices: Invoice[];
  projects: Project[];
  parties: Party[];
  role: Role;
  onSaveInvoice: (invoice: Invoice) => void;
  onUpdateStatus: (id: string, status: Invoice['status']) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, projects, parties, role, onSaveInvoice, onUpdateStatus }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  
  // Local Form State
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [supplierId, setSupplierId] = useState(parties.find(p => p.type === 'Contractor')?.id || '');
  const [recipientId, setRecipientId] = useState(parties.find(p => p.type === 'Client')?.id || '');
  const [retentionPercent, setRetentionPercent] = useState(5);
  const [advanceAdj, setAdvanceAdj] = useState(0);

  const isInterState = parties.find(p => p.id === supplierId)?.stateCode !== parties.find(p => p.id === recipientId)?.stateCode;

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      description: '',
      hsn: '9954',
      quantity: 0,
      unit: 'sq.m',
      rate: 0,
      taxableAmount: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      const calcs = billingService.calculateLineItem(updated.quantity, updated.rate, updated.gstRate, isInterState);
      return { ...updated, ...calcs };
    }));
  };

  const handleSave = () => {
    if (!selectedProject || items.length === 0) return;
    
    const summary = billingService.generateInvoiceSummary(items, retentionPercent, advanceAdj);
    const newInvoice: Invoice = {
      id: activeInvoice?.id || Date.now().toString(),
      projectId: selectedProject,
      invoiceNumber: activeInvoice?.invoiceNumber || `INV/${new Date().getFullYear()}/${invoices.length + 1}`,
      date: new Date().toISOString(),
      supplierId,
      recipientId,
      placeOfSupply: parties.find(p => p.id === recipientId)?.stateCode || '0',
      items,
      ...summary,
      status: 'Draft',
      billType: 'Composite'
    };
    onSaveInvoice(newInvoice);
    setShowEditor(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Engine</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Construction GST & Billing</p>
        </div>
        {(role === 'SUPERVISOR' || role === 'ADMIN') && (
          <button 
            onClick={() => { setActiveInvoice(null); setItems([]); setShowEditor(true); }}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} /> Raise RA Bill
          </button>
        )}
      </header>

      {showEditor ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-6 sm:p-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Draft GST Invoice</h2>
            <button onClick={() => setShowEditor(false)} className="text-slate-400 font-bold text-xs uppercase">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Project</label>
              <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Supplier (Contractor)</label>
              <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                {parties.filter(p => p.type === 'Contractor').map(p => <option key={p.id} value={p.id}>{p.name} ({p.gstin})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Recipient (Client)</label>
              <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={recipientId} onChange={e => setRecipientId(e.target.value)}>
                {parties.filter(p => p.type === 'Client').map(p => <option key={p.id} value={p.id}>{p.name} ({p.gstin})</option>)}
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-2">Description / HSN</th>
                  <th className="pb-4 px-2">Quantity</th>
                  <th className="pb-4 px-2">Rate (₹)</th>
                  <th className="pb-4 px-2">GST %</th>
                  <th className="pb-4 px-2 text-right">Taxable</th>
                  <th className="pb-4 px-2 text-right">Total</th>
                  <th className="pb-4 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="py-4 px-2">
                      <input className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Work Description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                      <select className="text-[9px] text-slate-400 bg-transparent border-none p-0 mt-1" value={item.hsn} onChange={e => updateItem(item.id, 'hsn', e.target.value)}>
                        {Object.entries(HSN_CONSTRUCTION).map(([code, name]) => <option key={code} value={code}>{code} - {name}</option>)}
                      </select>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1">
                        <input type="number" className="w-16 bg-transparent text-sm font-bold" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <input type="number" className="w-20 bg-transparent text-sm font-bold" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} />
                    </td>
                    <td className="py-4 px-2">
                      <select className="bg-transparent text-sm font-bold" value={item.gstRate} onChange={e => updateItem(item.id, 'gstRate', Number(e.target.value))}>
                        {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                      </select>
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-sm">₹{item.taxableAmount.toLocaleString()}</td>
                    <td className="py-4 px-2 text-right font-black text-sm text-indigo-600">₹{item.total.toLocaleString()}</td>
                    <td className="py-4 px-2 text-right">
                      <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addItem} className="mt-4 flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
            <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Retention Money Deduction (%)</label>
                 <input type="number" className="w-24 bg-slate-50 rounded-xl p-3 text-sm font-bold" value={retentionPercent} onChange={e => setRetentionPercent(Number(e.target.value))} />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Mobilization Advance Adjustment (₹)</label>
                 <input type="number" className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold" value={advanceAdj} onChange={e => setAdvanceAdj(Number(e.target.value))} />
               </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
               <div className="flex justify-between text-xs text-slate-400 uppercase font-black">
                 <span>Subtotal (Taxable)</span>
                 <span>₹{items.reduce((s,i) => s+i.taxableAmount, 0).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-xs text-slate-400 uppercase font-black">
                 <span>Combined GST</span>
                 <span>₹{items.reduce((s,i) => s+i.cgst+i.sgst+i.igst, 0).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-xs text-red-400 uppercase font-black pt-2 border-t border-slate-800">
                 <span>Retention & Adjustments</span>
                 <span>- ₹{billingService.generateInvoiceSummary(items, retentionPercent, advanceAdj).retentionAmount + advanceAdj}</span>
               </div>
               <div className="flex justify-between text-2xl font-black pt-4">
                 <span className="tracking-tighter uppercase">Net Payable</span>
                 <span className="text-emerald-400">₹{billingService.generateInvoiceSummary(items, retentionPercent, advanceAdj).totalAmount.toLocaleString()}</span>
               </div>
               <button onClick={handleSave} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-6">Generate Draft</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.slice().reverse().map(inv => (
            <div key={inv.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
                 inv.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 
                 inv.status === 'Issued' ? 'bg-indigo-600 text-white' : 
                 'bg-emerald-500 text-white'
               }`}>
                 {inv.status}
               </div>
               <div className="mb-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inv.invoiceNumber}</p>
                 <h3 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tighter">
                   {projects.find(p => p.id === inv.projectId)?.name}
                 </h3>
               </div>
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Total Value</p>
                   <p className="text-xl font-black text-slate-900">₹{inv.totalAmount.toLocaleString()}</p>
                 </div>
                 {role === 'ADMIN' && inv.status === 'Draft' && (
                   <button onClick={() => onUpdateStatus(inv.id, 'Issued')} className="text-indigo-600 hover:text-indigo-800"><CheckCircle2 size={24} /></button>
                 )}
               </div>
               <div className="mt-6 pt-6 border-t border-slate-50 flex gap-4">
                  <button className="flex-1 py-2 text-[10px] font-black text-slate-400 uppercase border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">Details</button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black text-white bg-slate-900 rounded-xl hover:opacity-90"><Printer size={14} /> PDF</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
