import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Project } from '../types';
import { MapPin, Clock, CheckCircle2, User, Satellite, Navigation, AlertCircle } from 'lucide-react';

interface AttendanceProps {
  attendanceHistory: AttendanceRecord[];
  projects: Project[];
  userName: string;
  onCheckIn: (record: AttendanceRecord) => void;
  onCheckOut: (id: string, time: number) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ attendanceHistory, projects, userName, onCheckIn, onCheckOut }) => {
  const [location, setLocation] = useState<{ lat: number, lng: number, accuracy?: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [currentSession, setCurrentSession] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    // Find active session for this user
    const active = attendanceHistory.find(r => r.userName === userName && !r.checkOutTime);
    if (active) {
      setCurrentSession(active);
      setSelectedProjectId(active.projectId);
    } else {
      setCurrentSession(null);
    }
  }, [attendanceHistory, userName]);

  const getLocation = () => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        setError('Location access denied. Please enable GPS for site attendance.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleAction = () => {
    if (!location) {
      getLocation();
      return;
    }

    if (currentSession) {
      onCheckOut(currentSession.id, Date.now());
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: 'u1',
        userName: userName,
        projectId: selectedProjectId,
        checkInTime: Date.now(),
        location: location,
        date: new Date().toISOString().split('T')[0]
      };
      onCheckIn(newRecord);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Attendance</h1>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">GPS Geofenced Punch Clock</p>
      </header>

      {/* Site Selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Current Project Site</label>
        <select 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          disabled={!!currentSession}
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        {selectedProject && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <Navigation size={12} className="text-indigo-600" />
            <span>Site Location: {selectedProject.location}</span>
          </div>
        )}
      </div>

      {/* Punch Clock UI */}
      <div className="text-center py-6 bg-white rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 ${currentSession ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        
        <div className="relative inline-block mb-6">
          <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${
            currentSession ? 'bg-emerald-50 border-4 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 border-4 border-slate-100'
          }`}>
            <MapPin size={48} className={currentSession ? 'text-emerald-600' : 'text-slate-300'} />
          </div>
          {location && (
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
               <Satellite size={16} className={location.accuracy && location.accuracy < 50 ? 'text-emerald-500' : 'text-amber-500'} />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {currentSession ? 'Site Check-in Active' : 'Ready for Check-in'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${location ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              {location ? `GPS Signal: Accurate to ${Math.round(location.accuracy || 0)}m` : 'Acquiring GPS Signal...'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={loading || !location}
          className={`mt-8 px-16 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
            currentSession 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Locating...' : (currentSession ? 'Punch Out' : 'Punch In')}
        </button>

        {currentSession && (
          <p className="mt-4 text-xs font-bold text-emerald-600 uppercase">
            Started at {new Date(currentSession.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        )}
      </div>

      {/* Activity Log */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Your Logs</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {attendanceHistory.filter(r => r.userName === userName).length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic text-sm">No recent attendance found.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {attendanceHistory.filter(r => r.userName === userName).slice().reverse().map(record => {
                const proj = projects.find(p => p.id === record.projectId);
                return (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase truncate w-32">{proj?.name || 'Unknown Site'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(record.checkInTime).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                         <Clock size={12} /> {new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                       {record.checkOutTime ? (
                         <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase mt-1">
                           <Clock size={12} /> {new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                       ) : (
                         <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block animate-pulse">On Site</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
