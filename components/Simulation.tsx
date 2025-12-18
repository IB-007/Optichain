import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Play, Settings2, AlertOctagon, TrendingDown } from 'lucide-react';
import { runSimulation } from '../services/mockData';
import { SimulationResult, SimulationParams } from '../types';
import { generateNarrative } from '../services/geminiService';

const Simulation: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    demandSurge: 20,
    leadTimeShock: 5,
    supplierReliability: 0.9,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string>("");

  const handleRun = async () => {
    setLoading(true);
    setInsight("");
    
    // Simulate compute time
    setTimeout(async () => {
        const simResult = runSimulation(params);
        setResult(simResult);
        
        // Auto-generate insight
        try {
            const text = await generateNarrative(
                "Supply Chain Stress Test Results",
                { params, metrics: { stockoutRate: simResult.stockoutRate, cost: simResult.totalCost } },
                'SIMULATION'
            );
            setInsight(text);
        } catch(e) {}
        
        setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-rose-500/10 rounded-xl">
                <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>
            <div>
                 <h1 className="text-2xl font-bold">What-If Simulator</h1>
                 <p className="text-slate-400">Discrete-Event Stochastic Engine • Monte Carlo Method</p>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-6 text-slate-200">
                        <Settings2 className="w-5 h-5" />
                        <h3 className="font-semibold">Scenario Parameters</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Demand Surge (%)</label>
                                <span className="text-sm font-mono text-indigo-400">+{params.demandSurge}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" step="5"
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                value={params.demandSurge}
                                onChange={(e) => setParams({...params, demandSurge: parseInt(e.target.value)})}
                            />
                            <p className="text-xs text-slate-500 mt-1">Sudden spike in consumer demand.</p>
                        </div>

                         <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Supplier Delay (Days)</label>
                                <span className="text-sm font-mono text-rose-400">+{params.leadTimeShock} days</span>
                            </div>
                            <input 
                                type="range" min="0" max="30" step="1"
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                value={params.leadTimeShock}
                                onChange={(e) => setParams({...params, leadTimeShock: parseInt(e.target.value)})}
                            />
                            <p className="text-xs text-slate-500 mt-1">Additional lead time due to disruptions.</p>
                        </div>

                         <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Supplier Reliability</label>
                                <span className="text-sm font-mono text-emerald-400">{(params.supplierReliability * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="1.0" step="0.05"
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                value={params.supplierReliability}
                                onChange={(e) => setParams({...params, supplierReliability: parseFloat(e.target.value)})}
                            />
                             <p className="text-xs text-slate-500 mt-1">Probability of on-time delivery.</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleRun}
                        disabled={loading}
                        className={`mt-8 w-full py-3 rounded-lg font-bold flex justify-center items-center space-x-2 transition-all ${
                            loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        }`}
                    >
                        {loading ? <div className="animate-spin w-5 h-5 border-2 border-slate-500 border-t-white rounded-full"></div> : <Play className="w-5 h-5 fill-current" />}
                        <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
                    </button>
                </div>

                {insight && (
                     <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-fadeIn">
                        <h4 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">AI Risk Assessment</h4>
                        <p className="text-sm text-slate-400 italic">"{insight}"</p>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col min-h-[500px]">
                {!result ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <Settings2 className="w-16 h-16 opacity-20" />
                        <p>Configure parameters and run simulation to see projection.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-4">
                             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-xs text-slate-500 uppercase">Stockout Rate</p>
                                <p className={`text-2xl font-bold ${result.stockoutRate > 0.1 ? 'text-rose-500' : 'text-slate-200'}`}>
                                    {(result.stockoutRate * 100).toFixed(1)}%
                                </p>
                             </div>
                              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-xs text-slate-500 uppercase">Est. Lost Sales Cost</p>
                                <p className="text-2xl font-bold text-slate-200">${result.totalCost.toLocaleString()}</p>
                             </div>
                              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-xs text-slate-500 uppercase">Revenue Impact</p>
                                <p className="text-2xl font-bold text-emerald-400">${result.revenue.toLocaleString()}</p>
                             </div>
                        </div>

                        <div className="h-80 bg-slate-800 rounded-xl p-4 border border-slate-700">
                             <h4 className="text-sm font-semibold text-slate-300 mb-4">Projected Daily Inventory Levels (30 Days)</h4>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={result.dailyInventory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 12}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#334155', opacity: 0.2}}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    />
                                    <ReferenceLine y={0} stroke="#cbd5e1" />
                                    <Bar dataKey="inventory" fill="#6366f1" radius={[2, 2, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};

export default Simulation;