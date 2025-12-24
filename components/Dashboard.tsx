import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Project, Task, MaterialRequest, DPR } from '../types';
import { AlertTriangle, TrendingDown, Package, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  materials: MaterialRequest[];
  dprs: DPR[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ projects, tasks, materials, dprs }) => {
  const delayedTasks = tasks.filter(t => t.isDelayed);
  const leakageDPRs = dprs.filter(d => d.leakageAlert);

  const taskStats = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length },
    { name: 'Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'Completed').length },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Intelligence</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Real-time Performance Metrics</p>
        </div>
      </div>

      {/* Feature 1: Delay Impact Indicator Widget */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-red-600" size={20} />
          <h3 className="font-bold text-red-900 text-sm uppercase">Critical Delay Impacts</h3>
        </div>
        {delayedTasks.length === 0 ? (
          <p className="text-xs text-red-700 opacity-70 italic">No critical delays detected.</p>
        ) : (
          <div className="space-y-2">
            {delayedTasks.map(t => (
              <div key={t.id} className="bg-white p-2 rounded-lg flex justify-between items-center border border-red-200">
                <span className="text-xs font-semibold text-slate-700 truncate w-32">{t.title}</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  {t.delayReason}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature 2: Material Leakage Alert Widget */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="text-amber-600" size={20} />
          <h3 className="font-bold text-amber-900 text-sm uppercase">Leakage Intelligence</h3>
        </div>
        {leakageDPRs.length === 0 ? (
          <p className="text-xs text-amber-700 opacity-70 italic">Consumption within thresholds.</p>
        ) : (
          <div className="space-y-2">
            {leakageDPRs.map(d => (
              <div key={d.id} className="bg-white p-2 rounded-lg flex justify-between items-center border border-amber-200">
                <span className="text-xs font-semibold text-slate-700">{new Date(d.date).toLocaleDateString()} Report</span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">
                  🚨 {d.leakageExcess}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={taskStats} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                {taskStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase mt-2">Task Efficiency</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
          <TrendingDown size={32} className="text-indigo-600 mb-2" />
          <p className="text-xl font-bold text-slate-900">{projects.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Active Sites</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Material Inventory Flow</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={materials.slice(0, 5)}>
            <XAxis dataKey="itemName" hide />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
