export const adminSuppliers = [
  { id: 'AS01', name: 'Olympia Sport', contact: 'Erik Hansen', location: 'Sandefjord', productsListed: 47, activeOrders: 3, paymentTerms: 'Net 30', lastActive: '2025-03-07' },
  { id: 'AS02', name: 'Sport 1 Vestfold', contact: 'Lise Berg', location: 'Tønsberg', productsListed: 32, activeOrders: 2, paymentTerms: 'Net 30', lastActive: '2025-03-06' },
  { id: 'AS03', name: 'XXL Sandefjord', contact: 'Magnus Olsen', location: 'Sandefjord', productsListed: 18, activeOrders: 1, paymentTerms: 'Net 60', lastActive: '2025-03-04' },
  { id: 'AS04', name: 'Intersport Larvik', contact: 'Anna Dahl', location: 'Larvik', productsListed: 12, activeOrders: 2, paymentTerms: 'Net 30', lastActive: '2025-03-05' },
  { id: 'AS05', name: 'G-Sport Oslo', contact: 'Thomas Vik', location: 'Oslo', productsListed: 8, activeOrders: 1, paymentTerms: 'Net 45', lastActive: '2025-03-03' },
  { id: 'AS06', name: 'Torshov Sport', contact: 'Kari Nilsen', location: 'Oslo', productsListed: 4, activeOrders: 1, paymentTerms: 'Net 30', lastActive: '2025-03-02' },
  { id: 'AS07', name: 'Sport Outlet Vestfold', contact: 'Jon Strand', location: 'Tønsberg', productsListed: 2, activeOrders: 0, paymentTerms: 'Net 30', lastActive: '2025-02-28' },
  { id: 'AS08', name: 'Fjellsport Larvik', contact: 'Marte Lie', location: 'Larvik', productsListed: 1, activeOrders: 1, paymentTerms: 'Net 60', lastActive: '2025-03-01' },
];

export const adminBuyers = [
  { id: 'AB01', name: 'Shanghai Sport Trade Co.', wechatId: 'weizhang_sport', location: 'Shanghai', accountType: 'Large Buyer', totalOrders: 12, activeQuotes: 2, accountManager: 'Jessica' },
  { id: 'AB02', name: 'Guangzhou Outdoor Retail', wechatId: 'gz_outdoor', location: 'Guangzhou', accountType: 'Large Buyer', totalOrders: 8, activeQuotes: 1, accountManager: 'Jessica' },
  { id: 'AB03', name: 'Seoul Active Wear', wechatId: 'seoul_active', location: 'Seoul', accountType: 'Small Buyer', totalOrders: 3, activeQuotes: 1, accountManager: 'Jessica' },
  { id: 'AB04', name: 'Bangkok Sports Co.', wechatId: 'bkk_sports', location: 'Bangkok', accountType: 'Drop-shipper', totalOrders: 5, activeQuotes: 0, accountManager: 'Jessica' },
  { id: 'AB05', name: 'Tokyo Outdoor Ltd.', wechatId: 'tokyo_outd', location: 'Tokyo', accountType: 'Small Buyer', totalOrders: 2, activeQuotes: 1, accountManager: 'Jessica' },
  { id: 'AB06', name: 'Shenzhen Gear Hub', wechatId: 'sz_gearhub', location: 'Shenzhen', accountType: 'Large Buyer', totalOrders: 15, activeQuotes: 1, accountManager: 'Jessica' },
];

export const adminProducts = [
  { id: 'AP01', product: 'Beta AR Jacket', brand: "Arc'teryx", supplier: 'Olympia Sport', supplierPriceNOK: 4800, ourPriceUSD: 450, marginPct: 18, stockLevel: 240, status: 'in-stock' as const },
  { id: 'AP02', product: 'Atom LT Hoody', brand: "Arc'teryx", supplier: 'Olympia Sport', supplierPriceNOK: 2900, ourPriceUSD: 280, marginPct: 22, stockLevel: 145, status: 'in-stock' as const },
  { id: 'AP03', product: 'Gamma MX Hoody', brand: "Arc'teryx", supplier: 'Sport 1 Vestfold', supplierPriceNOK: 3800, ourPriceUSD: 360, marginPct: 16, stockLevel: 25, status: 'on-order' as const },
  { id: 'AP04', product: 'Zeta SL Jacket', brand: "Arc'teryx", supplier: 'XXL Sandefjord', supplierPriceNOK: 2600, ourPriceUSD: 300, marginPct: 20, stockLevel: 12, status: 'low-stock' as const },
  { id: 'AP05', product: 'Alpha SV Jacket', brand: "Arc'teryx", supplier: 'Intersport Larvik', supplierPriceNOK: 5800, ourPriceUSD: 650, marginPct: 15, stockLevel: 0, status: 'pre-order' as const },
  { id: 'AP06', product: 'Cerium LT Jacket', brand: "Arc'teryx", supplier: 'Olympia Sport', supplierPriceNOK: 3600, ourPriceUSD: 400, marginPct: 19, stockLevel: 80, status: 'in-stock' as const },
  { id: 'AP07', product: 'Proton LT Hoody', brand: "Arc'teryx", supplier: 'Sport 1 Vestfold', supplierPriceNOK: 2700, ourPriceUSD: 310, marginPct: 21, stockLevel: 55, status: 'in-stock' as const },
  { id: 'AP08', product: 'Covert Cardigan', brand: "Arc'teryx", supplier: 'G-Sport Oslo', supplierPriceNOK: 1200, ourPriceUSD: 155, marginPct: 24, stockLevel: 190, status: 'in-stock' as const },
];

export const adminOrders = [
  { id: 'AO-001', buyer: 'Shanghai Sport Trade Co.', products: 'Atom LT Hoody (M,L)', qty: 300, supplierCostNOK: 870000, salePriceUSD: 84000, marginPct: 18, depositPaid: 30, balanceDueUSD: 58800, orderType: 'Normal' as const, stockStatus: 'confirmed' as const, shippingStatus: 'in-transit' as const, notes: 'On schedule' },
  { id: 'AO-002', buyer: 'Shanghai Sport Trade Co.', products: 'Beta AR Jacket (L,XL)', qty: 150, supplierCostNOK: 735000, salePriceUSD: 67500, marginPct: 16, depositPaid: 0, balanceDueUSD: 67500, orderType: 'Normal' as const, stockStatus: 'pending' as const, shippingStatus: 'processing' as const, notes: 'Awaiting deposit' },
  { id: 'AO-003', buyer: 'Guangzhou Outdoor Retail', products: 'Covert Cardigan (M–XL)', qty: 200, supplierCostNOK: 240000, salePriceUSD: 31000, marginPct: 24, depositPaid: 100, balanceDueUSD: 0, orderType: 'Normal' as const, stockStatus: 'confirmed' as const, shippingStatus: 'delivered' as const, notes: '' },
  { id: 'AO-004', buyer: 'Seoul Active Wear', products: 'Beta AR Jacket (M)', qty: 50, supplierCostNOK: 240000, salePriceUSD: 22500, marginPct: 18, depositPaid: 50, balanceDueUSD: 11250, orderType: 'Normal' as const, stockStatus: 'confirmed' as const, shippingStatus: 'dispatched' as const, notes: '' },
  { id: 'AO-005', buyer: 'Tokyo Outdoor Ltd.', products: 'Alpha SV Jacket (M,L)', qty: 100, supplierCostNOK: 580000, salePriceUSD: 65000, marginPct: 15, depositPaid: 50, balanceDueUSD: 32500, orderType: 'Pre-order' as const, stockStatus: 'pre-order' as const, shippingStatus: 'processing' as const, notes: 'Delivery Q3 2025' },
];

export const adminInventory = [
  { id: 'INV01', product: 'Beta AR Jacket (M)', qty: 80, supplier: 'Olympia Sport', stage: 'At Supplier' as const, dateEntered: '2025-03-01', estNextMove: '2025-03-15', notes: 'Awaiting pickup' },
  { id: 'INV02', product: 'Beta AR Jacket (L)', qty: 60, supplier: 'Olympia Sport', stage: 'At Supplier' as const, dateEntered: '2025-03-01', estNextMove: '2025-03-15', notes: '' },
  { id: 'INV03', product: 'Atom LT Hoody (M)', qty: 60, supplier: 'Olympia Sport', stage: 'At Sandefjord Warehouse' as const, dateEntered: '2025-02-25', estNextMove: '2025-03-10', notes: 'Ready for shipment' },
  { id: 'INV04', product: 'Atom LT Hoody (L)', qty: 30, supplier: 'Olympia Sport', stage: 'At Sandefjord Warehouse' as const, dateEntered: '2025-02-25', estNextMove: '2025-03-10', notes: '' },
  { id: 'INV05', product: 'Covert Cardigan (M)', qty: 100, supplier: 'G-Sport Oslo', stage: 'In Transit / With Jessica' as const, dateEntered: '2025-02-20', estNextMove: '2025-03-05', notes: 'Shipped via DHL' },
  { id: 'INV06', product: 'Covert Cardigan (L)', qty: 90, supplier: 'G-Sport Oslo', stage: 'In Transit / With Jessica' as const, dateEntered: '2025-02-20', estNextMove: '2025-03-05', notes: '' },
  { id: 'INV07', product: 'Gamma MX Hoody (M)', qty: 25, supplier: 'Sport 1 Vestfold', stage: 'At Supplier' as const, dateEntered: '2025-03-05', estNextMove: '2025-03-20', notes: 'On order from brand' },
  { id: 'INV08', product: 'Zeta SL Jacket (S)', qty: 12, supplier: 'XXL Sandefjord', stage: 'At Sandefjord Warehouse' as const, dateEntered: '2025-02-28', estNextMove: '2025-03-12', notes: 'Last batch' },
  { id: 'INV09', product: 'Cerium LT Jacket (M)', qty: 40, supplier: 'Olympia Sport', stage: 'At Supplier' as const, dateEntered: '2025-03-06', estNextMove: '2025-03-18', notes: '' },
  { id: 'INV10', product: 'Proton LT Hoody (L)', qty: 35, supplier: 'Sport 1 Vestfold', stage: 'In Transit / With Jessica' as const, dateEntered: '2025-02-22', estNextMove: '2025-03-08', notes: 'Arriving soon' },
];

export const adminRecentQuotes = [
  { buyer: 'Shanghai Sport Trade Co.', product: 'Beta AR Jacket (M,L)', date: '2025-03-07' },
  { buyer: 'Tokyo Outdoor Ltd.', product: 'Alpha SV Jacket (M,L)', date: '2025-03-06' },
  { buyer: 'Seoul Active Wear', product: 'Atom LT Hoody (S–XL)', date: '2025-03-05' },
  { buyer: 'Guangzhou Outdoor Retail', product: 'Cerium LT Jacket (M–XL)', date: '2025-03-04' },
  { buyer: 'Shenzhen Gear Hub', product: 'Beta LT Jacket (L,XL)', date: '2025-03-03' },
];

export const adminPendingUploads = [
  { supplier: 'Sport 1 Vestfold', date: '2025-03-06' },
  { supplier: 'XXL Sandefjord', date: '2025-03-05' },
  { supplier: 'G-Sport Oslo', date: '2025-03-04' },
  { supplier: 'Intersport Larvik', date: '2025-03-03' },
  { supplier: 'Fjellsport Larvik', date: '2025-03-01' },
];

export const adminTeam = [
  { name: 'Martin', role: 'Managing Director' },
  { name: 'Daniel', role: 'Director of Operations and Strategy' },
  { name: 'Jessica', role: 'Asia Relations Manager' },
];
