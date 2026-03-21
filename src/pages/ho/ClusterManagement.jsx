import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, X, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

const emptyForm = { name: '', region: '', head: '', description: '' };

export default function ClusterManagement() {
  const { clusters, users, sites, months, getClusterLeaderboard, addCluster, updateCluster, deleteCluster } = useData();
  const currentMonth = months[months.length - 1];
  const clusterScores = getClusterLeaderboard(currentMonth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const clusterHeads = users.filter(u => u.role === 'CLUSTER_HEAD');

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, region: c.region || '', head: c.head || '', description: '' }); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast({ title: 'Cluster name is required', variant: 'destructive' }); return; }
    if (editingId) {
      updateCluster(editingId, { name: form.name, region: form.region, head: form.head });
      toast({ title: 'Cluster updated ✓' });
    } else {
      addCluster({ name: form.name, region: form.region, head: form.head });
      toast({ title: 'Cluster added ✓' });
    }
    setDrawerOpen(false); setForm(emptyForm); setEditingId(null);
  };

  const handleDelete = (c) => {
    if (!confirm(`Delete cluster "${c.name}"? This cannot be undone.`)) return;
    deleteCluster(c.id);
    toast({ title: `Cluster "${c.name}" deleted` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Cluster Management</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90"><Plus className="w-4 h-4" /> Add Cluster</button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">Cluster</th><th className="px-4 py-3 text-left">Region</th><th className="px-4 py-3 text-left">Head</th><th className="px-4 py-3 text-right">Sites</th><th className="px-4 py-3 text-right">Avg Score</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody>{clusters.map((c, i) => {
            const clusterSites = sites.filter(s => s.cluster === c.name);
            const scoreData = clusterScores.find(cs => cs.cluster === c.name);
            const displayScore = scoreData ? scoreData.score : 0;
            return (
              <tr key={c.id} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
                <td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-muted-foreground">{c.region}</td><td className="px-4 py-3">{c.head || '—'}</td><td className="px-4 py-3 text-right text-score">{clusterSites.length}</td><td className="px-4 py-3 text-right text-score">{displayScore}</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">{c.status}</span></td>
                <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 rounded hover:bg-muted text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border"><h3 className="font-display font-bold text-lg">{editingId ? 'Edit Cluster' : 'Add Cluster'}</h3><button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button></div>
          <div className="p-5 space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">Cluster Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Region / State</label><input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Cluster Head</label><select value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select</option>{clusterHeads.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm">{editingId ? 'Update Cluster' : 'Save Cluster'}</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
