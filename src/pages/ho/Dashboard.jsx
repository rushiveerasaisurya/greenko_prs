import { motion } from 'framer-motion';
import { Factory, FolderTree, BarChart3, Ticket, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

import { useData } from '@/contexts/DataContext';

export default function HODashboard() {
  const { sites, clusters, months, getLeaderboard, getClusterLeaderboard, tickets, notifications } = useData();
  const currentMonth = months[months.length - 1];
  const currentLeaderboard = getLeaderboard(currentMonth);
  const clusterLeaderboard = getClusterLeaderboard(currentMonth);

  const avgScore = currentLeaderboard.length > 0
    ? (currentLeaderboard.reduce((acc, s) => acc + s.score, 0) / currentLeaderboard.length).toFixed(1)
    : '0.0';

  const kpis = [
    { label: 'Total Active Sites', value: sites.filter(s => s.status === 'Active').length, icon: Factory, color: 'bg-primary' },
    { label: 'Total Clusters', value: clusters.length, icon: FolderTree, color: 'bg-secondary' },
    { label: 'Company Avg Score', value: avgScore, icon: BarChart3, color: 'bg-info' },
  ];

  const clusterChart = clusterLeaderboard.map(c => ({
    name: c.cluster.replace(' Cluster', ''),
    score: c.score,
    full: c.cluster
  }));

  const trendData = months.map(m => {
    const lb = getLeaderboard(m);
    const avg = lb.length > 0 ? (lb.reduce((acc, s) => acc + s.score, 0) / lb.length) : 0;
    return { name: m.substring(0, 3), score: parseFloat(avg.toFixed(1)) };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((k, idx) => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className={`${k.color} w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground`}>
                <k.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-score text-2xl animate-glow">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Row: Leaderboard & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-foreground flex items-center gap-2"><Factory className="w-4 h-4 text-primary" /> Company Leaderboard</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10"><tr className="bg-primary text-primary-foreground">
                <th className="px-3 py-2 text-left rounded-tl-lg">Rank</th>
                <th className="px-3 py-2 text-left">Site</th>
                <th className="px-3 py-2 text-left">Cluster</th>
                <th className="px-3 py-2 text-right">Score</th>
                <th className="px-3 py-2 text-center">Trend</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">Status</th>
              </tr></thead>
              <tbody>
                {currentLeaderboard.map((e, i) => (
                  <tr key={e.rank} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} row-hover hover:bg-muted/50 transition-colors`}>
                    <td className="px-3 py-2 font-bold">{e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}</td>
                    <td className="px-3 py-2 font-medium">
                      <Link to={`/dashboard/ho/site/${encodeURIComponent(e.site)}?month=${encodeURIComponent(currentMonth)}`} className="text-foreground hover:text-primary transition-colors">
                        {e.site}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{e.cluster}</td>
                    <td className="px-3 py-2 text-right text-score font-bold">{e.score}</td>
                    <td className="px-3 py-2 text-center">{e.change > 0 ? <span className="text-success font-bold">↑ {e.change}</span> : e.change < 0 ? <span className="text-destructive font-bold">↓ {Math.abs(e.change)}</span> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status === 'Fully Submitted' ? 'bg-success/15 text-success' : e.status === 'Partial' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Recent Activity
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {notifications.slice(0, 8).map(n => (
                <div key={n.id} className="flex items-start gap-2 text-xs py-1.5 border-b border-border last:border-0">
                  <span>{n.icon}</span>
                  <div>
                    <p className="text-foreground">{n.message}</p>
                    <p className="text-muted-foreground text-[10px]">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Performance Chart */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.4s' }}>
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Cluster Performance
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusterChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                labelFormatter={(lbl) => clusterChart.find(d => d.name === lbl)?.full || lbl}
              />
              <Bar dataKey="score" name="Avg Score" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {clusterChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 80 ? 'hsl(var(--success))' : entry.score >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--warning))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
