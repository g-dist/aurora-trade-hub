import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PortalLayout from "@/components/PortalLayout";
import { LayoutDashboard, Package, Upload, ShoppingCart, User, ImagePlus, X } from "lucide-react";
import { supabase } from "@aurora/shared/supabase";

const NOK_TO_CNY = 0.65;

interface FormState {
  name: string;
  product_number: string;
  category: string;
  price_nok: string;
  stock_s: string;
  stock_m: string;
  stock_l: string;
  stock_xl: string;
  stock_xxl: string;
  description: string;
}

const empty: FormState = {
  name: '',
  product_number: '',
  category: '',
  price_nok: '',
  stock_s: '0',
  stock_m: '0',
  stock_l: '0',
  stock_xl: '0',
  stock_xxl: '0',
  description: '',
};

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
const SIZE_KEYS = ['stock_s', 'stock_m', 'stock_l', 'stock_xl', 'stock_xxl'] as const;

const categories = ['Jackets', 'Insulation', 'Softshell', 'Down', 'Fleece', 'Running'];

const navItems = [
  { label: 'Dashboard', path: '/supplier/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Products', path: '/supplier/products', icon: <Package className="h-4 w-4" /> },
  { label: 'Upload Price List', path: '/supplier/upload', icon: <Upload className="h-4 w-4" /> },
  { label: 'Orders', path: '/supplier/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Profile', path: '/supplier/profile', icon: <User className="h-4 w-4" /> },
];

const SupplierUpload = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(empty);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the supplier record ID for the logged-in user
  useEffect(() => {
    const fetchSupplierId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setSupplierId(data.id);
    };
    fetchSupplierId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!supplierId) {
      setError('Supplier account not found. Contact your administrator.');
      setSubmitting(false);
      return;
    }

    // Upload image if selected
    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const filename = `${supplierId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, imageFile, { upsert: true });
      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);
      image_url = urlData.publicUrl;
    }

    const price_nok = parseFloat(form.price_nok) || 0;
    const price_cny = Math.round(price_nok * NOK_TO_CNY);

    const { error: insertError } = await supabase.from('products').insert([{
      name: form.name,
      product_number: form.product_number || null,
      category: form.category,
      price_nok,
      supplier_price_nok: price_nok,
      price_cny,
      price_range: `${price_nok.toLocaleString('nb-NO')} NOK`,
      stock_s: parseInt(form.stock_s) || 0,
      stock_m: parseInt(form.stock_m) || 0,
      stock_l: parseInt(form.stock_l) || 0,
      stock_xl: parseInt(form.stock_xl) || 0,
      stock_xxl: parseInt(form.stock_xxl) || 0,
      description: form.description,
      image_url,
      status: 'pending',
      supplier_id: supplierId,
    }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setForm(empty);
      clearImage();
    }
    setSubmitting(false);
  };

  const priceCNY = form.price_nok ? Math.round(parseFloat(form.price_nok) * NOK_TO_CNY) : null;

  return (
    <PortalLayout navItems={navItems} portalName="Supplier Portal">
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-foreground">{t('submit_product')}</h1>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-6">{t('products_reviewed')}</p>

          {success ? (
            <div className="rounded-xl border border-status-green/30 bg-status-green/10 p-6 text-center space-y-2">
              <p className="text-status-green font-semibold">Produkt sendt til gjennomgang!</p>
              <p className="text-sm text-muted-foreground">Adminteamet godkjenner det før det vises i katalogen.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                {t('submit_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1: Product name + Product number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('product_name')}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t('product_name_placeholder')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('product_number')}
                  </label>
                  <input
                    name="product_number"
                    value={form.product_number}
                    onChange={handleChange}
                    placeholder="f.eks. OLY-2024-001"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Category + Price in NOK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('category')}
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">{t('select_category')}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Pris (NOK)
                  </label>
                  <div className="relative">
                    <input
                      name="price_nok"
                      type="number"
                      min="0"
                      step="1"
                      value={form.price_nok}
                      onChange={handleChange}
                      required
                      placeholder="f.eks. 2200"
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors pr-24"
                    />
                    {priceCNY !== null && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        ≈ ¥{priceCNY.toLocaleString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Image upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Produktbilde
                </label>
                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-card border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Last opp bilde (valgfritt)
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Row 4: Stock per size grid */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Lager per størrelse
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((size, i) => (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <div className="w-full bg-muted/30 border border-border/60 rounded-lg py-1.5 text-center">
                        <span className="text-xs font-semibold text-muted-foreground">{size}</span>
                      </div>
                      <input
                        name={SIZE_KEYS[i]}
                        type="number"
                        min="0"
                        value={form[SIZE_KEYS[i]]}
                        onChange={handleChange}
                        className="w-full px-1 py-2 border border-border rounded-lg text-sm text-center bg-input text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('description')}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={t('description_placeholder')}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-status-red">{t('failed_to_submit')} {error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !supplierId}
                className="w-full py-2.5 bg-accent text-accent-foreground font-medium rounded-lg text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {submitting ? t('submitting') : t('submit_for_review')}
              </button>
            </form>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default SupplierUpload;
