import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Pencil, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

export default function ScoringConfig() {
  const { scoringElements, updateScoringElement, resetScoringElements } = useData();
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const startEdit = (el, e) => {
    e.stopPropagation();
    setEditingId(el.id);
    setEditForm({ ...el, subElements: el.subElements.map(se => ({ ...se })) });
    setExpanded(el.id); // Ensure it's expanded to see sub-elements during edit
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    // Validate marks sum? Optional, but let's keep it simple for now as per user request.
    updateScoringElement(editingId, editForm);
    toast({ title: 'Scoring element and sub-elements updated ✓' });
    cancelEdit();
  };

  const handleReset = () => {
    if (confirm('Reset all scoring elements to defaults? This cannot be undone.')) {
      resetScoringElements();
      toast({ title: 'Scoring elements reset to defaults' });
    }
  };

  const updateSubElement = (idx, field, value) => {
    const newSubs = [...editForm.subElements];
    newSubs[idx] = { ...newSubs[idx], [field]: value };

    // Auto-calculate parent maxMarks based on sub-elements
    const newMaxMarks = newSubs.reduce((sum, se) => sum + (se.active ? se.maxMarks : 0), 0);

    setEditForm({ ...editForm, subElements: newSubs, maxMarks: newMaxMarks });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Scoring Configuration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define elements, sub-elements, benchmarks and max marks.</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted text-muted-foreground transition"><RotateCcw className="w-3 h-3" /> Reset to Defaults</button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left w-8">#</th><th className="px-4 py-3 text-left">Element</th><th className="px-4 py-3 text-right">Max Marks</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Weightage %</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody>
            {scoringElements.map((el, i) => {
              const isEditing = editingId === el.id;
              return (<>
                <tr key={el.id} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} cursor-pointer hover:bg-muted/50 transition-colors`} onClick={() => !isEditing && setExpanded(expanded === el.id ? null : el.id)}>
                  <td className="px-4 py-3 font-bold">{el.number}</td>
                  <td className="px-4 py-3 font-medium">
                    {isEditing ? (
                      <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1 bg-background border border-primary rounded text-sm focus:outline-none" onClick={e => e.stopPropagation()} />
                    ) : el.name}
                  </td>
                  <td className="px-4 py-3 text-right text-score">
                    {isEditing ? (
                      <input type="number" value={editForm.maxMarks} onChange={e => setEditForm({ ...editForm, maxMarks: Number(e.target.value) })} className="w-16 px-2 py-1 bg-background border border-primary rounded text-sm text-right focus:outline-none" onClick={e => e.stopPropagation()} />
                    ) : el.maxMarks}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="px-2 py-1 bg-background border border-primary rounded text-[10px] focus:outline-none" onClick={e => e.stopPropagation()}>
                        <option value="Leading">Leading</option>
                        <option value="Lagging">Lagging</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${el.type === 'Leading' ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent'}`}>{el.type}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input type="number" value={editForm.weightage} onChange={e => setEditForm({ ...editForm, weightage: Number(e.target.value) })} className="w-16 px-2 py-1 bg-background border border-primary rounded text-sm text-right focus:outline-none" onClick={e => e.stopPropagation()} />
                    ) : <>{el.weightage}%</>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={(e) => { e.stopPropagation(); isEditing ? setEditForm({ ...editForm, active: !editForm.active }) : updateScoringElement(el.id, { active: !el.active }); }} title={el.active ? 'Deactivate' : 'Activate'}>
                      <span className={`w-3 h-3 rounded-full inline-block ${(isEditing ? editForm.active : el.active) ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'} transition-all`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors" title="Save All Changes"><Check className="w-4 h-4" /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors" title="Discard Changes"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={(e) => startEdit(el, e)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Edit Element & Sub-elements"><Pencil className="w-4 h-4" /></button>
                          {expanded === el.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expanded === el.id && (
                  <tr key={`${el.id}-exp`}><td colSpan={7} className="px-6 py-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Sub-elements Configuration</p>
                      {isEditing && <span className="text-[10px] text-info font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Heads up: Changing descriptions might affect existing submissions.</span>}
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left font-semibold">Description</th><th className="py-2 text-left font-semibold">Benchmark / Method</th><th className="py-2 text-right font-semibold">Max</th><th className="py-2 text-center font-semibold">Active</th></tr></thead>
                      <tbody>{(isEditing ? editForm.subElements : el.subElements).map((se, sIdx) => (
                        <tr key={se.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 pr-4">
                            {isEditing ? (
                              <textarea value={se.description} onChange={e => updateSubElement(sIdx, 'description', e.target.value)} className="w-full px-2 py-1 bg-background border border-border rounded focus:border-primary outline-none transition-colors" rows={2} />
                            ) : <span className="text-foreground/80">{se.description}</span>}
                          </td>
                          <td className="py-2.5 pr-4">
                            {isEditing ? (
                              <input value={se.benchmark} onChange={e => updateSubElement(sIdx, 'benchmark', e.target.value)} className="w-full px-2 py-1 bg-background border border-border rounded focus:border-primary outline-none transition-colors" />
                            ) : <span className="text-muted-foreground font-mono text-[10px]">{se.benchmark}</span>}
                          </td>
                          <td className="py-2.5 text-right font-bold w-12">
                            {isEditing ? (
                              <input type="number" value={se.maxMarks} onChange={e => updateSubElement(sIdx, 'maxMarks', Number(e.target.value))} className="w-12 px-1 py-1 bg-background border border-border rounded text-right focus:border-primary outline-none" />
                            ) : <span className="text-score">{se.maxMarks}</span>}
                          </td>
                          <td className="py-2.5 text-center w-12">
                            <button onClick={() => isEditing ? updateSubElement(sIdx, 'active', !se.active) : null} disabled={!isEditing} className={`${!isEditing && 'cursor-default'}`}>
                              <span className={`w-2 h-2 rounded-full inline-block ${se.active ? 'bg-success/60' : 'bg-destructive/60'} transition-all`} />
                            </button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </td></tr>
                )}
              </>);
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center">Changes to elements and sub-elements reflect instantly across Site Dashboards and Evidence Validation screens.</p>
    </motion.div>
  );
}
