import { motion } from 'framer-motion';
import { clusters } from '@/mockData/clusters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const trendData = [
  { month: 'Oct', score: 65 }, { month: 'Nov', score: 70 }, { month: 'Dec', score: 74 }, { month: 'Jan', score: 76 }, { month: 'Feb', score: 78 }, { month: 'Mar', score: 78.4 },
];
import { useData } from '@/contexts/DataContext';

export default function Reports() {
  const { months, getLeaderboard } = useData();
  const currentLeaderboard = getLeaderboard(months[months.length - 1]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold">Reports & Analytics</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-semibold mb-4">Company Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip /><Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-semibold mb-4">Cluster Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clusters.map(c => ({ name: c.name.replace(' Cluster', ''), score: c.avgScore }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip /><Bar dataKey="score" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-display font-semibold mb-4">Site Scores Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-primary text-primary-foreground"><th className="px-4 py-2 text-left">Site</th><th className="px-4 py-2 text-left">Cluster</th><th className="px-4 py-2 text-right">Positive</th><th className="px-4 py-2 text-right">Negative</th><th className="px-4 py-2 text-right">Net Score</th></tr></thead>
            <tbody>{currentLeaderboard.map((e, i) => (
              <tr key={e.rank} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
                <td className="px-4 py-2 font-medium">{e.site}</td><td className="px-4 py-2 text-muted-foreground">{e.cluster}</td>
                <td className="px-4 py-2 text-right text-score text-success">{e.totalPositive}</td>
                <td className="px-4 py-2 text-right text-score text-destructive">{e.totalNegative}</td>
                <td className="px-4 py-2 text-right text-score">{e.score}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
