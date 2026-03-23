import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Check, XIcon, Eye, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function EvidenceValidation() {
  const { user } = useAuth();
  const { sites, submissions, updateSubmission, scoringElements, months } = useData();
  const [filterSite, setFilterSite] = useState('');
  const [filterElement, setFilterElement] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState(months ? months[months.length - 1] : 'Mar 2026');
  const [reviewId, setReviewId] = useState(null);
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');

  const activeRole = user?.activeRole || (user?.roles ? user.roles[0] : user?.role);
  const mySites = activeRole === 'HEAD_OFFICE' ? sites : sites.filter(s => s.cluster === user?.cluster);
  const mySiteNames = mySites.map(s => s.name);

  const filtered = submissions.filter(s =>
    mySiteNames.includes(s.site) &&
    (!filterSite || s.site === filterSite) &&
    (!filterElement || s.element === filterElement) &&
    (!filterStatus || s.status === filterStatus) &&
    (!filterMonth || s.month === filterMonth)
  );

  const handleAction = (id, action) => {
    if (!remarks.trim()) { toast({ title: 'Remarks are required', variant: 'destructive' }); return; }
    updateSubmission(id, {
      status: action,
      marksAwarded: action === 'APPROVED' ? Number(marks) || 0 : null,
      remarks,
      rejectionReason: action === 'REJECTED' ? remarks : undefined
    });
    setReviewId(null); setMarks(''); setRemarks('');
    toast({ title: `Evidence ${action.toLowerCase()} ✓` });
  };

  const review = submissions.find(s => s.id === reviewId);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="font-display text-xl font-bold">Evidence Validation</h2>
      <div className="flex flex-wrap gap-3">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          {months?.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">All Sites</option>{mySites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
        <select value={filterElement} onChange={e => setFilterElement(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">All Elements</option>{(scoringElements || []).map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-secondary">🏭 {s.site}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'PENDING' ? 'bg-warning/15 text-warning' : s.status === 'APPROVED' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{s.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">Element {s.elementNumber} › {s.subElement}</p>
            <p className="text-sm font-medium mt-1">{s.element}</p>
            <p className="text-xs text-muted-foreground mt-2">By: {s.submittedBy} · 📎 {s.filesCount} files</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { 
                const pEl = scoringElements.find(e => Number(e.number) === Number(s.elementNumber));
                const maxM = pEl?.subElements?.find(se => se.description === s.subElement)?.maxMarks || 0;
                setReviewId(s.id); setMarks(maxM); setRemarks(''); 
              }} className="flex-1 py-1.5 bg-info/10 text-info rounded-lg text-xs font-semibold flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Review</button>
              {s.status === 'PENDING' && <>
                <button onClick={() => { 
                  const pEl = scoringElements.find(e => Number(e.number) === Number(s.elementNumber));
                  const maxM = pEl?.subElements?.find(se => se.description === s.subElement)?.maxMarks || 0;
                  setReviewId(s.id); setMarks(maxM); 
                }} className="py-1.5 px-3 bg-success text-success-foreground rounded-lg text-xs font-semibold"><Check className="w-3 h-3" /></button>
                <button onClick={() => { 
                  const pEl = scoringElements.find(e => Number(e.number) === Number(s.elementNumber));
                  const maxM = pEl?.subElements?.find(se => se.description === s.subElement)?.maxMarks || 0;
                  setReviewId(s.id); setMarks(maxM); 
                }} className="py-1.5 px-3 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold"><XIcon className="w-3 h-3" /></button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {review && (
        <>
          <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setReviewId(null)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-xl z-50 shadow-xl border border-border overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold">Review Submission</h3>
              <button onClick={() => setReviewId(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm"><span className="font-semibold">Site:</span> {review.site}</div>
              <div className="text-sm"><span className="font-semibold">Element:</span> {review.element}</div>
              <div className="text-sm"><span className="font-semibold">Sub-element:</span> {review.subElement}</div>
              <div className="text-sm"><span className="font-semibold">Notes:</span> {review.notes}</div>
              <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-info" /> {review.filesCount} files attached</div>
              {review.status === 'PENDING' && (() => {
                const pEl = scoringElements.find(e => Number(e.number) === Number(review.elementNumber));
                const maxM = pEl?.subElements?.find(se => se.description === review.subElement)?.maxMarks || 0;
                return (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">Marks to Award (Maximum allowed: {maxM})</label>
                      <input 
                        type="number" 
                        max={maxM}
                        min={0}
                        step={0.5}
                        value={marks} 
                        onChange={e => {
                          let val = e.target.value;
                          if (val !== '' && Number(val) > maxM) val = maxM;
                          if (val !== '' && Number(val) < 0) val = 0;
                          setMarks(val);
                        }} 
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" 
                        placeholder={`Max marks: ${maxM}`} 
                      />
                    </div>
                    <div><label className="text-xs font-semibold text-muted-foreground">Remarks *</label><textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} /></div>
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(review.id, 'APPROVED')} className="flex-1 py-2.5 bg-success text-success-foreground rounded-lg font-semibold text-sm">Approve ✓</button>
                      <button onClick={() => handleAction(review.id, 'REJECTED')} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-semibold text-sm">Reject ✗</button>
                    </div>
                  </>
                );
              })()}
              {review.status !== 'PENDING' && <div className="p-3 rounded-lg bg-muted text-sm"><span className="font-semibold">Status:</span> {review.status} {review.remarks && `— ${review.remarks}`}</div>}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
