import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Ban, Eye, X, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

const emptyForm = { name: '', type: 'Solar', cluster: '', siteHead: '', state: '', capacity: '', commissionedDate: '', status: 'Active' };

export default function SiteManagement() {
  const { sites, clusters, users, addSite, updateSite, toggleSiteStatus, deleteSite } = useData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detailSite, setDetailSite] = useState(null);
  const [search, setSearch] = useState('');

  const availableHeads = users.filter(u => u.role === 'SITE_HEAD' && u.status === 'Active');

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (s) => { setEditingId(s.id); setForm({ name: s.name, type: s.type, cluster: s.cluster, siteHead: s.siteHead || '', state: s.state || '', capacity: String(s.capacity || ''), commissionedDate: s.commissionedDate || '', status: s.status }); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.cluster) { toast({ title: 'Site name and cluster are required', variant: 'destructive' }); return; }
    if (editingId) {
      updateSite(editingId, { name: form.name, type: form.type, cluster: form.cluster, siteHead: form.siteHead, state: form.state, capacity: Number(form.capacity) || 0, commissionedDate: form.commissionedDate, status: form.status });
      toast({ title: 'Site updated ✓' });
    } else {
      addSite({ name: form.name, type: form.type, cluster: form.cluster, siteHead: form.siteHead, state: form.state, capacity: Number(form.capacity) || 0, commissionedDate: form.commissionedDate, status: form.status });
      toast({ title: 'Site added ✓' });
    }
    setDrawerOpen(false); setForm(emptyForm); setEditingId(null);
  };

  const handleToggleStatus = (s) => {
    toggleSiteStatus(s.id);
    toast({ title: `${s.name} is now ${s.status === 'Active' ? 'Inactive' : 'Active'}` });
  };

  const handleDelete = (s) => {
    if (!confirm(`Delete site "${s.name}"? This cannot be undone.`)) return;
    deleteSite(s.id);
    toast({ title: `Site "${s.name}" deleted` });
  };

  const filtered = sites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cluster.toLowerCase().includes(search.toLowerCase()) ||
    (s.siteHead && s.siteHead.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Site Management</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"><Plus className="w-4 h-4" /> Add New Site</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">Site Name</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Cluster</th>
            <th className="px-4 py-3 text-left">Site Head</th>
            <th className="px-4 py-3 text-right">Capacity (MW)</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} hover:bg-muted/50 transition`}>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.type === 'Solar' ? 'bg-warning/15 text-warning' : 'bg-info/15 text-info'}`}>{s.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{s.cluster}</td>
                <td className="px-4 py-3">{s.siteHead || '—'}</td>
                <td className="px-4 py-3 text-right text-score">{s.capacity}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleToggleStatus(s)} className="p-1.5 rounded hover:bg-muted" title={s.status === 'Active' ? 'Deactivate' : 'Activate'}><Ban className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDetailSite(s)} className="p-1.5 rounded hover:bg-muted" title="View Details"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s)} className="p-1.5 rounded hover:bg-muted text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No sites found</p>}
      </div>

      {/* Detail Modal */}
      {detailSite && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDetailSite(null)} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">{detailSite.name}</h3><button onClick={() => setDetailSite(null)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{detailSite.type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cluster</span><span className="font-medium">{detailSite.cluster}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Site Head</span><span className="font-medium">{detailSite.siteHead || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="font-medium">{detailSite.capacity} MW</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">State</span><span className="font-medium">{detailSite.state || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Commissioned</span><span className="font-medium">{detailSite.commissionedDate || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${detailSite.status === 'Active' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{detailSite.status}</span></div>
            </div>
          </div>
        </motion.div>
      </>)}

      {/* Add/Edit Drawer */}
      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border"><h3 className="font-display font-bold text-lg">{editingId ? 'Edit Site' : 'Add New Site'}</h3><button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button></div>
          <div className="p-5 space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">Site Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Site Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option>Solar</option><option>Wind</option></select></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Cluster *</label><select value={form.cluster} onChange={e => setForm({ ...form, cluster: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select</option>{clusters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Site Head</label><select value={form.siteHead} onChange={e => setForm({ ...form, siteHead: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select</option>{availableHeads.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-muted-foreground">State / Location</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Capacity (MW)</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Commissioned Date</label><input type="date" value={form.commissionedDate} onChange={e => setForm({ ...form, commissionedDate: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm hover:opacity-90">{editingId ? 'Update Site' : 'Save Site'}</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg font-semibold text-sm hover:bg-muted">Cancel</button>
            </div>
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
