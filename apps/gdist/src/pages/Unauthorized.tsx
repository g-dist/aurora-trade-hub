import { Link } from "react-router-dom";
import Aurora from "@/components/Aurora";
import Logo from "@/components/Logo";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
    <Aurora />
    <div className="relative z-10 text-center px-6">
      <Logo className="h-10 mx-auto mb-6" variant="dark" />
      <p className="text-status-red text-xs uppercase tracking-widest font-semibold mb-3">Access Denied</p>
      <h1 className="text-3xl font-bold text-foreground mb-3">Unauthorized</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
        Your account doesn't have permission to access this portal.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all duration-150"
      >
        Back to Home
      </Link>
    </div>
  </div>
);

export default Unauthorized;
