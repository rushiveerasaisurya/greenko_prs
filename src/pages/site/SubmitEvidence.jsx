import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Upload, X, FileText, Image, FileSpreadsheet, AlertCircle, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

export default function SubmitEvidence() {
  const { user } = useAuth();
  const { submissions, addSubmission, scoringElements, months } = useData();
  const [expanded, setExpanded] = useState(null);
  const [files, setFiles] = useState({});
  const [notes, setNotes] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);

  const elements = (scoringElements || []).filter(e => e.active && e.number <= 8);



  const getAllSubSubmissions = (elementNum, subDesc) => {
    return (submissions || []).filter(s => s.site === user?.site && s.elementNumber === elementNum && s.subElement === subDesc && s.month === selectedMonth);
  };

  const handleFileAdd = (subId) => {
    const mockFiles = ['safety_report.pdf', 'site_photo.jpg', 'training_log.xlsx'];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    // Only allow one file per submission — replaces any existing file
    setFiles({ ...files, [subId]: [randomFile] });
  };

  const handleRemoveFile = (subId, idx) => {
    setFiles({ ...files, [subId]: (files[subId] || []).filter((_, i) => i !== idx) });
  };

  const handleSubmit = (elementNum, subElement, subId) => {
    const subFiles = files[subId] || [];
    if (subFiles.length === 0) { toast({ title: 'Please upload an evidence file', variant: 'destructive' }); return; }
    const newSub = {
      id: String(Date.now()), site: user?.site || '', element: scoringElements.find(e => e.number === elementNum)?.name || '',
      elementNumber: elementNum, subElement, submittedBy: user?.name || '', date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      month: selectedMonth, filesCount: subFiles.length, status: 'PENDING', notes: notes[subId] || '', marksAwarded: null,
    };
    addSubmission(newSub);
    setFiles({ ...files, [subId]: [] });
    setNotes({ ...notes, [subId]: '' });
    toast({ title: 'Evidence submitted for validation ✓' });
  };

  const fileIcon = (name) => {
    if (name.endsWith('.pdf')) return <FileText className="w-3.5 h-3.5 text-destructive" />;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return <Image className="w-3.5 h-3.5 text-info" />;
    return <FileSpreadsheet className="w-3.5 h-3.5 text-success" />;
  };

  const statusBadge = (status) => {
    const map = { NOT_SUBMITTED: 'bg-muted text-muted-foreground', PENDING: 'bg-warning/15 text-warning', APPROVED: 'bg-success/15 text-success', REJECTED: 'bg-destructive/15 text-destructive' };
    const labels = { NOT_SUBMITTED: 'Not Submitted', PENDING: '⏳ Pending', APPROVED: '✓ Approved', REJECTED: '✗ Rejected' };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Submit Evidence</h2>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {elements.map(el => {
          const awarded = submissions.filter(s => s.site === user?.site && s.elementNumber === el.number && s.status === 'APPROVED' && s.month === selectedMonth).reduce((a, s) => a + (s.marksAwarded || 0), 0);
          return (
            <div key={el.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(expanded === el.id ? null : el.id)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{el.number}</span>
                  <span className="font-display font-semibold text-sm text-left">{el.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">Max: {el.maxMarks}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary text-score">{awarded}/{el.maxMarks}</span>
                  {expanded === el.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {expanded === el.id && (
                <div className="border-t border-border divide-y divide-border">
                  {el.subElements.map(se => {
                    const allSubs = getAllSubSubmissions(el.number, se.description);
                    const latestSub = allSubs.length > 0 ? allSubs[allSubs.length - 1] : null;
                    const latestStatus = latestSub?.status || 'NOT_SUBMITTED';
                    const canSubmitNew = !latestSub || latestSub.status !== 'PENDING';
                    const subFiles = files[se.id] || [];
                    return (
                      <div key={se.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{se.description}</p>
                          <div className="flex items-center gap-2">
                            {allSubs.length > 0 && <span className="text-[10px] text-muted-foreground font-medium">{allSubs.length} response(s)</span>}
                            {statusBadge(latestStatus)}
                          </div>
                        </div>
                        <details className="text-xs"><summary className="text-info cursor-pointer font-semibold">Benchmark Guide</summary><div className="mt-1 p-2 rounded-lg bg-success/5 border border-success/20 text-success">{se.benchmark}</div></details>

                        {/* Show all past submission responses */}
                        {allSubs.length > 0 && (
                          <div className="space-y-1.5">
                            {allSubs.map((sub, idx) => (
                              <div key={sub.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                                sub.status === 'APPROVED' ? 'bg-success/5 border-success/20' :
                                sub.status === 'REJECTED' ? 'bg-destructive/5 border-destructive/20' :
                                'bg-warning/5 border-warning/20'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {sub.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                                  {sub.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                                  {sub.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-warning" />}
                                  <span className="font-medium">Response {idx + 1}</span>
                                  <span className="text-muted-foreground">📎 {sub.filesCount} file · {sub.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {sub.status === 'APPROVED' && <span className="text-success font-semibold">+{sub.marksAwarded} marks</span>}
                                  {sub.status === 'REJECTED' && sub.rejectionReason && (
                                    <span className="text-destructive max-w-[200px] truncate" title={sub.rejectionReason}>✗ {sub.rejectionReason}</span>
                                  )}
                                  {statusBadge(sub.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Show upload form when latest isn't PENDING */}
                        {canSubmitNew && (
                          <>
                            {allSubs.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                                <Plus className="w-3.5 h-3.5" />
                                Submit another response
                              </div>
                            )}
                            <div onClick={() => handleFileAdd(se.id)} className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition">
                              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                              <p className="text-xs text-muted-foreground">Drop PDF, Images, or Excel here — or click to browse</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Max: 20MB per file · 1 file per submission</p>
                            </div>
                            {subFiles.length > 0 && (
                              <div className="space-y-1">{subFiles.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-xs">
                                  {fileIcon(f)}<span className="flex-1">{f}</span><button onClick={() => handleRemoveFile(se.id, fi)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                                </div>
                              ))}</div>
                            )}
                            <textarea value={notes[se.id] || ''} onChange={e => setNotes({ ...notes, [se.id]: e.target.value })} placeholder="Add context for your cluster head..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={2} />
                            <button onClick={() => handleSubmit(el.number, se.description, se.id)} disabled={subFiles.length === 0} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Submit for Validation</button>
                          </>
                        )}
                        {latestStatus === 'PENDING' && (
                          <p className="text-xs text-warning font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Awaiting cluster head review — you can submit another response after this is reviewed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* My Submissions Tracking Table */}
      {(() => {
        const mySubmissions = (submissions || []).filter(s => s.site === user?.site && s.month === selectedMonth);
        if (mySubmissions.length === 0) return null;
        return (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">My Submissions — {selectedMonth}</h3>
              <p className="text-xs text-muted-foreground mt-1">{mySubmissions.length} submission(s) tracked</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-primary text-primary-foreground">
                  <th className="px-3 py-2 text-left">Element</th>
                  <th className="px-3 py-2 text-left">Sub-element</th>
                  <th className="px-3 py-2 text-center">Files</th>
                  <th className="px-3 py-2 text-left">Submitted</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Marks</th>
                  <th className="px-3 py-2 text-left">Remarks</th>
                </tr></thead>
                <tbody>{mySubmissions.map((s, i) => (
                  <tr key={s.id} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} hover:bg-muted/30 transition-colors`}>
                    <td className="px-3 py-2 font-medium text-xs">{s.element}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{s.subElement}</td>
                    <td className="px-3 py-2 text-center text-xs">📎 {s.filesCount}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{s.date}</td>
                    <td className="px-3 py-2 text-center">{statusBadge(s.status)}</td>
                    <td className="px-3 py-2 text-right text-score font-bold text-primary">{s.marksAwarded != null ? s.marksAwarded : '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">{s.remarks || s.rejectionReason || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </motion.div>
  );
}
