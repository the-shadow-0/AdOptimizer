"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search campaigns, experiments, or audiences..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Growth Team</p>
            <p className="text-xs text-slate-400">Pro Tier</p>
          </div>
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-slate-800 hover:ring-indigo-500 transition-all">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
