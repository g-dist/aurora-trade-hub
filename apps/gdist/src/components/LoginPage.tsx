import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Aurora from "@/components/Aurora";
import Logo from "@/components/Logo";
import { supabase } from "@aurora/shared/supabase";

interface LoginPageProps {
  portalName: string;
  dashboardPath: string;
  accentText?: string;
  requireAuth?: boolean;
}

const LoginPage = ({ portalName, dashboardPath, accentText, requireAuth }: LoginPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth) {
      navigate(dashboardPath);
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate(dashboardPath);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <Aurora />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl p-8 border border-white/[0.08]">
          <div className="text-center mb-8">
            <Logo className="h-10 mx-auto mb-4" variant="dark" />
            <h1 className="text-xl font-bold text-foreground">{portalName}</h1>
            {accentText && <p className="text-muted-foreground text-sm mt-1">{accentText}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm block mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm block mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-status-red">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="block w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 text-sm"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
          <Link to="/" className="block text-center text-muted-foreground text-xs mt-6 hover:text-foreground transition-colors duration-150">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
