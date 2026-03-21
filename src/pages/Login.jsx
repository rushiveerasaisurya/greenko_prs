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
  const { login, switchRole, updateSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [tempUser, setTempUser] = useState(null);

  const roleLabels = { HEAD_OFFICE: 'Head Office', CLUSTER_HEAD: 'Cluster Head', CLUSTER_SAFETY_OFFICER: 'Cluster Safety Officer', SITE_HEAD: 'Site Head' };

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const err = login(email, password); 
    setLoading(false);
    
    if (err) { setError(err); return; }
    
    const fetchedUser = JSON.parse(sessionStorage.getItem('ssrs_user')) || {};
    const roles = fetchedUser.roles || (fetchedUser.role ? [fetchedUser.role] : []);
    
    if (roles.length > 1) {
      setTempUser(fetchedUser);
      setSelectedRole(roles[0]);
      setStep(2);
    } else {
      if (roles[0] === 'CLUSTER_SAFETY_OFFICER') {
        setTempUser(fetchedUser);
        setSelectedRole(roles[0]);
        setStep(3);
      } else {
        finalizeLogin(roles[0]);
      }
    }
  };

  const handleRoleSelection = (e) => {
    e.preventDefault();
    if (switchRole) {
      switchRole(selectedRole);
    }
    if (selectedRole === 'CLUSTER_SAFETY_OFFICER') {
      setStep(3);
    } else {
      finalizeLogin(selectedRole);
    }
  };

  const handleClusterSelection = (e) => {
    e.preventDefault();
    if (!selectedCluster) { setError('Please select a cluster'); return; }
    if (updateSession) updateSession({ cluster: selectedCluster });
    else {
      const current = JSON.parse(sessionStorage.getItem('ssrs_user')) || tempUser;
      sessionStorage.setItem('ssrs_user', JSON.stringify({ ...current, cluster: selectedCluster }));
    }
    finalizeLogin(selectedRole);
  };

  const finalizeLogin = (roleToUse) => {
    const routes = {
      HEAD_OFFICE: '/dashboard/ho',
      CLUSTER_HEAD: '/dashboard/cluster',
      CLUSTER_SAFETY_OFFICER: '/dashboard/cluster',
      SITE_HEAD: '/dashboard/site',
    };
    navigate(routes[roleToUse] || '/dashboard/site');
  };

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

          <h2 className="text-2xl font-bold font-display text-foreground mb-1">{step === 1 ? 'Welcome back' : step === 2 ? 'Select Your Role' : 'Explore Cluster'}</h2>
          <p className="text-muted-foreground text-sm mb-8">{step === 1 ? 'Sign in to access your safety dashboard' : step === 2 ? `Welcome, ${tempUser?.name}. Choose a role to continue.` : 'Which cluster would you like to view?'}</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleInitialLogin} className="space-y-4">
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
          ) : step === 2 ? (
            <form onSubmit={handleRoleSelection} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {tempUser?.roles?.map((r) => (
                  <button 
                    key={r}
                    type="button" 
                    onClick={() => setSelectedRole(r)}
                    className={`p-4 rounded-xl border-2 text-left transition flex items-center justify-between ${selectedRole === r ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground'}`}
                  >
                    <div>
                      <span className="block font-bold text-sm">{roleLabels[r]}</span>
                      {r === 'SITE_HEAD' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.site}</span>}
                      {r === 'CLUSTER_HEAD' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.cluster}</span>}
                      {r === 'CLUSTER_SAFETY_OFFICER' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.accessibleClusters?.length} accessible clusters</span>}
                    </div>
                    {selectedRole === r && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm">
                  Continue as {roleLabels[selectedRole]}
                </Button>
              </div>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:underline">← Back to login</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleClusterSelection} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1 pb-1">
                {tempUser?.accessibleClusters?.map((c) => (
                  <button 
                    key={c}
                    type="button" 
                    onClick={() => setSelectedCluster(c)}
                    className={`p-4 rounded-xl border-2 text-left transition flex items-center justify-between ${selectedCluster === c ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground'}`}
                  >
                    <div>
                      <span className="block font-bold text-sm">{c}</span>
                    </div>
                    {selectedCluster === c && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={!selectedCluster} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm">
                  Enter Cluster
                </Button>
              </div>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setStep(tempUser?.roles?.length > 1 ? 2 : 1)} className="text-xs text-muted-foreground hover:underline">← Back</button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">Confidential — Internal Use Only</p>
        </motion.div>
      </div>
    </div>
  );
}
