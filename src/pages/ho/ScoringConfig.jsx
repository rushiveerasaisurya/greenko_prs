import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { scoringElements } from '@/mockData/scoringElements';

export default function ScoringConfig() {
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="font-display text-xl font-bold">Scoring Configuration</h2>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-primary text-primary-foreground">
            <th className="px-4 py-3 text-left w-8">#</th><th className="px-4 py-3 text-left">Element</th><th className="px-4 py-3 text-right">Max Marks</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Weightage %</th><th className="px-4 py-3 text-center">Active</th><th className="px-4 py-3 text-center">Details</th>
          </tr></thead>
          <tbody>
            {scoringElements.map((el, i) => (<>
              <tr key={el.id} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card'} cursor-pointer hover:bg-muted/50`} onClick={() => setExpanded(expanded === el.id ? null : el.id)}>
                <td className="px-4 py-3 font-bold">{el.number}</td>
                <td className="px-4 py-3 font-medium">{el.name}</td>
                <td className="px-4 py-3 text-right text-score">{el.maxMarks}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${el.type === 'Leading' ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent'}`}>{el.type}</span></td>
                <td className="px-4 py-3 text-right">{el.weightage}%</td>
                <td className="px-4 py-3 text-center"><span className={`w-2 h-2 rounded-full inline-block ${el.active ? 'bg-success' : 'bg-destructive'}`} /></td>
                <td className="px-4 py-3 text-center">{expanded === el.id ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}</td>
              </tr>
              {expanded === el.id && (
                <tr key={`${el.id}-exp`}><td colSpan={7} className="px-6 py-4 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Sub-elements</p>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="py-1 text-left">Description</th><th className="py-1 text-left">Benchmark</th><th className="py-1 text-right">Max Marks</th><th className="py-1 text-center">Active</th></tr></thead>
                    <tbody>{el.subElements.map(se => (
                      <tr key={se.id} className="border-b border-border/50">
                        <td className="py-2">{se.description}</td><td className="py-2 text-muted-foreground">{se.benchmark}</td><td className="py-2 text-right text-score">{se.maxMarks}</td>
                        <td className="py-2 text-center"><span className={`w-2 h-2 rounded-full inline-block ${se.active ? 'bg-success' : 'bg-destructive'}`} /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </td></tr>
              )}
            </>))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
