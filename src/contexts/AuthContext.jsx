import { createContext, useContext, useState } from 'react';

const MOCK_CREDS = [
  { email: 'ho@greenko.com', password: 'admin123', user: { id: '1', name: 'Rahul Sharma', role: 'HEAD_OFFICE' , cluster: null, site: null, avatar: 'RS' } },
  { email: 'cluster@greenko.com', password: 'cluster123', user: { id: '2', name: 'Priya Mehta', role: 'CLUSTER_HEAD' , cluster: 'South Cluster', site: null, avatar: 'PM' } },
  { email: 'site@greenko.com', password: 'site123', user: { id: '3', name: 'Arun Kumar', role: 'SITE_HEAD' , cluster: 'South Cluster', site: 'Kurnool Solar Plant', avatar: 'AK' } },
];

const AuthContext = createContext({} );

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem('ssrs_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    const found = MOCK_CREDS.find(c => c.email === email && c.password === password);
    if (!found) return 'Invalid email or password';
    const u = { ...found.user, email };
    setUser(u);
    sessionStorage.setItem('ssrs_user', JSON.stringify(u));
    return null;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ssrs_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
