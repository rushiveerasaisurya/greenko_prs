import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

const typeConfig = {
  NM: { label: 'Near Miss', emoji: '🟡', color: 'bg-warning/15 text-warning-foreground' },
  UA: { label: 'Unsafe Act', emoji: '🔴', color: 'bg-destructive/15 text-destructive' },
  UC: { label: 'Unsafe Condition', emoji: '🟠', color: 'bg-accent/15 text-accent' },
};
const statusConfig = { OPEN: 'bg-destructive/15 text-destructive', IN_PROGRESS: 'bg-accent/15 text-accent', CLOSED: 'bg-success/15 text-success' };
const priorityConfig = { Low: 'bg-muted text-muted-foreground', Medium: 'bg-info/15 text-info', High: 'bg-accent/15 text-accent', Critical: 'bg-destructive/15 text-destructive' };

export default function Tickets() {
  const { user } = useAuth();
  const { sites, tickets: ticketList, addTicket, updateTicket } = useData();
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [regStep, setRegStep] = useState(1);
  const [form, setForm] = useState({ type: '', title: '', description: '', location: '', date: '', priority: 'Medium', people: '', immediateAction: '' });
  const [comment, setComment] = useState('');
  const [caForm, setCaForm] = useState({ action: '', assignedTo: '', dueDate: '' });
  const [closureNotes, setClosureNotes] = useState('');

  const activeRole = user?.activeRole || user?.roles?.[0] || user?.role || 'SITE_HEAD';
  
  const scoped = ticketList.filter(t => {
    if (activeRole === 'HEAD_OFFICE') return true;
    if ((activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && t.cluster === user.cluster) return true;
    if (activeRole === 'SITE_HEAD' && t.site === user.site) return true;
    return false;
  });
  const filtered = scoped.filter(t => (!filterType || t.type === filterType) && (!filterStatus || t.status === filterStatus));
  const detail = ticketList.find(t => t.id === detailId);

  const stats = { NM: scoped.filter(t => t.type === 'NM' && t.status !== 'CLOSED').length, UA: scoped.filter(t => t.type === 'UA' && t.status !== 'CLOSED').length, UC: scoped.filter(t => t.type === 'UC' && t.status !== 'CLOSED').length, closed: scoped.filter(t => t.status === 'CLOSED').length };

  const nextTicketId = (type) => `${type}-2026-${String(ticketList.filter(t => t.type === type).length + 1).padStart(4, '0')}`;

  const handleRegister = () => {
    if (!form.type || !form.title || !form.description) return;
    const tId = nextTicketId(form.type);
    const newTicket = {
      id: String(Date.now()), ticketId: tId, type: form.type, title: form.title, description: form.description,
      location: form.location, reportedBy: user?.name || '', site: user?.site || sites[0].name, cluster: user?.cluster || 'South Cluster',
      date: form.date || new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'OPEN', priority: form.priority,
      immediateAction: form.immediateAction, assignedTo: '', correctiveActions: [], comments: [],
    };
    addTicket(newTicket);
    setDrawerOpen(false);
    setRegStep(1);
    setForm({ type: '', title: '', description: '', location: '', date: '', priority: 'Medium', people: '', immediateAction: '' });
    toast({ title: `Ticket ${tId} registered. Cluster Head notified.` });
  };

  const addComment = () => {
    if (!comment.trim() || !detailId) return;
    updateTicket(detailId, { comments: [...detail.comments, { id: String(Date.now()), by: user?.name || '', text: comment, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') }] });
    setComment('');
  };

  const addCA = () => {
    if (!caForm.action || !detailId) return;
    const ca = { id: String(Date.now()), ...caForm, done: false };
    updateTicket(detailId, { correctiveActions: [...detail.correctiveActions, ca], status: 'IN_PROGRESS' });
    setCaForm({ action: '', assignedTo: '', dueDate: '' });
    toast({ title: 'Corrective action added ✓' });
  };

  const toggleCA = (caId) => {
    if (!detailId) return;
    updateTicket(detailId, { correctiveActions: detail.correctiveActions.map(ca => ca.id === caId ? { ...ca, done: !ca.done } : ca) });
  };

  const closeTicket = () => {
    if (!detailId) return;
    updateTicket(detailId, { status: 'CLOSED', closedDate: new Date().toISOString().slice(0, 16).replace('T', ' '), closedBy: user?.name || '' });
    setClosureNotes('');
    toast({ title: 'Ticket closed ✓' });
  };

  // Detail view
  if (detail) {
    const allCADone = detail.correctiveActions.length > 0 && detail.correctiveActions.every(ca => ca.done);
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
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConfig[detail.type].color}`}>{typeConfig[detail.type].emoji} {typeConfig[detail.type].label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[detail.status]}`}>{detail.status}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[detail.priority]}`}>{detail.priority}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-display font-bold mb-2">{detail.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{detail.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Location:</span> {detail.location}</div>
                <div><span className="text-muted-foreground">Reported by:</span> {detail.reportedBy}</div>
                <div><span className="text-muted-foreground">Site:</span> {detail.site}</div>
                <div><span className="text-muted-foreground">Date:</span> {detail.date}</div>
              </div>
              {detail.immediateAction && <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/20 text-xs"><span className="font-semibold text-info">Immediate Action:</span> {detail.immediateAction}</div>}
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-display font-bold mb-4">Activity Timeline</h3>
              <div className="space-y-3 border-l-2 border-border ml-3">
                <div className="relative pl-6"><div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-warning" /><p className="text-xs"><span className="text-muted-foreground">{detail.date}</span> — Ticket opened by {detail.reportedBy}</p></div>
                {detail.comments.map(c => (
                  <div key={c.id} className="relative pl-6"><div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-info" /><p className="text-xs"><span className="text-muted-foreground">{c.timestamp}</span> — {c.by}: {c.text}</p></div>
                ))}
                {detail.closedDate && <div className="relative pl-6"><div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-success" /><p className="text-xs"><span className="text-muted-foreground">{detail.closedDate}</span> — Closed by {detail.closedBy}</p></div>}
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
              {detail.correctiveActions.map(ca => (
                <div key={ca.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0 text-xs">
                  <button onClick={() => toggleCA(ca.id)} className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${ca.done ? 'border-success bg-success' : 'border-input'}`}>
                    {ca.done && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
                  </button>
                  <div><p className={ca.done ? 'line-through text-muted-foreground' : ''}>{ca.action}</p><p className="text-muted-foreground">{ca.assignedTo} · Due: {ca.dueDate}</p></div>
                </div>
              ))}
              {(activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && detail.status !== 'CLOSED' && (
                <div className="mt-3 space-y-2 pt-3 border-t border-border">
                  <input value={caForm.action} onChange={e => setCaForm({ ...caForm, action: e.target.value })} placeholder="Action..." className="w-full px-2 py-1.5 rounded border border-input bg-background text-xs" />
                  <div className="flex gap-2">
                    <input value={caForm.assignedTo} onChange={e => setCaForm({ ...caForm, assignedTo: e.target.value })} placeholder="Assign to" className="flex-1 px-2 py-1.5 rounded border border-input bg-background text-xs" />
                    <input type="date" value={caForm.dueDate} onChange={e => setCaForm({ ...caForm, dueDate: e.target.value })} className="px-2 py-1.5 rounded border border-input bg-background text-xs" />
                  </div>
                  <button onClick={addCA} className="w-full py-1.5 bg-info text-info-foreground rounded text-xs font-semibold">+ Add Action</button>
                </div>
              )}
            </div>

            {(activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') && detail.status !== 'CLOSED' && allCADone && (
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
        <h2 className="font-display text-xl font-bold">Tickets</h2>
        <button onClick={() => { setDrawerOpen(true); setRegStep(1); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Register Ticket</button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning-foreground text-xs font-semibold">🟡 Near Miss: {stats.NM} Open</span>
        <span className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">🔴 Unsafe Act: {stats.UA} Open</span>
        <span className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold">🟠 Unsafe Cond: {stats.UC} Open</span>
        <span className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold">✅ Closed: {stats.closed}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">All Types</option><option value="NM">Near Miss</option><option value="UA">Unsafe Act</option><option value="UC">Unsafe Condition</option></select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">All Status</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="CLOSED">Closed</option></select>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Reported By</th><th className="px-4 py-3 text-left">Site</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Priority</th>
          </tr></thead>
          <tbody>{filtered.map((t, i) => (
            <tr key={t.id} onClick={() => setDetailId(t.id)} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} cursor-pointer hover:bg-muted/50 transition`}>
              <td className="px-4 py-3 font-mono text-xs font-bold">{t.ticketId}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConfig[t.type].color}`}>{typeConfig[t.type].emoji} {typeConfig[t.type].label}</span></td>
              <td className="px-4 py-3 font-medium max-w-xs truncate">{t.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.reportedBy}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.site}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{t.date}</td>
              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[t.status]}`}>{t.status}</span></td>
              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[t.priority]}`}>{t.priority}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Register Drawer */}
      {drawerOpen && (<>
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setDrawerOpen(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-card z-50 shadow-xl border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border"><h3 className="font-display font-bold text-lg">Register Ticket</h3><button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button></div>
          <div className="p-5 space-y-5">
            {/* Step indicators */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <button key={s} onClick={() => setRegStep(s)} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition ${regStep === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {s === 1 ? 'Type' : s === 2 ? 'Details' : s === 3 ? 'Evidence' : 'Review'}
                </button>
              ))}
            </div>

            {regStep === 1 && (
              <div className="grid grid-cols-3 gap-3">
                {(['NM', 'UA', 'UC']).map(t => (
                  <button key={t} onClick={() => { setForm({ ...form, type: t }); setRegStep(2); }} className={`p-4 rounded-xl border-2 text-center transition ${form.type === t ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground'}`}>
                    <span className="text-2xl block mb-1">{typeConfig[t].emoji}</span>
                    <span className="text-xs font-bold">{typeConfig[t].label.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}

            {regStep === 2 && (
              <div className="space-y-4">
                <div><label className="text-xs font-semibold text-muted-foreground">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Date & Time</label><input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Priority</label>
                  <div className="flex gap-2 mt-1">{(['Low', 'Medium', 'High', 'Critical']).map(p => (
                    <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${form.priority === p ? `${priorityConfig[p]} border-current` : 'border-input text-muted-foreground'}`}>{p}</button>
                  ))}</div>
                </div>
                <div><label className="text-xs font-semibold text-muted-foreground">Immediate Action Taken</label><textarea value={form.immediateAction} onChange={e => setForm({ ...form, immediateAction: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={2} /></div>
                <div className="flex justify-between"><button onClick={() => setRegStep(1)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button><button onClick={() => setRegStep(3)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next →</button></div>
              </div>
            )}

            {regStep === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition">
                  <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload photos or documents</p>
                  <p className="text-[10px] text-muted-foreground mt-1">(Mock — files not actually stored)</p>
                </div>
                <div className="flex justify-between"><button onClick={() => setRegStep(2)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button><button onClick={() => setRegStep(4)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next →</button></div>
              </div>
            )}

            {regStep === 4 && (
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${form.type ? typeConfig[form.type].color : ''}`}>{form.type ? typeConfig[form.type].label : ''}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Title:</span><span className="font-medium">{form.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Priority:</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityConfig[form.priority]}`}>{form.priority}</span></div>
                  <div><span className="text-muted-foreground">Description:</span><p className="mt-1 text-xs">{form.description}</p></div>
                  {form.location && <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span>{form.location}</span></div>}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setRegStep(3)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button>
                  <button onClick={handleRegister} className="px-6 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold">Submit Ticket</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </>)}
    </motion.div>
  );
}
