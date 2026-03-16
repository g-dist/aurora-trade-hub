import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Supplier
import SupplierDashboard from "@/pages/supplier/SupplierDashboard";
import SupplierProducts from "@/pages/supplier/SupplierProducts";
import SupplierUpload from "@/pages/supplier/SupplierUpload";
import SupplierOrders from "@/pages/supplier/SupplierOrders";
import SupplierProfile from "@/pages/supplier/SupplierProfile";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSuppliers from "@/pages/admin/AdminSuppliers";
import AdminBuyers from "@/pages/admin/AdminBuyers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Supplier Portal */}
          <Route element={<ProtectedRoute role="supplier" loginPath="/login" />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/products" element={<SupplierProducts />} />
            <Route path="/supplier/upload" element={<SupplierUpload />} />
            <Route path="/supplier/orders" element={<SupplierOrders />} />
            <Route path="/supplier/profile" element={<SupplierProfile />} />
          </Route>

          {/* Admin Portal */}
          <Route element={<ProtectedRoute role="admin" loginPath="/login" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/suppliers" element={<AdminSuppliers />} />
            <Route path="/admin/buyers" element={<AdminBuyers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
