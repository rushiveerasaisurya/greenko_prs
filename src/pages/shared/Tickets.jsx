import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, MessageSquare, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

const statusConfig = { 
  OPEN: 'bg-destructive/15 text-destructive', 
  IN_PROGRESS: 'bg-warning/15 text-warning', 
  CLOSED: 'bg-success/15 text-success' 
};

const priorityConfig = { 
  Low: 'bg-muted text-muted-foreground', 
  Medium: 'bg-info/15 text-info', 
  High: 'bg-warning/15 text-warning', 
  Critical: 'bg-destructive/15 text-destructive' 
};

export default function Tickets() {
  const { user } = useAuth();
  const { sites, months, tickets: ticketList, addTicket, updateTicket } = useData();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  
  // 1: Details, 2: Evidence (Optional), 3: Review
  const [regStep, setRegStep] = useState(1); 
  const [form, setForm] = useState({ 
    title: '', description: '', site: '', dueDate: '', priority: 'Medium', immediateAction: '' 
  });
  
  const [comment, setComment] = useState('');
  const [caForm, setCaForm] = useState({ action: '', completionDate: '' });
  const [closureNotes, setClosureNotes] = useState('');

  const activeRole = user?.activeRole || user?.roles?.[0] || user?.role || 'SITE_HEAD';
  
  const scoped = ticketList.filter(t => {
    if (activeRole === 'HEAD_OFFICE') return true;
    if ((activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && t.cluster === user.cluster) return true;
    if (activeRole === 'SITE_HEAD' && t.site === user.site) return true;
    return false;
  });
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getTicketMonth = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const filtered = scoped.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterMonth && getTicketMonth(t.date) !== filterMonth) return false;
    if (activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') {
      if (filterSite && t.site !== filterSite) return false;
    }
    return true;
  });
  const detail = ticketList.find(t => t.id === detailId);

  const stats = { 
    open: scoped.filter(t => t.status === 'OPEN').length, 
    inProgress: scoped.filter(t => t.status === 'IN_PROGRESS').length,
    closed: scoped.filter(t => t.status === 'CLOSED').length 
  };

  const nextTicketId = () => `TCK-2026-${String(ticketList.length + 1).padStart(4, '0')}`;

  // Only cluster heads can define the site within their cluster
  const availableSites = sites.filter(s => s.status === 'Active' && s.cluster === user?.cluster);

  const handleRegister = () => {
    if (!form.title || !form.description || !form.site || !form.dueDate) {
        toast({ title: 'Please fill out all required fields (*)', variant: 'destructive' });
        return;
    }
    const tId = nextTicketId();
    const newTicket = {
      id: String(Date.now()), 
      ticketId: tId, 
      title: form.title, 
      description: form.description,
      site: form.site, 
      cluster: user?.cluster || 'Unknown', 
      dueDate: form.dueDate,
      reportedBy: user?.name || '', 
      date: new Date().toISOString().slice(0, 10), 
      status: 'OPEN', 
      priority: form.priority, 
      immediateAction: form.immediateAction, 
      assignedTo: '', 
      correctiveActions: [], 
      comments: [],
    };
    addTicket(newTicket);
    setDrawerOpen(false);
    setRegStep(1);
    setForm({ title: '', description: '', site: '', dueDate: '', priority: 'Medium', immediateAction: '' });
    toast({ title: `Ticket ${tId} registered successfully.` });
  };

  const addComment = () => {
    if (!comment.trim() || !detailId) return;
    updateTicket(detailId, { comments: [...detail.comments, { id: String(Date.now()), by: user?.name || '', text: comment, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') }] });
    setComment('');
  };

  const addCA = () => {
    if (!caForm.action || !detailId) return;
    const ca = { id: String(Date.now()), ...caForm, done: true, by: user?.name || '' };
    updateTicket(detailId, { correctiveActions: [...(detail.correctiveActions || []), ca], status: 'IN_PROGRESS' });
    setCaForm({ action: '', completionDate: '' });
    toast({ title: 'Corrective action submitted ✓' });
  };

  const closeTicket = () => {
    if (!detailId) return;
    updateTicket(detailId, { status: 'CLOSED', closedDate: new Date().toISOString().slice(0, 16).replace('T', ' '), closedBy: user?.name || '' });
    setClosureNotes('');
    toast({ title: 'Ticket closed ✓' });
  };

  // Detail view
  if (detail) {
    const allCADone = detail.correctiveActions && detail.correctiveActions.length > 0 && detail.correctiveActions.every(ca => ca.done);
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <button onClick={() => setDetailId(null)} className="text-xs text-muted-foreground hover:underline">← Back to tickets</button>

        {detail.status === 'CLOSED' && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-sm text-success font-semibold">
            ✅ Ticket closed on {detail.closedDate} by {detail.closedBy}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-bold">{detail.ticketId}</h2>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[detail.status] || statusConfig.OPEN}`}>{detail.status}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[detail.priority] || priorityConfig.Medium}`}>{detail.priority}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-display font-bold mb-2">{detail.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{detail.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Site:</span> {detail.site}</div>
                <div><span className="text-muted-foreground">Reported by:</span> {detail.reportedBy}</div>
                <div><span className="text-muted-foreground">Due Date:</span> {detail.dueDate || 'N/A'}</div>
                <div><span className="text-muted-foreground">Created:</span> {detail.date}</div>
              </div>
              {detail.immediateAction && (
                <div className="mt-4 p-3 rounded-lg bg-info/5 border border-info/20 text-xs">
                    <span className="font-semibold text-info block mb-1">Immediate Action:</span> 
                    {detail.immediateAction}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-display font-bold mb-4">Activity Timeline</h3>
              <div className="space-y-3 border-l-2 border-border ml-3">
                <div className="relative pl-6">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-warning" />
                    <p className="text-xs"><span className="text-muted-foreground">{detail.date}</span> — Ticket opened by {detail.reportedBy}</p>
                </div>
                {detail.comments && detail.comments.map(c => (
                  <div key={c.id} className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-info" />
                      <p className="text-xs"><span className="text-muted-foreground">{c.timestamp}</span> — {c.by}: {c.text}</p>
                  </div>
                ))}
                {detail.closedDate && (
                    <div className="relative pl-6">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-success" />
                        <p className="text-xs"><span className="text-muted-foreground">{detail.closedDate}</span> — Closed by {detail.closedBy}</p>
                    </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                <button onClick={addComment} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"><MessageSquare className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h4 className="font-display font-semibold text-sm mb-3">Corrective Actions</h4>
              {(!detail.correctiveActions || detail.correctiveActions.length === 0) && (
                  <p className="text-xs text-muted-foreground">No corrective actions submitted by site yet.</p>
              )}
              {detail.correctiveActions && detail.correctiveActions.map(ca => (
                <div key={ca.id} className="p-3 bg-muted/30 border border-border rounded-lg mb-2 text-xs">
                  <p className="font-medium text-foreground">{ca.action}</p>
                  <div className="flex justify-between items-center mt-2 text-muted-foreground">
                      <span>Completed by: {ca.by}</span>
                      {ca.completionDate && <span>Date: {ca.completionDate}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-primary bg-primary/10 w-max px-2 py-1 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Evidence Attached
                  </div>
                </div>
              ))}
              {activeRole === 'SITE_HEAD' && detail.status !== 'CLOSED' && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-bold">Submit Corrective Action</h5>
                  <textarea value={caForm.action} onChange={e => setCaForm({ ...caForm, action: e.target.value })} placeholder="Describe the corrective action taken..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs resize-none" rows={3} />
                  <div className="flex gap-2">
                    <input type="date" value={caForm.completionDate} onChange={e => setCaForm({ ...caForm, completionDate: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-xs" title="Completion Date" />
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-primary/50 text-primary bg-primary/5 text-xs font-semibold hover:bg-primary/10 transition">
                        <UploadCloud className="w-3 h-3" /> Upload Evidence
                    </button>
                  </div>
                  <button onClick={addCA} className="w-full py-2 bg-info text-info-foreground rounded-lg text-xs font-bold shadow-sm hover:shadow transition-shadow">Submit Action</button>
                </div>
              )}
            </div>

            {(activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && detail.status !== 'CLOSED' && (detail.correctiveActions?.length > 0) && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <h4 className="font-display font-semibold text-sm mb-3">Close Ticket</h4>
                <textarea value={closureNotes} onChange={e => setClosureNotes(e.target.value)} placeholder="Closure notes..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" rows={3} />
                <button onClick={closeTicket} className="w-full py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm">CLOSE TICKET ✓</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Tickets / Ideas</h2>
        {(activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && (
          <button onClick={() => { setDrawerOpen(true); setRegStep(1); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" /> Register Ticket
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">Open: {stats.open}</span>
        <span className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-semibold">In Progress: {stats.inProgress}</span>
        <span className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold">✅ Closed: {stats.closed}</span>
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        {(activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && (
          <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm flex-1 md:flex-none md:w-48">
            <option value="">All Sites</option>
            {availableSites.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        )}
        
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm flex-1 md:flex-none md:w-36">
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm flex-1 md:flex-none md:w-40">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
        </select>
        <p className="text-xs text-muted-foreground w-full md:w-auto">Only {filtered.length} visible tickets.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Reported By</th>
            <th className="px-4 py-3 text-left">Site</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Priority</th>
          </tr></thead>
          <tbody>{filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No tickets found.</td></tr>
          ) : filtered.map((t, i) => (
            <tr key={t.id} onClick={() => setDetailId(t.id)} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} cursor-pointer hover:bg-muted/50 transition`}>
              <td className="px-4 py-3 font-mono text-xs font-bold w-32">{t.ticketId}</td>
              <td className="px-4 py-3 font-medium max-w-xs">{t.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.reportedBy}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.site}</td>
              <td className="px-4 py-3 text-center w-32">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[t.status] || statusConfig.OPEN}`}>{t.status}</span>
              </td>
              <td className="px-4 py-3 text-center w-24">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[t.priority] || priorityConfig.Medium}`}>{t.priority}</span>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Register Drawer */}
      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">Raise Ticket / Idea</h3>
              <button onClick={() => setDrawerOpen(false)} className="hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="p-5 space-y-5">
            {/* Step indicators */}
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <button key={s} onClick={() => setRegStep(s)} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition ${regStep === s ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Evidence (Opt)' : 'Review'}
                </button>
              ))}
            </div>

            {regStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Title *</label>
                    <input autoFocus placeholder="Brief summary of the idea/issue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Description *</label>
                    <textarea placeholder="Provide comprehensive details here..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" rows={4} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Site Selection *</label>
                    <select value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm font-medium">
                        <option value="">-- Select Site --</option>
                        {availableSites.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Due Date *</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Priority</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                      <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition hover:shadow-sm ${form.priority === p ? `${priorityConfig[p]} border-current shadow-sm` : 'border-input text-muted-foreground hover:bg-muted/50'}`}>
                          {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Immediate Action Taken (Optional)</label>
                    <textarea placeholder="What was done immediately..." value={form.immediateAction} onChange={e => setForm({ ...form, immediateAction: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" rows={2} />
                </div>
                
                <div className="flex justify-end pt-2">
                    <button onClick={() => setRegStep(2)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-transform">Next →</button>
                </div>
              </motion.div>
            )}

            {regStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition group">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Click to upload supplementary evidence</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Photos, reports, or documents (Optional)</p>
                </div>
                <div className="flex justify-between pt-2">
                    <button onClick={() => setRegStep(1)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">← Back</button>
                    <button onClick={() => setRegStep(3)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-transform">Next →</button>
                </div>
              </motion.div>
            )}

            {regStep === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-sm">
                <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
                  <div className="flex justify-between pb-2 border-b border-border/50">
                      <span className="text-muted-foreground font-semibold">Title:</span>
                      <span className="font-bold text-foreground text-right">{form.title || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Site:</span>
                      <span className="font-medium">{form.site || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Due Date:</span>
                      <span className="font-medium">{form.dueDate || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-semibold">Priority:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[form.priority]}`}>{form.priority}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground font-semibold block mb-1">Description:</span>
                      <p className="text-xs bg-background p-2 rounded border border-border min-h-[50px] whitespace-pre-wrap">{form.description || '—'}</p>
                  </div>
                  {form.immediateAction && (
                      <div className="pt-2">
                          <span className="text-muted-foreground font-semibold block mb-1">Immediate Action:</span>
                          <p className="text-xs bg-background p-2 rounded border border-border">{form.immediateAction}</p>
                      </div>
                  )}
                </div>
                
                <div className="flex justify-between pt-4">
                  <button onClick={() => setRegStep(2)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">← Back</button>
                  <button onClick={handleRegister} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Submit Ticket</button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
