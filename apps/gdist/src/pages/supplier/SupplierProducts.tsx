import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import StatusBadge from "@/components/StatusBadge";
import { LayoutDashboard, Package, Upload, ShoppingCart, User } from "lucide-react";
import { supabase } from "@aurora/shared/supabase";
import type { StatusType } from "@/components/StatusBadge";

interface SupplierProduct {
  id: string;
  name: string;
  product_number: string | null;
  price_nok: number | null;
  stock_s: number | null;
  stock_m: number | null;
  stock_l: number | null;
  stock_xl: number | null;
  stock_xxl: number | null;
  status: StatusType;
  created_at: string;
}

const navItems = [
  { label: 'Dashboard', path: '/supplier/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Products', path: '/supplier/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Upload Price List', path: '/supplier/upload', icon: <Upload className="h-4 w-4" /> },
  { label: 'Orders', path: '/supplier/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Profile', path: '/supplier/profile', icon: <User className="h-4 w-4" /> },
];

const SupplierProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('products')
        .select('id, name, product_number, price_nok, stock_s, stock_m, stock_l, stock_xl, stock_xxl, status, created_at')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });
      setProducts(data ?? []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <PortalLayout navItems={navItems} portalName="Supplier Portal">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">{t('my_products')}</h1>
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('product_name')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('product_number')}</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">S</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">M</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">L</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">XL</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">XXL</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('price_nok')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground">
                    No products submitted yet.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-surface-elevated/50' : ''}`}>
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{p.product_number ?? '—'}</td>
                    <td className="p-3 text-right text-foreground">{p.stock_s ?? '—'}</td>
                    <td className="p-3 text-right text-foreground">{p.stock_m ?? '—'}</td>
                    <td className="p-3 text-right text-foreground">{p.stock_l ?? '—'}</td>
                    <td className="p-3 text-right text-foreground">{p.stock_xl ?? '—'}</td>
                    <td className="p-3 text-right text-foreground">{p.stock_xxl ?? '—'}</td>
                    <td className="p-3 text-right font-medium font-mono text-foreground">
                      {p.price_nok != null ? p.price_nok.toLocaleString() : '—'}
                    </td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
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

export default SupplierProducts;
