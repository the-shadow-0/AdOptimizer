"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Play, Pause, AlertTriangle, TrendingUp, Filter, Search, MoreHorizontal, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/experiments')
      .then(res => res.json())
      .then(data => {
        setExperiments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'TERMINATED' ? 'LEARNING' : (currentStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED');
    setExperiments(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    try {
      await fetch(`/api/v1/experiments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Experiment updated to ${newStatus}`);
    } catch {
      toast.error("Action failed");
      setExperiments(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus } : c));
    }
  };

  const filteredExperiments = experiments.filter(e => 
    (e.variantName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.campaign || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Active Experiments</h1>
          <p className="text-slate-400 mt-1">Granular view of all AI-driven split tests across connected ad accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search experiments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64 transition-colors"
            />
          </div>
          <button onClick={() => toast('No custom filters defined.', {icon: '⚙️'})} className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Summary KPI Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Active", value: experiments.filter(e => e.status !== 'Terminated' && e.status !== 'Paused').length, subtext: "+3 since yesterday" },
          { label: "Tests Scaling", value: experiments.filter(e => e.status === 'Scaling').length, subtext: "Meeting ROAS goals" },
          { label: "In Learning", value: experiments.filter(e => e.status === 'Learning').length, subtext: "Gathering data" },
          { label: "Terminated Today", value: experiments.filter(e => e.status === 'Terminated').length, subtext: "Below CPA threshold" },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center transition-all duration-300">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
            <div className="flex items-end gap-2 text-white">
              <motion.span 
                key={kpi.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold"
              >{kpi.value}</motion.span>
              <span className="text-xs text-slate-500 mb-1">{kpi.subtext}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider">Experiment</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider">Platform</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider text-right">Spend</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider text-right">CPA</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider text-right">ROAS</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-xs uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredExperiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{exp.variantName}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{exp.id.split('-')[0]} • {exp.campaign}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider transition-colors ${
                        exp.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                        exp.status === 'SCALING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        exp.status === 'TERMINATED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        exp.status === 'LEARNING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        exp.status === 'PAUSED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{exp.platform}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-white font-medium">{exp.spend}</span>
                  </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-bold text-white">{exp.roas}x</span>
                      {exp.roasTrend === 'up' ? (
                        <ArrowUpRight className="inline w-3.5 h-3.5 text-emerald-400 ml-1 mb-0.5" />
                      ) : (
                        <ArrowDownRight className="inline w-3.5 h-3.5 text-rose-400 ml-1 mb-0.5" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {exp.status === 'ACTIVE' || exp.status === 'LEARNING' || exp.status === 'SCALING' ? (
                         <button onClick={(e) => { e.stopPropagation(); toggleStatus(exp.id, exp.status); }} className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded transition-colors" title="Pause Experiment">
                            <Pause className="w-4 h-4" />
                         </button>
                      ) : exp.status === 'TERMINATED' ? (
                         <button onClick={(e) => { e.stopPropagation(); toggleStatus(exp.id, exp.status); }} className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 rounded transition-colors" title="Restart Experiment">
                            <RefreshCw className="w-4 h-4" />
                         </button>
                      ) : (
                         <button onClick={(e) => { e.stopPropagation(); toggleStatus(exp.id, exp.status); }} className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 rounded transition-colors" title="Resume Experiment">
                            <Play className="w-4 h-4" />
                         </button>
                      )}
                         <button onClick={(e) => { e.stopPropagation(); toast('More actions loading...'); }} className="p-1.5 hover:bg-slate-700 hover:text-white text-slate-400 rounded transition-colors" title="More Options">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                </tr>
              ))}
              {filteredExperiments.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                     No experiments match your search criteria.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
