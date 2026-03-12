import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu } from 'lucide-react';
import { notifications as mockNotifications } from '@/mockData/notifications';

const pathLabels = {
  '/dashboard/ho': 'Dashboard',
  '/dashboard/ho/sites': 'Site Management',
  '/dashboard/ho/clusters': 'Cluster Management',
  '/dashboard/ho/users': 'User Management',
  '/dashboard/ho/reports': 'Reports & Analytics',
  '/dashboard/ho/scoring': 'Scoring Configuration',
  '/dashboard/ho/quarters': 'Quarter Management',
  '/dashboard/cluster': 'Dashboard',
  '/dashboard/cluster/validation': 'Evidence Validation',
  '/dashboard/cluster/quizzes': 'Quiz & Exam Builder',
  '/dashboard/cluster/audits': 'Audit Reports',
  '/dashboard/site': 'My Dashboard',
  '/dashboard/site/evidence': 'Submit Evidence',
  '/dashboard/site/quizzes': 'Quizzes & Exams',
  '/dashboard/site/performance': 'My Performance',
  '/leaderboard': 'Leaderboard',
  '/tickets': 'Tickets',
  '/notifications': 'Notifications',
};

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const currentPage = pathLabels[location.pathname] || 'Page';
  const roleLabel = user?.role === 'HEAD_OFFICE' ? 'HO' : user?.role === 'CLUSTER_HEAD' ? 'Cluster' : 'Site';

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-card border-b border-border shadow-sm relative">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-md hover:bg-muted" onClick={onMenuClick}>
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">{roleLabel}</span>
          <span className="text-muted-foreground">›</span>
          <span className="font-semibold text-foreground font-display">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-live" />
          Q3 FY2025-26
        </span>

        <div className="relative">
          <button className="p-2 rounded-md hover:bg-muted relative" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-1 w-80 bg-card rounded-lg shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-border font-display font-semibold text-sm">Notifications</div>
                {mockNotifications.slice(0, 8).map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 text-xs hover:bg-muted/50 ${!n.read ? 'bg-info/5' : ''}`}>
                    <span className="mr-2">{n.icon}</span>
                    <span className="text-foreground">{n.message}</span>
                    <p className="text-muted-foreground mt-1 text-[10px]">{n.time}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {user?.avatar}
          </div>
          <span className="hidden sm:block text-sm font-medium text-foreground">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
