import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Box } from 'lucide-react';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:bg-slate-800 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 
        trend === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-600/20 text-slate-400'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue (7d)" 
          value="$1.2M" 
          change="+12.5%" 
          trend="up" 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <MetricCard 
          title="Avg Forecast Accuracy" 
          value="94.2%" 
          change="+1.1%" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <MetricCard 
          title="Stockout Risk (High)" 
          value="3 SKUs" 
          change="-2" 
          trend="down" 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <MetricCard 
          title="Total Inventory" 
          value="45,230" 
          change="+5.4%" 
          trend="neutral" 
          icon={Box} 
          color="bg-cyan-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6">Network-Wide Sales Velocity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Urgent Actions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 border-l-4 border-l-rose-500">
              <div className="flex justify-between items-center mb-1">
                <span className="text-rose-400 text-xs font-bold uppercase">Critical Stockout</span>
                <span className="text-slate-500 text-xs">2h ago</span>
              </div>
              {/* Using Indiranagar Store ID */}
              <p className="text-sm font-medium">ADIDAS-UB-002 at Store - Indiranagar</p> 
              <button className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">Allocate Stock →</button>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 border-l-4 border-l-amber-500">
               <div className="flex justify-between items-center mb-1">
                <span className="text-amber-400 text-xs font-bold uppercase">Forecast Drift</span>
                <span className="text-slate-500 text-xs">5h ago</span>
              </div>
              <p className="text-sm font-medium">LAYS-CLASSIC Model Deviation &gt; 5%</p>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">Retrain Model →</button>
            </div>

             <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 border-l-4 border-l-emerald-500">
               <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-400 text-xs font-bold uppercase">Optimization</span>
                <span className="text-slate-500 text-xs">1d ago</span>
              </div>
              <p className="text-sm font-medium">Monthly Allocation Plan Ready</p>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">Review Plan →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;