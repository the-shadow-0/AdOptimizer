"use client";

import { useState, useEffect } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Key, CreditCard, Building, Webhook, Zap, Copy } from "lucide-react";
import toast from "react-hot-toast";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/workspace')
      .then(res => res.json())
      .then(data => setWorkspace(data))
      .catch(console.error);
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Platform Settings</h1>
        <p className="text-slate-400 mt-1">Manage your workspace, API integrations, and billing.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Settings Navigation */}
        <motion.div variants={itemVariants} className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: "general", label: "General", icon: Building },
            { id: "profile", label: "My Profile", icon: User },
            { id: "billing", label: "Billing & Plans", icon: CreditCard },
            { id: "integrations", label: "Ad Accounts", icon: Zap },
            { id: "api", label: "API & Webhooks", icon: Webhook },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Settings Content Area */}
        <motion.div variants={itemVariants} className="flex-1">
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
                {activeTab === 'general' && <GeneralSettings workspace={workspace} onUpdate={setWorkspace} />}
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'billing' && <BillingSettings />}
                {activeTab === 'integrations' && <IntegrationSettings integrations={workspace?.integrations || []} />}
                {activeTab === 'api' && <ApiSettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'security' && <SecuritySettings />}
             </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function GeneralSettings({ workspace, onUpdate }: { workspace?: any; onUpdate?: (w: any) => void }) {
  const [name, setName] = useState(workspace?.name || '');
  const [timezone, setTimezone] = useState(workspace?.timezone || 'UTC');
  const [currency, setCurrency] = useState(workspace?.currency || 'usd');
  const [saving, setSaving] = useState(false);

  // Sync with loaded workspace data
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setTimezone(workspace.timezone || 'UTC');
      setCurrency(workspace.currency || 'usd');
    }
  }, [workspace]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone, currency }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      onUpdate?.(updated);
      toast.success('Workspace settings updated successfully.');
    } catch {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-medium text-white mb-4">Workspace Details</h2>
            <div className="space-y-5 flex flex-col max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Currency</label>
                <select 
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
                <select 
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Metrics and daily budgets reset based on this timezone.</p>
              </div>

            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg transition-colors font-medium text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl border-l-4 border-l-rose-500/50">
            <h2 className="text-xl font-medium text-white mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-400 mb-4">Permanently delete this workspace and all associated campaign data. This cannot be undone.</p>
            <button onClick={() => toast.error('You do not have administrative privilege to delete the primary workspace.')} className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg transition-colors font-medium text-sm">
              Delete Workspace
            </button>
          </div>
      </div>
  )
}


function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/user')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUser(updated);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile. Is the API running?');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.avatarInitials || fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'JD';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <h2 className="text-xl font-medium text-white mb-4">My Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/30">
          {initials}
        </div>
        <button onClick={() => toast('Avatar upload coming soon.', { icon: '🖼️' })} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium">
          Change Avatar
        </button>
      </div>
      <div className="max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg transition-colors font-medium text-sm"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}


function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-medium text-white">Current Plan: Scale</h2>
            <p className="text-sm text-slate-400 mt-1">$499/month. Includes up to $100k/mo ad spend management.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">Active</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 mt-6 mb-2 overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>$45k managed this month</span>
          <span>$100k limit</span>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800 flex gap-3">
          <button onClick={() => toast('Upgrade portal loading...', { icon: '🚀' })} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm">
            Upgrade Plan
          </button>
          <button onClick={() => toast('Redirecting to invoice history...', { icon: '📄' })} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm">
            View Invoices
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Payment Method</h2>
          <button onClick={() => toast.success('Add new card dialog opened.')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">Add New</button>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-white border border-slate-700">VISA</div>
            <div>
              <p className="text-slate-200 font-medium text-sm flex items-center gap-1">•••• •••• •••• 4242</p>
              <p className="text-slate-500 text-xs">Expires 12/26</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-800 py-1 px-2 rounded">Default</span>
        </div>
      </div>
    </div>
  )
}

function IntegrationSettings({ integrations = [] }: { integrations?: any[] }) {
  const meta = integrations.find((i: any) => i.platform === 'META');
  const google = integrations.find((i: any) => i.platform === 'GOOGLE');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-medium text-white mb-6">Ad Account Integrations</h2>
      <div className="space-y-4">
        {[
          { name: 'Meta Ads', status: meta ? 'Connected' : 'Connect', account: meta?.adAccountId || null, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { name: 'Google Ads', status: google ? 'Connected' : 'Connect', account: google?.adAccountId || null, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
          { name: 'TikTok Ads', status: 'Connect', account: null, color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700' },
          { name: 'LinkedIn Ads', status: 'Connect', account: null, color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700' },
        ].map(platform => (
          <div key={platform.name} className="flex items-center justify-between p-4 border border-slate-800 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${platform.bg} ${platform.color}`}>
                 {platform.name[0]}
               </div>
               <div>
                  <p className="text-white font-medium">{platform.name}</p>
                  {platform.account ? (
                    <p className="text-slate-500 text-xs font-mono">{platform.account}</p>
                  ) : (
                    <p className="text-slate-500 text-xs">Not connected</p>
                  )}
               </div>
            </div>
            {platform.account ? (
              <button onClick={() => toast.success(`Synced data from ${platform.name}`)} className="px-4 py-2 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-slate-700">
                Sync Now
              </button>
            ) : (
              <button onClick={() => toast(`OAuth flow for ${platform.name} initiated.`, { icon: '🔄' })} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ApiSettings() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-medium text-white mb-2">API Keys</h2>
        <p className="text-sm text-slate-400 mb-4">Use these keys to authenticate API requests from your own backend.</p>
        
        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-200">Production Key</span>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
          </div>
          <div className="flex gap-2">
            <input type="password" value="sk_live_1234567890abcdef" readOnly className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 font-mono text-sm focus:outline-none" />
            <button onClick={() => { navigator.clipboard.writeText('sk_live_1234567890abcdef'); toast.success('API Key copied to clipboard') }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
               <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-800">
         <button onClick={() => toast.success('New API Key generated. Please save it securely.')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
            Roll API Key
         </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState([
    { title: "Daily Performance Digest", desc: "A daily summary of spend, ROAS, and AI actions.", active: true },
    { title: "Experiment Scaling Alerts", desc: "Get notified immediately when the AI scales a winning ad.", active: true },
    { title: "Fatigue Warnings", desc: "Alerts when an ad creative is burning out.", active: false },
    { title: "Budget Constraints", desc: "Notifications when you're about to hit account spending limits.", active: true },
  ]);

  const togglePref = (index: number) => {
    const newPrefs = [...prefs];
    newPrefs[index].active = !newPrefs[index].active;
    setPrefs(newPrefs);
    toast.success('Notification preference updated.');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-medium text-white mb-6">Alerts & Notifications</h2>
      <div className="space-y-4">
        {prefs.map((pref, i) => (
           <div key={i} className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0 last:pb-0">
             <div>
               <p className="text-slate-200 font-medium">{pref.title}</p>
               <p className="text-slate-500 text-sm mt-0.5">{pref.desc}</p>
             </div>
             <button 
               onClick={() => togglePref(i)}
               className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${pref.active ? 'bg-indigo-600' : 'bg-slate-700'}`}
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.active ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           </div>
        ))}
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-medium text-white mb-4">Password</h2>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={() => toast.success('Password updated successfully.')} className="px-5 py-2 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm">
            Update Password
          </button>
        </div>
      </div>
      <div className="pt-6 border-t border-slate-800">
        <h2 className="text-xl font-medium text-white mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-slate-400 mb-4">Add an extra layer of security to your account.</p>
        <button onClick={() => toast('2FA Setup initiated...', { icon: '🛡️' })} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm border border-slate-700">
          Enable 2FA
        </button>
      </div>
    </div>
  )
}
