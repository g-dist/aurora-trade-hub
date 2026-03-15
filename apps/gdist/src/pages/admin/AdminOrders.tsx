import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import StatusBadge from "@/components/StatusBadge";
import { LayoutDashboard, Users, UserCheck, Package, ShoppingCart, Warehouse, Settings } from "lucide-react";
import { adminOrders } from "@/lib/data/admin";

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Suppliers', path: '/admin/suppliers', icon: <Users className="h-4 w-4" /> },
  { label: 'Buyers', path: '/admin/buyers', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <Warehouse className="h-4 w-4" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

const AdminOrders = () => {
  const { t } = useTranslation();
  return (
    <PortalLayout navItems={navItems} portalName="Admin Portal" variant="admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">{t('all_orders')}</h1>
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('order_id')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('buyer')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('products')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('qty')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('cost_nok')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('sale_usd')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('margin')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('deposit_pct')}</th>
                <th className="text-right p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('balance')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('type')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('stock')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('shipping')}</th>
                <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider">{t('notes')}</th>
              </tr>
            </thead>
            <tbody>
              {adminOrders.map((o, i) => (
                <tr key={o.id} className={`border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-surface-elevated/50' : ''}`}>
                  <td className="p-2 font-mono font-medium text-foreground">{o.id}</td>
                  <td className="p-2 text-foreground">{o.buyer}</td>
                  <td className="p-2 text-muted-foreground">{o.products}</td>
                  <td className="p-2 text-right text-foreground">{o.qty}</td>
                  <td className="p-2 text-right font-mono text-foreground">{o.supplierCostNOK.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-foreground">¥{o.salePriceUSD.toLocaleString()}</td>
                  <td className="p-2 text-right font-medium text-foreground">{o.marginPct}%</td>
                  <td className="p-2 text-right text-foreground">{o.depositPaid}%</td>
                  <td className="p-2 text-right font-mono text-foreground">¥{o.balanceDueUSD.toLocaleString()}</td>
                  <td className="p-2 text-muted-foreground">{o.orderType}</td>
                  <td className="p-2"><StatusBadge status={o.stockStatus} /></td>
                  <td className="p-2"><StatusBadge status={o.shippingStatus} /></td>
                  <td className="p-2 text-muted-foreground">{o.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminOrders;
