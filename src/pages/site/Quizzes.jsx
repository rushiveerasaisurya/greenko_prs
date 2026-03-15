import { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Clock, Award, ChevronLeft, ChevronRight, CheckCircle2, Upload } from 'lucide-react';

export default function SiteQuizzes() {
  const { user } = useAuth();
  const { quizzes } = useData();
  const [tab, setTab] = useState('pending');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checklistDone, setChecklistDone] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);

  const assigned = quizzes.filter(q => q.status === 'Published' && q.assignedSites.includes(user?.site || ''));
  const pending = assigned.filter(q => !completedIds.includes(q.id));
  const completed = assigned.filter(q => completedIds.includes(q.id));

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz); setCurrentQ(0); setAnswers({}); setChecklistDone({}); setSubmitted(false); setScore(0);
  };

  const toggleAnswer = (qId, optId, type) => {
    if (type === 'single') {
      setAnswers({ ...answers, [qId]: [optId] });
    } else {
      const current = answers[qId] || [];
      setAnswers({ ...answers, [qId]: current.includes(optId) ? current.filter(a => a !== optId) : [...current, optId] });
    }
  };

  const submitMCQ = () => {
    if (!activeQuiz) return;
    let total = 0, earned = 0;
    activeQuiz.questions.forEach(q => {
      total += q.marks;
      const selected = answers[q.id] || [];
      const correct = q.options.filter(o => o.correct).map(o => o.id);
      if (selected.length === correct.length && selected.every(s => correct.includes(s))) earned += q.marks;
    });
    const pct = Math.round((earned / total) * 100);
    setScore(pct); setSubmitted(true);
    setCompletedIds([...completedIds, activeQuiz.id]);
    toast({ title: `Quiz completed! Score: ${pct}%` });
  };

  const submitPractical = () => {
    if (!activeQuiz) return;
    setSubmitted(true); setCompletedIds([...completedIds, activeQuiz.id]);
    toast({ title: 'Practical exam submitted for evaluation ✓' });
  };

  // Quiz taking UI
  if (activeQuiz && !submitted) {
    if (activeQuiz.type === 'MCQ') {
      const q = activeQuiz.questions[currentQ];
      const totalQ = activeQuiz.questions.length;
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">{activeQuiz.title}</h3>
              {activeQuiz.timeLimit && <span className="flex items-center gap-1 text-xs text-accent font-semibold"><Clock className="w-3.5 h-3.5" /> {activeQuiz.timeLimit} min</span>}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-6"><div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} /></div>
            <p className="text-xs text-muted-foreground mb-1">Question {currentQ + 1} of {totalQ} · {q.marks} marks</p>
            <p className="text-base font-semibold mb-4">{q.text}</p>
            <div className="space-y-2">
              {q.options.map(o => {
                const selected = (answers[q.id] || []).includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggleAnswer(q.id, o.id, q.type)} className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${selected ? 'border-primary bg-primary/10 font-semibold' : 'border-input hover:border-muted-foreground'}`}>
                    <span className={`inline-flex w-6 h-6 rounded-full border-2 mr-3 items-center justify-center text-xs font-bold ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>{o.id.toUpperCase()}</span>
                    {o.text}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm font-semibold disabled:opacity-50"><ChevronLeft className="w-4 h-4" /> Previous</button>
              {currentQ < totalQ - 1
                ? <button onClick={() => setCurrentQ(currentQ + 1)} className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Next <ChevronRight className="w-4 h-4" /></button>
                : <button onClick={submitMCQ} className="px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-semibold">Submit Quiz</button>
              }
            </div>
          </div>
          <button onClick={() => setActiveQuiz(null)} className="text-xs text-muted-foreground hover:underline">← Back to quizzes</button>
        </motion.div>
      );
    }

    // Practical
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-display font-bold mb-4">{activeQuiz.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{activeQuiz.description}</p>
          <div className="space-y-3">
            {activeQuiz.checklist.map((cl, ci) => (
              <div key={cl.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                <button onClick={() => setChecklistDone({ ...checklistDone, [cl.id]: !checklistDone[cl.id] })} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${checklistDone[cl.id] ? 'border-success bg-success' : 'border-input'}`}>
                  {checklistDone[cl.id] && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm">{ci + 1}. {cl.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cl.marks} marks {cl.evidenceRequired && '· Evidence required'}</p>
                  {cl.evidenceRequired && <div className="mt-2 flex items-center gap-2 text-xs text-info cursor-pointer"><Upload className="w-3.5 h-3.5" /> Upload evidence</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={submitPractical} className="px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-semibold">Submit for Evaluation</button>
          </div>
        </div>
        <button onClick={() => setActiveQuiz(null)} className="text-xs text-muted-foreground hover:underline">← Back to quizzes</button>
      </motion.div>
    );
  }

  // Result screen
  if (activeQuiz && submitted && activeQuiz.type === 'MCQ') {
    const passed = score >= activeQuiz.passingScore;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-4">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-success/15' : 'bg-destructive/15'}`}>
            <Award className={`w-10 h-10 ${passed ? 'text-success' : 'text-destructive'}`} />
          </div>
          <h3 className="font-display text-2xl font-bold">{score}%</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${passed ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{passed ? 'PASSED' : 'FAILED'}</span>
          <p className="text-sm text-muted-foreground mt-2">Passing score: {activeQuiz.passingScore}%</p>
          <button onClick={() => setActiveQuiz(null)} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Back to Quizzes</button>
        </div>
      </motion.div>
    );
  }

  if (activeQuiz && submitted && activeQuiz.type === 'Practical') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-4">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-warning/15"><Clock className="w-10 h-10 text-accent" /></div>
          <h3 className="font-display text-xl font-bold">Submitted for Evaluation</h3>
          <p className="text-sm text-muted-foreground mt-2">Your cluster head will review and grade this exam.</p>
          <button onClick={() => setActiveQuiz(null)} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Back to Quizzes</button>
        </div>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="font-display text-xl font-bold">Quizzes & Exams</h2>
      <div className="flex gap-2">
        {(['pending', 'completed']).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t === 'pending' ? `Pending (${pending.length})` : `Completed (${completed.length})`}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {(tab === 'pending' ? pending : completed).map(q => (
          <div key={q.id} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.type === 'MCQ' ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent'}`}>{q.type}</span>
              {q.timeLimit && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" /> {q.timeLimit} min</span>}
            </div>
            <h4 className="font-display font-semibold text-sm mb-1">{q.title}</h4>
            <p className="text-xs text-muted-foreground mb-1">{q.element}</p>
            <p className="text-[10px] text-muted-foreground">Due: {q.endDate}</p>
            {tab === 'pending' && <button onClick={() => startQuiz(q)} className="mt-3 w-full py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold">Start Quiz →</button>}
            {tab === 'completed' && <div className="mt-3 text-xs font-semibold text-success">✓ Completed</div>}
          </div>
        ))}
        {(tab === 'pending' ? pending : completed).length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No {tab} quizzes</p>}
      </div>
    </motion.div>
  );
}
