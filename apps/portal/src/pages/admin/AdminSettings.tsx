import { useState } from "react";
import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import { LayoutDashboard, Users, UserCheck, Package, ShoppingCart, Warehouse, Settings, UserPlus } from "lucide-react";
import { adminTeam } from "@/lib/data/admin";
import { supabase } from "@aurora/shared/supabase";

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Suppliers', path: '/admin/suppliers', icon: <Users className="h-4 w-4" /> },
  { label: 'Buyers', path: '/admin/buyers', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <Warehouse className="h-4 w-4" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

const roleColors: Record<string, string> = {
  'Managing Director': 'bg-primary/15 text-primary',
  'Director of Operations and Strategy': 'bg-status-blue/15 text-status-blue',
  'Asia Relations Manager': 'bg-status-green/15 text-status-green',
};

const INVITE_ROLES = [
  'Admin',
  'Managing Director',
  'Supplier Manager',
  'Buyer Relations',
  'Read Only',
];

const AdminSettings = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(INVITE_ROLES[0]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('user_roles')
      .insert({ email, role });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setEmail('');
      setRole(INVITE_ROLES[0]);
    }
  };

  return (
    <PortalLayout navItems={navItems} portalName="Admin Portal" variant="admin">
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-foreground">{t('settings')}</h1>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">{t('team_members')}</h2>
          </div>
          <div className="divide-y divide-border">
            {adminTeam.map((m) => (
              <div key={m.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center text-foreground font-semibold text-sm border border-border">
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[m.role] || 'bg-muted text-muted-foreground'}`}>
                      {m.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 max-w-md">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> {t('invite_team_member')}
          </h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5 font-medium">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="team@globaldistribution.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5 font-medium">{t('role')}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {status === 'error' && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}
            {status === 'success' && (
              <p className="text-sm text-status-green">{t('invite_saved')}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:brightness-110 transition-all duration-150 disabled:opacity-50"
            >
              {status === 'loading' ? t('saving') : t('send_invite')}
            </button>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminSettings;
