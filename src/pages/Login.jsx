import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const err = login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    const routes= {
      'ho@greenko.com': '/dashboard/ho',
      'cluster@greenko.com': '/dashboard/cluster',
      'site@greenko.com': '/dashboard/site',
    };
    navigate(routes[email] || '/dashboard/ho');
  };

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(168,72%,30%) 0%, transparent 60%), radial-gradient(circle at 70% 80%, hsl(28,80%,52%) 0%, transparent 40%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground font-display mb-4">GREENKO SSRS</h1>
          <p className="text-xl text-primary-foreground/80 font-display">Site Safety Ranking System</p>
          <div className="mt-8 border-t border-primary-foreground/20 pt-8">
            <p className="text-2xl text-primary-foreground font-display italic">"Zero Harm. Every Site. Every Day."</p>
            <p className="text-sm text-primary-foreground/60 mt-4">Solar & Wind Business Unit</p>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">GREENKO SSRS</span>
          </div>

          <h2 className="text-2xl font-bold font-display text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your safety dashboard</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-display font-semibold">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@greenko.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-display font-semibold">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <span className="text-sm text-info hover:underline cursor-pointer">Forgot Password?</span>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-display font-bold text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold mb-3 uppercase tracking-wide">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { label: 'Head Office / Admin', email: 'ho@greenko.com', pw: 'admin123', color: 'bg-primary' },
                { label: 'Cluster Head / Safety Officer', email: 'cluster@greenko.com', pw: 'cluster123', color: 'bg-secondary' },
                { label: 'Site Head', email: 'site@greenko.com', pw: 'site123', color: 'bg-accent' },
              ].map(r => (
                <button key={r.email} type="button" onClick={() => quickLogin(r.email, r.pw)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left">
                  <div className={`w-8 h-8 rounded-md ${r.color} flex items-center justify-center shrink-0`}>
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.label}</p>
                    <p className="text-[11px] text-muted-foreground">{r.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">Confidential — Internal Use Only</p>
        </motion.div>
      </div>
    </div>
  );
}
