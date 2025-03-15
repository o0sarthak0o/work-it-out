
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkoutDetail from "./pages/WorkoutDetail";
import WorkoutSession from "./pages/WorkoutSession";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { WorkoutProvider } from "./context/WorkoutContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WorkoutProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workout/:workoutId" element={<WorkoutDetail />} />
              <Route path="/workout/:workoutId/session" element={<WorkoutSession />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WorkoutProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
