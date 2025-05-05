
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkoutProvider } from "@/context/WorkoutContext";
import HomePage from "./pages/HomePage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import WorkoutPage from "./pages/WorkoutPage";
import SummaryPage from "./pages/SummaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkoutProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exercise" element={<ExerciseDetailPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
