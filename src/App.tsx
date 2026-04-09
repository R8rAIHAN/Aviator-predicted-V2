import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Shield, Zap, History, User as UserIcon, LogOut, Settings, 
  Menu, X, AlertTriangle, CheckCircle2, Info, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, MultiplierHistory, Prediction } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = ({ 
  children, className, variant = 'primary', size = 'md', ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon', size?: 'sm' | 'md' | 'lg' }) => {
  const variants = {
    primary: 'bg-neon-blue text-black hover:bg-neon-blue/90',
    secondary: 'bg-neon-green text-black hover:bg-neon-green/90',
    outline: 'border border-white/20 hover:bg-white/10 text-white',
    ghost: 'hover:bg-white/5 text-white/70 hover:text-white',
    neon: 'bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black neon-glow-blue'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm font-semibold',
    lg: 'px-8 py-3 text-base font-bold'
  };
  return (
    <button 
      className={cn(
        'rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={cn('glass-card rounded-xl p-6 relative overflow-hidden', className)}>
    {title && (
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
        {Icon && <Icon className="w-4 h-4 text-neon-blue" />}
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// --- Pages ---

const LoginPage = ({ onLogin }: { onLogin: (data: any) => void }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-blue/10 mb-4 border border-neon-blue/20">
            <Zap className="w-8 h-8 text-neon-blue" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Aviator <span className="text-neon-blue">Analytics</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Professional Multiplier Forecasting</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-white/50 hover:text-neon-blue transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [history, setHistory] = useState<MultiplierHistory[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const fetchData = useCallback(async () => {
    try {
      const [hRes, pRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/user/predictions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      const hData = await hRes.json();
      const pData = await pRes.json();
      setHistory(hData);
      setUserHistory(pData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prediction', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPrediction(data);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const chartData = [...history].reverse().map((h, i) => ({
    name: i,
    val: h.multiplier
  }));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-casino-card border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
            <Zap className="w-6 h-6 text-neon-blue" />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic">AVIATOR <span className="text-neon-blue">PRO</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-white/5 text-white">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <History className="w-4 h-4" /> History
          </Button>
          {user.role === 'admin' && (
            <Button variant="ghost" className="w-full justify-start text-neon-green">
              <Settings className="w-4 h-4" /> Admin Panel
            </Button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <UserIcon className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.username}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Next Prediction" icon={Zap}>
              <div className="flex flex-col items-center justify-center py-4">
                {prediction ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-5xl font-black text-neon-blue mb-1 italic tracking-tighter">
                      {prediction.multiplier}x
                    </div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border inline-block",
                      prediction.riskLevel === 'Safe' ? 'border-neon-green text-neon-green' :
                      prediction.riskLevel === 'Risky' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'
                    )}>
                      {prediction.riskLevel} Risk
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-white/30 py-4">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Ready to Analyze</p>
                  </div>
                )}
                <Button 
                  variant="neon" 
                  className="mt-6 w-full" 
                  onClick={getPrediction}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Generate Signal'}
                </Button>
              </div>
            </Card>

            <Card title="Confidence Meter" icon={Shield}>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * (prediction?.confidence || 0)) / 100}
                      className="text-neon-green transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-white">{prediction?.confidence || 0}%</span>
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">
                    Real-time refresh in <span className="text-neon-blue">{countdown}s</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Recent Multipliers" icon={History}>
              <div className="grid grid-cols-4 gap-2">
                {history.slice(0, 12).map((h, i) => (
                  <div 
                    key={h.id} 
                    className={cn(
                      "p-2 rounded-lg text-center border border-white/5",
                      h.multiplier >= 2 ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' : 'bg-white/5 text-white/50'
                    )}
                  >
                    <div className="text-xs font-black italic">{h.multiplier}x</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chart Section */}
          <Card title="Live Multiplier Analytics" icon={TrendingUp}>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis hide dataKey="name" />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickFormatter={(val) => `${val}x`}
                    domain={[1, 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#00d2ff', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#00d2ff" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Prediction History */}
          <Card title="Your Prediction History" icon={History}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Predicted</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Confidence</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {userHistory.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white/50 font-mono text-xs">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-black italic text-neon-blue">{p.predicted_multiplier}x</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                          p.risk_level === 'Safe' ? 'border-neon-green/30 text-neon-green' :
                          p.risk_level === 'Risky' ? 'border-red-500/30 text-red-500' : 'border-yellow-500/30 text-yellow-500'
                        )}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">{p.confidence}%</td>
                    </tr>
                  ))}
                  {userHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-white/20 italic uppercase tracking-widest text-xs">
                        No predictions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Footer */}
          <footer className="pt-10 pb-6 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Disclaimer</p>
            </div>
            <p className="text-xs text-white/40 max-w-2xl mx-auto leading-relaxed">
              This platform is for demo analytics and educational simulation only. 
              No prediction guarantees actual betting outcomes. Play responsibly.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsReady(true);
  }, []);

  const handleLogin = (data: { token: string, user: User }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-casino-dark">
      <AnimatePresence mode="wait">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}
