import { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Download, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const scoreColor = (s) => s >= 80 ? 'text-success' : s >= 60 ? 'text-secondary' : s >= 40 ? 'text-accent' : 'text-destructive';

export default function Leaderboard() {
  const { user } = useAuth();
  const { months, getLeaderboard, getFYLeaderboard, getClusterLeaderboard, getPeriodLeaderboard } = useData();
  const [tab, setTab] = useState('current');
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);
  const [startMonth, setStartMonth] = useState(months[months.length - 3]);
  const [endMonth, setEndMonth] = useState(months[months.length - 1]);
  const [fyYear, setFyYear] = useState('2025-26');
  const isHOorCluster = user?.role === 'HEAD_OFFICE' || user?.role === 'CLUSTER_HEAD';

  let data = getLeaderboard(selectedMonth);
  if (tab === 'fy') {
    data = getFYLeaderboard(fyYear);
  } else if (tab === 'cluster') {
    data = getClusterLeaderboard(selectedMonth);
  } else if (tab === 'period') {
    data = getPeriodLeaderboard(startMonth, endMonth);
  }

  // Prepare chart data (Trend of Top 5 sites/clusters of selected month over history)
  const topSites = data.slice(0, 5);
  const chartData = [];
  const nameKey = tab === 'cluster' ? 'cluster' : 'site';

  if (topSites.length > 0) {
    const historyMonths = topSites[0].history.map(h => h.month);
    historyMonths.forEach(m => {
      const point = { name: m };
      topSites.forEach(item => {
        const histEntry = item.history.find(h => h.month === m);
        point[item[nameKey]] = histEntry ? histEntry.score : null;
      });
      chartData.push(point);
    });
  }
  const colors = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold">Leaderboard</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-live" /> LIVE
          </span>
        </div>
        {isHOorCluster && <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted"><Download className="w-4 h-4" /> Export</button>}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['current', 'fy', 'period', 'cluster']).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t === 'current' ? 'HQ View' : t === 'fy' ? 'FY Cumulative' : t === 'period' ? 'Period View' : 'By Cluster'}
            </button>
          ))}
        </div>

        {tab === 'current' || tab === 'cluster' ? (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        ) : tab === 'fy' ? (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <select
              value={fyYear}
              onChange={e => setFyYear(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="2025-26">FY 2025-26 (Current)</option>
              <option value="2024-25">FY 2024-25 (Previous)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">From:</span>
              <select
                value={startMonth}
                onChange={e => setStartMonth(e.target.value)}
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">To:</span>
              <select
                value={endMonth}
                onChange={e => setEndMonth(e.target.value)}
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 py-6">
        {[data[1], data[0], data[2]].filter(Boolean).map((entry, idx) => {
          const medals = ['🥈', '🥇', '🥉'];
          const heights = ['h-24', 'h-32', 'h-20'];
          const order = [1, 0, 2];
          return entry ? (
            <div key={entry.rank} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{medals[idx]}</span>
              <p className="text-xs font-semibold text-center max-w-[100px] truncate">
                {tab === 'cluster' ? entry.cluster : entry.site}
              </p>
              <p className={`text-score text-lg font-bold ${scoreColor(entry.score)}`}>{entry.score}</p>
              <div className={`${heights[idx]} w-20 rounded-t-lg mt-1 ${idx === 1 ? 'bg-primary' : 'bg-primary/60'}`} />
            </div>
          ) : null;
        })}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">Rank</th>
            <th className="px-4 py-3 text-left">{tab === 'cluster' ? 'Cluster' : 'Site'}</th>
            {tab !== 'cluster' && <th className="px-4 py-3 text-left">Cluster</th>}
            <th className="px-4 py-3 text-right">Score</th>
            <th className="px-4 py-3 text-center">Change</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr></thead>
          <tbody>{data.map((e, i) => (
            <tr key={e.rank} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} ${(e.site === user?.site || (tab === 'cluster' && e.cluster === user?.cluster)) ? 'ring-2 ring-primary/30' : ''} transition`}>
              <td className="px-4 py-3 font-bold">{e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}</td>
              <td className="px-4 py-3 font-medium">{tab === 'cluster' ? e.cluster : e.site}</td>
              {tab !== 'cluster' && <td className="px-4 py-3 text-muted-foreground">{e.cluster}</td>}
              <td className={`px-4 py-3 text-right text-score font-bold ${scoreColor(e.score)}`}>{e.score}</td>
              <td className="px-4 py-3 text-center">{e.change > 0 ? <span className="text-success font-semibold">↑{e.change}</span> : e.change < 0 ? <span className="text-destructive font-semibold">↓{Math.abs(e.change)}</span> : '—'}</td>
              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap font-bold ${e.status === 'Fully Submitted' || e.status === 'Excellent' ? 'bg-success/15 text-success' : e.status === 'Partial' || e.status === 'Good' ? 'bg-warning/15 text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>{e.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {chartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 mt-6">
          <h3 className="font-display font-bold text-lg mb-4">Top 5 Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {topSites.map((item, index) => (
                <Line
                  key={item.id}
                  type="monotone"
                  dataKey={item[nameKey]}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
