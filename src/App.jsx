import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AppShell from "./components/layout/AppShell";
import PrivateRoute from "./components/layout/PrivateRoute";

// HO pages
import HODashboard from "./pages/ho/Dashboard";
import SiteManagement from "./pages/ho/SiteManagement";
import ClusterManagement from "./pages/ho/ClusterManagement";
import UserManagement from "./pages/ho/UserManagement";
import ScoringConfig from "./pages/ho/ScoringConfig";
import QuarterManagement from "./pages/ho/QuarterManagement";

// Cluster pages
import ClusterDashboard from "./pages/cluster/Dashboard";
import EvidenceValidation from "./pages/cluster/EvidenceValidation";
import QuizBuilder from "./pages/cluster/QuizBuilder";
import AuditReports from "./pages/cluster/AuditReports";

// Site pages
import SiteDashboard from "./pages/site/Dashboard";
import SubmitEvidence from "./pages/site/SubmitEvidence";
import SiteQuizzes from "./pages/site/Quizzes";
import SitePerformance from "./pages/site/Performance";

// Shared pages
import Leaderboard from "./pages/shared/Leaderboard";
import Tickets from "./pages/shared/Tickets";
import Notifications from "./pages/shared/Notifications";

const queryClient = new QueryClient();

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    HEAD_OFFICE: '/dashboard/ho',
    CLUSTER_HEAD: '/dashboard/cluster',
    SITE_HEAD: '/dashboard/site',
  };
  return <Navigate to={routes[user.role]} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RoleRedirect />} />
              <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
                {/* HO */}
                <Route path="/dashboard/ho" element={<HODashboard />} />
                <Route path="/dashboard/ho/sites" element={<SiteManagement />} />
                <Route path="/dashboard/ho/clusters" element={<ClusterManagement />} />
                <Route path="/dashboard/ho/users" element={<UserManagement />} />
                <Route path="/dashboard/ho/scoring" element={<ScoringConfig />} />
                <Route path="/dashboard/ho/quarters" element={<QuarterManagement />} />
                {/* Cluster */}
                <Route path="/dashboard/cluster" element={<ClusterDashboard />} />
                <Route path="/dashboard/cluster/validation" element={<EvidenceValidation />} />
                <Route path="/dashboard/cluster/quizzes" element={<QuizBuilder />} />
                <Route path="/dashboard/cluster/audits" element={<AuditReports />} />
                {/* Site */}
                <Route path="/dashboard/site" element={<SiteDashboard />} />
                <Route path="/dashboard/site/evidence" element={<SubmitEvidence />} />
                <Route path="/dashboard/site/quizzes" element={<SiteQuizzes />} />
                <Route path="/dashboard/site/performance" element={<SitePerformance />} />
                {/* Shared */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
