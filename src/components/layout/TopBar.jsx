import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const pathLabels = {
  '/dashboard/ho': 'Dashboard',
  '/dashboard/ho/sites': 'Site Management',
  '/dashboard/ho/clusters': 'Cluster Management',
  '/dashboard/ho/users': 'User Management',
  '/dashboard/ho/scoring': 'Scoring Configuration',
  '/dashboard/ho/incidents': 'Log Negative Incident',
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
  const { user, switchRole } = useAuth();
  const { notifications: mockNotifications } = useData();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  const roleLabelMap = { HEAD_OFFICE: 'HO', CLUSTER_HEAD: 'Cluster', CLUSTER_SAFETY_OFFICER: 'Cluster Safety Officer', SITE_HEAD: 'Site' };
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const activeRole = user?.activeRole || roles[0] || 'SITE_HEAD';
  const roleLabel = roleLabelMap[activeRole] || 'Site';

  const filteredNotifications = mockNotifications.filter(n => {
    if (activeRole === 'HEAD_OFFICE') return true;
    if (activeRole === 'CLUSTER_HEAD' || activeRole === 'CLUSTER_SAFETY_OFFICER') {
      return n.targetCluster === user?.cluster;
    }
    if (activeRole === 'SITE_HEAD') {
      return n.targetSite === user?.site;
    }
    return false;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;
  const currentPage = pathLabels[location.pathname] || 'Page';

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-card border-b border-border shadow-sm relative">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-md hover:bg-muted" onClick={onMenuClick}>
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <div className="relative">
            <button 
              onClick={() => roles.length > 1 && setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 text-muted-foreground ${roles.length > 1 ? 'hover:text-foreground cursor-pointer' : ''}`}
            >
              <span>{roleLabel}</span>
              {roles.length > 1 && <ChevronDown className="w-3 h-3" />}
            </button>
            {showRoleMenu && roles.length > 1 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                <div className="absolute left-0 top-full mt-1 w-40 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border font-semibold text-xs text-muted-foreground bg-muted/30">Switch Role</div>
                  {roles.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleMenu(false);
                        window.location.href = '/dashboard/' + (r === 'HEAD_OFFICE' ? 'ho' : r === 'CLUSTER_HEAD' || r === 'CLUSTER_SAFETY_OFFICER' ? 'cluster' : 'site');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-muted ${activeRole === r ? 'text-primary font-bold bg-primary/5' : 'text-foreground'}`}
                    >
                      {roleLabelMap[r]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <span className="text-muted-foreground">›</span>
          <span className="font-semibold text-foreground font-display">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
                {filteredNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">No new notifications</div>
                ) : (
                  filteredNotifications.slice(0, 8).map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 text-xs hover:bg-muted/50 ${!n.read ? 'bg-info/5' : ''}`}>
                      <span className="mr-2">{n.icon}</span>
                      <span className="text-foreground">{n.message}</span>
                      <p className="text-muted-foreground mt-1 text-[10px]">{n.time}</p>
                    </div>
                  ))
                )}
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
