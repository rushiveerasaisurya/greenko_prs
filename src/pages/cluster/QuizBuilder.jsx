import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, GripVertical, X, FileQuestion, ClipboardList } from 'lucide-react';
import { quizzes as initialQuizzes } from '@/mockData/quizzes';
import { scoringElements } from '@/mockData/scoringElements';
import { sites } from '@/mockData/sites';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const emptyQuiz = {
  title: '', type: 'MCQ', element: '', targetRole: 'SITE_HEAD', timeLimit: 30, passingScore: 70,
  description: '', status: 'Draft', questions: [], checklist: [], assignedSites: [], startDate: '', endDate: '', createdBy: '',
};

export default function QuizBuilder() {
  const { user } = useAuth();
  const [quizList, setQuizList] = useState(initialQuizzes);
  const [editing, setEditing] = useState(null);
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);

  const startNew = () => {
    setEditing({ ...emptyQuiz, id: String(Date.now()), createdBy: user?.name || '' });
    setStep(1);
  };

  const updateField = (field, value) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const addQuestion = () => {
    if (!editing) return;
    const q = {
      id: `q${Date.now()}`, text: '', type: 'single', marks: 5, options: [
        { id: 'a', text: '', correct: false }, { id: 'b', text: '', correct: false },
        { id: 'c', text: '', correct: false }, { id: 'd', text: '', correct: false },
      ]
    };
    setEditing({ ...editing, questions: [...editing.questions, q] });
  };

  const updateQuestion = (qId, field, value) => {
    if (!editing) return;
    setEditing({ ...editing, questions: editing.questions.map(q => q.id === qId ? { ...q, [field]: value } : q) });
  };

  const updateOption = (qId, oId, field, value) => {
    if (!editing) return;
    setEditing({
      ...editing, questions: editing.questions.map(q =>
        q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, [field]: value } : (field === 'correct' && q.type === 'single' ? { ...o, correct: false } : o)) } : q
      )
    });
  };

  const removeQuestion = (qId) => {
    if (!editing) return;
    setEditing({ ...editing, questions: editing.questions.filter(q => q.id !== qId) });
  };

  const addChecklistItem = () => {
    if (!editing) return;
    const cl = { id: `cl${Date.now()}`, description: '', marks: 5, evidenceRequired: false };
    setEditing({ ...editing, checklist: [...editing.checklist, cl] });
  };

  const updateChecklist = (clId, field, value) => {
    if (!editing) return;
    setEditing({ ...editing, checklist: editing.checklist.map(c => c.id === clId ? { ...c, [field]: value } : c) });
  };

  const removeChecklist = (clId) => {
    if (!editing) return;
    setEditing({ ...editing, checklist: editing.checklist.filter(c => c.id !== clId) });
  };

  const saveQuiz = (publish) => {
    if (!editing) return;
    const updated = { ...editing, status: publish ? 'Published' : 'Draft' };
    const exists = quizList.find(q => q.id === updated.id);
    setQuizList(exists ? quizList.map(q => q.id === updated.id ? updated : q) : [...quizList, updated]);
    setEditing(null);
    toast({ title: publish ? 'Quiz published ✓' : 'Quiz saved as draft ✓' });
  };

  const toggleSiteAssign = (siteName) => {
    if (!editing) return;
    const assigned = editing.assignedSites.includes(siteName)
      ? editing.assignedSites.filter(s => s !== siteName)
      : [...editing.assignedSites, siteName];
    setEditing({ ...editing, assignedSites: assigned });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Quiz & Exam Builder</h2>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Create New Quiz
        </button>
      </div>

      {!editing ? (
        <div className="grid lg:grid-cols-1 gap-4">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-primary text-primary-foreground">
                <th className="px-4 py-3 text-left">Quiz Name</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Element</th><th className="px-4 py-3 text-right">Questions</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th>
              </tr></thead>
              <tbody>{quizList.map((q, i) => (
                <tr key={q.id} className={i % 2 === 0 ? 'bg-background' : 'bg-card'}>
                  <td className="px-4 py-3 font-medium">{q.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.type === 'MCQ' ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent'}`}>{q.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{q.element}</td>
                  <td className="px-4 py-3 text-right text-score">{q.type === 'MCQ' ? q.questions.length : q.checklist.length}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.status === 'Published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning-foreground'}`}>{q.status}</span></td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                    <button onClick={() => { setEditing(q); setStep(1); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setPreview(q)} className="p-1.5 rounded hover:bg-muted"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => setStep(s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s === 1 && 'Details'}
                {s === 2 && (editing.type === 'MCQ' ? 'Questions' : 'Checklist')}
                {s === 3 && 'Assign & Publish'}
              </button>
            ))}
            <button onClick={() => setEditing(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-muted-foreground">Quiz Title *</label><input value={editing.title} onChange={e => updateField('title', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground">Quiz Type</label>
                <div className="flex gap-3 mt-1">
                  {(['MCQ', 'Practical']).map(t => (
                    <button key={t} onClick={() => updateField('type', t)} className={`flex-1 py-3 rounded-lg border text-sm font-semibold text-center transition ${editing.type === t ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground'}`}>
                      {t === 'MCQ' ? <><FileQuestion className="w-4 h-4 mx-auto mb-1" />MCQ Test</> : <><ClipboardList className="w-4 h-4 mx-auto mb-1" />Practical Exam</>}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground">Linked Element</label><select value={editing.element} onChange={e => updateField('element', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">Select</option>{scoringElements.filter(e => e.number <= 8).map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground">Target Role</label><select value={editing.targetRole} onChange={e => updateField('targetRole', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="SITE_HEAD">Site Head</option><option value="All">All</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground">Time Limit (min)</label><input type="number" value={editing.timeLimit || ''} onChange={e => updateField('timeLimit', e.target.value ? Number(e.target.value) : null)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground">Passing Score %</label><input type="number" value={editing.passingScore} onChange={e => updateField('passingScore', Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              <div className="md:col-span-2"><label className="text-xs font-semibold text-muted-foreground">Description</label><textarea value={editing.description} onChange={e => updateField('description', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} /></div>
              <div className="md:col-span-2 flex justify-end"><button onClick={() => setStep(2)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next →</button></div>
            </div>
          )}

          {/* Step 2 - MCQ */}
          {step === 2 && editing.type === 'MCQ' && (
            <div className="space-y-4">
              {editing.questions.map((q, qi) => (
                <div key={q.id} className="border border-border rounded-lg p-4 bg-background space-y-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">Q{qi + 1}</span>
                    <div className="flex-1" />
                    <select value={q.type} onChange={e => updateQuestion(q.id, 'type', e.target.value)} className="px-2 py-1 rounded border border-input bg-card text-xs"><option value="single">Single</option><option value="multiple">Multiple</option></select>
                    <input type="number" value={q.marks} onChange={e => updateQuestion(q.id, 'marks', Number(e.target.value))} className="w-16 px-2 py-1 rounded border border-input bg-card text-xs text-right" placeholder="Marks" />
                    <button onClick={() => removeQuestion(q.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder="Question text..." className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm" rows={2} />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(o => (
                      <div key={o.id} className={`flex items-center gap-2 p-2 rounded-lg border transition cursor-pointer ${o.correct ? 'border-success bg-success/5' : 'border-input'}`} onClick={() => updateOption(q.id, o.id, 'correct', !o.correct)}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${o.correct ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground'}`}>{o.correct ? '✓' : o.id.toUpperCase()}</div>
                        <input value={o.text} onChange={e => { e.stopPropagation(); updateOption(q.id, o.id, 'text', e.target.value); }} onClick={e => e.stopPropagation()} placeholder={`Option ${o.id.toUpperCase()}`} className="flex-1 bg-transparent text-sm outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition">+ Add Question</button>
              <div className="flex justify-between"><button onClick={() => setStep(1)} className="px-6 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button><button onClick={() => setStep(3)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next →</button></div>
            </div>
          )}

          {/* Step 2 - Practical */}
          {step === 2 && editing.type === 'Practical' && (
            <div className="space-y-4">
              {editing.checklist.map((cl, ci) => (
                <div key={cl.id} className="flex items-center gap-3 border border-border rounded-lg p-3 bg-background">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground shrink-0">{ci + 1}.</span>
                  <input value={cl.description} onChange={e => updateChecklist(cl.id, 'description', e.target.value)} placeholder="Checklist item..." className="flex-1 px-2 py-1 rounded border border-input bg-card text-sm" />
                  <input type="number" value={cl.marks} onChange={e => updateChecklist(cl.id, 'marks', Number(e.target.value))} className="w-16 px-2 py-1 rounded border border-input bg-card text-xs text-right" placeholder="Marks" />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"><input type="checkbox" checked={cl.evidenceRequired} onChange={e => updateChecklist(cl.id, 'evidenceRequired', e.target.checked)} className="rounded" /> Evidence</label>
                  <button onClick={() => removeChecklist(cl.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={addChecklistItem} className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition">+ Add Checklist Item</button>
              <div className="flex justify-between"><button onClick={() => setStep(1)} className="px-6 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button><button onClick={() => setStep(3)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next →</button></div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-muted-foreground">Assign to Sites</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sites.filter(s => s.status === 'Active').map(s => (
                    <button key={s.id} onClick={() => toggleSiteAssign(s.name)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${editing.assignedSites.includes(s.name) ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground'}`}>{s.name}</button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-muted-foreground">Start Date</label><input type="date" value={editing.startDate} onChange={e => updateField('startDate', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">End Date</label><input type="date" value={editing.endDate} onChange={e => updateField('endDate', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-2 border border-border rounded-lg text-sm font-semibold">← Back</button>
                <div className="flex gap-3">
                  <button onClick={() => saveQuiz(false)} className="px-6 py-2 border border-border rounded-lg text-sm font-semibold">Save as Draft</button>
                  <button onClick={() => saveQuiz(true)} className="px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-semibold">Publish Quiz</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <>
          <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setPreview(null)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-card rounded-xl z-50 shadow-xl border border-border overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold">{preview.title}</h3>
              <button onClick={() => setPreview(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">{preview.description}</p>
              {preview.type === 'MCQ' && preview.questions.map((q, qi) => (
                <div key={q.id} className="border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Q{qi + 1}. {q.text} <span className="text-muted-foreground">({q.marks} marks)</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(o => (
                      <div key={o.id} className="px-3 py-2 rounded-lg border border-input text-sm">{o.id.toUpperCase()}. {o.text}</div>
                    ))}
                  </div>
                </div>
              ))}
              {preview.type === 'Practical' && preview.checklist.map((cl, ci) => (
                <div key={cl.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
                  <div className="w-5 h-5 rounded border-2 border-input" />
                  <span className="text-sm">{ci + 1}. {cl.description}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{cl.marks} marks</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
