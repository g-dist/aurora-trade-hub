import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import StatusBadge from "@/components/StatusBadge";
import { LayoutDashboard, Users, UserCheck, Package, ShoppingCart, Warehouse, Settings } from "lucide-react";
import { supabase } from "@aurora/shared/supabase";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_range: string;
  status: 'pending' | 'active' | 'in-stock' | 'low-stock' | 'on-order' | 'pre-order' | 'rejected';
  created_at: string;
}

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Suppliers', path: '/admin/suppliers', icon: <Users className="h-4 w-4" /> },
  { label: 'Buyers', path: '/admin/buyers', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <Warehouse className="h-4 w-4" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

const AdminProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setError(error.message);
      else setProducts(data ?? []);
      setLoading(false);
    });
  }, []);

  const approveProduct = async (id: string) => {
    await supabase.from('products').update({ status: 'active' }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'active' as const } : p));
  };

  const rejectProduct = async (id: string) => {
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p));
  };

  return (
    <PortalLayout navItems={navItems} portalName="Admin Portal" variant="admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">{t('master_product_list')}</h1>

        {error && (
          <div className="rounded-xl border border-status-red/30 bg-status-red/10 p-4 text-sm text-status-red">
            {t('failed_load_products')} {error}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('product')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('brand')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('category')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('price_range')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('status')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-surface-elevated/50' : ''}`}>
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.brand ?? '—'}</td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 text-foreground">{p.price_range}</td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
                    <td className="p-3 flex gap-3">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveProduct(p.id)}
                            className="text-xs text-status-green hover:text-status-green/80 font-medium transition-colors"
                          >
                            {t('approve')}
                          </button>
                          <button
                            onClick={() => rejectProduct(p.id)}
                            className="text-xs text-status-red hover:text-status-red/80 font-medium transition-colors"
                          >
                            {t('reject')}
                          </button>
                        </>
                      )}
                      <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">{t('edit')}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminProducts;
