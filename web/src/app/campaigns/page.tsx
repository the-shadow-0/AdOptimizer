"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Play, Pause, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    try {
      await fetch(`/api/v1/campaigns/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`${newStatus === 'PAUSED' ? 'Paused' : 'Resumed'} ${name}`);
    } catch {
      toast.error("Action failed");
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus } : c));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Campaign Goals</h1>
          <p className="text-slate-400 mt-1">Manage top-level campaigns that the AI orchestrator operates within.</p>
        </div>
        <Link 
          href="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium text-sm shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          New Campaign Goal
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign Name</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Experiments</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Spend</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">True ROAS</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Loading campaigns...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">No campaigns found.</td></tr>
            ) : campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors cursor-pointer">
                      {camp.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono mt-0.5">{camp.id.split('-')[0]}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    camp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    camp.status === 'PAUSED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {camp.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
                    {camp.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-400 font-medium">Auto</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-300 font-medium">${camp.spend.toLocaleString()}</td>
                <td className="py-4 px-6 text-emerald-400 font-medium">{camp.roas}x</td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => toggleStatus(camp.id, camp.status, camp.name)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                    title={camp.status === 'PAUSED' ? "Resume Campaign" : "Pause Campaign"}
                  >
                    {camp.status === 'PAUSED' ? (
                      <Play className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Pause className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
