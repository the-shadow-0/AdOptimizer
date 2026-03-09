"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Target, Sparkles, CheckCircle2, Loader2, Link2, Users, Play } from "lucide-react";

export default function NewCampaignWizard() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [url, setUrl] = useState("");
  const [roas, setRoas] = useState("");
  const [budget, setBudget] = useState("");
  const [context, setContext] = useState("");
  const [results, setResults] = useState<any>(null);

  const startGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Dispatch agent orchestrator loop
      const res = await fetch("/api/v1/campaigns/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, targetRoas: roas, dailyBudget: budget, context })
      });
      const data = await res.json();
      
      const jobId = data.jobId;

      // Poll until completion
      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/v1/campaigns/orchestrate/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'completed') {
          clearInterval(poll);
          setResults(statusData.results);
          setIsGenerating(false);
          setStep(3);
        } else if (statusData.status === 'failed') {
          clearInterval(poll);
          alert('Agent orchestrator failed to generate assets.');
          setIsGenerating(false);
        }
      }, 1500);

    } catch (e) {
      console.error(e);
      alert('Unable to connect to AdOptimizer AI backend.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />
        
        {[
          { num: 1, label: "Define Goal" },
          { num: 2, label: "AI Brainstorming" },
          { num: 3, label: "Review & Deploy" }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
              step >= s.num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-sm font-medium ${step >= s.num ? 'text-slate-200' : 'text-slate-500'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {step === 1 && (
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">Let's build a new campaign.</h2>
              <p className="text-slate-400 mt-1">Define your business goal, and the orchestrator will handle the rest.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Landing Page URL</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourbrand.com/product" className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Target ROAS</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="number" value={roas} onChange={e => setRoas(e.target.value)} step="0.1" placeholder="3.0" className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Daily Budget Limit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="1000" className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Business / Product Context</label>
                <textarea rows={3} value={context} onChange={e => setContext(e.target.value)} placeholder="Describe the product, key selling points, and target demographic briefly..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!url || !context}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-indigo-500 text-white rounded-lg transition font-medium text-sm shadow-lg shadow-indigo-500/20 disabled:shadow-none"
              >
                Proceed to Generative AI
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="relative z-10 py-12 flex flex-col items-center justify-center text-center space-y-6">
            {!isGenerating ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Bot className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white mb-2">Initialize the Orchestrator?</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    The AI agents will analyze your context, generate high-converting creative copies, propose image concepts, and discover audience clusters.
                  </p>
                </div>
                <button 
                  onClick={startGeneration}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-400 hover:to-teal-300 text-white rounded-full transition font-semibold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Generation
                </button>
              </>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <div className="space-y-2">
                  <p className="text-white font-medium text-lg animate-pulse">Running Agents in parallel...</p>
                  <div className="text-sm text-slate-400 text-left space-y-1">
                    <p className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Analyzing Product Context</p>
                    <p className="flex items-center gap-2 text-indigo-400"><Loader2 className="w-4 h-4 animate-spin" /> Calling Gemini 2.5 Flash API for Creatives...</p>
                    <p className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4" /> Discovering Lookalike Audiences...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && results && (
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-heading text-white">Generation Complete</h2>
                <p className="text-slate-400 mt-1">The agents have mapped out experiments to deploy based on your AI definitions.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wide">Ready for Launch</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-auto max-h-64">
                <h3 className="font-medium text-white mb-3 flex items-center gap-2 sticky top-0 bg-slate-950/90 backdrop-blur py-1">
                  <Sparkles className="w-4 h-4 text-teal-400" /> AI Creative Concepts ({results.creatives?.length || 0})
                </h3>
                <div className="space-y-3">
                  {results.creatives?.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <p className="text-sm font-bold text-white mb-1">"{item.headline}" <span className="text-xs font-normal text-emerald-400 border border-emerald-500/30 px-1 rounded ml-1 bg-emerald-500/10">Est. CTR {item.predictedCTR}</span></p>
                      <p className="text-xs text-slate-400 mb-2">{item.bodyCopy}</p>
                      <p className="text-[10px] text-slate-500 border-l border-slate-700 pl-2">Prompt: {item.imagePrompt}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> Selected Audiences
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                   {results.audiences?.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between p-2 bg-slate-900 rounded-lg">
                        <span>{item.name}</span>
                        <span className="text-slate-500 font-mono">{item.size}</span>
                      </li>
                   ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 z-20 relative">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium text-sm"
              >
                Regenerate
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-semibold text-sm shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-4 h-4" />
                Deploy Experiments Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
