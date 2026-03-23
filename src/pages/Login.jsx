import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Leaf, Zap, Wind, Sun as SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

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
  const roleIcons = { HEAD_OFFICE: Shield, CLUSTER_HEAD: Zap, CLUSTER_SAFETY_OFFICER: Wind, SITE_HEAD: SunIcon };

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
    if (switchRole) switchRole(selectedRole);
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

  // Floating orb components
  const FloatingOrb = ({ delay, duration, size, x, y, color }) => (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );

  const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ====== ANIMATED LEFT PANEL ====== */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(147,64%,22%) 0%, hsl(168,72%,25%) 40%, hsl(153,50%,18%) 100%)' }}>

        {/* Floating animated orbs */}
        <FloatingOrb delay={0} duration={6} size="300px" x="10%" y="15%" color="hsl(168,72%,40%)" />
        <FloatingOrb delay={2} duration={8} size="250px" x="60%" y="55%" color="hsl(28,80%,52%)" />
        <FloatingOrb delay={1} duration={7} size="200px" x="35%" y="70%" color="hsl(147,64%,40%)" />
        <FloatingOrb delay={3} duration={9} size="180px" x="75%" y="10%" color="hsl(207,58%,44%)" />

        {/* Animated grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-lg"
        >
          {/* Greenko Logo */}
          <motion.div
            className="flex items-center justify-center mx-auto -mb-10"
            animate={{ filter: ['drop-shadow(0 0 30px rgba(255,255,255,0.1))', 'drop-shadow(0 0 50px rgba(255,255,255,0.2))', 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/greenko_logo.png" alt="Greenko" className="h-44 object-contain" />
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold text-white font-display mb-3 tracking-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          >
            PRS
          </motion.h1>
          <motion.p
            className="text-lg text-white/70 font-display"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
          >
            Plant Ranking System
          </motion.p>

          <motion.div
            className="mt-10 pt-8 border-t border-white/15"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className="text-2xl text-white/90 font-display italic leading-relaxed">
              "Zero Harm.<br />Every Site. Every Day."
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <SunIcon className="w-3.5 h-3.5" /> Solar
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <Wind className="w-3.5 h-3.5" /> Wind
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <Leaf className="w-3.5 h-3.5" /> Green Energy
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ====== RIGHT PANEL — FORM ====== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative">
        {/* Subtle decorative orb for right side */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10 bg-primary pointer-events-none" />

        <motion.div
          variants={staggerContainer} initial="hidden" animate="show"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeUp} className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/greenko_logo.png" alt="Greenko" className="h-10 object-contain" />
            <span className="text-xl font-bold font-display text-foreground">PRS</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <motion.h2 variants={fadeUp} className="text-3xl font-extrabold font-display text-foreground mb-2">
                {step === 1 ? 'Welcome back' : step === 2 ? 'Choose Your Role' : 'Select Cluster'}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-sm mb-8">
                {step === 1 ? 'Sign in to access your safety dashboard' : step === 2 ? `Hello, ${tempUser?.name}! Pick a role to continue.` : 'Which cluster would you like to explore?'}
              </motion.p>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </motion.div>
              )}

              {step === 1 ? (
                <form onSubmit={handleInitialLogin} className="space-y-5">
                  <motion.div variants={fadeUp} className="space-y-2">
                    <Label htmlFor="email" className="font-display font-semibold text-sm">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@greenko.com" required
                      className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </motion.div>
                  <motion.div variants={fadeUp} className="space-y-2">
                    <Label htmlFor="password" className="font-display font-semibold text-sm">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                        className="h-12 rounded-xl pr-11 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="flex justify-end">
                    <span className="text-sm text-primary hover:text-primary/80 hover:underline cursor-pointer font-medium transition-colors">Forgot Password?</span>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm shadow-lg shadow-primary/20 btn-press transition-all duration-300 hover:shadow-xl hover:shadow-primary/30">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : 'Sign In →'}
                    </Button>
                  </motion.div>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleRoleSelection} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {tempUser?.roles?.map((r, idx) => {
                      const RoleIcon = roleIcons[r] || Shield;
                      return (
                        <motion.button
                          key={r} type="button"
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.3 }}
                          onClick={() => setSelectedRole(r)}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 hover-lift
                            ${selectedRole === r ? 'border-primary bg-primary/8 shadow-md shadow-primary/10' : 'border-border hover:border-muted-foreground bg-card'}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedRole === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} transition-colors`}>
                            <RoleIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <span className="block font-bold text-sm text-foreground">{roleLabels[r]}</span>
                            {r === 'SITE_HEAD' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.site}</span>}
                            {r === 'CLUSTER_HEAD' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.cluster}</span>}
                            {r === 'CLUSTER_SAFETY_OFFICER' && <span className="block text-xs text-muted-foreground mt-0.5">{tempUser.accessibleClusters?.length} accessible clusters</span>}
                          </div>
                          {selectedRole === r && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm shadow-lg shadow-primary/20 btn-press">
                      Continue as {roleLabels[selectedRole]} →
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors">← Back to login</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleClusterSelection} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1 pb-1">
                    {tempUser?.accessibleClusters?.map((c, idx) => (
                      <motion.button
                        key={c} type="button"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08, duration: 0.3 }}
                        onClick={() => setSelectedCluster(c)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between hover-lift
                          ${selectedCluster === c ? 'border-primary bg-primary/8 shadow-md shadow-primary/10' : 'border-border hover:border-muted-foreground bg-card'}`}
                      >
                        <span className="block font-bold text-sm text-foreground">{c}</span>
                        {selectedCluster === c && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={!selectedCluster} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm shadow-lg shadow-primary/20 btn-press">
                      Enter Cluster →
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <button type="button" onClick={() => setStep(tempUser?.roles?.length > 1 ? 2 : 1)} className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors">← Back</button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.p variants={fadeUp} className="text-center text-[11px] text-muted-foreground mt-10 tracking-wide">
            CONFIDENTIAL — INTERNAL USE ONLY
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
