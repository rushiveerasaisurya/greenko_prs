import { createContext, useContext, useState } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { users } = useData();
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem('ssrs_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password && u.status === 'Active');
    if (!found) return 'Invalid email or password, or account inactive';

    // Auto-generate avatar from name
    const initials = found.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const u = { ...found, avatar: initials };

    // Hide password from stored session state
    delete u.password;
    
    // Set a default active role
    const defaultRole = u.roles ? u.roles[0] : (u.role || 'SITE_HEAD');
    u.activeRole = defaultRole;

    setUser(u);
    sessionStorage.setItem('ssrs_user', JSON.stringify(u));
    return null;
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, activeRole: newRole };
    setUser(updatedUser);
    sessionStorage.setItem('ssrs_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ssrs_user');
  };

  const updateSession = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    sessionStorage.setItem('ssrs_user', JSON.stringify(updatedUser));
  };

  return <AuthContext.Provider value={{ user, login, logout, switchRole, updateSession }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
