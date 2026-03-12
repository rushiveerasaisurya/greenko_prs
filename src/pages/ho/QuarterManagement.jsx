import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lock, Unlock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const quarters = [
  { id: 'Q1', period: 'Apr – Jun 2025', status: 'CLOSED', submitted: 74, approved: 72, evidences: 648 },
  { id: 'Q2', period: 'Jul – Sep 2025', status: 'CLOSED', submitted: 74, approved: 70, evidences: 712 },
  { id: 'Q3', period: 'Oct – Dec 2025', status: 'OPEN', submitted: 52, approved: 38, evidences: 431 },
  { id: 'Q4', period: 'Jan – Mar 2026', status: 'UPCOMING', submitted: 0, approved: 0, evidences: 0 },
];

export default function QuarterManagement() {
  const [fy, setFy] = useState('FY2025-26');
  const [qList, setQList] = useState(quarters);

  const handleClose = (qId) => {
    if (!confirm('This will freeze all scores. Are you sure?')) return;
    setQList(qList.map(q => q.id === qId ? { ...q, status: 'CLOSED' } : q));
    toast({ title: `Quarter ${qId} closed successfully` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Quarter Management</h2>
        <select value={fy} onChange={e => setFy(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <option>FY2025-26</option><option>FY2024-25</option>
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {qList.map(q => (
          <div key={q.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-lg">{q.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.status === 'OPEN' ? 'bg-success/15 text-success' : q.status === 'CLOSED' ? 'bg-muted text-muted-foreground' : 'bg-info/15 text-info'}`}>{q.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{q.period}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Sites Submitted</span><span className="text-score">{q.submitted}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sites Approved</span><span className="text-score">{q.approved}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Evidences</span><span className="text-score">{q.evidences}</span></div>
            </div>
            <div className="mt-4">
              {q.status === 'OPEN' && <button onClick={() => handleClose(q.id)} className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Close Quarter</button>}
              {q.status === 'UPCOMING' && <button className="w-full py-2 bg-success text-success-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Unlock className="w-3 h-3" /> Open Quarter</button>}
              {q.status === 'CLOSED' && <button className="w-full py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Calendar className="w-3 h-3" /> View History</button>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
