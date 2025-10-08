import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LearnerPortal from "./pages/LearnerPortal";
import TrackDashboard from "./pages/TrackDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGate from "./pages/AdminGate";
import HealthcareAgentsHub from "./pages/HealthcareAgentsHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learner" element={<LearnerPortal />} />
          <Route path="/track/:id" element={<ErrorBoundary><TrackDashboard /></ErrorBoundary>} />
          <Route path="/healthcare/agents" element={<ErrorBoundary><HealthcareAgentsHub /></ErrorBoundary>} />
          <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
