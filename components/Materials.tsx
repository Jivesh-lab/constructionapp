import React, { useState } from 'react';
import { MaterialRequest, MaterialStatus, Project } from '../types';
import { Plus, PackageCheck, XCircle, Clock, ShoppingCart, Truck, History, TrendingUp, ArrowDownRight, Package, Search } from 'lucide-react';

interface MaterialsProps {
  materials: MaterialRequest[];
  projects: Project[];
  onAddRequest: (req: MaterialRequest) => void;
  onUpdateStatus: (id: string, status: MaterialStatus) => void;
}

const Materials: React.FC<MaterialsProps> = ({ materials, projects, onAddRequest, onUpdateStatus }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'REQUESTS'>('INVENTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    projectId: projects[0]?.id || '',
    itemName: '',
    quantity: '',
    unit: 'Units',
    cost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: MaterialRequest = {
      id: Date.now().toString(),
      projectId: formData.projectId,
      itemName: formData.itemName,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      estimatedCost: Number(formData.cost),
      status: MaterialStatus.REQUESTED,
      requestedBy: 'Authority',
      requestDate: new Date().toISOString(),
      usedQuantity: 0
    };
    onAddRequest(newReq);
    setIsFormOpen(false);
    setFormData({ ...formData, itemName: '', quantity: '', cost: '' });
  };

  const inventory = materials.reduce((acc, curr) => {
    if (curr.status !== MaterialStatus.DELIVERED) return acc;
    const existing = acc.find(i => i.itemName === curr.itemName);
    if (existing) {
      existing.totalPurchased += curr.quantity;
      existing.totalUsed += (curr.usedQuantity || 0);
    } else {
      acc.push({ 
        itemName: curr.itemName, 
        unit: curr.unit, 
        totalPurchased: curr.quantity, 
        totalUsed: curr.usedQuantity || 0 
      });
    }
    return acc;
  }, [] as { itemName: string, unit: string, totalPurchased: number, totalUsed: number }[]);

  const pendingRequests = materials.filter(m => m.status === MaterialStatus.REQUESTED || m.status === MaterialStatus.APPROVED);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Suite</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Global Material Lifecycle</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus size={18} /> New Sourcing Request
        </button>
      </header>

      {/* Global Stock Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingCart size={20} />} label="Pending Orders" value={pendingRequests.length} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={<Truck size={20} />} label="Total Sourced" value={inventory.length} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={<TrendingUp size={20} />} label="Stock Items" value={inventory.filter(i => i.totalPurchased > i.totalUsed).length} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<ArrowDownRight size={20} />} label="Critical Stock" value={inventory.filter(i => (i.totalUsed / i.totalPurchased) > 0.8).length} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-80">
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'INVENTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          Stock Inventory
        </button>
        <button 
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'REQUESTS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          Active Requests
        </button>
      </div>

      {activeTab === 'INVENTORY' ? (
        <div className="space-y-6">
           {/* Inventory View */}
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search materials..."
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inventory.filter(i => i.itemName.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                const percentage = Math.round((item.totalUsed / item.totalPurchased) * 100);
                const stock = item.totalPurchased - item.totalUsed;
                return (
                  <div key={item.itemName} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Package size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 leading-none">{stock}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available {item.unit}</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">{item.itemName}</h3>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Consumption Plan</span>
                          <span className={percentage > 85 ? 'text-red-500' : 'text-indigo-600'}>{percentage}% Used</span>
                       </div>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${percentage > 85 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                       </div>
                       <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase pt-1">
                          <span>Purchased: {item.totalPurchased}</span>
                          <span>Used: {item.totalUsed}</span>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${req.status === MaterialStatus.REQUESTED ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{req.itemName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{req.quantity} {req.unit} • ₹{req.estimatedCost.toLocaleString()}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {req.status === MaterialStatus.REQUESTED ? (
                    <>
                      <button onClick={() => onUpdateStatus(req.id, MaterialStatus.REJECTED)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><XCircle size={20} /></button>
                      <button onClick={() => onUpdateStatus(req.id, MaterialStatus.APPROVED)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Approve Sourcing</button>
                    </>
                  ) : req.status === MaterialStatus.APPROVED ? (
                    <button onClick={() => onUpdateStatus(req.id, MaterialStatus.DELIVERED)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">Confirm Delivery</button>
                  ) : null}
               </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 sm:p-12 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Material Requisition</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Site</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Definition</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                    value={formData.itemName}
                    onChange={e => setFormData({...formData, itemName: e.target.value})}
                    placeholder="e.g. Steel Rebars"
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume</label>
                   <input 
                    type="number" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Metric</label>
                   <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                   >
                     <option>Bags</option>
                     <option>Kg</option>
                     <option>Tons</option>
                     <option>Units</option>
                     <option>Liters</option>
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valuation (INR)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                  value={formData.cost}
                  onChange={e => setFormData({...formData, cost: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-5 text-slate-500 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-5 text-white bg-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Push Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }: { icon: React.ReactNode, label: string, value: string | number, color: string, bg: string }) => (
  <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
    </div>
  </div>
);

export default Materials;
