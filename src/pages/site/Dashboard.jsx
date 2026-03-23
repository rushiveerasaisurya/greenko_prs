import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Award, Trophy, FileUp, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function SiteDashboard() {
  const { user } = useAuth();
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { months, getLeaderboard, submissions, notifications, scoringElements, sites } = useData();
  
  const queryMonth = searchParams.get('month');
  const initialMonth = queryMonth && months.includes(queryMonth) ? queryMonth : months[months.length - 1];
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // Determine which site to display (URL param or logged-in user's site)
  const displaySite = siteId ? decodeURIComponent(siteId) : user?.site;
  const displayCluster = siteId ? sites.find(s => s.name === displaySite)?.cluster : user?.cluster;

  const currentLeaderboard = getLeaderboard(selectedMonth);

  const myEntry = currentLeaderboard.find(l => l.site === displaySite);
  const myScore = myEntry?.score ?? 0;
  const clusterRank = currentLeaderboard.filter(l => l.cluster === displayCluster).findIndex(l => l.site === displaySite) + 1;
  const overallRank = myEntry?.rank ?? 0;
  const pendingCount = submissions.filter(e => e.site === displaySite && e.month === selectedMonth && (e.status === 'PENDING' || e.status === 'NOT_SUBMITTED')).length;
  const rejectedCount = submissions.filter(e => e.site === displaySite && e.month === selectedMonth && e.status === 'REJECTED').length;

  const elements = (scoringElements || []).filter(e => e.active && e.number <= 8);
  const elementStatus = elements.map(el => {
    const subs = submissions.filter(e => e.site === displaySite && e.elementNumber === el.number && e.month === selectedMonth);
    const awarded = subs.filter(s => s.status === 'APPROVED').reduce((a, s) => a + (s.marksAwarded || 0), 0);
    const subElementCount = el.subElements ? el.subElements.length : 0;
    const approvedSubElements = new Set(subs.filter(s => s.status === 'APPROVED').map(s => s.subElement)).size;
    const maxMarks = el.maxMarks || 0;
    const allApproved = subElementCount > 0 && approvedSubElements >= subElementCount;
    const anyPending = subs.some(s => s.status === 'PENDING');
    const anySubmitted = subs.length > 0;
    const status = allApproved ? 'All Approved' : anyPending ? 'Pending Review' : anySubmitted ? 'Partially Submitted' : 'Not Started';
    return { 
      ...el, 
      awarded, 
      status, 
      maxMarks,
      pct: maxMarks > 0 ? Math.min(100, Math.round((awarded / maxMarks) * 100)) : 0,
      shortName: `El ${el.number}`
    };
  });

  // Prepare trend data
  const trendData = months.map(m => {
    const lb = getLeaderboard(m);
    const entry = lb.find(l => l.site === displaySite);
    return {
      month: m.substring(0, 3), // short month name
      score: entry?.score || 0
    };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Drilldown Back Navigation */}
      {siteId && (
        <div className="flex items-center mb-1">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2 rounded-lg border border-border shadow-sm hover:border-primary/40 hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-5 text-primary-foreground relative shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">{displaySite}</h2>
            <p className="text-sm border-l-2 border-primary-foreground/50 pl-2 mt-1 opacity-90">{displayCluster}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-3 py-1.5 rounded-lg border border-white/30 bg-white/10 text-primary-foreground text-sm font-medium backdrop-blur-sm">
              {months.map(m => <option key={m} value={m} className="text-foreground bg-card">{m}</option>)}
            </select>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" /> LIVE
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Score', value: `${myScore} / 100`, icon: LayoutDashboard, color: 'bg-primary' },
          { label: 'Cluster Rank', value: `#${clusterRank} of ${currentLeaderboard.filter(l => l.cluster === displayCluster).length}`, icon: Award, color: 'bg-secondary' },
          { label: 'Overall Rank', value: `#${overallRank} of ${currentLeaderboard.length}`, icon: Trophy, color: 'bg-info' },
          { label: 'Pending Evidence', value: pendingCount + rejectedCount, icon: FileUp, color: 'bg-accent' },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3">
              <div className={`${k.color} w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground`}><k.icon className="w-4 h-4" /></div>
              <div><p className="text-score text-xl">{k.value}</p><p className="text-[11px] text-muted-foreground">{k.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter">
          <h3 className="font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Score Trend ({months[0]} - {months[months.length-1]})
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Element Progress Chart */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-display font-bold mb-4 text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Element Scoring — {selectedMonth}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elementStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  formatter={(value, name) => [value, name === 'awarded' ? 'Earned' : 'Potential']}
                />
                <Bar dataKey="awarded" name="Earned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="maxMarks" name="Max Possible" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Element Progress Detailed List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-foreground flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-primary" /> Element Details</h3>
            {!siteId && (
              <Link to="/dashboard/site/evidence" className="text-xs font-semibold text-primary hover:underline">Submit Evidence →</Link>
            )}
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
            {elementStatus.map(el => (
              <div key={el.id} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">{el.number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{el.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-muted rounded-full h-1.5"><div className={`rounded-full h-1.5 transition-all ${el.status === 'All Approved' ? 'bg-success' : el.status === 'Not Started' ? 'bg-muted-foreground/30' : 'bg-primary'}`} style={{ width: `${el.pct}%` }} /></div>
                    <span className="text-[10px] font-semibold text-muted-foreground w-12 text-right">{el.awarded} / {el.maxMarks}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${el.status === 'All Approved' ? 'bg-success/15 text-success' : el.status === 'Not Started' ? 'bg-destructive/10 text-destructive' : el.status === 'Pending Review' ? 'bg-warning/15 text-warning' : el.pct > 0 ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent-foreground'}`}>{el.status === 'Not Started' ? '⬆ Upload' : el.status === 'Pending Review' ? '⏳ Pending' : el.status === 'All Approved' ? '✓ Done' : el.pct > 0 ? '⚡ Partial' : '⬆ Upload'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover-lift animate-card-enter" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-display font-bold mb-3">Recent Updates</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
