import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users as defaultUsers } from '@/mockData/users';
import { sites as defaultSites } from '@/mockData/sites';
import { clusters as defaultClusters } from '@/mockData/clusters';
import { evidenceSubmissions as defaultSubmissions } from '@/mockData/evidenceSubmissions';
import { tickets as defaultTickets } from '@/mockData/tickets';
import { notifications as defaultNotifications } from '@/mockData/notifications';
import { quizzes as defaultQuizzes } from '@/mockData/quizzes';
import { scoringElements as defaultScoringElements } from '@/mockData/scoringElements';

const KEYS = { users: 'sp_users', sites: 'sp_sites', clusters: 'sp_clusters', submissions: 'sp_submissions', tickets: 'sp_tickets', notifications: 'sp_notifications', quizzes: 'sp_quizzes', scoring: 'sp_scoring' };

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
    const [users, setUsers] = useState(() => {
        const loaded = load(KEYS.users, defaultUsers);
        return loaded.map(u => ({ ...u, password: u.password || 'password' }));
    });
    const [sites, setSites] = useState(() => load(KEYS.sites, defaultSites));
    const [clusters, setClusters] = useState(() => load(KEYS.clusters, defaultClusters));
    const [submissions, setSubmissions] = useState(() => load(KEYS.submissions, defaultSubmissions));
    const [tickets, setTickets] = useState(() => load(KEYS.tickets, defaultTickets));
    const [notifications, setNotifications] = useState(() => load(KEYS.notifications, defaultNotifications));
    const [quizzes, setQuizzes] = useState(() => load(KEYS.quizzes, defaultQuizzes));
    const [scoringElements, setScoringElements] = useState(() => load(KEYS.scoring, defaultScoringElements));

    // Persist on every change
    useEffect(() => { save(KEYS.users, users); }, [users]);
    useEffect(() => { save(KEYS.sites, sites); }, [sites]);
    useEffect(() => { save(KEYS.clusters, clusters); }, [clusters]);
    useEffect(() => { save(KEYS.submissions, submissions); }, [submissions]);
    useEffect(() => { save(KEYS.tickets, tickets); }, [tickets]);
    useEffect(() => { save(KEYS.notifications, notifications); }, [notifications]);
    useEffect(() => { save(KEYS.quizzes, quizzes); }, [quizzes]);
    useEffect(() => { save(KEYS.scoring, scoringElements); }, [scoringElements]);

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

    // --- Submissions ---
    const addSubmission = useCallback((sub) => {
        setSubmissions(prev => [...prev, { ...sub, id: String(Date.now()) }]);
    }, []);

    const updateSubmission = useCallback((id, updates) => {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const deleteSubmission = useCallback((id) => {
        setSubmissions(prev => prev.filter(s => s.id !== id));
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
        setSubmissions(defaultSubmissions);
        setTickets(defaultTickets);
        setNotifications(defaultNotifications);
        setQuizzes(defaultQuizzes);
        setScoringElements(defaultScoringElements);
    }, []);

    // --- Tickets ---
    const addTicket = useCallback((ticket) => {
        setTickets(prev => [...prev, { ...ticket, id: String(Date.now()), ticketId: `TICK-${Date.now()}` }]);
    }, []);

    const updateTicket = useCallback((id, updates) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    // --- Notifications ---
    const addNotification = useCallback((notif) => {
        setNotifications(prev => [{ ...notif, id: String(Date.now()), read: false, time: 'Just now' }, ...prev]);
    }, []);

    const markNotificationRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // --- Quizzes ---
    const addQuiz = useCallback((quiz) => {
        setQuizzes(prev => [...prev, { ...quiz, id: String(Date.now()) }]);
    }, []);

    const updateQuiz = useCallback((id, updates) => {
        setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    }, []);

    const deleteQuiz = useCallback((id) => {
        setQuizzes(prev => prev.filter(q => q.id !== id));
    }, []);

    // --- Scoring Configuration ---
    const updateScoringElement = useCallback((id, updates) => {
        setScoringElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    }, []);

    const resetScoringElements = useCallback(() => {
        setScoringElements(defaultScoringElements);
    }, []);

    // --- Weighted Scoring Logic ---
    const getSiteScore = useCallback((siteId, siteName, monthStr) => {
        const prng = pseudoRandom(siteId + monthStr);
        const activeElements = scoringElements.filter(e => e.active);

        let totalWeightedScore = 0;
        let totalWeight = 0;

        // Elements 1-8 (Positive)
        activeElements.filter(e => e.number <= 8).forEach(el => {
            const subs = submissions.filter(s => s.site === siteName && s.elementNumber === el.number && s.month === monthStr);
            const awarded = subs.filter(s => s.status === 'APPROVED').reduce((a, s) => a + (s.marksAwarded || 0), 0);

            // For demo: if no submissions, use PRNG performance (60-90%)
            // If submissions exist, use actual performance
            let performancePct = el.maxMarks > 0 ? (awarded / el.maxMarks) : 0;
            if (subs.length === 0) {
                performancePct = 0.6 + (prng() * 0.3);
            }

            totalWeightedScore += performancePct * el.weightage;
            totalWeight += el.weightage;
        });

        // Normalize if total weight isn't 100 (optional, but good for safety)
        let finalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

        // Element 9 (Negative Incidents)
        const incidentElement = activeElements.find(e => e.number === 9);
        if (incidentElement) {
            const incidents = submissions.filter(s => s.site === siteName && s.elementNumber === 9 && s.month === monthStr);
            const totalDeduction = incidents.reduce((a, s) => a + Math.abs(s.marksAwarded || 0), 0);
            finalScore = Math.max(0, finalScore - totalDeduction);
        }

        return Math.round(finalScore);
    }, [scoringElements, submissions]);

    // --- Dynamic Leaderboard ---
    const getLeaderboard = useCallback((monthStr) => {
        const activeSites = sites.filter(s => s.status === 'Active');
        if (activeSites.length === 0) return [];

        const monthIndex = months.indexOf(monthStr);
        if (monthIndex === -1) return [];

        const isCurrentMonth = monthIndex === months.length - 1;

        // Pseudo-random helper for consistent mock data
        const pseudoRandom = (seed) => {
            let value = 0;
            for (let i = 0; i < seed.length; i++) value = (value << 5) - value + seed.charCodeAt(i);
            return () => {
                value = (value * 16807) % 2147483647;
                return (value - 1) / 2147483646;
            };
        };

        return activeSites.map(site => {
            const prng = pseudoRandom(site.id + monthStr);
            const score = getSiteScore(site.id, site.name, monthStr);

            const totalPositive = score + Math.floor(prng() * 10);
            const totalNegative = -(totalPositive - score);

            const prevScore = getSiteScore(site.id, site.name, months[monthIndex - 1] || 'Past');
            const change = monthIndex === 0 ? 0 : score - prevScore;

            const statuses = ['Fully Submitted', 'Partial', 'Pending'];
            const statusIndex = isCurrentMonth ? (score > 80 ? 0 : 1) : 0;

            return {
                id: site.id,
                rank: 0, // Calculated below
                site: site.name,
                cluster: site.cluster,
                type: site.type,
                score,
                totalPositive,
                totalNegative,
                change,
                status: statuses[statusIndex],
                history: months.slice(0, monthIndex + 1).map(m => {
                    return { month: m.split(' ')[0], score: getSiteScore(site.id, site.name, m) };
                })
            };
        }).sort((a, b) => b.score - a.score).map((s, i) => ({ ...s, rank: i + 1 }));
    }, [sites, months]);

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
                const score = getSiteScore(site.id, site.name, m);
                totalHistoryScore += score;
                if (index === fyMonths.length - 1) currentMonthScore = score;
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
                const score = getSiteScore(site.id, site.name, m);
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
            users, sites, clusters, months, submissions, tickets, notifications, quizzes,
            addUser, updateUser, toggleUserStatus, deleteUser,
            addSite, updateSite, toggleSiteStatus, deleteSite,
            addCluster, updateCluster, deleteCluster,
            addSubmission, updateSubmission, deleteSubmission,
            addTicket, updateTicket, addNotification, markNotificationRead, deleteNotification,
            addQuiz, updateQuiz, deleteQuiz,
            scoringElements, updateScoringElement, resetScoringElements,
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
