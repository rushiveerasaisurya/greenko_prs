import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

export default function IncidentReporting() {
    const { sites, submissions, addSubmission, scoringElements } = useData();
    const [site, setSite] = useState('');
    const [month, setMonth] = useState('2026-03');
    const [typeId, setTypeId] = useState('');
    const [description, setDescription] = useState('');

    const element9 = scoringElements.find(e => e.number === 9);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!site || !typeId || !description) return toast({ title: 'Please fill all fields', variant: 'destructive' });
        const subElement = element9?.subElements?.find(se => se.id === typeId);
        if (!subElement) return toast({ title: 'Invalid incident type', variant: 'destructive' });

        const newIncident = {
            id: String(Date.now()),
            site,
            month,
            element: element9?.name || 'Negative Grade',
            elementNumber: 9,
            subElement: subElement.description,
            submittedBy: 'Cluster Head',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            notes: description,
            filesCount: 0,
            status: 'APPROVED',
            marksAwarded: -Math.abs(subElement.maxMarks), // Negative marks
        };

        addSubmission(newIncident);
        setSite(''); setTypeId(''); setDescription('');
        toast({ title: 'Incident logged successfully', variant: 'destructive' });
    };

    const myIncidents = submissions.filter(s => s.elementNumber === 9);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Log Negative Incident</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-card border border-destructive/20 rounded-xl p-5 shadow-sm h-fit">
                    <h3 className="font-semibold mb-4 text-sm">Report New Incident</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Site</label>
                            <select value={site} onChange={e => setSite(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="">-- Choose Site --</option>{sites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Month</label>
                            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Incident Type</label>
                            <select value={typeId} onChange={e => setTypeId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                                <option value="">-- Choose Type --</option>
                                {element9?.subElements.map(se => <option key={se.id} value={se.id}>{se.description} ({se.maxMarks} marks)</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">Description / Remarks</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Provide details..."></textarea>
                        </div>
                        <button type="submit" className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-4"><Plus className="w-4 h-4" /> Log Incident Record</button>
                    </form>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-sm">Recent Logged Incidents</h3>
                    {myIncidents.length === 0 ? (
                        <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">No incidents logged yet. Great job!</div>
                    ) : (
                        <div className="space-y-3">
                            {myIncidents.map(inc => (
                                <div key={inc.id} className="bg-card border border-destructive/20 p-4 rounded-xl shadow-sm flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-destructive/10 shrink-0 flex items-center justify-center text-destructive font-bold">{Math.abs(inc.marksAwarded)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-sm">{inc.site}</p>
                                            <span className="text-xs text-muted-foreground">{inc.date}</span>
                                        </div>
                                        <p className="text-xs text-destructive font-medium mt-0.5">{inc.subElement}</p>
                                        <p className="text-sm text-muted-foreground mt-2">{inc.notes}</p>
                                        <span className="inline-block mt-3 px-2 py-0.5 rounded-full text-[10px] bg-muted font-semibold">Month: {inc.month}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
