import { useState } from "react";
import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import { LayoutDashboard, Users, UserCheck, Package, ShoppingCart, Warehouse, Settings, LayoutGrid, List } from "lucide-react";
import { adminInventory } from "@/lib/data/admin";

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Suppliers', path: '/admin/suppliers', icon: <Users className="h-4 w-4" /> },
  { label: 'Buyers', path: '/admin/buyers', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <Warehouse className="h-4 w-4" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

const stages = ['At Supplier', 'At Sandefjord Warehouse', 'In Transit / With Jessica'] as const;

const AdminInventory = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  return (
    <PortalLayout navItems={navItems} portalName="Admin Portal" variant="admin">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{t('inventory')}</h1>
          <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-md text-sm transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-md text-sm transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === 'kanban' ? (
          <div className="grid md:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <div key={stage} className="bg-card rounded-xl border border-border">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold text-foreground text-sm">{stage}</h3>
                  <span className="text-xs text-muted-foreground">
                    {adminInventory.filter(i => i.stage === stage).length} {t('items')}
                  </span>
                </div>
                <div className="p-2 space-y-2">
                  {adminInventory.filter(i => i.stage === stage).map((item) => (
                    <div key={item.id} className="bg-surface-elevated rounded-lg p-3 text-sm space-y-1 border border-border/50 hover:-translate-y-px transition-all duration-150">
                      <p className="font-medium text-foreground">{item.product}</p>
                      <p className="text-xs text-muted-foreground">{t('qty')}: {item.qty} · {item.supplier}</p>
                      <p className="text-xs text-muted-foreground">Entered: {item.dateEntered}</p>
                      <p className="text-xs text-muted-foreground">Next move: {item.estNextMove}</p>
                      {item.notes && <p className="text-xs text-accent">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('product')}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('qty')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('supplier')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('stage')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('date_entered')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('est_next_move')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('notes')}</th>
                </tr>
              </thead>
              <tbody>
                {adminInventory.map((item, i) => (
                  <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-surface-elevated/50' : ''}`}>
                    <td className="p-3 font-medium text-foreground">{item.product}</td>
                    <td className="p-3 text-right text-foreground">{item.qty}</td>
                    <td className="p-3 text-muted-foreground">{item.supplier}</td>
                    <td className="p-3 text-muted-foreground">{item.stage}</td>
                    <td className="p-3 text-muted-foreground">{item.dateEntered}</td>
                    <td className="p-3 text-muted-foreground">{item.estNextMove}</td>
                    <td className="p-3 text-muted-foreground text-xs">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminInventory;
