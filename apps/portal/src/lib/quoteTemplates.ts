// =============================================================
// quoteTemplates.ts — Multilingual quote document strings
// Languages: en (English), no (Norwegian), cn (Chinese Simplified)
// =============================================================

import type { QuoteLanguage } from './quoteEngine';

export interface QuoteStrings {
  docTitle: string;
  quotation: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  to: string;
  from: string;
  lineNo: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  subtotal: string;
  shipping: string;
  shippingValue: string;
  grandTotal: string;
  paymentTerms: string;
  paymentValue: string;
  delivery: string;
  deliveryValue: (weeks: number) => string;
  origin: string;
  originValue: string;
  notes: string;
  closing: string;
  signatureLabel: string;
  authorizedBy: string;
}

const en: QuoteStrings = {
  docTitle:      'Quotation',
  quotation:     'QUOTATION',
  quoteNo:       'Quote No.',
  date:          'Date',
  validUntil:    'Valid Until',
  to:            'To',
  from:          'From',
  lineNo:        '#',
  description:   'Description',
  quantity:      'Qty',
  unitPrice:     'Unit Price',
  total:         'Total',
  subtotal:      'Subtotal',
  shipping:      'Shipping',
  shippingValue: 'Included (DDP)',
  grandTotal:    'TOTAL',
  paymentTerms:  'Payment Terms',
  paymentValue:  '30% deposit upon order confirmation, 70% balance before shipment',
  delivery:      'Estimated Delivery',
  deliveryValue: (w) => `${w}–${w + 2} weeks from order confirmation`,
  origin:        'Country of Origin',
  originValue:   'Europe (Norway / Scandinavia)',
  notes:         'Notes',
  closing:       'Thank you for the opportunity to quote. We look forward to your order.',
  signatureLabel:'Authorised Signature',
  authorizedBy:  'Global Distribution AS',
};

const no: QuoteStrings = {
  docTitle:      'Tilbud',
  quotation:     'TILBUD',
  quoteNo:       'Tilbudsnr.',
  date:          'Dato',
  validUntil:    'Gyldig til',
  to:            'Til',
  from:          'Fra',
  lineNo:        'Nr.',
  description:   'Beskrivelse',
  quantity:      'Antall',
  unitPrice:     'Enhetspris',
  total:         'Totalt',
  subtotal:      'Delsum',
  shipping:      'Frakt',
  shippingValue: 'Inkludert (DDP)',
  grandTotal:    'TOTALSUM',
  paymentTerms:  'Betalingsbetingelser',
  paymentValue:  '30% depositum ved ordrebekreftelse, 70% restbeløp før avsendelse',
  delivery:      'Estimert levering',
  deliveryValue: (w) => `${w}–${w + 2} uker fra ordrebekreftelse`,
  origin:        'Opprinnelsesland',
  originValue:   'Europa (Norge / Skandinavia)',
  notes:         'Merknader',
  closing:       'Takk for muligheten til å gi tilbud. Vi ser frem til din bestilling.',
  signatureLabel:'Autorisert signatur',
  authorizedBy:  'Global Distribution AS',
};

const cn: QuoteStrings = {
  docTitle:      '报价单',
  quotation:     '报 价 单',
  quoteNo:       '报价单号',
  date:          '日期',
  validUntil:    '有效期至',
  to:            '致',
  from:          '来自',
  lineNo:        '序号',
  description:   '产品描述',
  quantity:      '数量',
  unitPrice:     '单价',
  total:         '金额',
  subtotal:      '小计',
  shipping:      '运费',
  shippingValue: '含运费（DDP）',
  grandTotal:    '总计',
  paymentTerms:  '付款条款',
  paymentValue:  '确认订单时支付30%定金，发货前支付70%余款',
  delivery:      '预计交货期',
  deliveryValue: (w) => `确认订单后 ${w}–${w + 2} 周`,
  origin:        '原产地',
  originValue:   '欧洲（挪威/北欧）',
  notes:         '备注',
  closing:       '感谢您的询价，期待与您合作。',
  signatureLabel:'授权签字',
  authorizedBy:  'Global Distribution AS',
};

export const STRINGS: Record<QuoteLanguage, QuoteStrings> = { en, no, cn };

export function validUntilDate(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function followUpDate(days = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateObsidianMarkdown(params: {
  quoteNumber: string;
  date: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  language: QuoteLanguage;
  items: Array<{ productName: string; quantity: number; unitPriceUsd: number; totalUsd: number }>;
  totalUsd: number;
  marginPct: number;
  deliveryWeeks: number;
  notes: string;
  followUp: string;
}): string {
  const { quoteNumber, date, buyerName, buyerCompany, buyerCountry,
          items, totalUsd, marginPct, deliveryWeeks, notes, followUp } = params;

  const itemRows = items.map((i, idx) =>
    `| ${idx + 1} | ${i.productName} | ${i.quantity} | USD ${i.unitPriceUsd.toFixed(2)} | USD ${i.totalUsd.toFixed(2)} |`
  ).join('\n');

  return `---
title: ${quoteNumber}
type: rapport
date: ${date}
followup: ${followUp}
status: sent
---

# ${quoteNumber} — ${buyerCompany}

**Buyer:** ${buyerName} · ${buyerCompany} · ${buyerCountry}
**Sent:** ${date}  **Valid:** 30 days  **Language:** ${params.language.toUpperCase()}
**Delivery:** ${deliveryWeeks}–${deliveryWeeks + 2} weeks

## Produkter

| # | Produkt | Antall | Enhetspris | Totalt |
|---|---------|--------|-----------|--------|
${itemRows}

**Total: USD ${totalUsd.toFixed(2)}**  |  Margin: ${(marginPct * 100).toFixed(1)}%

## Notater

${notes || '—'}

## Oppfølging

**Neste kontakt:** ${followUp}
- [ ] Sjekk om buyer har mottatt tilbudet
- [ ] Følg opp status

## Logg

| Dato | Hendelse |
|------|----------|
| ${date} | Tilbud sendt |
`;
}
