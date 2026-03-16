import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface PortalLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  portalName: string;
  variant?: 'default' | 'admin';
  accentColor?: string;
}

const PortalLayout = ({ children, navItems, portalName, variant = 'default', accentColor }: PortalLayoutProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const portal = portalName.toLowerCase().includes('buyer')
    ? 'buyer'
    : portalName.toLowerCase().includes('supplier')
    ? 'supplier'
    : 'admin';

  const isActive = (path: string) => location.pathname === path;

  // Determine accent color based on portal
  const getAccent = () => {
    if (accentColor) return accentColor;
    if (portalName.includes('Supplier')) return 'hsl(217, 91%, 60%)'; // blue
    if (portalName.includes('Buyer')) return 'hsl(160, 84%, 39%)'; // green
    return 'hsl(263, 70%, 50%)'; // purple for admin
  };

  const accent = getAccent();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-50 h-full w-60 bg-sidebar flex flex-col transition-transform duration-200 border-r border-sidebar-border ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" variant="dark" />
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            <p className="text-xs text-sidebar-foreground/50 font-medium">{portalName}</p>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 mx-2 rounded-lg ${
                isActive(item.path)
                  ? 'text-foreground bg-sidebar-accent'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
              style={isActive(item.path) ? { borderLeft: `2px solid ${accent}` } : { borderLeft: '2px solid transparent' }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-foreground text-xs font-semibold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium truncate">User</p>
              <p className="text-[10px] text-muted-foreground truncate">user@company.com</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 px-2">
            <LogOut className="h-3.5 w-3.5" />
            {t('sign_out')}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card h-14 flex items-center px-4 md:px-6 shrink-0 border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-foreground mr-3">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-foreground font-medium text-sm">{portalName}</h2>
          <div className="ml-auto mr-16">
            <Logo className="h-5 w-auto" variant="dark" />
          </div>
          <LanguageSwitcher portal={portal} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
