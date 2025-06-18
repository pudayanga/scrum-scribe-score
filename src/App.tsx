
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/PermissionGuard";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Statistics from "./pages/Statistics";
import PlayerTracking from "./pages/PlayerTracking";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      {user?.role === 'admin' && (
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      )}
      <Route path="/tournaments" element={
        <ProtectedRoute>
          <PermissionGuard page="tournaments">
            <Tournaments />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="/teams" element={
        <ProtectedRoute>
          <PermissionGuard page="teams">
            <Teams />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="/players" element={
        <ProtectedRoute>
          <PermissionGuard page="players">
            <Players />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="/matches" element={
        <ProtectedRoute>
          <PermissionGuard page="matches">
            <Matches />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="/statistics" element={
        <ProtectedRoute>
          <PermissionGuard page="statistics">
            <Statistics />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="/player-tracking" element={
        <ProtectedRoute>
          <PermissionGuard page="player_tracking">
            <PlayerTracking />
          </PermissionGuard>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
