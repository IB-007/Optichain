import React, { useState, useEffect } from 'react';
import { SKUS, generateAllocationPlan } from '../services/mockData';
import { AllocationRow } from '../types';
import { generateNarrative } from '../services/geminiService';
import { ArrowRight, BarChart3, Save, RotateCcw, BrainCircuit } from 'lucide-react';

const Allocation: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState(SKUS[0]);
  const [allocationPlan, setAllocationPlan] = useState<AllocationRow[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExpl, setLoadingExpl] = useState(false);

  useEffect(() => {
    // Reset plan when SKU changes
    const plan = generateAllocationPlan(selectedSku);
    setAllocationPlan(plan);
    setExplanation("");
  }, [selectedSku]);

  const handleUpdateAllocation = (storeId: string, value: string) => {
    const val = parseInt(value) || 0;
    setAllocationPlan(prev => prev.map(row => 
      row.storeId === storeId ? { ...row, finalAllocation: val } : row
    ));
  };

  const handleExplain = async () => {
    setLoadingExpl(true);
    const narrative = await generateNarrative(
      `Allocation plan for ${selectedSku.name}`,
      allocationPlan,
      'ALLOCATION'
    );
    setExplanation(narrative);
    setLoadingExpl(false);
  };

  const totalAllocated = allocationPlan.reduce((sum, row) => sum + row.finalAllocation, 0);
  // Estimate central stock as a buffer over total need for demo
  const estimatedCentralStock = Math.round(totalAllocated * 1.5); 
  const remainingStock = estimatedCentralStock - totalAllocated;

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold">Allocation Engine</h1>
          <p className="text-slate-400">MIP-based Optimizer • Maximize Expected Sell-Through</p>
        </div>
        <div className="flex items-center space-x-3">
             <div className="text-right mr-4">
                <p className="text-xs text-slate-500 uppercase font-bold">DC Available Stock</p>
                <p className={`text-2xl font-mono font-bold ${remainingStock < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {remainingStock} <span className="text-sm text-slate-600">/ {estimatedCentralStock}</span>
                </p>
             </div>
             <select 
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={selectedSku.id}
                onChange={(e) => setSelectedSku(SKUS.find(s => s.id === e.target.value) || SKUS[0])}
            >
                {SKUS.map(sku => <option key={sku.id} value={sku.id}>{sku.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-slate-200">Proposed Store Distribution</h3>
                <span className="text-xs text-slate-500">Based on Lead Time & Sales Velocity</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900">
                        <tr>
                            <th className="px-6 py-3">Store</th>
                            <th className="px-6 py-3 text-right">Current Stock</th>
                            <th className="px-6 py-3 text-right">Forecast (LT)</th>
                            <th className="px-6 py-3 text-center">Sell-Through %</th>
                            <th className="px-6 py-3 text-right">System Rec</th>
                            <th className="px-6 py-3 text-right w-32">Final Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocationPlan.map((row) => (
                            <tr key={row.storeId} className="border-b border-slate-700 hover:bg-slate-750">
                                <td className="px-6 py-4 font-medium text-white">
                                    {row.storeName}
                                    <div className="text-xs text-slate-500 text-ellipsis overflow-hidden w-32 whitespace-nowrap" title={row.storeId}>
                                        {row.storeId.substring(0, 12)}...
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-400">{row.currentStock}</td>
                                <td className="px-6 py-4 text-right font-mono text-slate-400">{row.forecastDemand}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        row.sellThroughProb > 0.85 ? 'bg-emerald-500/20 text-emerald-400' :
                                        row.sellThroughProb > 0.7 ? 'bg-indigo-500/20 text-indigo-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {(row.sellThroughProb * 100).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-indigo-300">{row.suggestedAllocation}</td>
                                <td className="px-6 py-4">
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-white focus:border-indigo-500 focus:outline-none"
                                        value={row.finalAllocation}
                                        onChange={(e) => handleUpdateAllocation(row.storeId, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-900 font-semibold">
                         <tr>
                            <td colSpan={5} className="px-6 py-4 text-right text-slate-400">Total Allocated</td>
                            <td className={`px-6 py-4 text-right font-mono ${remainingStock < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                {totalAllocated}
                            </td>
                         </tr>
                    </tfoot>
                </table>
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-end space-x-3">
                <button 
                    onClick={() => setAllocationPlan(generateAllocationPlan(selectedSku))}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-2 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Optimal</span>
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-2 text-sm shadow-lg shadow-indigo-500/20 transition-all">
                    <Save className="w-4 h-4" />
                    <span>Approve Allocation</span>
                </button>
            </div>
        </div>

        {/* Explainability Panel */}
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <BrainCircuit className="w-6 h-6 text-indigo-400" />
                    <h3 className="font-semibold text-lg">Allocation Logic</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                    This allocation is optimized using a Mixed-Integer Programming (MIP) solver minimizing 
                    lost sales while balancing inventory carrying costs across the network.
                </p>

                <div className="space-y-3 mb-6">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Objective Function</span>
                        <span className="text-emerald-400 font-medium">Maximize GMROI</span>
                     </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Constraints Active</span>
                        <span className="text-slate-200 font-medium">Capacity, Safety Stock</span>
                     </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                    <button 
                        onClick={handleExplain}
                        disabled={loadingExpl}
                        className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-semibold flex justify-center items-center space-x-2 transition-all"
                    >
                        {loadingExpl ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div> : <BrainCircuit className="w-4 h-4" />}
                        <span>Explain Strategy with AI</span>
                    </button>
                    
                    {explanation && (
                        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4 animate-fadeIn">
                             <p className="text-sm text-indigo-200 leading-relaxed italic">
                                "{explanation}"
                             </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                 <h4 className="font-semibold text-slate-300 mb-4 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Projected Fill Rate
                 </h4>
                 <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Network Wide</span>
                    <span className="text-emerald-400">96%</span>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Allocation;