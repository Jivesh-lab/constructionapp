
import React, { useState, useRef } from 'react';
import { DPR, Project, MaterialRequest, Role, Task, TaskStatus } from '../types';
import { Camera, Save, Mic, Loader2, PackageOpen, Info, Check, Trash2, Users, CloudSun, Plus, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { transcribeProgress } from '../services/ai';

interface DPRProps {
  dprs: DPR[];
  projects: Project[];
  tasks: Task[];
  materials: MaterialRequest[];
  onAddDPR: (dpr: DPR) => void;
  onApproveDPR?: (id: string, status: 'Approved' | 'Rejected', remarks?: string) => void;
  role: Role;
  userId: string;
}

const DPRView: React.FC<DPRProps> = ({ dprs, projects, tasks, materials, onAddDPR, onApproveDPR, role, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [workforce, setWorkforce] = useState<number>(0);
  const [materialUsage, setMaterialUsage] = useState<{itemName: string, quantityUsed: number}[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const isWorker = role === 'WORKER';
  const isSupervisor = role === 'SUPERVISOR';
  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER' || role === 'OWNER';

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          const transcription = await transcribeProgress(base64Audio);
          setDescription(prev => prev ? `${prev} ${transcription}` : transcription);
          setIsTranscribing(false);
        };
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    // Mock photo capture
    setPhoto("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDPR: DPR = {
      id: Date.now().toString(),
      projectId: selectedProject,
      date: new Date().toISOString(),
      description,
      weather: 'Sunny',
      workforceCount: workforce,
      submittedBy: userId,
      submittedById: userId,
      timestamp: Date.now(),
      materialsUsed: materialUsage.filter(m => m.itemName && m.quantityUsed > 0),
      photoUrl: photo || undefined,
      completedTaskIds,
      approvalStatus: 'Pending'
    };
    onAddDPR(newDPR);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setWorkforce(0);
    setMaterialUsage([]);
    setCompletedTaskIds([]);
    setPhoto(null);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const addMaterialUsageLine = () => {
    setMaterialUsage([...materialUsage, { itemName: '', quantityUsed: 0 }]);
  };

  const availableTasks = tasks.filter(t => t.projectId === selectedProject && (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS));
  const projectMaterials = materials.filter(m => m.projectId === selectedProject).map(m => m.itemName);
  const uniqueMaterialNames = Array.from(new Set(projectMaterials));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Field Intelligence</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Daily Progress & Verification</p>
        </div>
        {(isWorker || isSupervisor) && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
              showForm ? 'bg-red-50 text-red-600 shadow-none' : 'bg-indigo-600 text-white shadow-indigo-200'
            }`}
          >
            {showForm ? 'Discard Draft' : 'New Report Entry'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8 animate-in slide-in-from-top-6 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Site</label>
                <select 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observations (Text or Voice)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[160px] font-medium"
                  placeholder="Detail the activities and challenges..."
                  required
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-100'
                    }`}
                  >
                    {isTranscribing ? <Loader2 className="animate-spin" size={24} /> : <Mic size={24} />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Task Realization</label>
                {availableTasks.length === 0 ? (
                   <p className="text-[10px] text-slate-400 italic">No pending tasks for this site.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {availableTasks.map(task => (
                      <label key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={completedTaskIds.includes(task.id)} 
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="w-5 h-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span className="text-xs font-bold text-slate-700">{task.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Workforce</label>
                   <div className="flex items-center gap-3">
                     <Users size={20} className="text-slate-300" />
                     <input 
                        type="number"
                        value={workforce}
                        onChange={(e) => setWorkforce(Number(e.target.value))}
                        className="bg-transparent text-xl font-black w-full outline-none"
                     />
                   </div>
                </div>
                <button 
                 type="button"
                 onClick={handleCapture}
                 className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                   photo ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400'
                 }`}
               >
                 {photo ? <Check size={24} /> : <Camera size={24} />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{photo ? 'Image Saved' : 'Site Visual'}</span>
               </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Consumption</label>
                  <button type="button" onClick={addMaterialUsageLine} className="text-indigo-600 bg-white p-1 rounded-lg border border-indigo-100 shadow-sm"><Plus size={16}/></button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                   {materialUsage.map((m, idx) => (
                     <div key={idx} className="flex gap-2">
                        <select 
                          className="flex-[2] bg-white text-xs font-bold p-2 rounded-lg border border-slate-200"
                          value={m.itemName}
                          onChange={e => {
                            const newUsage = [...materialUsage];
                            newUsage[idx].itemName = e.target.value;
                            setMaterialUsage(newUsage);
                          }}
                        >
                          <option value="">Item</option>
                          {uniqueMaterialNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <input 
                          type="number"
                          placeholder="Qty"
                          className="flex-1 bg-white text-xs font-bold p-2 rounded-lg border border-slate-200"
                          value={m.quantityUsed || ''}
                          onChange={e => {
                            const newUsage = [...materialUsage];
                            newUsage[idx].quantityUsed = Number(e.target.value);
                            setMaterialUsage(newUsage);
                          }}
                        />
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isTranscribing} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.01] transition-all disabled:opacity-50">
            Push Daily Intelligence
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dprs.slice().reverse().map(d => (
          <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group overflow-hidden relative">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
              d.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
              d.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {d.approvalStatus}
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full tracking-widest">{new Date(d.date).toLocaleDateString()}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{d.submittedBy}</span>
            </div>

            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">{d.description}</p>

            {d.completedTaskIds && d.completedTaskIds.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tasks Claimed Done</p>
                {d.completedTaskIds.map(tid => {
                   const t = tasks.find(x => x.id === tid);
                   return <div key={tid} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
                     <CheckCircle size={14} className="text-emerald-500" /> {t?.title || tid}
                   </div>
                })}
              </div>
            )}

            {d.leakageAlert && (
               <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                 <XCircle size={16} className="text-red-500" />
                 <span className="text-[10px] font-black text-red-600 uppercase">{d.leakageExcess}</span>
               </div>
            )}

            {d.approverRemarks && (
               <div className="mb-6 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex items-center gap-2 mb-1">
                   <MessageSquare size={12} className="text-slate-400" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Review Comment</span>
                 </div>
                 <p className="text-[11px] font-medium text-slate-600 italic">"{d.approverRemarks}"</p>
               </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-50">
               <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-slate-100">
                    <Users size={12} /> {d.workforceCount}
                  </div>
                  {d.materialsUsed.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-amber-100">
                      <PackageOpen size={12} /> {d.materialsUsed.length} Used
                    </div>
                  )}
               </div>
               
               {isSupervisor && d.approvalStatus === 'Pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowApprovalModal(d.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl"
                    >
                      Process Approval
                    </button>
                  </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Report Audit</h2>
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[100px] mb-6"
              placeholder="Add feedback or reasons for decision..."
              value={approvalRemarks}
              onChange={e => setApprovalRemarks(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  onApproveDPR?.(showApprovalModal, 'Rejected', approvalRemarks);
                  setShowApprovalModal(null);
                  setApprovalRemarks('');
                }}
                className="flex-1 py-4 text-red-600 bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Reject
              </button>
              <button 
                onClick={() => {
                  onApproveDPR?.(showApprovalModal, 'Approved', approvalRemarks);
                  setShowApprovalModal(null);
                  setApprovalRemarks('');
                }}
                className="flex-1 py-4 text-white bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DPRView;
