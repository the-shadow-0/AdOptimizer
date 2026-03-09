"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Image as ImageIcon, Sparkles, AlertCircle, ArrowUpRight, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function CreativeStudio() {
  const [creatives, setCreatives] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/creatives')
      .then(res => res.json())
      .then(data => {
        setCreatives(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCreatives = creatives.filter(c => 
    (c.headline || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Creative Studio</h1>
          <p className="text-slate-400 mt-1">Asset library featuring AI-generated variations and live performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search creatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button onClick={() => toast('No filters active.', { icon: '🔍' })} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-slate-500">Loading creatives...</div>
        ) : filteredCreatives.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-colors cursor-pointer">
            <div className="relative h-48 w-full bg-slate-800">
              <img src={item.imageUrl} alt="Creative Asset" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 left-3 flex gap-2">
                {item.aiGenerated && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/90 backdrop-blur-md text-white rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                  item.status === 'WINNING' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  item.status === 'SCALING' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                  item.status === 'ACTIVE' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                  item.status === 'LEARNING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-slate-500">{item.id}</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-white flex items-center gap-1">
                    {item.roas} <span className="text-xs text-slate-400 font-normal">True ROAS</span>
                  </p>
                </div>
              </div>
              
              <div className="mb-4 h-10">
                <p className="text-sm text-slate-200 line-clamp-2">"{item.headline}"</p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <button onClick={() => toast.success('Creative angle duplicated to draft.')} className="flex-1 flex justify-center items-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-xs font-medium border border-transparent hover:border-slate-600">
                  <Copy className="w-3 h-3" /> Duplicate Angle
                </button>
                <button onClick={() => toast.success('Added to swipe file.')} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-transparent hover:border-slate-600">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCreatives.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
             No creatives match your search.
          </div>
        )}
      </div>
    </div>
  );
}
