import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Aurora from "@/components/Aurora";
import Logo from "@/components/Logo";
import { supabase } from "@aurora/shared/supabase";

const roleRedirects: Record<string, string> = {
  admin: '/admin/dashboard',
  supplier: '/supplier/dashboard',
};

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !session) {
      setError(authError?.message ?? 'Login failed');
      setLoading(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleError || !roleData) {
      setError('Account has no role assigned. Contact your administrator.');
      setLoading(false);
      return;
    }

    const redirect = roleRedirects[roleData.role];
    if (!redirect) {
      setError(`Unknown role: ${roleData.role}`);
      setLoading(false);
      return;
    }

    navigate(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Photorealistic background */}
      <img
        src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay — 55% black */}
      <div className="absolute inset-0 bg-black/[0.55]" />

      {/* Blue / teal vignette on edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(6,182,212,0.08) 75%, rgba(6,182,212,0.18) 100%)",
        }}
      />

      {/* Subtle animated aurora blended on top */}
      <div className="absolute inset-0 opacity-25 mix-blend-screen">
        <Aurora />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="backdrop-blur-2xl bg-black/[0.55] rounded-2xl p-8 md:p-10 border border-white/[0.08] shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <Logo className="h-10 mx-auto mb-6 block" variant="dark" />
            <h1 className="text-lg font-semibold text-foreground tracking-wide">Sign In</h1>
            <p className="text-muted-foreground text-sm mt-1.5 font-light">
              You'll be redirected to your portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:bg-white/[0.06] focus:outline-none transition-all duration-200"
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:bg-white/[0.06] focus:outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-status-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="block w-full py-2.5 mt-2 bg-white/[0.06] text-white/85 font-medium rounded-lg text-center border border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.2] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm tracking-wide"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-8 tracking-wide">
          © 2026 Global Distribution AS
        </p>
      </div>
    </div>
  );
};

export default Landing;
