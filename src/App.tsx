
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Statistics from "./pages/Statistics";
import PlayerTracking from "./pages/PlayerTracking";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

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
      <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
      <Route path="/player-tracking" element={<ProtectedRoute><PlayerTracking /></ProtectedRoute>} />
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
