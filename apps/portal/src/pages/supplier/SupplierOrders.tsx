import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import StatusBadge from "@/components/StatusBadge";
import { LayoutDashboard, Package, Upload, ShoppingCart, User } from "lucide-react";
import { supplierOrders } from "@/lib/data/supplier";

const navItems = [
  { label: 'Dashboard', path: '/supplier/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Products', path: '/supplier/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Upload Price List', path: '/supplier/upload', icon: <Upload className="h-4 w-4" /> },
  { label: 'Orders', path: '/supplier/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Profile', path: '/supplier/profile', icon: <User className="h-4 w-4" /> },
];

const SupplierOrders = () => {
  const { t } = useTranslation();
  return (
    <PortalLayout navItems={navItems} portalName="Supplier Portal">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">{t('orders')}</h1>
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('order_id')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('product')}</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('qty')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('buyer_ref')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('order_date')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('status')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('payment_terms_col')}</th>
              </tr>
            </thead>
            <tbody>
              {supplierOrders.map((o, i) => (
                <tr key={o.id} className={`border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-surface-elevated/50' : ''}`}>
                  <td className="p-3 font-mono text-xs font-medium text-foreground">{o.id}</td>
                  <td className="p-3 text-foreground">{o.product}</td>
                  <td className="p-3 text-right text-foreground">{o.qty}</td>
                  <td className="p-3 text-muted-foreground">{o.buyerRef}</td>
                  <td className="p-3 text-muted-foreground">{o.orderDate}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 text-muted-foreground">{o.paymentTerms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
};

export default SupplierOrders;
