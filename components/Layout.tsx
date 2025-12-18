import React from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PackageSearch, 
  Activity, 
  Cpu,
  Settings
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.FORECASTING, label: 'ML Forecasting', icon: TrendingUp },
    { id: ViewState.ALLOCATION, label: 'Allocation Engine', icon: PackageSearch },
    { id: ViewState.SIMULATION, label: 'What-If Simulator', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            OptiChain AI
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 text-slate-400 hover:text-slate-200 w-full px-4 py-2 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <div className="mt-4 px-4 py-2 bg-slate-900 rounded border border-slate-800">
            <p className="text-xs text-slate-500">Model Version</p>
            <p className="text-xs font-mono text-emerald-500">v2.4.0 (Prod)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-slate-100">
                {navItems.find(n => n.id === currentView)?.label}
            </h2>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>System Operational</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                    OA
                </div>
            </div>
        </header>
        <div className="p-8 pb-20 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;