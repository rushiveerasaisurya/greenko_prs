import { motion } from 'framer-motion';
import { Factory, ClipboardCheck, BarChart3, Ticket, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';

export default function ClusterDashboard() {
  const { user } = useAuth();
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sites, months, getLeaderboard, submissions, tickets, notifications } = useData();
  
  const queryMonth = searchParams.get('month');
  const currentMonth = queryMonth && months.includes(queryMonth) ? queryMonth : months[months.length - 1];
  
  const activeRole = user?.activeRole || user?.roles?.[0] || user?.role || 'SITE_HEAD';
  const basePath = activeRole === 'HEAD_OFFICE' ? '/dashboard/ho' : '/dashboard/cluster';
  
  const displayCluster = clusterId ? decodeURIComponent(clusterId) : user?.cluster;
  
  const currentLeaderboard = getLeaderboard(currentMonth);
  const clusterSitesData = currentLeaderboard.filter(l => l.cluster === displayCluster);
  const clusterSites = sites.filter(s => s.cluster === displayCluster);
  const pending = submissions.filter(e => e.status === 'PENDING' && clusterSites.some(s => s.name === e.site));
  const clusterTickets = tickets.filter(t => t.cluster === displayCluster && t.status !== 'CLOSED');

  const avgScore = clusterSitesData.length > 0
    ? Math.round(clusterSitesData.reduce((acc, s) => acc + s.score, 0) / clusterSitesData.length)
    : 0;

  const gaugeData = [{ value: avgScore, fill: 'hsl(var(--primary))' }];

  const siteComparisonData = clusterSitesData.map(s => ({
    name: s.site.replace(/^[A-Z]{2}_/, ''), // strip prefix for cleaner labels
    score: s.score,
    fullSite: s.site
  }));

  const clusterSubs = submissions.filter(e => e.month === currentMonth && clusterSites.some(s => s.name === e.site));
  const approved = clusterSubs.filter(e => e.status === 'APPROVED').length;
  const pendingCount = clusterSubs.filter(e => e.status === 'PENDING').length;
  const rejected = clusterSubs.filter(e => e.status === 'REJECTED').length;

  let statusData = [
    { name: 'Approved', value: approved, color: 'hsl(var(--success))' },
    { name: 'Pending', value: pendingCount, color: 'hsl(var(--warning))' },
    { name: 'Rejected', value: rejected, color: 'hsl(var(--destructive))' }
  ].filter(d => d.value > 0);

  if (statusData.length === 0) {
    statusData = [{ name: 'No Data', value: 1, color: 'hsl(var(--muted-foreground))' }];
  }

  const totalSubmissions = clusterSubs.length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Drilldown Back Navigation & Header */}
      {clusterId && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2 rounded-lg border border-border shadow-sm hover:border-primary/40 hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h2 className="font-display text-2xl font-bold text-foreground">{displayCluster}</h2>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Cluster Sites', value: clusterSites.length, icon: Factory, color: 'bg-primary' },
          { label: 'Pending Validations', value: pending.length, icon: ClipboardCheck, color: pending.length > 5 ? 'bg-destructive' : 'bg-accent' },
          { label: 'Cluster Avg Score', value: avgScore, icon: BarChart3, color: 'bg-secondary' },
          { label: 'Open Tickets', value: clusterTickets.length, icon: Ticket, color: 'bg-info' },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3">
              <div className={`${k.color} w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground`}><k.icon className="w-5 h-5" /></div>
              <div><p className="text-score text-2xl">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Site Comparison */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter">
          <h3 className="font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Site Comparison — {currentMonth}
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  labelFormatter={(lbl) => siteComparisonData.find(d => d.name === lbl)?.fullSite || lbl}
                />
                <Bar dataKey="score" name="Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown & Gauge */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm text-center hover-lift animate-card-enter" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-display font-bold mb-2 text-foreground">Cluster Average</h3>
            <div className="relative h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="60%" innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                <span className="text-score text-3xl font-bold">{avgScore}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">out of 100</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-display font-bold mb-4 text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> Submissions</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">Total: {totalSubmissions}</span>
            </h3>
            <div className="flex items-center justify-between">
              <div className="w-1/2 h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3 pl-4 border-l border-border/50">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Appr</span>
                  <span className="font-bold text-foreground">{approved}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning"></span> Pend</span>
                  <span className="font-bold text-foreground">{pendingCount}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive"></span> Rej</span>
                  <span className="font-bold text-foreground">{rejected}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-foreground"><Factory className="w-4 h-4 text-primary" /> Leaderboard Ranking</h3>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10"><tr className="bg-primary text-primary-foreground"><th className="px-3 py-2 text-left rounded-tl-lg">Rank</th><th className="px-3 py-2 text-left">Site</th><th className="px-3 py-2 text-right">Score</th><th className="px-3 py-2 text-right rounded-tr-lg">Pending</th></tr></thead>
              <tbody>{clusterSitesData.map((l, i) => (
                <tr key={l.rank} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} hover:bg-muted/50 transition-colors`}>
                  <td className="px-3 py-2 font-bold">{l.rank}</td>
                  <td className="px-3 py-2 font-medium">
                    <Link to={`${basePath}/site/${encodeURIComponent(l.site)}?month=${encodeURIComponent(currentMonth)}`} className="text-foreground hover:text-primary transition-colors block">
                      {l.site}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right text-score font-bold">{l.score}</td>
                  <td className="px-3 py-2 text-right">{submissions.filter(e => e.site === l.site && e.status === 'PENDING').length || '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-foreground"><AlertCircle className="w-4 h-4 text-warning" /> Action Required: Pending</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending validations!</p>
            ) : pending.slice(0, 10).map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-xs flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{p.site}</p>
                  <p className="text-muted-foreground mt-0.5">El {p.elementNumber} › {p.subElement}</p>
                  <p className="text-muted-foreground mt-1 text-[10px]">{p.submittedBy} · {p.filesCount} files</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0 group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
