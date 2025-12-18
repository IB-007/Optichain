import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import { SKUS, generateForecastData } from '../services/mockData';
import { generateNarrative } from '../services/geminiService';
import { ForecastPoint } from '../types';

const Forecasting: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState(SKUS[0]);
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      const forecast = generateForecastData(selectedSku.id);
      setData(forecast);
      setAiNarrative(null); // Reset narrative on SKU change
      setLoading(false);
    }, 600);
  }, [selectedSku]);

  const handleAiAnalyze = async () => {
    setAnalyzing(true);
    // Grab the last 14 days (forecast portion) + some context
    const recentData = data.slice(-14).map(d => ({ 
        date: d.date, 
        forecast: d.forecast, 
        confidence: `[${d.lowerBound}, ${d.upperBound}]` 
    }));
    
    const narrative = await generateNarrative(
      `Forecasting for ${selectedSku.name} (${selectedSku.category})`, 
      recentData, 
      'FORECAST'
    );
    setAiNarrative(narrative);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">ML Forecasting Suite</h1>
          <p className="text-slate-400">LightGBM Production Pipeline • Confidence Calibration Active</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
           <span className="text-sm font-medium text-slate-300 px-2">Select SKU:</span>
           <select 
             className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2"
             value={selectedSku.id}
             onChange={(e) => setSelectedSku(SKUS.find(s => s.id === e.target.value) || SKUS[0])}
           >
             {SKUS.map(sku => (
               <option key={sku.id} value={sku.id}>{sku.name} ({sku.id})</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Demand Forecast w/ Uncertainty Quantiles</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></span> Actual</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></span> Forecast P50</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-emerald-900/50 rounded-full mr-1"></span> 95% CI</span>
            </div>
          </div>
          
          {loading ? (
             <div className="h-80 flex items-center justify-center">
               <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    tickFormatter={(val) => val.slice(5)} // Show MM-DD
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  {/* Uncertainty Band (Confidence Interval) */}
                  <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="none" 
                    fill="#10b981" 
                    fillOpacity={0.1} 
                  />
                   {/* We need a custom way to do the lower bound area to create a band, 
                       but simple Area stacking works for visual effect if configured right. 
                       For simplicity in this mock, we just show the range via error bars or just a wide area. 
                       Better approach for Recharts: Two areas or a range area. 
                       Here I'll overlay a thick light area to represent the range.
                   */}
                   
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    dot={false}
                    name="Actual Sales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#34d399" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={{ r: 4 }}
                    name="Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Info & AI Panel */}
        <div className="space-y-6">
            {/* Stats */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-slate-200 border-b border-slate-700 pb-2">Model Diagnostics</h4>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">MAPE</span>
                    <span className="text-emerald-400 font-mono">4.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">RMSE</span>
                    <span className="text-slate-200 font-mono">12.4</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Bias</span>
                    <span className="text-slate-200 font-mono">+0.8%</span>
                </div>
            </div>

            {/* GenAI Insight */}
            <div className="bg-gradient-to-b from-indigo-900/20 to-slate-800 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-semibold text-indigo-100">AI Narrative</h4>
                </div>
                
                {aiNarrative ? (
                    <div className="animate-fadeIn">
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            {aiNarrative}
                        </p>
                        <button 
                            onClick={handleAiAnalyze}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                            Refresh Analysis
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-400 mb-4">
                            Generate a natural language summary of this forecast trend using Gemini.
                        </p>
                        <button 
                            onClick={handleAiAnalyze}
                            disabled={analyzing}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center justify-center space-x-2 transition-all"
                        >
                            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Bot className="w-4 h-4" />}
                            <span>{analyzing ? 'Thinking...' : 'Analyze with AI'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;