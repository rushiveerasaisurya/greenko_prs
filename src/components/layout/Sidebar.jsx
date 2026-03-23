import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Factory, FolderTree, Users, Trophy, BarChart3,
  Settings, Calendar, Ticket, Bell, ClipboardCheck,
  ClipboardList, FileUp, TrendingUp, Shield, ChevronLeft, ChevronRight,
  LogOut, X, AlertTriangle
} from 'lucide-react';

const navConfig = {
  HEAD_OFFICE: [
    { path: '/dashboard/ho', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/ho/sites', label: 'Site Management', icon: Factory },
    { path: '/dashboard/ho/clusters', label: 'Cluster Management', icon: FolderTree },
    { path: '/dashboard/ho/users', label: 'User Management', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/dashboard/ho/scoring', label: 'Scoring Config', icon: Settings },
    { path: '/dashboard/ho/incidents', label: 'Incident Reporting', icon: AlertTriangle },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ],
  CLUSTER_HEAD: [
    { path: '/dashboard/cluster', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/cluster/validation', label: 'Evidence Validation', icon: ClipboardCheck },

    { path: '/leaderboard', label: 'Cluster Leaderboard', icon: Trophy },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/dashboard/cluster/audits', label: 'Audit Reports', icon: ClipboardList },
    { path: '/dashboard/cluster/incidents', label: 'Incident Reporting', icon: AlertTriangle },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ],
  CLUSTER_SAFETY_OFFICER: [
    { path: '/dashboard/cluster', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/cluster/validation', label: 'Evidence Validation', icon: ClipboardCheck },

    { path: '/leaderboard', label: 'Cluster Leaderboard', icon: Trophy },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/dashboard/cluster/audits', label: 'Audit Reports', icon: ClipboardList },
    { path: '/dashboard/cluster/incidents', label: 'Incident Reporting', icon: AlertTriangle },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ],
  SITE_HEAD: [
    { path: '/dashboard/site', label: 'My Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/site/evidence', label: 'Submit Evidence', icon: FileUp },

    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/dashboard/site/performance', label: 'My Performance', icon: TrendingUp },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ],
};

const roleLabels = {
  HEAD_OFFICE: 'Head Office',
  CLUSTER_HEAD: 'Cluster Head',
  CLUSTER_SAFETY_OFFICER: 'Cluster Safety Officer',
  SITE_HEAD: 'Site Head',
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;
  const activeRole = user.activeRole || (user.roles ? user.roles[0] : user.role) || 'SITE_HEAD';
  const items = navConfig[activeRole] || [];

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`
        fixed md:relative z-50 h-full flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300
        ${collapsed ? 'w-[60px]' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold font-display leading-tight">GREENKO PRS</h1>
              <p className="text-[10px] opacity-70">Plant Ranking System</p>
            </div>
          )}
          <button className="md:hidden ml-auto p-1" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {items.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/15 text-white border-l-2 border-sidebar-accent pl-2.5'
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}
                `}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-accent-foreground text-xs font-bold shrink-0">
              {user.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] opacity-70 truncate">
                  {roleLabels[activeRole]}
                </p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="p-1.5 rounded hover:bg-white/10" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse */}
        <div className="hidden md:flex justify-center p-2 border-t border-sidebar-border">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-white/10">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
