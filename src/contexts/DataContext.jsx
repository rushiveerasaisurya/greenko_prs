import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users as defaultUsers } from '@/mockData/users';
import { sites as defaultSites } from '@/mockData/sites';
import { clusters as defaultClusters } from '@/mockData/clusters';
import { evidenceSubmissions as defaultSubmissions } from '@/mockData/evidenceSubmissions';
import { tickets as defaultTickets } from '@/mockData/tickets';
import { notifications as defaultNotifications } from '@/mockData/notifications';
import { quizzes as defaultQuizzes } from '@/mockData/quizzes';
import { scoringElements as defaultScoringElements } from '@/mockData/scoringElements';

const KEYS = { users: 'sp_users_v2', sites: 'sp_sites_v2', clusters: 'sp_clusters_v2', submissions: 'sp_submissions_v2', tickets: 'sp_tickets_v2', notifications: 'sp_notifications_v2', quizzes: 'sp_quizzes_v2', scoring: 'sp_scoring_v2' };

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

    // --- Users ---
    const addUser = useCallback((user) => {
        const id = String(Date.now());
        setUsers(prev => [...prev, { ...user, id, lastLogin: 'Never' }]);
        
        // Sync with Sites
        if (user.site) {
            setSites(sPrev => sPrev.map(s => s.name === user.site ? { ...s, siteHead: user.name } : s));
        }
        // Sync with Clusters
        if (user.cluster) {
            setClusters(cPrev => cPrev.map(c => c.name === user.cluster ? { ...c, head: user.name } : c));
        }
    }, []);

    const updateUser = useCallback((id, updates) => {
        setUsers(prev => {
            const user = prev.find(u => u.id === id);
            if (!user) return prev;

            // Sync with Sites if site assignment changes
            if (updates.site !== undefined && updates.site !== user.site) {
                if (user.site) {
                    setSites(sPrev => sPrev.map(s => s.name === user.site ? { ...s, siteHead: '' } : s));
                }
                if (updates.site) {
                    setSites(sPrev => sPrev.map(s => s.name === updates.site ? { ...s, siteHead: user.name } : s));
                }
            }

            // Sync with Clusters if cluster assignment changes
            if (updates.cluster !== undefined && updates.cluster !== user.cluster) {
                if (user.cluster) {
                    setClusters(cPrev => cPrev.map(c => c.name === user.cluster ? { ...c, head: '' } : c));
                }
                if (updates.cluster) {
                    setClusters(cPrev => cPrev.map(c => c.name === updates.cluster ? { ...c, head: user.name } : c));
                }
            }

            return prev.map(u => u.id === id ? { ...u, ...updates } : u);
        });
    }, []);

    const toggleUserStatus = useCallback((id) => {
        setUsers(prev => {
            const user = prev.find(u => u.id === id);
            const newStatus = user?.status === 'Active' ? 'Inactive' : 'Active';
            
            if (newStatus === 'Inactive') {
                // Clear site head assignments
                setSites(sPrev => sPrev.map(s => s.siteHead === user?.name ? { ...s, siteHead: '' } : s));
                // Clear cluster head assignments
                setClusters(cPrev => cPrev.map(c => c.head === user?.name ? { ...c, head: '' } : c));
                
                addNotification({
                    icon: '🚫',
                    message: `User ${user?.name} deactivated. Head office assignments cleared.`,
                    targetSite: user?.site,
                    targetCluster: user?.cluster
                });
            } else if (user) {
                // Restore site head assignments
                if (user.site) {
                    setSites(sPrev => sPrev.map(s => s.name === user.site ? { ...s, siteHead: user.name } : s));
                }
                // Restore cluster head assignments
                if (user.cluster) {
                    setClusters(cPrev => cPrev.map(c => c.name === user.cluster ? { ...c, head: user.name } : c));
                }
                
                addNotification({
                    icon: '✅',
                    message: `User ${user.name} activated. Head office assignments restored.`,
                    targetSite: user.site,
                    targetCluster: user.cluster
                });
            }
            
            return prev.map(u => u.id === id ? { ...u, status: newStatus } : u);
        });
    }, [addNotification]);

    const deleteUser = useCallback((id) => {
        setUsers(prev => {
            const user = prev.find(u => u.id === id);
            if (user) {
                setSites(sPrev => sPrev.map(s => s.siteHead === user.name ? { ...s, siteHead: '' } : s));
                setClusters(cPrev => cPrev.map(c => c.head === user.name ? { ...c, head: '' } : c));
            }
            return prev.filter(u => u.id !== id);
        });
    }, []);

    // --- Submissions ---
    const addSubmission = useCallback((sub) => {
        const id = String(Date.now());
        setSubmissions(prev => [...prev, { ...sub, id }]);
        addNotification({
            icon: '📤',
            message: `New evidence submitted for ${sub.site}: ${sub.element}`,
            targetSite: sub.site,
            targetCluster: sub.cluster
        });
    }, [addNotification]);

    const updateSubmission = useCallback((id, updates) => {
        setSubmissions(prev => {
            const current = prev.find(s => s.id === id);
            if (current && updates.status && updates.status !== current.status) {
                addNotification({
                    icon: updates.status === 'APPROVED' ? '✅' : '❌',
                    message: `Evidence for ${current.site} (${current.element}) has been ${updates.status.toLowerCase()}`,
                    targetSite: current.site,
                    targetCluster: current.cluster
                });
            }
            return prev.map(s => s.id === id ? { ...s, ...updates } : s);
        });
    }, [addNotification]);

    const deleteSubmission = useCallback((id) => {
        setSubmissions(prev => prev.filter(s => s.id !== id));
    }, []);

    // --- Sites ---
    const addSite = useCallback((site) => {
        setSites(prev => [...prev, { ...site, id: String(Date.now()) }]);
    }, []);

    const updateSite = useCallback((id, updates) => {
        setSites(prev => {
            const site = prev.find(s => s.id === id);
            // If head is changing, update users
            if (updates.siteHead !== undefined && updates.siteHead !== site.siteHead) {
                setUsers(uPrev => uPrev.map(u => {
                    if (u.name === updates.siteHead) return { ...u, site: site.name, role: 'SITE_HEAD' };
                    if (u.name === site.siteHead) return { ...u, site: '' };
                    return u;
                }));
            }
            return prev.map(s => s.id === id ? { ...s, ...updates } : s);
        });
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
        setClusters(prev => {
            const cluster = prev.find(c => c.id === id);
            if (updates.head !== undefined && updates.head !== cluster.head) {
                setUsers(uPrev => uPrev.map(u => {
                    if (u.name === updates.head) return { ...u, cluster: cluster.name, role: 'CLUSTER_HEAD' };
                    if (u.name === cluster.head) return { ...u, cluster: '' };
                    return u;
                }));
            }
            return prev.map(c => c.id === id ? { ...c, ...updates } : c);
        });
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
        const id = String(Date.now());
        const ticketId = `TICK-${id}`;
        setTickets(prev => [...prev, { ...ticket, id, ticketId }]);
        addNotification({
            icon: '🎫',
            message: `New ticket ${ticketId} created for ${ticket.site}`,
            targetSite: ticket.site,
            targetCluster: ticket.cluster
        });
    }, [addNotification]);

    const updateTicket = useCallback((id, updates) => {
        setTickets(prev => {
            const current = prev.find(t => t.id === id);
            if (current && updates.status && updates.status !== current.status) {
                addNotification({
                    icon: '🎫',
                    message: `Ticket ${current.ticketId} for ${current.site} status changed to ${updates.status}`,
                    targetSite: current.site,
                    targetCluster: current.cluster
                });
            }
            return prev.map(t => t.id === id ? { ...t, ...updates } : t);
        });
    }, [addNotification]);



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
    const getSiteScoreDetails = useCallback((siteId, siteName, monthStr) => {
        const activeElements = scoringElements.filter(e => e.active);

        let totalWeightedScore = 0;
        let totalWeight = 0;

        // Elements 1-8 (Positive)
        activeElements.filter(e => e.number <= 8).forEach(el => {
            const subs = submissions.filter(s => s.site === siteName && s.elementNumber === el.number && s.month === monthStr);
            const awarded = subs.filter(s => s.status === 'APPROVED').reduce((a, s) => a + (s.marksAwarded || 0), 0);

            let performancePct = el.maxMarks > 0 ? (awarded / el.maxMarks) : 0;
            totalWeightedScore += performancePct * el.weightage;
            totalWeight += el.weightage;
        });

        const totalPositive = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

        // Element 9 (Negative Incidents)
        let totalNegative = 0;
        const incidentElement = activeElements.find(e => e.number === 9);
        if (incidentElement) {
            const incidents = submissions.filter(s => s.site === siteName && s.elementNumber === 9 && s.month === monthStr);
            totalNegative = incidents.reduce((a, s) => a + Math.abs(s.marksAwarded || 0), 0);
        }

        // Allow scores to drop below 0
        const score = totalPositive - totalNegative;

        return {
            score: parseFloat(score.toFixed(1)),
            totalPositive: parseFloat(totalPositive.toFixed(1)),
            totalNegative: parseFloat(totalNegative.toFixed(1))
        };
    }, [scoringElements, submissions]);

    const getSiteScore = useCallback((siteId, siteName, monthStr) => {
        return getSiteScoreDetails(siteId, siteName, monthStr).score;
    }, [getSiteScoreDetails]);

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
            const details = getSiteScoreDetails(site.id, site.name, monthStr);
            const score = details.score;
            const totalPositive = details.totalPositive;
            const totalNegative = details.totalNegative;

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
    }, [sites, months, getSiteScoreDetails]);

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
            let totalHistoryPositive = 0;
            let totalHistoryNegative = 0;

            const history = fyMonths.map((m, index) => {
                const details = getSiteScoreDetails(site.id, site.name, m);
                const score = details.score;
                totalHistoryScore += score;
                totalHistoryPositive += details.totalPositive;
                totalHistoryNegative += details.totalNegative;
                
                if (index === fyMonths.length - 1) currentMonthScore = score;
                if (index === fyMonths.length - 2) previousMonthScore = score;

                return { month: m.split(' ')[0], score };
            });

            const avgScore = parseFloat((totalHistoryScore / fyMonths.length).toFixed(1));
            const change = parseFloat((currentMonthScore - previousMonthScore).toFixed(1));
            const totalPositive = parseFloat((totalHistoryPositive / fyMonths.length).toFixed(1));
            const totalNegative = parseFloat((totalHistoryNegative / fyMonths.length).toFixed(1));

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
    }, [sites, months, getSiteScoreDetails]);

    const getPeriodLeaderboard = useCallback((startMonth, endMonth) => {
        const startIndex = months.indexOf(startMonth);
        const endIndex = months.indexOf(endMonth);
        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return [];

        const periodMonths = months.slice(startIndex, endIndex + 1);
        const activeSites = sites.filter(s => s.status === 'Active');

        let leaderboard = activeSites.map(site => {
            let totalScore = 0;
            let totalHistoryPositive = 0;
            let totalHistoryNegative = 0;

            const history = periodMonths.map(m => {
                const details = getSiteScoreDetails(site.id, site.name, m);
                const score = details.score;
                totalScore += score;
                totalHistoryPositive += details.totalPositive;
                totalHistoryNegative += details.totalNegative;
                return { month: m.split(' ')[0], score };
            });

            const avgScore = parseFloat((totalScore / periodMonths.length).toFixed(1));

            // For change, compare with the month before the start month
            let change = 0;
            if (startIndex > 0) {
                const prevScore = getSiteScore(site.id, site.name, months[startIndex - 1]);
                change = parseFloat((avgScore - prevScore).toFixed(1));
            }

            const totalPositive = parseFloat((totalHistoryPositive / periodMonths.length).toFixed(1));
            const totalNegative = parseFloat((totalHistoryNegative / periodMonths.length).toFixed(1));
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
    }, [sites, months, getSiteScoreDetails]);

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
            const score = parseFloat((c.totalScore / c.count).toFixed(1));
            const statuses = ['Excellent', 'Good', 'Needs Improvement'];
            const statusIndex = score > 75 ? 0 : score > 60 ? 1 : 2;

            // Get names of all sites in this cluster
            const clusterSitesNames = sites.filter(s => s.cluster === c.cluster && s.status === 'Active').map(s => s.name);

            return {
                id: c.cluster,
                cluster: c.cluster,
                score,
                siteNames: clusterSitesNames,
                totalPositive: parseFloat((c.totalPositive / c.count).toFixed(1)),
                totalNegative: parseFloat((c.totalNegative / c.count).toFixed(1)),
                change: parseFloat((c.totalChange / c.count).toFixed(1)),
                status: statuses[statusIndex],
                history: Object.keys(c.historySums).map(m => ({
                    month: m,
                    score: parseFloat((c.historySums[m] / c.count).toFixed(1))
                }))
            };
        });

        cLeaderboard.sort((a, b) => b.score - a.score);
        return cLeaderboard.map((l, i) => ({ ...l, rank: i + 1 }));
    }, [getLeaderboard, sites]);

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
