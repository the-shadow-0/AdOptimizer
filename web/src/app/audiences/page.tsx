"use client";

import { useState, useEffect } from "react";
import { Users, Crosshair, TrendingUp, Zap, HelpCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AudienceExplorer() {
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClustering, setIsClustering] = useState(false);

  useEffect(() => {
    fetch('/api/v1/audiences')
      .then(res => res.json())
      .then(data => {
        setAudiences(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleForceCluster = async () => {
    setIsClustering(true);
    toast('Agent re-evaluating cluster algorithms...', { icon: '⚡' });
    try {
      await fetch('/api/v1/audiences/recluster', { method: 'POST' });
      toast.success('Audience model recalibrated with new signals.');
    } catch {
      toast.error('Re-clustering failed.');
    }
    setIsClustering(false);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Audience Explorer</h1>
          <p className="text-slate-400 mt-1">Autonomous clustering and dynamic lookalikes built by the Audience Agent.</p>
        </div>
        <button 
          onClick={handleForceCluster}
          disabled={isClustering}
          className={`flex items-center gap-2 px-4 py-2 ${isClustering ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-lg transition font-medium text-sm shadow-lg shadow-indigo-500/20`}
        >
          <Zap className={`w-4 h-4 ${isClustering ? 'animate-pulse' : ''}`} />
          {isClustering ? 'Re-Clustering...' : 'Force Re-Cluster'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Clusters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Managed Segments
          </h2>
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading segments...</div>
          ) : audiences.map((aud) => (
            <motion.div 
              key={aud.id} 
              variants={itemVariants}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium text-lg group-hover:text-indigo-400">{aud.name}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs">{aud.id.split('-')[0]}</span>
                    &bull;
                    <span>{aud.size} users</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  aud.performance === 'EXCELLENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  aud.performance === 'GOOD' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                  aud.performance === 'LEARNING' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {aud.performance}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Avg CPA</p>
                  <p className={`text-xl font-bold ${aud.performance === 'DEGRADING' ? 'text-rose-400' : 'text-white'}`}>${aud.cpa}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">True ROAS</p>
                  <p className="text-xl font-bold text-white flex items-center gap-2">
                    {aud.roas}x
                    {aud.performance === 'EXCELLENT' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3D Visualizer Placeholder / Intelligence Panel */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-30 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="mb-6 relative z-10 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-teal-400" /> Dimension Clustering
            </h2>
            <HelpCircle className="w-5 h-5 text-slate-600 hover:text-slate-400 cursor-pointer" />
          </div>

          <div className="flex-1 border border-slate-800/50 bg-slate-950/50 rounded-xl relative flex items-center justify-center p-8 transition-all overflow-hidden">
            <div className="text-center absolute z-10">
              <motion.div 
                animate={{ rotate: isClustering ? 1080 : 360 }}
                transition={{ duration: isClustering ? 2 : 20, repeat: Infinity, ease: "linear" }}
                className={`w-16 h-16 rounded-full border-2 ${isClustering ? 'border-indigo-400' : 'border-indigo-500/30'} flex items-center justify-center mx-auto mb-4 bg-slate-900/80 backdrop-blur transition-colors`}
              >
                <TrendingUp className={`w-8 h-8 ${isClustering ? 'text-white' : 'text-indigo-400'}`} />
              </motion.div>
              <p className="text-slate-300 font-medium">
                {isClustering ? 'Pulling CRM Signals...' : 'Audience Model Calibrated'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                {isClustering ? 'Connecting to Shopify Webhook API.' : 'The agent is currently pulling real-time CRM signals to refine overlap.'}
              </p>
            </div>
            
            {/* Fake dots for "clusters" */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0.5, scale: 0.8 }}
                  animate={{ 
                    opacity: isClustering ? [0.2, 1, 0.2] : [0.5, 1, 0.5], 
                    scale: isClustering ? [0.8, 1.5, 0.8] : [0.8, 1.2, 0.8],
                    x: isClustering ? (Math.random() > 0.5 ? 20 : -20) : 0,
                    y: isClustering ? (Math.random() > 0.5 ? 20 : -20) : 0
                  }}
                  transition={{ duration: isClustering ? 0.5 : Math.random() * 3 + 2, repeat: Infinity }}
                  className={`absolute rounded-full ${i % 3 === 0 ? 'bg-emerald-500' : i % 2 === 0 ? 'bg-indigo-500' : 'bg-teal-500'}`}
                  style={{
                    width: Math.random() * 8 + 4 + 'px',
                    height: Math.random() * 8 + 4 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
