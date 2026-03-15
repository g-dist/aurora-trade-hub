import { Outlet, Navigate } from "react-router-dom";
import useUserRole from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  role: 'admin' | 'supplier' | 'buyer';
  loginPath: string;
}

const ProtectedRoute = ({ role, loginPath }: ProtectedRouteProps) => {
  const { role: userRole, loading } = useUserRole();

  if (loading) return null;
  if (userRole === null) return <Navigate to={loginPath} replace />;
  if (userRole !== role) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
