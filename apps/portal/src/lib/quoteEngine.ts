// =============================================================
// quoteEngine.ts — Margin calculation for Quote Generator
// =============================================================

export type BuyerSegment = 'new' | 'active' | 'established' | 'vip';
export type QuoteLanguage = 'en' | 'no' | 'cn';

export interface QuoteLineItem {
  id: string;
  productId: string | null;
  productName: string;
  supplierCostNok: number;
  quantity: number;
  marginPct: number;       // 0–1, e.g. 0.22 = 22%
  unitPriceUsd: number;    // calculated sale price
  totalUsd: number;
}

export interface MarginInputs {
  segment: BuyerSegment;
  totalUnits: number;
  buyerCountry: string;
}

// NOK → USD exchange rate (update quarterly)
export const NOK_USD_RATE = 0.088;

// Base margin by segment
const BASE_MARGIN: Record<BuyerSegment, number> = {
  new:         0.28,
  active:      0.22,
  established: 0.18,
  vip:         0.15,
};

// Volume discount applied to total units in the quote
function volumeModifier(units: number): number {
  if (units >= 1000) return -0.06;
  if (units >= 500)  return -0.04;
  if (units >= 300)  return -0.02;
  if (units < 150)   return  0.02;
  return 0;
}

// Country/market premium
function countryModifier(country: string): number {
  const premiums: Record<string, number> = {
    JP: 0.03, KR: 0.03, AU: 0.03, NZ: 0.03,
    HK: 0.02, SG: 0.02, TW: 0.02,
    CN: 0.00, MY: 0.00, TH: 0.00, VN: 0.00, ID: 0.00,
  };
  return premiums[country.toUpperCase()] ?? 0.01;
}

export function calculateMargin(inputs: MarginInputs): number {
  const base = BASE_MARGIN[inputs.segment];
  const vol  = volumeModifier(inputs.totalUnits);
  const ctry = countryModifier(inputs.buyerCountry);
  return Math.max(0.10, Math.min(0.50, base + vol + ctry));
}

export function nokToUsd(nok: number, rate = NOK_USD_RATE): number {
  return nok * rate;
}

export function applyMargin(supplierCostNok: number, marginPct: number, rate = NOK_USD_RATE): number {
  const costUsd = nokToUsd(supplierCostNok, rate);
  return costUsd / (1 - marginPct);
}

export function buildLineItem(
  id: string,
  productId: string | null,
  productName: string,
  supplierCostNok: number,
  quantity: number,
  marginPct: number,
): QuoteLineItem {
  const unitPriceUsd = Math.ceil(applyMargin(supplierCostNok, marginPct) * 100) / 100;
  return {
    id,
    productId,
    productName,
    supplierCostNok,
    quantity,
    marginPct,
    unitPriceUsd,
    totalUsd: Math.round(unitPriceUsd * quantity * 100) / 100,
  };
}

export function recalcItem(item: QuoteLineItem, newMarginPct: number): QuoteLineItem {
  return buildLineItem(item.id, item.productId, item.productName, item.supplierCostNok, item.quantity, newMarginPct);
}

export function quoteTotal(items: QuoteLineItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.totalUsd, 0) * 100) / 100;
}

export function blendedMargin(items: QuoteLineItem[]): number {
  const totalCostUsd = items.reduce((s, i) => s + nokToUsd(i.supplierCostNok) * i.quantity, 0);
  const totalSaleUsd = quoteTotal(items);
  if (totalCostUsd === 0) return 0;
  return (totalSaleUsd - totalCostUsd) / totalSaleUsd;
}
