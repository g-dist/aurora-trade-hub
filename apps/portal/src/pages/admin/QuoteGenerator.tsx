import { useState, useEffect, useRef, useCallback } from 'react';
import PortalLayout from '@/components/PortalLayout';
import {
  LayoutDashboard, Users, UserCheck, Package, ShoppingCart,
  Warehouse, Settings, FileText, Plus, Trash2, Printer,
  Copy, Save, ChevronDown, Search,
} from 'lucide-react';
import { supabase } from '@aurora/shared/supabase';
import { formatUSD } from '@aurora/shared/currency';
import {
  calculateMargin, buildLineItem, recalcItem, quoteTotal, blendedMargin,
  NOK_USD_RATE, type BuyerSegment, type QuoteLanguage, type QuoteLineItem,
} from '@/lib/quoteEngine';
import { STRINGS, validUntilDate, followUpDate, generateObsidianMarkdown } from '@/lib/quoteTemplates';

const navItems = [
  { label: 'Dashboard',       path: '/admin/dashboard',   icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Suppliers',       path: '/admin/suppliers',   icon: <Users className="h-4 w-4" /> },
  { label: 'Buyers',          path: '/admin/buyers',      icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Products',        path: '/admin/products',    icon: <Package className="h-4 w-4" /> },
  { label: 'Quote Generator', path: '/admin/quotes/new',  icon: <FileText className="h-4 w-4" /> },
  { label: 'Orders',          path: '/admin/orders',      icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Inventory',       path: '/admin/inventory',   icon: <Warehouse className="h-4 w-4" /> },
  { label: 'Settings',        path: '/admin/settings',    icon: <Settings className="h-4 w-4" /> },
];

interface ProductOption {
  id: string;
  name: string;
  category: string;
  price_nok: number | null;
  supplier_price_nok: number | null;
}

const SEGMENTS: { value: BuyerSegment; label: string; desc: string }[] = [
  { value: 'new',         label: 'New buyer',         desc: 'First order — base margin 28%' },
  { value: 'active',      label: 'Active buyer',       desc: '1–4 orders — base margin 22%' },
  { value: 'established', label: 'Established buyer',  desc: '5+ orders — base margin 18%' },
  { value: 'vip',         label: 'VIP buyer',          desc: 'Strategic partner — base margin 15%' },
];

const LANGUAGES: { value: QuoteLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English',  flag: '🇬🇧' },
  { value: 'no', label: 'Norsk',    flag: '🇳🇴' },
  { value: 'cn', label: '中文',     flag: '🇨🇳' },
];

const COUNTRIES = [
  { code: 'CN', name: 'China' }, { code: 'HK', name: 'Hong Kong' },
  { code: 'KR', name: 'South Korea' }, { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' }, { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' }, { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malaysia' }, { code: 'ID', name: 'Indonesia' },
  { code: 'AU', name: 'Australia' }, { code: 'NO', name: 'Norway' },
  { code: 'SE', name: 'Sweden' }, { code: 'DE', name: 'Germany' },
  { code: 'OTHER', name: 'Other' },
];

function nextId() { return Math.random().toString(36).slice(2, 9); }

const today = new Date().toISOString().slice(0, 10);

export default function QuoteGenerator() {
  // Buyer info
  const [buyerName, setBuyerName]       = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerCountry, setBuyerCountry] = useState('CN');
  const [segment, setSegment]           = useState<BuyerSegment>('new');
  const [language, setLanguage]         = useState<QuoteLanguage>('en');

  // Line items
  const [items, setItems]               = useState<QuoteLineItem[]>([]);
  const [globalMarginOverride, setGlobalMarginOverride] = useState<string>('');

  // Product search
  const [products, setProducts]         = useState<ProductOption[]>([]);
  const [search, setSearch]             = useState('');
  const [searchOpen, setSearchOpen]     = useState(false);
  const searchRef                       = useRef<HTMLDivElement>(null);

  // Quote settings
  const [deliveryWeeks, setDeliveryWeeks] = useState(6);
  const [notes, setNotes]               = useState('');
  const [followUp, setFollowUp]         = useState(followUpDate(7));

  // State
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [quoteNumber, setQuoteNumber]   = useState('QUO-…');

  // Fetch products on mount
  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, category, price_nok, supplier_price_nok')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => setProducts(data ?? []));

    // Get next quote number
    supabase.rpc('next_quote_number').then(({ data }) => {
      if (data) setQuoteNumber(data as string);
    });
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Computed margin
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const autoMargin = calculateMargin({ segment, totalUnits, buyerCountry });
  const effectiveMargin = globalMarginOverride !== ''
    ? Math.min(0.5, Math.max(0.05, parseFloat(globalMarginOverride) / 100))
    : autoMargin;

  const total = quoteTotal(items);
  const blended = blendedMargin(items);
  const s = STRINGS[language];

  // Recompute all items when margin changes
  const applyGlobalMargin = useCallback((marginPct: number) => {
    setItems(prev => prev.map(item => recalcItem(item, marginPct)));
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      applyGlobalMargin(effectiveMargin);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMargin]);

  // Add product from search
  const addProduct = (p: ProductOption) => {
    const cost = p.supplier_price_nok ?? p.price_nok ?? 0;
    const item = buildLineItem(nextId(), p.id, p.name, cost, 1, effectiveMargin);
    setItems(prev => [...prev, item]);
    setSearch('');
    setSearchOpen(false);
  };

  const addManual = () => {
    const item = buildLineItem(nextId(), null, 'New product', 0, 1, effectiveMargin);
    setItems(prev => [...prev, item]);
  };

  const updateItem = (id: string, field: keyof QuoteLineItem, raw: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === 'productName') return { ...item, productName: raw };
      if (field === 'quantity') {
        const q = Math.max(1, parseInt(raw) || 1);
        return buildLineItem(item.id, item.productId, item.productName, item.supplierCostNok, q, item.marginPct);
      }
      if (field === 'supplierCostNok') {
        const cost = parseFloat(raw) || 0;
        return buildLineItem(item.id, item.productId, item.productName, cost, item.quantity, item.marginPct);
      }
      if (field === 'marginPct') {
        const m = Math.min(0.5, Math.max(0.05, (parseFloat(raw) || 0) / 100));
        return recalcItem(item, m);
      }
      if (field === 'unitPriceUsd') {
        const price = parseFloat(raw) || 0;
        const costUsd = item.supplierCostNok * NOK_USD_RATE;
        const derivedMargin = costUsd > 0 ? (price - costUsd) / price : item.marginPct;
        return { ...item, unitPriceUsd: price, totalUsd: Math.round(price * item.quantity * 100) / 100, marginPct: derivedMargin };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  // Filtered products for search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  // Save to Supabase
  const saveQuote = async () => {
    if (!items.length) { setError('Add at least one product'); return; }
    setSaving(true);
    setError(null);

    const { data: quoteData, error: qErr } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        status: 'sent',
        valid_until: validUntilDate(30),
        total_usd: total,
        buyer_name_override: buyerName,
        buyer_company: buyerCompany,
        buyer_country: buyerCountry,
        buyer_segment: segment,
        language,
        delivery_weeks: deliveryWeeks,
        nok_usd_rate: NOK_USD_RATE,
        margin_pct: blended * 100,
        notes,
        obsidian_followup_date: followUp,
      })
      .select('id')
      .single();

    if (qErr || !quoteData) {
      setError(qErr?.message ?? 'Failed to save quote');
      setSaving(false);
      return;
    }

    const lineRows = items.map(i => ({
      quote_id: quoteData.id,
      product_id: i.productId,
      product_name_override: i.productName,
      description: i.productName,
      quantity: i.quantity,
      unit_price_usd: i.unitPriceUsd,
      supplier_cost_nok: i.supplierCostNok,
      margin_pct: i.marginPct * 100,
    }));

    const { error: liErr } = await supabase.from('quote_items').insert(lineRows);
    if (liErr) { setError(liErr.message); setSaving(false); return; }

    setSaved(quoteNumber);
    setSaving(false);
  };

  // Copy Obsidian markdown
  const copyMarkdown = () => {
    const md = generateObsidianMarkdown({
      quoteNumber,
      date: today,
      buyerName,
      buyerCompany,
      buyerCountry,
      language,
      items: items.map(i => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPriceUsd: i.unitPriceUsd,
        totalUsd: i.totalUsd,
      })),
      totalUsd: total,
      marginPct: blended,
      deliveryWeeks,
      notes,
      followUp,
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print
  const print = () => window.print();

  return (
    <PortalLayout navItems={navItems} portalName="Admin Portal" variant="admin">
      {/* ── Screen layout ── */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quote Generator</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{quoteNumber} · {today}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy Obsidian MD'}
            </button>
            <button
              onClick={print}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / PDF
            </button>
            <button
              onClick={saveQuote}
              disabled={saving || !!saved}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:brightness-110 disabled:opacity-50 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? `Saved — ${saved}` : saving ? 'Saving…' : 'Save Quote'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-status-red/30 bg-status-red/10 px-4 py-2.5 text-sm text-status-red">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left: Form ── */}
          <div className="space-y-4">

            {/* Buyer */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Buyer</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                  <input
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Michael Chan"
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Company</label>
                  <input
                    value={buyerCompany}
                    onChange={e => setBuyerCompany(e.target.value)}
                    placeholder="SportsCo HK"
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Country</label>
                  <select
                    value={buyerCountry}
                    onChange={e => setBuyerCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none"
                  >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Segment</label>
                  <select
                    value={segment}
                    onChange={e => setSegment(e.target.value as BuyerSegment)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none"
                  >
                    {SEGMENTS.map(s => (
                      <option key={s.value} value={s.value} title={s.desc}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as QuoteLanguage)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Products</h2>
                <button
                  onClick={addManual}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Manual line
                </button>
              </div>

              {/* Product search */}
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search products…"
                    className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                {searchOpen && filteredProducts.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {filteredProducts.map(p => {
                      const cost = p.supplier_price_nok ?? p.price_nok ?? 0;
                      return (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <span className="text-foreground">{p.name}</span>
                          <span className="text-muted-foreground text-xs">{p.category} · NOK {cost.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchOpen && search.length > 1 && filteredProducts.length === 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-sm text-muted-foreground">
                    No products found — use Manual line
                  </div>
                )}
              </div>

              {/* Line items table */}
              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-1.5 font-medium text-muted-foreground">Product</th>
                        <th className="text-right pb-1.5 font-medium text-muted-foreground w-16">Qty</th>
                        <th className="text-right pb-1.5 font-medium text-muted-foreground w-24">Cost (NOK)</th>
                        <th className="text-right pb-1.5 font-medium text-muted-foreground w-16">Margin</th>
                        <th className="text-right pb-1.5 font-medium text-muted-foreground w-24">Price (USD)</th>
                        <th className="w-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 pr-2">
                            <input
                              value={item.productName}
                              onChange={e => updateItem(item.id, 'productName', e.target.value)}
                              className="w-full bg-transparent text-foreground focus:outline-none focus:bg-input px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="py-1.5 text-right">
                            <input
                              type="number" min="1"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-16 text-right bg-transparent text-foreground focus:outline-none focus:bg-input px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="py-1.5 text-right">
                            <input
                              type="number" min="0"
                              value={item.supplierCostNok || ''}
                              onChange={e => updateItem(item.id, 'supplierCostNok', e.target.value)}
                              placeholder="0"
                              className="w-24 text-right bg-transparent text-foreground focus:outline-none focus:bg-input px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="py-1.5 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <input
                                type="number" min="5" max="50" step="0.5"
                                value={(item.marginPct * 100).toFixed(1)}
                                onChange={e => updateItem(item.id, 'marginPct', e.target.value)}
                                className="w-12 text-right bg-transparent text-foreground focus:outline-none focus:bg-input px-1 py-0.5 rounded"
                              />
                              <span className="text-muted-foreground">%</span>
                            </div>
                          </td>
                          <td className="py-1.5 text-right">
                            <input
                              type="number" min="0" step="0.01"
                              value={item.unitPriceUsd.toFixed(2)}
                              onChange={e => updateItem(item.id, 'unitPriceUsd', e.target.value)}
                              className="w-24 text-right bg-transparent text-foreground focus:outline-none focus:bg-input px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="py-1.5">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-status-red transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Search for a product or add a manual line
                </p>
              )}
            </div>

            {/* Margin + Settings */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Margin &amp; Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Global margin override
                    </label>
                    <span className="text-[10px] text-muted-foreground">Auto: {(autoMargin * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min="5" max="50" step="0.5"
                      value={globalMarginOverride}
                      onChange={e => setGlobalMarginOverride(e.target.value)}
                      placeholder={`${(autoMargin * 100).toFixed(1)}`}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Delivery (weeks)
                  </label>
                  <input
                    type="number" min="1" max="52"
                    value={deliveryWeeks}
                    onChange={e => setDeliveryWeeks(parseInt(e.target.value) || 6)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Follow-up date
                  </label>
                  <input
                    type="date"
                    value={followUp}
                    onChange={e => setFollowUp(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Notes
                  </label>
                  <input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special conditions…"
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Margin summary */}
              {items.length > 0 && (
                <div className="bg-surface-elevated rounded-lg p-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Units</p>
                    <p className="text-sm font-semibold text-foreground">{totalUnits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Blended margin</p>
                    <p className="text-sm font-semibold text-foreground">{(blended * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                    <p className="text-sm font-semibold text-foreground">{formatUSD(total)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
              <span className="text-xs text-muted-foreground">{LANGUAGES.find(l => l.value === language)?.flag} {language.toUpperCase()}</span>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(100vh-220px)]">
              <QuotePreview
                quoteNumber={quoteNumber}
                date={today}
                buyerName={buyerName}
                buyerCompany={buyerCompany}
                buyerCountry={buyerCountry}
                items={items}
                deliveryWeeks={deliveryWeeks}
                notes={notes}
                strings={s}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Print view — hidden on screen, shown when printing ── */}
      <div className="hidden print:block">
        <QuotePreview
          quoteNumber={quoteNumber}
          date={today}
          buyerName={buyerName}
          buyerCompany={buyerCompany}
          buyerCountry={buyerCountry}
          items={items}
          deliveryWeeks={deliveryWeeks}
          notes={notes}
          strings={s}
          total={total}
          isPrint
        />
      </div>
    </PortalLayout>
  );
}

// ── Quote Preview Component ──────────────────────────────────
interface PreviewProps {
  quoteNumber: string;
  date: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  items: QuoteLineItem[];
  deliveryWeeks: number;
  notes: string;
  strings: ReturnType<typeof STRINGS[QuoteLanguage]>;
  total: number;
  isPrint?: boolean;
}

function QuotePreview({ quoteNumber, date, buyerName, buyerCompany, buyerCountry, items, deliveryWeeks, notes, strings: s, total, isPrint }: PreviewProps) {
  const countryName = COUNTRIES.find(c => c.code === buyerCountry)?.name ?? buyerCountry;
  const validUntil = validUntilDate(30);

  const cellClass = isPrint
    ? 'border border-gray-300 px-2 py-1.5 text-xs'
    : 'border border-border px-2 py-1.5 text-xs text-foreground';

  return (
    <div className={`font-sans text-sm leading-relaxed ${isPrint ? 'text-black bg-white p-8 min-h-screen' : 'text-foreground'}`}
         style={{ fontFamily: isPrint ? 'system-ui, -apple-system, sans-serif' : undefined }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-2xl font-bold tracking-tight mb-1">{s.quotation}</div>
          <div className={`text-xs ${isPrint ? 'text-gray-500' : 'text-muted-foreground'}`}>
            Global Distribution AS
          </div>
          <div className={`text-xs ${isPrint ? 'text-gray-500' : 'text-muted-foreground'}`}>
            Norway · europe@globaldistribution.no
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <div className="font-mono font-bold text-base">{quoteNumber}</div>
          <div className={`text-xs ${isPrint ? 'text-gray-600' : 'text-muted-foreground'}`}>
            {s.date}: {date}
          </div>
          <div className={`text-xs ${isPrint ? 'text-gray-600' : 'text-muted-foreground'}`}>
            {s.validUntil}: {validUntil}
          </div>
        </div>
      </div>

      {/* To/From */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPrint ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {s.to}
          </div>
          <div className="font-semibold">{buyerCompany || '—'}</div>
          <div className={isPrint ? 'text-gray-600 text-xs' : 'text-muted-foreground text-xs'}>
            {buyerName}{buyerName && ', '}{countryName}
          </div>
        </div>
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPrint ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {s.from}
          </div>
          <div className="font-semibold">Global Distribution AS</div>
          <div className={isPrint ? 'text-gray-600 text-xs' : 'text-muted-foreground text-xs'}>Norway, Europe</div>
        </div>
      </div>

      {/* Line items */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className={isPrint ? 'bg-gray-100' : 'bg-surface-elevated'}>
            <th className={`${cellClass} text-left font-semibold`}>{s.lineNo}</th>
            <th className={`${cellClass} text-left font-semibold`}>{s.description}</th>
            <th className={`${cellClass} text-right font-semibold`}>{s.quantity}</th>
            <th className={`${cellClass} text-right font-semibold`}>{s.unitPrice}</th>
            <th className={`${cellClass} text-right font-semibold`}>{s.total}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className={`${cellClass} text-center ${isPrint ? 'text-gray-400' : 'text-muted-foreground'}`}>
                —
              </td>
            </tr>
          ) : items.map((item, idx) => (
            <tr key={item.id}>
              <td className={`${cellClass} ${isPrint ? 'text-gray-500' : 'text-muted-foreground'}`}>{idx + 1}</td>
              <td className={cellClass}>{item.productName}</td>
              <td className={`${cellClass} text-right`}>{item.quantity.toLocaleString()}</td>
              <td className={`${cellClass} text-right font-mono`}>USD {item.unitPriceUsd.toFixed(2)}</td>
              <td className={`${cellClass} text-right font-mono`}>USD {item.totalUsd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} />
            <td className={`${cellClass} font-semibold`}>{s.shipping}</td>
            <td className={`${cellClass} text-right text-xs ${isPrint ? 'text-gray-500' : 'text-muted-foreground'}`}>
              {s.shippingValue}
            </td>
          </tr>
          <tr className={isPrint ? 'bg-gray-100' : 'bg-surface-elevated'}>
            <td colSpan={3} />
            <td className={`${cellClass} font-bold text-base`}>{s.grandTotal}</td>
            <td className={`${cellClass} text-right font-bold font-mono text-base`}>
              USD {total.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Terms */}
      <div className={`space-y-1 mb-6 text-xs ${isPrint ? 'text-gray-600' : 'text-muted-foreground'}`}>
        <div><span className="font-semibold">{s.paymentTerms}:</span> {s.paymentValue}</div>
        <div><span className="font-semibold">{s.delivery}:</span> {s.deliveryValue(deliveryWeeks)}</div>
        <div><span className="font-semibold">{s.origin}:</span> {s.originValue}</div>
        {notes && <div><span className="font-semibold">{s.notes}:</span> {notes}</div>}
      </div>

      {/* Closing */}
      <div className={`text-xs mb-8 ${isPrint ? 'text-gray-500' : 'text-muted-foreground'}`}>{s.closing}</div>

      {/* Signature */}
      <div className="mt-12 pt-4 border-t border-gray-300">
        <div className="font-semibold text-sm">{s.authorizedBy}</div>
        <div className={`text-xs mt-4 ${isPrint ? 'text-gray-400' : 'text-muted-foreground'}`}>
          {s.signatureLabel}: _________________________________
        </div>
      </div>
    </div>
  );
}
