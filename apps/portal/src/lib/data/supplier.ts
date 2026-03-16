export const supplierProducts = [
  { id: 'SP001', name: 'Beta AR Jacket', brand: "Arc'teryx", sku: 'ARC-BAR-S', size: 'S', qty: 45, priceNOK: 4800, discountRRP: 38, estDelivery: '2025-04-15', status: 'in-stock' as const },
  { id: 'SP002', name: 'Beta AR Jacket', brand: "Arc'teryx", sku: 'ARC-BAR-M', size: 'M', qty: 80, priceNOK: 4800, discountRRP: 38, estDelivery: '2025-04-15', status: 'in-stock' as const },
  { id: 'SP003', name: 'Beta AR Jacket', brand: "Arc'teryx", sku: 'ARC-BAR-L', size: 'L', qty: 60, priceNOK: 4900, discountRRP: 37, estDelivery: '2025-04-15', status: 'in-stock' as const },
  { id: 'SP004', name: 'Beta AR Jacket', brand: "Arc'teryx", sku: 'ARC-BAR-XL', size: 'XL', qty: 35, priceNOK: 5000, discountRRP: 36, estDelivery: '2025-04-20', status: 'low-stock' as const },
  { id: 'SP005', name: 'Beta AR Jacket', brand: "Arc'teryx", sku: 'ARC-BAR-XXL', size: 'XXL', qty: 20, priceNOK: 5200, discountRRP: 35, estDelivery: '2025-05-01', status: 'low-stock' as const },
  { id: 'SP006', name: 'Atom LT Hoody', brand: "Arc'teryx", sku: 'ARC-ALH-S', size: 'S', qty: 30, priceNOK: 2800, discountRRP: 40, estDelivery: '2025-04-10', status: 'in-stock' as const },
  { id: 'SP007', name: 'Atom LT Hoody', brand: "Arc'teryx", sku: 'ARC-ALH-M', size: 'M', qty: 60, priceNOK: 2900, discountRRP: 39, estDelivery: '2025-04-10', status: 'in-stock' as const },
  { id: 'SP008', name: 'Atom LT Hoody', brand: "Arc'teryx", sku: 'ARC-ALH-L', size: 'L', qty: 15, priceNOK: 3000, discountRRP: 38, estDelivery: '2025-04-18', status: 'low-stock' as const },
  { id: 'SP009', name: 'Atom LT Hoody', brand: "Arc'teryx", sku: 'ARC-ALH-XL', size: 'XL', qty: 40, priceNOK: 3200, discountRRP: 37, estDelivery: '2025-04-10', status: 'in-stock' as const },
  { id: 'SP010', name: 'Gamma MX Hoody', brand: "Arc'teryx", sku: 'ARC-GMX-M', size: 'M', qty: 25, priceNOK: 3800, discountRRP: 35, estDelivery: '2025-05-10', status: 'on-order' as const },
];

export const supplierOrders = [
  { id: 'SO-1001', product: 'Beta AR Jacket (M)', qty: 50, buyerRef: 'Buyer #1042', orderDate: '2025-03-01', status: 'confirmed' as const, paymentTerms: '30 days' },
  { id: 'SO-1002', product: 'Atom LT Hoody (L)', qty: 20, buyerRef: 'Buyer #1038', orderDate: '2025-03-05', status: 'pending' as const, paymentTerms: '60 days' },
  { id: 'SO-1003', product: 'Beta AR Jacket (XL)', qty: 35, buyerRef: 'Buyer #1042', orderDate: '2025-02-20', status: 'dispatched' as const, paymentTerms: '30 days' },
  { id: 'SO-1004', product: 'Gamma MX Hoody (M)', qty: 15, buyerRef: 'Buyer #1055', orderDate: '2025-03-08', status: 'pending' as const, paymentTerms: '30 days' },
  { id: 'SO-1005', product: 'Atom LT Hoody (S)', qty: 30, buyerRef: 'Buyer #1038', orderDate: '2025-01-15', status: 'cancelled' as const, paymentTerms: '60 days' },
];

export const supplierUploads = [
  { filename: 'pricelist_march_2025.xlsx', date: '2025-03-01', productsImported: 47, status: 'completed' as const },
  { filename: 'pricelist_feb_update.csv', date: '2025-02-15', productsImported: 12, status: 'completed' as const },
  { filename: 'new_arrivals_jan.xlsx', date: '2025-01-20', productsImported: 8, status: 'completed' as const },
];

export const supplierProfile = {
  companyName: 'Olympia Sport',
  contactPerson: 'Erik Hansen',
  email: 'erik@olympiasport.no',
  phone: '+47 33 45 67 89',
  paymentTerms: 'Net 30',
  bankDetails: '',
};
