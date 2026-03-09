"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  MousePointerClick,
  BrainCircuit,
  Settings2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const performanceData = [
  { time: "00:00", roas: 2.1, spend: 1200 },
  { time: "04:00", roas: 2.3, spend: 2100 },
  { time: "08:00", roas: 1.8, spend: 3400 },
  { time: "12:00", roas: 2.6, spend: 5800 },
  { time: "16:00", roas: 2.9, spend: 8900 },
  { time: "20:00", roas: 3.2, spend: 11200 },
  { time: "24:00", roas: 3.5, spend: 14500 },
];

const activeExperiments = [
  { id: "EXP-8924", status: "Scaling", roas: 4.2, variant: "Hook V3 (AI)", platform: "Meta" },
  { id: "EXP-8925", status: "Learning", roas: 1.8, variant: "Catalog Carousel", platform: "Meta" },
  { id: "EXP-8926", status: "Terminated", roas: 0.9, variant: "UGC Text Overlay", platform: "TikTok" },
  { id: "EXP-8927", status: "Scaling", roas: 3.8, variant: "Lookalike 1% Seed", platform: "Google" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 mt-1">AI Agent Loop is active. 14 optimizations made in the last hour.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Bidding Rule thresholds are locked on this dashboard.")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
          >
            <Settings2 className="w-4 h-4" />
            Bidding Rules
          </button>
          <button 
            onClick={() => {
              const loadingToast = toast.loading("Invoking Orchestrator Edge...");
              setTimeout(() => {
                toast.success("Accounts successfully re-evaluated.", { id: loadingToast });
              }, 1500);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium text-sm shadow-lg shadow-indigo-500/20"
          >
            <BrainCircuit className="w-4 h-4" />
            Force Re-Evaluate
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Spend", value: "$14,500", change: "+12.5%", trend: "up", icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "True ROAS", value: "3.5x", change: "+0.8x", trend: "up", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Blended CPA", value: "$42.50", change: "-15%", trend: "up", icon: Activity, color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { label: "Active Experiments", value: "1,204", change: "+142", trend: "up", icon: MousePointerClick, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {kpi.change}
              </div>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">{kpi.label}</h3>
            <p className="text-3xl font-bold text-white mt-1 font-heading">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6" style={{ minWidth: 0 }}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white font-heading">ROAS Velocity (Intraday)</h2>
            <p className="text-sm text-slate-400">Predicted vs. Actual Returns mapped against Agent Bidding aggressive spikes.</p>
          </div>
          <div style={{ width: '100%', height: 300, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="roas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRoas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>


        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white font-heading">Live Agent Feed</h2>
            <p className="text-sm text-slate-400">Real-time decisions by the Orchestrator.</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {activeExperiments.map((exp, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{exp.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      exp.status === 'Scaling' ? 'bg-emerald-500/10 text-emerald-400' :
                      exp.status === 'Terminated' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 truncate w-40">{exp.variant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{exp.roas}x</p>
                  <p className="text-xs text-slate-400">{exp.platform}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
