import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Building, 
  User as UserIcon, 
  Shield, 
  ArrowRight, 
  Plus, 
  Activity, 
  PiggyBank, 
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  Database,
  Lock,
  Tag,
  Target,
  Terminal,
  FileText
} from 'lucide-react';
import * as api from './api';
import { type User, type Campaign, type Donation } from './types';

// Components
const Navbar = ({ user, onLogout, onNavigate }: { user: User | null; onLogout: () => void; onNavigate: (v: any) => void }) => (
  <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-800 tracking-tight">Donation<span className="text-indigo-600">MS</span></span>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => onNavigate('dashboard')} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">Dashboard</button>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">{user.username}</span>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={() => onNavigate('login')} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5 border border-slate-200 rounded hover:bg-slate-50">Login</button>
        )}
      </div>
    </div>
  </nav>
);

const CampaignCard = ({ campaign, onDonate }: { campaign: Campaign; onDonate: (c: Campaign) => void }) => {
  const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-indigo-400 transition-all shadow-sm"
    >
      <div className="h-24 bg-slate-50 flex items-center justify-center relative">
        <Heart className="w-10 h-10 text-indigo-100 group-hover:scale-110 transition-transform" />
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase">Live</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ORG ID: {campaign.charity_id}</span>
        </div>
        <h3 className="font-bold text-slate-800 leading-tight mb-2">{campaign.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-6 leading-relaxed">{campaign.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span className="text-indigo-600">${campaign.raised_amount}</span>
            <span className="text-slate-400">Goal: ${campaign.goal_amount}</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <button 
            onClick={() => onDonate(campaign)}
            className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Inject Funds
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(api.getActiveUser());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<'home' | 'dashboard' | 'login'>('home');
  const [stats, setStats] = useState({ total: 0, users: 0, campaigns: 0 });
  const [loading, setLoading] = useState(false);
  
  // Login Form
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getCampaigns();
    setCampaigns(data);
    const s = await api.getStats();
    setStats(s || { total: 0, users: 0, campaigns: 0 });
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setView('home');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = await api.login(loginData.username, loginData.password);
    if (u) {
      setUser(u);
      setView('dashboard');
      loadData();
    } else {
      alert("Invalid credentials. Try admin / admin123");
    }
  };

  const handleDonate = async (c: Campaign) => {
    if (!user) {
      setView('login');
      return;
    }
    const amount = prompt(`Enter donation amount for ${c.title}:`);
    if (amount) {
      const val = parseFloat(amount);
      if (val > 0) {
        await api.makeDonation({
          donor_id: user.id,
          campaign_id: c.id,
          amount: val,
          payment_method: 'Card'
        });
        alert("Donation successful!");
        loadData();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar user={user} onLogout={handleLogout} onNavigate={setView} />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Campaigns</h1>
                  <p className="text-xs text-slate-400 font-medium italic">Validated Contribution Streams</p>
                </div>
                <div className="hidden md:flex gap-2">
                  <div className="bg-white px-4 py-2 border border-slate-200 rounded-xl flex items-center gap-3">
                    <PiggyBank className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total Liquidated</p>
                      <p className="text-sm font-bold text-slate-800">${stats.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    onDonate={handleDonate} 
                  />
                ))}
                
                {campaigns.length === 0 && !loading && (
                  <div className="col-span-full py-20 bg-white border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center">
                    <Clock className="w-10 h-10 text-slate-200 mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Buffer Empty</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <Lock className="text-indigo-600 w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Access</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Credentials Required</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={loginData.username}
                      onChange={e => setLoginData({...loginData, username: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. admin"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    <input 
                      type="password" 
                      value={loginData.password}
                      onChange={e => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Commit Identity
                  </button>
                </form>
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-[9px] text-slate-400 italic">Default: admin / admin123</p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">Terminal Dashboard</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Identity: {user.username} | Role: {user.role}</p>
                </div>
                {user.role === 'admin' && (
                  <button className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                     Sys Console
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">State Integrity</p>
                    <p className="text-xl font-bold text-slate-800 uppercase">Verified</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">SSL / Encrypted</span>
                    </div>
                 </div>
                 <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Transactions</p>
                    <p className="text-xl font-bold text-slate-800">14 Active</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">+12% Velocity</span>
                    </div>
                 </div>
                 <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Impact Radius</p>
                    <p className="text-xl font-bold text-indigo-600 underline">Global</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Database className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Distributed Nodes</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm italic">System Ledger</h3>
                  <button className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Filter Data</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                          <th className="px-6 py-3 tracking-widest">Ref ID</th>
                          <th className="px-6 py-3 tracking-widest">Module</th>
                          <th className="px-6 py-3 tracking-widest">Value (USD)</th>
                          <th className="px-6 py-3 tracking-widest text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-50">
                        {campaigns.slice(0, 5).map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-400">#00{c.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{c.title}</td>
                            <td className="px-6 py-4 font-bold text-emerald-600">${c.raised_amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-slate-400 font-mono italic">SYNC_OK</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
