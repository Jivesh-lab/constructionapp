import React from 'react';
import { LayoutDashboard, FolderKanban, ClipboardList, MapPin, Package, Receipt } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  
  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dash' },
    { id: 'PROJECTS', icon: FolderKanban, label: 'Projects' },
    { id: 'DPR', icon: ClipboardList, label: 'DPR' },
    { id: 'ATTENDANCE', icon: MapPin, label: 'GPS' },
    { id: 'MATERIALS', icon: Package, label: 'Materials' },
    { id: 'INVOICES', icon: Receipt, label: 'Billing' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-safe pt-2 px-2 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto pb-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full py-1 ${
                isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
