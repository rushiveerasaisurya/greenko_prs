import { motion } from 'framer-motion';
import { Factory, ClipboardCheck, BarChart3, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useData } from '@/contexts/DataContext';

export default function ClusterDashboard() {
  const { user } = useAuth();
  const { sites, months, getLeaderboard, submissions, tickets, notifications } = useData();
  const currentMonth = months[months.length - 1];
  const currentLeaderboard = getLeaderboard(currentMonth);
  const clusterSitesData = currentLeaderboard.filter(l => l.cluster === user?.cluster);
  const clusterSites = sites.filter(s => s.cluster === user?.cluster);
  const pending = submissions.filter(e => e.status === 'PENDING' && clusterSites.some(s => s.name === e.site));
  const clusterTickets = tickets.filter(t => t.cluster === user?.cluster && t.status !== 'CLOSED');

  const avgScore = clusterSitesData.length > 0
    ? Math.round(clusterSitesData.reduce((acc, s) => acc + s.score, 0) / clusterSitesData.length)
    : 0;

  const gaugeData = [{ value: avgScore, fill: 'hsl(var(--primary))' }];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-bold mb-4">Sites in My Cluster</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-primary text-primary-foreground"><th className="px-3 py-2 text-left">Rank</th><th className="px-3 py-2 text-left">Site</th><th className="px-3 py-2 text-right">Score</th><th className="px-3 py-2 text-right">Pending</th></tr></thead>
            <tbody>{currentLeaderboard.filter(l => l.cluster === user?.cluster).map((l, i) => (
              <tr key={l.rank} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
                <td className="px-3 py-2 font-bold">{l.rank}</td><td className="px-3 py-2 font-medium">{l.site}</td>
                <td className="px-3 py-2 text-right text-score">{l.score}</td>
                <td className="px-3 py-2 text-right">{submissions.filter(e => e.site === l.site && e.status === 'PENDING').length}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm text-center">
            <h3 className="font-display font-bold mb-2">Cluster Score</h3>
            <ResponsiveContainer width="100%" height={140}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={gaugeData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} background />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-score text-3xl -mt-4">{avgScore}</p>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-display font-bold mb-3">Pending Validations</h3>
            <div className="space-y-2">
              {pending.slice(0, 5).map(p => (
                <div key={p.id} className="p-3 rounded-lg border border-border bg-background text-xs">
                  <p className="font-semibold">{p.site}</p>
                  <p className="text-muted-foreground">Element {p.elementNumber} › {p.subElement}</p>
                  <p className="text-muted-foreground mt-1">{p.submittedBy} · {p.filesCount} files</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
