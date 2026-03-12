import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const initialReports = [
  { id: '1', site: 'Kurnool Solar Plant', date: '2026-02-15', type: 'Safety Walkthrough', findings: 'Minor housekeeping issues in Block 2. Fire exit signage faded.', corrective: 'Housekeeping drive scheduled. Signage replaced.', nextDate: '2026-05-15', createdBy: 'Priya Mehta' },
  { id: '2', site: 'Anantapur Wind Farm', date: '2026-01-20', type: 'Compliance Audit', findings: 'All permits current. PPE compliance 95%.', corrective: 'Refresher training for 5% non-compliant workers.', nextDate: '2026-04-20', createdBy: 'Priya Mehta' },
];

export default function AuditReports() {
  const { user } = useAuth();
  const { sites } = useData();
  const [reports, setReports] = useState(initialReports);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ site: '', date: '', type: '', findings: '', corrective: '', nextDate: '' });

  const handleSave = () => {
    if (!form.site || !form.findings) return;
    setReports([...reports, { ...form, id: String(Date.now()), createdBy: user?.name || '' }]);
    setDrawerOpen(false);
    setForm({ site: '', date: '', type: '', findings: '', corrective: '', nextDate: '' });
    toast({ title: 'Audit report submitted ✓' });
  };

  const clusterSites = sites.filter(s => s.cluster === user?.cluster);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Audit Reports</h2>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Create Report</button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">Site</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Findings</th><th className="px-4 py-3 text-left">Next Audit</th><th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody>{reports.map((r, i) => (
            <tr key={r.id} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
              <td className="px-4 py-3 font-medium">{r.site}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-info/15 text-info">{r.type}</span></td>
              <td className="px-4 py-3 max-w-xs truncate">{r.findings}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.nextDate}</td>
              <td className="px-4 py-3 text-center"><button className="p-1.5 rounded hover:bg-muted"><Download className="w-3.5 h-3.5" /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border"><h3 className="font-display font-bold text-lg">Create Audit Report</h3><button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button></div>
          <div className="p-5 space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">Site *</label><select value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select</option>{clusterSites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Audit Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Audit Type</label><input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. Safety Walkthrough" className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Findings *</label><textarea value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={4} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Corrective Actions</label><textarea value={form.corrective} onChange={e => setForm({ ...form, corrective: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Next Audit Date</label><input type="date" value={form.nextDate} onChange={e => setForm({ ...form, nextDate: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm">Submit Report</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
