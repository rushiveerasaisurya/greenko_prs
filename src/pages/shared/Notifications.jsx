import { useState } from 'react';
import { motion } from 'framer-motion';
import { notifications as initialNotifs } from '@/mockData/notifications';

export default function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [tab, setTab] = useState('all');

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

  const filtered = tab === 'unread' ? notifs.filter(n => !n.read) : tab === 'important' ? notifs.filter(n => n.type === 'warning' || n.type === 'error') : notifs;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Notifications</h2>
        <button onClick={markAllRead} className="text-xs text-info font-semibold hover:underline">Mark all read</button>
      </div>
      <div className="flex gap-2">
        {(['all', 'unread', 'important']).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t} {t === 'unread' && `(${notifs.filter(n => !n.read).length})`}
          </button>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>}
        {filtered.map(n => (
          <div key={n.id} onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))} className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition ${!n.read ? 'bg-info/5' : ''}`}>
            <span className="text-lg">{n.icon}</span>
            <div className="flex-1">
              <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-info shrink-0 mt-2" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
