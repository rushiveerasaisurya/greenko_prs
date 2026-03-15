import { motion } from 'framer-motion';
import { LayoutDashboard, Award, Trophy, FileUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';

export default function SiteDashboard() {
  const { user } = useAuth();
  const { months, getLeaderboard, submissions, notifications, scoringElements } = useData();
  const currentLeaderboard = getLeaderboard(months[months.length - 1]);

  const myEntry = currentLeaderboard.find(l => l.site === user?.site);
  const myScore = myEntry?.score ?? 0;
  const clusterRank = currentLeaderboard.filter(l => l.cluster === user?.cluster).findIndex(l => l.site === user?.site) + 1;
  const overallRank = myEntry?.rank ?? 0;
  const pendingCount = submissions.filter(e => e.site === user?.site && (e.status === 'NOT_SUBMITTED' || e.status === 'REJECTED')).length;

  const elements = scoringElements.filter(e => e.number <= 8);
  const elementStatus = elements.map(el => {
    const subs = submissions.filter(e => e.site === user?.site && e.elementNumber === el.number);
    const awarded = subs.filter(s => s.status === 'APPROVED').reduce((a, s) => a + (s.marksAwarded || 0), 0);
    const allApproved = subs.length > 0 && subs.every(s => s.status === 'APPROVED');
    const anyPending = subs.some(s => s.status === 'PENDING');
    const anySubmitted = subs.length > 0;
    const status = allApproved ? 'All Approved' : anyPending ? 'Partially Submitted' : anySubmitted ? 'Partially Submitted' : 'Not Started';
    return { ...el, awarded, status, pct: el.maxMarks > 0 ? Math.round((awarded / el.maxMarks) * 100) : 0 };
  });

  // Quarter timeline
  const quarterStart = new Date('2025-10-01');
  const quarterEnd = new Date('2025-12-31');
  const now = new Date('2025-12-15');
  const totalDays = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / 86400000);
  const elapsed = Math.ceil((now.getTime() - quarterStart.getTime()) / 86400000);
  const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{user?.site}</h2>
            <p className="text-sm opacity-80">{user?.cluster} · Q3 FY2025-26</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" /> LIVE
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Score', value: `${myScore} / 100`, icon: LayoutDashboard, color: 'bg-primary' },
          { label: 'Cluster Rank', value: `#${clusterRank} of ${currentLeaderboard.filter(l => l.cluster === user?.cluster).length}`, icon: Award, color: 'bg-secondary' },
          { label: 'Overall Rank', value: `#${overallRank} of ${currentLeaderboard.length}`, icon: Trophy, color: 'bg-info' },
          { label: 'Pending Evidence', value: pendingCount + submissions.filter(e => e.site === user?.site && e.status === 'REJECTED').length, icon: FileUp, color: 'bg-accent' },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3">
              <div className={`${k.color} w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground`}><k.icon className="w-4 h-4" /></div>
              <div><p className="text-score text-xl">{k.value}</p><p className="text-[11px] text-muted-foreground">{k.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Element Progress */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-bold mb-4 text-foreground flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-primary" /> Element Progress</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-primary text-primary-foreground">
              <th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Element</th><th className="px-3 py-2 text-right">Max</th><th className="px-3 py-2 text-right">Awarded</th><th className="px-3 py-2 text-right">Weight</th><th className="px-3 py-2 text-center">Progress</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th>
            </tr></thead>
            <tbody>{elementStatus.map((el, i) => (
              <tr key={el.id} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} hover:bg-muted/30 transition-colors`}>
                <td className="px-3 py-2 font-bold">{el.number}</td>
                <td className="px-3 py-2 font-medium text-xs text-foreground/80">{el.name}</td>
                <td className="px-3 py-2 text-right text-score font-semibold">{el.maxMarks}</td>
                <td className="px-3 py-2 text-right text-score font-extrabold text-primary">{el.awarded}</td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">{el.weightage}%</td>
                <td className="px-3 py-2"><div className="w-24 ml-auto bg-muted rounded-full h-1.5"><div className="bg-primary rounded-full h-1.5 transition-all shadow-[0_0_8px_rgba(var(--primary),0.4)]" style={{ width: `${el.pct}%` }} /></div></td>
                <td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${el.status === 'All Approved' ? 'bg-success/15 text-success' : el.status === 'Not Started' ? 'bg-muted text-muted-foreground' : 'bg-warning/15 text-warning-foreground'}`}>{el.status}</span></td>
                <td className="px-3 py-2 text-center"><Link to="/dashboard/site/evidence" className="text-[10px] font-bold text-info hover:text-info/80 hover:underline px-2 py-1 bg-info/5 rounded">Submit →</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div className="space-y-6">
          {/* Quarter Timeline */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-display font-bold mb-3">Quarter Timeline</h3>
            <div className="relative w-full bg-muted rounded-full h-3 mb-2">
              <div className="bg-primary rounded-full h-3 transition-all" style={{ width: `${pct}%` }} />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-card" title="Quarter close" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{elapsed} days elapsed</span>
              <span>{totalDays - elapsed} days remaining</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-display font-bold mb-3">Recent Updates</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {notifications.slice(0, 6).map(n => (
                <div key={n.id} className="flex items-start gap-2 text-xs py-1.5 border-b border-border last:border-0">
                  <span>{n.icon}</span>
                  <div><p className="text-foreground">{n.message}</p><p className="text-[10px] text-muted-foreground">{n.time}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
