import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Ban, KeyRound, X, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

const emptyForm = { name: '', email: '', password: '', roles: ['SITE_HEAD'], cluster: '', site: '', sites: [], accessibleClusters: [], status: 'Active' };
const roleLabels = { HEAD_OFFICE: 'Head Office', CLUSTER_HEAD: 'Cluster Head', CLUSTER_SAFETY_OFFICER: 'Cluster Safety Officer', SITE_HEAD: 'Site Head' };

export default function UserManagement() {
  const { users, sites, clusters, addUser, updateUser, toggleUserStatus, deleteUser } = useData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedHead, setSelectedHead] = useState(null);
  const [search, setSearch] = useState('');

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (u) => { setEditingId(u.id); setForm({ name: u.name, email: u.email, password: '', roles: u.roles || [], cluster: u.cluster || '', site: u.site || '', sites: u.sites || (u.site ? [u.site] : []), accessibleClusters: u.accessibleClusters || [], status: u.status }); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email) { toast({ title: 'Name and Email are required', variant: 'destructive' }); return; }
    if (form.roles.length === 0) { toast({ title: 'At least one role is required', variant: 'destructive' }); return; }
    
    // Auto-resolve cluster from selected site for SITE_HEAD
    let resolvedCluster = form.cluster || null;
    if (form.roles.includes('SITE_HEAD') && form.site) {
      const matchedSite = sites.find(s => s.name === form.site);
      if (matchedSite) resolvedCluster = matchedSite.cluster;
    }
    
    // Only save cluster/site if role implies it
    if (!form.roles.includes('CLUSTER_HEAD') && !form.roles.includes('SITE_HEAD')) resolvedCluster = null;
    let resolvedSites = form.roles.includes('SITE_HEAD') ? (form.sites.length > 0 ? form.sites : (form.site ? [form.site] : [])) : [];
    let resolvedSite = resolvedSites.length > 0 ? resolvedSites[0] : null;

    if (editingId) {
      updateUser(editingId, { name: form.name, email: form.email, roles: form.roles, cluster: resolvedCluster, site: resolvedSite, sites: resolvedSites, accessibleClusters: form.roles.includes('CLUSTER_SAFETY_OFFICER') ? form.accessibleClusters : [], status: form.status });
      toast({ title: 'User updated ✓' });
    } else {
      addUser({ name: form.name, email: form.email, password: form.password || 'password', roles: form.roles, cluster: resolvedCluster, site: resolvedSite, sites: resolvedSites, accessibleClusters: form.roles.includes('CLUSTER_SAFETY_OFFICER') ? form.accessibleClusters : [], status: form.status });
      toast({ title: 'User created ✓' });
    }
    setDrawerOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleToggleStatus = (u) => {
    toggleUserStatus(u.id);
    toast({ title: `${u.name} is now ${u.status === 'Active' ? 'Inactive' : 'Active'}` });
  };

  const handleResetPwd = (u) => {
    toast({ title: `Password reset link sent to ${u.email} ✓` });
  };

  const handleDelete = (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    deleteUser(u.id);
    toast({ title: `User "${u.name}" deleted` });
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.roles?.some(r => roleLabels[r]?.toLowerCase().includes(search.toLowerCase())))
  );

  const sitesBySelectedHead = selectedHead 
    ? sites.filter(s => s.siteHead === selectedHead)
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">User Management</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Add User</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Assignment</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-left">Last Login</th><th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody>{filtered.map((u, i) => (
            <tr key={u.id} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {u.roles?.map(r => (
                    <span key={r} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary whitespace-nowrap">{roleLabels[r] || r}</span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u.roles.includes('SITE_HEAD') ? (
                  <button 
                    onClick={() => setSelectedHead(u.name)}
                    className="text-primary hover:underline font-medium text-left transition-all"
                  >
                    {u.sites?.length > 0 ? u.sites[0] : (u.site || '—')}
                    {((u.sites?.length || 0) > 1 || sites.filter(s => s.siteHead === u.name).length > 1) && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold">
                        {Math.max(u.sites?.length || 0, sites.filter(s => s.siteHead === u.name).length)} Sites
                      </span>
                    )}
                  </button>
                ) : (
                  u.cluster || '—'
                )}
              </td>
              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{u.status}</span></td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin}</td>
              <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleToggleStatus(u)} className="p-1.5 rounded hover:bg-muted" title={u.status === 'Active' ? 'Deactivate' : 'Activate'}><Ban className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleResetPwd(u)} className="p-1.5 rounded hover:bg-muted" title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(u)} className="p-1.5 rounded hover:bg-muted text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No users found</p>}
      </div>

      {/* Site Head's Multiple Sites Modal */}
      {selectedHead && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setSelectedHead(null)} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div>
                <h3 className="font-display font-bold text-lg">{selectedHead}</h3>
                <p className="text-xs text-muted-foreground">Managed Sites ({sitesBySelectedHead.length})</p>
              </div>
              <button onClick={() => setSelectedHead(null)} className="p-1 rounded-full hover:bg-muted"><X theme="w-5 h-5" className="w-5 h-5" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {sitesBySelectedHead.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No sites assigned to this head in the sites database.</p>
              ) : (
                sitesBySelectedHead.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.cluster} · {s.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-score">{s.capacity} MW</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${s.status === 'Active' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{s.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
              <button onClick={() => setSelectedHead(null)} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90">Close</button>
            </div>
          </div>
        </motion.div>
      </>)}

      {/* Drawer */}
      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border"><h3 className="font-display font-bold text-lg">{editingId ? 'Edit User' : 'Add User'}</h3><button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button></div>
          <div className="p-5 space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground">Email *</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
            {!editingId && <div><label className="text-xs font-semibold text-muted-foreground">Temporary Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>}
            
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">Roles</label>
              <div className="flex flex-wrap gap-2 text-sm">
                {Object.entries(roleLabels).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-input bg-background transition hover:bg-muted">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary border-input focus:ring-primary h-4 w-4"
                      checked={form.roles.includes(val)}
                      onChange={e => {
                        if (e.target.checked) setForm({ ...form, roles: [...form.roles, val] });
                        else setForm({ ...form, roles: form.roles.filter(r => r !== val) });
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {form.roles.includes('CLUSTER_SAFETY_OFFICER') && <div><label className="text-xs font-semibold text-muted-foreground block mb-2">Accessible Clusters</label><div className="flex flex-wrap gap-2">{clusters.map(c => <label key={c.id} className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={form.accessibleClusters.includes(c.name)} onChange={e => { if (e.target.checked) setForm({ ...form, accessibleClusters: [...form.accessibleClusters, c.name] }); else setForm({ ...form, accessibleClusters: form.accessibleClusters.filter(ac => ac !== c.name) }); }} className="rounded border-input text-primary focus:ring-primary h-4 w-4" /> {c.name}</label>)}</div></div>}
            {form.roles.includes('CLUSTER_HEAD') && <div><label className="text-xs font-semibold text-muted-foreground">Cluster Assignment</label><select value={form.cluster} onChange={e => setForm({ ...form, cluster: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select Cluster</option>{clusters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>}
            {form.roles.includes('SITE_HEAD') && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Site Assignments (Can select multiple) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border border-input rounded-lg bg-background/50">
                  {sites.map(s => (
                    <label key={s.id} className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border ${form.sites.includes(s.name) || form.site === s.name ? 'border-primary/30 bg-primary/5' : 'border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={form.sites.includes(s.name) || form.site === s.name}
                        onChange={e => {
                          const currentSites = form.sites.length > 0 ? form.sites : (form.site ? [form.site] : []);
                          if (e.target.checked) setForm({ ...form, sites: [...new Set([...currentSites, s.name])], site: s.name });
                          else setForm({ ...form, sites: currentSites.filter(sn => sn !== s.name), site: currentSites.filter(sn => sn !== s.name)[0] || '' });
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.cluster}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {form.sites.length === 0 && !form.site && <p className="text-[10px] text-destructive mt-1">Please select at least one site for Site Head role.</p>}
              </div>
            )}
            <div><label className="text-xs font-semibold text-muted-foreground">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm">{editingId ? 'Update User' : 'Create User'}</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
