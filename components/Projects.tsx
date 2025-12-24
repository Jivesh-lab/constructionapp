import React, { useState } from 'react';
import { Project, Task, TaskStatus, Role, User } from '../types';
import { Calendar, CheckSquare, Clock, Plus, User as UserIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ProjectProps {
  projects: Project[];
  tasks: Task[];
  users: User[]; // Added users to allow assignment
  role: Role;
  onAddTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus, remarks?: string) => void;
  onRequestCompletion: (taskId: string) => void; 
}

const Projects: React.FC<ProjectProps> = ({ projects, tasks, users, role, onAddTask, onUpdateTaskStatus, onRequestCompletion }) => {
  const [activeProject, setActiveProject] = useState<string>(projects[0]?.id || '');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isWorker = role === 'WORKER';
  const isSupervisor = role === 'SUPERVISOR';
  const isManagerOrAdmin = role === 'MANAGER' || role === 'ADMIN' || role === 'OWNER';

  const workers = users.filter(u => u.role === 'WORKER');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const worker = workers.find(w => w.id === assignedWorkerId);
    
    const newTask: Task = {
      id: Date.now().toString(),
      projectId: activeProject,
      title: newTaskTitle,
      assignedTo: worker ? worker.name : 'Unassigned',
      status: TaskStatus.PENDING,
      dueDate: new Date().toISOString()
    };
    onAddTask(newTask);
    setNewTaskTitle('');
    setAssignedWorkerId('');
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter(t => t.projectId === activeProject);

  return (
    <div className="pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Execution Board</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Management & Milestone Tracking</p>
        </div>
        {(isSupervisor || isManagerOrAdmin) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className={`flex-shrink-0 w-72 p-6 rounded-[2rem] border transition-all ${
              activeProject === p.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
            }`}
          >
            <h3 className="font-black text-xl truncate mb-1 uppercase tracking-tighter">{p.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {p.location}
            </p>
            <div className="mt-6 flex justify-between items-center">
               <div className="text-[10px] font-black uppercase">
                 <span className="opacity-60">Tasks: </span>
                 {tasks.filter(t => t.projectId === p.id && t.status === TaskStatus.COMPLETED).length} / {tasks.filter(t => t.projectId === p.id).length}
               </div>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20'}`}>
                 {p.status}
               </span>
            </div>
          </button>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-4 animate-in slide-in-from-top-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Task Description</label>
              <input 
                type="text" 
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Worker</label>
              <select 
                value={assignedWorkerId}
                onChange={(e) => setAssignedWorkerId(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a worker...</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Create Task</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tasks assigned to this site</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 p-2 rounded-xl ${
                  task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-500' : 
                  task.status === TaskStatus.PENDING_APPROVAL ? 'bg-amber-50 text-amber-500 animate-pulse' :
                  'bg-slate-50 text-slate-300'
                }`}>
                  <CheckSquare size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-base font-black uppercase tracking-tight ${task.status === TaskStatus.COMPLETED ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <UserIcon size={12} /> {task.assignedTo}
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      task.status === TaskStatus.PENDING_APPROVAL ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {isWorker && (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) && (
                  <button 
                    onClick={() => onRequestCompletion(task.id)}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                  >
                    Complete via DPR
                  </button>
                )}

                {isSupervisor && task.status === TaskStatus.PENDING_APPROVAL && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onUpdateTaskStatus(task.id, TaskStatus.REJECTED, "Task rejected by supervisor")}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => onUpdateTaskStatus(task.id, TaskStatus.COMPLETED, "Task approved by supervisor")}
                      className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>
                )}

                {(isSupervisor || isManagerOrAdmin) && (
                  <div className="relative group">
                    <button className="p-2 text-slate-300 hover:text-slate-600">
                      <AlertCircle size={20} />
                    </button>
                    <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-2xl z-20 font-medium">
                      Site ID: {task.projectId}<br/>
                      Ref: {task.id}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;