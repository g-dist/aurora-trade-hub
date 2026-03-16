import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";

// Buyer
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import BuyerCatalogue from "@/pages/buyer/BuyerCatalogue";
import BuyerQuotes from "@/pages/buyer/BuyerQuotes";
import BuyerQuoteNew from "@/pages/buyer/BuyerQuoteNew";
import BuyerOrders from "@/pages/buyer/BuyerOrders";
import BuyerProfile from "@/pages/buyer/BuyerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <BrowserRouter>
        <Routes>
          <Route path="/buyer" element={<Login />} />
          <Route path="/" element={<Navigate to="/buyer" replace />} />

          {/* Buyer Portal */}
          <Route element={<ProtectedRoute role="buyer" loginPath="/buyer" />}>
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/catalogue" element={<BuyerCatalogue />} />
            <Route path="/buyer/quotes" element={<BuyerQuotes />} />
            <Route path="/buyer/quotes/new" element={<BuyerQuoteNew />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
