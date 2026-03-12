import { motion } from 'framer-motion';
import { Factory, FolderTree, BarChart3, Ticket } from 'lucide-react';

import { tickets } from '@/mockData/tickets';
import { notifications } from '@/mockData/notifications';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useData } from '@/contexts/DataContext';

export default function HODashboard() {
  const { sites, clusters, months, getLeaderboard, getClusterLeaderboard } = useData();
  const currentMonth = months[months.length - 1];
  const currentLeaderboard = getLeaderboard(currentMonth);
  const clusterLeaderboard = getClusterLeaderboard(currentMonth);

  const kpis = [
    { label: 'Total Active Sites', value: sites.filter(s => s.status === 'Active').length, icon: Factory, color: 'bg-primary' },
    { label: 'Total Clusters', value: clusters.length, icon: FolderTree, color: 'bg-secondary' },
    { label: 'Company Avg Score', value: '78.4', icon: BarChart3, color: 'bg-info' },
    { label: 'Open Tickets', value: tickets.filter(t => t.status !== 'CLOSED').length, icon: Ticket, color: 'bg-accent' },
  ];

  const clusterChart = clusterLeaderboard.map(c => ({
    name: c.cluster.replace(' Cluster', ''),
    score: c.score
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3">
              <div className={`${k.color} w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground`}>
                <k.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-score text-2xl">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-bold text-foreground mb-4">Company Leaderboard — Top 10</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-primary text-primary-foreground">
                <th className="px-3 py-2 text-left rounded-tl-lg">Rank</th>
                <th className="px-3 py-2 text-left">Site</th>
                <th className="px-3 py-2 text-left">Cluster</th>
                <th className="px-3 py-2 text-right">Score</th>
                <th className="px-3 py-2 text-center">Trend</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">Status</th>
              </tr></thead>
              <tbody>
                {currentLeaderboard.map((e, i) => (
                  <tr key={e.rank} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
                    <td className="px-3 py-2 font-bold">{e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}</td>
                    <td className="px-3 py-2 font-medium">{e.site}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.cluster}</td>
                    <td className="px-3 py-2 text-right text-score">{e.score}</td>
                    <td className="px-3 py-2 text-center">{e.change > 0 ? <span className="text-success">↑{e.change}</span> : e.change < 0 ? <span className="text-destructive">↓{Math.abs(e.change)}</span> : '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status === 'Fully Submitted' ? 'bg-success/15 text-success' : e.status === 'Partial' ? 'bg-warning/15 text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-display font-bold text-foreground mb-4">Cluster Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={clusterChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-display font-bold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
    </motion.div>
  );
}
