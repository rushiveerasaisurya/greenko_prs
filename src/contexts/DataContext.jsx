import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users as defaultUsers } from '@/mockData/users';
import { sites as defaultSites } from '@/mockData/sites';
import { clusters as defaultClusters } from '@/mockData/clusters';

const KEYS = { users: 'sp_users', sites: 'sp_sites', clusters: 'sp_clusters' };

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}

function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Pseudo-random generator for historical data based on string seed
function pseudoRandom(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    return function () {
        h = Math.imul(741103597, h) + 1 | 0;
        return (h >>> 0) / 4294967296;
    };
}

export const months = [
    'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025',
    'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'
];

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [users, setUsers] = useState(() => load(KEYS.users, defaultUsers));
    const [sites, setSites] = useState(() => load(KEYS.sites, defaultSites));
    const [clusters, setClusters] = useState(() => load(KEYS.clusters, defaultClusters));

    // Persist on every change
    useEffect(() => { save(KEYS.users, users); }, [users]);
    useEffect(() => { save(KEYS.sites, sites); }, [sites]);
    useEffect(() => { save(KEYS.clusters, clusters); }, [clusters]);

    // --- Users ---
    const addUser = useCallback((user) => {
        setUsers(prev => [...prev, { ...user, id: String(Date.now()), lastLogin: 'Never' }]);
    }, []);

    const updateUser = useCallback((id, updates) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    }, []);

    const toggleUserStatus = useCallback((id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    }, []);

    const deleteUser = useCallback((id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    }, []);

    // --- Sites ---
    const addSite = useCallback((site) => {
        setSites(prev => [...prev, { ...site, id: String(Date.now()) }]);
    }, []);

    const updateSite = useCallback((id, updates) => {
        setSites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const toggleSiteStatus = useCallback((id) => {
        setSites(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    }, []);

    const deleteSite = useCallback((id) => {
        setSites(prev => prev.filter(s => s.id !== id));
    }, []);

    // --- Clusters ---
    const addCluster = useCallback((cluster) => {
        setClusters(prev => [...prev, { ...cluster, id: String(Date.now()), siteCount: 0, avgScore: 0, status: 'Active' }]);
    }, []);

    const updateCluster = useCallback((id, updates) => {
        setClusters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const deleteCluster = useCallback((id) => {
        setClusters(prev => prev.filter(c => c.id !== id));
    }, []);

    // Reset all data to defaults
    const resetData = useCallback(() => {
        setUsers(defaultUsers);
        setSites(defaultSites);
        setClusters(defaultClusters);
    }, []);

    // --- Dynamic Leaderboard ---
    const getLeaderboard = useCallback((monthStr) => {
        const activeSites = sites.filter(s => s.status === 'Active');
        if (activeSites.length === 0) return [];

        const monthIndex = months.indexOf(monthStr);
        if (monthIndex === -1) return [];

        const isCurrentMonth = monthIndex === months.length - 1;

        let leaderboard = activeSites.map(site => {
            // Use site id + month for deterministic but seemingly random historical data
            const prng = pseudoRandom(site.id + monthStr);
            // Current month gets a slight boost to look like progress is happening
            const baseScore = 50 + Math.floor(prng() * 40);
            const score = isCurrentMonth ? Math.min(100, baseScore + 5) : baseScore;

            const totalPositive = score + Math.floor(prng() * 10);
            const totalNegative = -(totalPositive - score);

            // Previous month score to calculate trend 'change'
            const prevPrng = pseudoRandom(site.id + (months[monthIndex - 1] || 'Past'));
            const prevScore = 50 + Math.floor(prevPrng() * 40);
            const change = monthIndex === 0 ? 0 : score - prevScore;

            // Generate realistic historical status
            const statuses = ['Fully Submitted', 'Partial', 'Pending'];
            const statusIndex = isCurrentMonth
                ? (score > 70 ? 0 : score > 50 ? 1 : 2) // Current month depends on score
                : (prng() > 0.2 ? 0 : 1); // Historical is mostly fully submitted

            return {
                id: site.id,
                site: site.name,
                cluster: site.cluster,
                type: site.type,
                score,
                totalPositive,
                totalNegative,
                change,
                status: statuses[statusIndex],
                history: months.slice(0, monthIndex + 1).map(m => {
                    const hPrng = pseudoRandom(site.id + m);
                    return { month: m.split(' ')[0], score: 50 + Math.floor(hPrng() * 40) };
                })
            };
        });

        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
    }, [sites]);

    const getFYLeaderboard = useCallback((year = '2025-26') => {
        const fyMonths = year === '2025-26'
            ? months.slice(6)
            : months.slice(0, 6);

        const activeSites = sites.filter(s => s.status === 'Active');
        if (activeSites.length === 0) return [];

        let leaderboard = activeSites.map(site => {
            let totalHistoryScore = 0;
            let currentMonthScore = 0;
            let previousMonthScore = 0;

            const history = fyMonths.map((m, index) => {
                const prng = pseudoRandom(site.id + m);
                const isLatestInFY = index === fyMonths.length - 1;
                const baseScore = 45 + Math.floor(prng() * 45); // Adjust for variety
                const score = isLatestInFY ? Math.min(100, baseScore + 5) : baseScore;

                totalHistoryScore += score;
                if (isLatestInFY) currentMonthScore = score;
                if (index === fyMonths.length - 2) previousMonthScore = score;

                return { month: m.split(' ')[0], score };
            });

            const avgScore = Math.round(totalHistoryScore / fyMonths.length);
            const change = currentMonthScore - previousMonthScore;
            const totalPositive = avgScore + Math.floor(pseudoRandom(site.id + 'fy' + year)() * 10);
            const totalNegative = -(totalPositive - avgScore);

            const statuses = ['Fully Submitted', 'Partial', 'Pending'];
            const statusIndex = avgScore > 70 ? 0 : avgScore > 50 ? 1 : 2;

            return {
                id: site.id,
                site: site.name,
                cluster: site.cluster,
                type: site.type,
                score: avgScore,
                totalPositive,
                totalNegative,
                change,
                status: statuses[statusIndex],
                history
            };
        });

        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
    }, [sites]);

    const getPeriodLeaderboard = useCallback((startMonth, endMonth) => {
        const startIndex = months.indexOf(startMonth);
        const endIndex = months.indexOf(endMonth);
        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return [];

        const periodMonths = months.slice(startIndex, endIndex + 1);
        const activeSites = sites.filter(s => s.status === 'Active');

        let leaderboard = activeSites.map(site => {
            let totalScore = 0;

            const history = periodMonths.map(m => {
                const prng = pseudoRandom(site.id + m);
                const score = 45 + Math.floor(prng() * 45);
                totalScore += score;
                return { month: m.split(' ')[0], score };
            });

            const avgScore = Math.round(totalScore / periodMonths.length);

            // For change, compare with the month before the start month
            let change = 0;
            if (startIndex > 0) {
                const prevPrng = pseudoRandom(site.id + months[startIndex - 1]);
                const prevScore = 45 + Math.floor(prevPrng() * 45);
                change = avgScore - prevScore;
            }

            const totalPositive = avgScore + Math.floor(pseudoRandom(site.id + 'period' + startMonth + endMonth)() * 10);
            const totalNegative = -(totalPositive - avgScore);
            const statuses = ['Fully Submitted', 'Partial', 'Pending'];
            const statusIndex = avgScore > 70 ? 0 : avgScore > 50 ? 1 : 2;

            return {
                id: site.id,
                site: site.name,
                cluster: site.cluster,
                type: site.type,
                score: avgScore,
                totalPositive,
                totalNegative,
                change,
                status: statuses[statusIndex],
                history
            };
        });

        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
    }, [sites]);

    const getClusterLeaderboard = useCallback((monthStr) => {
        const fullLeaderboard = getLeaderboard(monthStr);
        if (fullLeaderboard.length === 0) return [];

        const clusterMap = {};

        fullLeaderboard.forEach(site => {
            if (!clusterMap[site.cluster]) {
                clusterMap[site.cluster] = {
                    cluster: site.cluster,
                    count: 0,
                    totalScore: 0,
                    totalPositive: 0,
                    totalNegative: 0,
                    totalChange: 0,
                    historySums: {}
                };
            }

            const c = clusterMap[site.cluster];
            c.count += 1;
            c.totalScore += site.score;
            c.totalPositive += site.totalPositive;
            c.totalNegative += site.totalNegative;
            c.totalChange += site.change;

            site.history.forEach(h => {
                if (!c.historySums[h.month]) c.historySums[h.month] = 0;
                c.historySums[h.month] += h.score;
            });
        });

        const cLeaderboard = Object.values(clusterMap).map(c => {
            const score = Math.round(c.totalScore / c.count);
            const statuses = ['Excellent', 'Good', 'Needs Improvement'];
            const statusIndex = score > 75 ? 0 : score > 60 ? 1 : 2;

            // Get names of all sites in this cluster
            const clusterSitesNames = sites.filter(s => s.cluster === c.cluster && s.status === 'Active').map(s => s.name);

            return {
                id: c.cluster,
                cluster: c.cluster,
                score,
                siteNames: clusterSitesNames,
                totalPositive: Math.round(c.totalPositive / c.count),
                totalNegative: Math.round(c.totalNegative / c.count),
                change: Math.round(c.totalChange / c.count),
                status: statuses[statusIndex],
                history: Object.keys(c.historySums).map(m => ({
                    month: m,
                    score: Math.round(c.historySums[m] / c.count)
                }))
            };
        });

        cLeaderboard.sort((a, b) => b.score - a.score);
        return cLeaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
    }, [getLeaderboard]);

    return (
        <DataContext.Provider value={{
            users, sites, clusters, months,
            addUser, updateUser, toggleUserStatus, deleteUser,
            addSite, updateSite, toggleSiteStatus, deleteSite,
            addCluster, updateCluster, deleteCluster,
            resetData, getLeaderboard, getFYLeaderboard, getClusterLeaderboard, getPeriodLeaderboard,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}
