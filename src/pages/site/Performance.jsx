import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useData } from '@/contexts/DataContext';

export default function SitePerformance() {
  const { user } = useAuth();
  const { months, getLeaderboard, submissions, scoringElements } = useData();
  const currentLeaderboard = getLeaderboard(months[months.length - 1]);
  const myEntry = currentLeaderboard.find(l => l.site === user?.site);
  const elements = (scoringElements || []).filter(e => e.active && e.number <= 8);

  const elementScores = elements.map(el => {
    const subs = submissions.filter(s => s.site === user?.site && s.elementNumber === el.number && s.status === 'APPROVED').reduce((a, s) => a + (s.marksAwarded || 0), 0);
    return { name: `E${el.number}`, awarded: subs, max: el.maxMarks, weight: el.weightage, pct: el.maxMarks > 0 ? Math.round((subs / el.maxMarks) * 100) : 0 };
  });

  const gaugeData = [{ value: myEntry?.score || 0, fill: 'hsl(var(--primary))' }];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold">My Performance</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
          <h3 className="font-display font-bold mb-2">Overall Score</h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={10} background />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-score text-4xl -mt-6">{myEntry?.score || 0}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <span className="text-success font-semibold">+{myEntry?.totalPositive || 0} positive</span>
            <span className="text-destructive font-semibold">{myEntry?.totalNegative || 0} negative</span>
          </div>
        </div>
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-bold mb-4">Element-wise Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={elementScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="pct" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-display font-bold mb-4">Element Breakdown</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground"><th className="px-4 py-2 text-left">#</th><th className="px-4 py-2 text-left">Element</th><th className="px-4 py-2 text-right">Max</th><th className="px-4 py-2 text-right">Awarded</th><th className="px-4 py-2 text-right">Weight</th><th className="px-4 py-2 text-center">%</th></tr></thead>
          <tbody>{elementScores.map((e, i) => (
            <tr key={e.name} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
              <td className="px-4 py-2 font-bold">{i + 1}</td>
              <td className="px-4 py-2">{elements[i]?.name}</td>
              <td className="px-4 py-2 text-right text-score">{e.max}</td>
              <td className="px-4 py-2 text-right text-score">{e.awarded}</td>
              <td className="px-4 py-2 text-right text-muted-foreground">{e.weight}%</td>
              <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.pct >= 80 ? 'bg-success/15 text-success' : e.pct >= 50 ? 'bg-warning/15 text-warning-foreground' : 'bg-destructive/15 text-destructive'}`}>{e.pct}%</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </motion.div>
  );
}
