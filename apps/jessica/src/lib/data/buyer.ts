export const buyerCatalogue = [
  { id: 'BC001', name: 'Beta AR Jacket', brand: "Arc'teryx", category: 'Jackets', sizes: ['S', 'M', 'L', 'XL', 'XXL'], availability: 'in-stock' as const, priceRange: '$420–$480' },
  { id: 'BC002', name: 'Atom LT Hoody', brand: "Arc'teryx", category: 'Insulation', sizes: ['S', 'M', 'L', 'XL'], availability: 'in-stock' as const, priceRange: '$260–$300' },
  { id: 'BC003', name: 'Gamma MX Hoody', brand: "Arc'teryx", category: 'Softshell', sizes: ['M', 'L', 'XL'], availability: 'pre-order' as const, priceRange: '$350–$380' },
  { id: 'BC004', name: 'Zeta SL Jacket', brand: "Arc'teryx", category: 'Jackets', sizes: ['S', 'M', 'L'], availability: 'limited' as const, priceRange: '$280–$320' },
  { id: 'BC005', name: 'Cerium LT Jacket', brand: "Arc'teryx", category: 'Down', sizes: ['S', 'M', 'L', 'XL'], availability: 'in-stock' as const, priceRange: '$380–$420' },
  { id: 'BC006', name: 'Proton LT Hoody', brand: "Arc'teryx", category: 'Insulation', sizes: ['M', 'L', 'XL'], availability: 'in-stock' as const, priceRange: '$290–$330' },
  { id: 'BC007', name: 'Alpha SV Jacket', brand: "Arc'teryx", category: 'Jackets', sizes: ['S', 'M', 'L'], availability: 'pre-order' as const, priceRange: '$620–$680' },
  { id: 'BC008', name: 'Beta LT Jacket', brand: "Arc'teryx", category: 'Jackets', sizes: ['M', 'L', 'XL', 'XXL'], availability: 'in-stock' as const, priceRange: '$390–$440' },
  { id: 'BC009', name: 'Thorium AR Jacket', brand: "Arc'teryx", category: 'Down', sizes: ['S', 'M', 'L', 'XL'], availability: 'limited' as const, priceRange: '$340–$380' },
  { id: 'BC010', name: 'Kyanite AR Jacket', brand: "Arc'teryx", category: 'Fleece', sizes: ['M', 'L', 'XL'], availability: 'in-stock' as const, priceRange: '$160–$190' },
  { id: 'BC011', name: 'Covert Cardigan', brand: "Arc'teryx", category: 'Fleece', sizes: ['S', 'M', 'L', 'XL'], availability: 'in-stock' as const, priceRange: '$140–$170' },
  { id: 'BC012', name: 'Norvan SL Hoody', brand: "Arc'teryx", category: 'Running', sizes: ['S', 'M', 'L'], availability: 'pre-order' as const, priceRange: '$300–$340' },
];

export const buyerQuotes = [
  { id: 'QR-2001', products: 'Beta AR Jacket (M, L) x 200', qty: 200, requestedDate: '2025-03-01', status: 'pending-review' as const, depositRequired: '-', notes: '' },
  { id: 'QR-2002', products: 'Atom LT Hoody (S–XL) x 500', qty: 500, requestedDate: '2025-02-20', status: 'quote-sent' as const, depositRequired: '30%', notes: 'Volume discount applied' },
  { id: 'QR-2003', products: 'Alpha SV Jacket (M, L) x 100', qty: 100, requestedDate: '2025-02-10', status: 'negotiating' as const, depositRequired: '50%', notes: 'Pre-order, delivery Q3 2025' },
  { id: 'QR-2004', products: 'Zeta SL Jacket (S) x 50', qty: 50, requestedDate: '2025-01-15', status: 'expired' as const, depositRequired: '-', notes: 'No response from buyer' },
];

export const buyerOrders = [
  { id: 'BO-3001', products: 'Atom LT Hoody (M, L) x 300', qty: 300, orderDate: '2025-02-01', shipmentStatus: 'in-transit' as const, estArrival: '2025-03-20', trackingRef: 'GDIST-TRK-88421' },
  { id: 'BO-3002', products: 'Beta AR Jacket (L, XL) x 150', qty: 150, orderDate: '2025-02-25', shipmentStatus: 'processing' as const, estArrival: '2025-04-10', trackingRef: '-' },
  { id: 'BO-3003', products: 'Covert Cardigan (M–XL) x 200', qty: 200, orderDate: '2025-01-10', shipmentStatus: 'delivered' as const, estArrival: '2025-02-15', trackingRef: 'GDIST-TRK-87102' },
];

export const buyerProfile = {
  companyName: 'Shanghai Sport Trade Co.',
  contactPerson: 'Wei Zhang',
  wechatId: 'weizhang_sport',
  email: 'wei@shanghaisport.cn',
  shippingAddress: '88 Nanjing Road, Pudong, Shanghai, China',
  accountType: 'Large Buyer' as const,
};
