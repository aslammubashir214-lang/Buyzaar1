import {
  Product,
  Supplier,
  Order,
  Customer,
  Expense,
  BusinessPolicy,
  BusinessSettings,
  UserSession,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'resellhub_products_v1',
  SUPPLIERS: 'resellhub_suppliers_v1',
  ORDERS: 'resellhub_orders_v1',
  CUSTOMERS: 'resellhub_customers_v1',
  EXPENSES: 'resellhub_expenses_v1',
  POLICIES: 'resellhub_policies_v1',
  SETTINGS: 'resellhub_settings_v1',
  SESSION: 'resellhub_session_v1',
  CATEGORIES: 'resellhub_categories_v1',
};

export const INITIAL_CATEGORIES: string[] = [
  'Smart Watches',
  'AirPods',
  'Earbuds',
  'Chargers',
  'Data Cables',
  'Power Banks',
  'Mobile Accessories',
  'Smart Glasses',
  'Speakers',
  'Other',
];

// Seed Suppliers
export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    businessName: 'Ahmed Traders',
    contactPerson: 'Ahmed Raza',
    phone: '03001234567',
    whatsapp: '923001234567',
    marketName: 'Mobile Accessories Market',
    shopNumber: 'Shop #18, 1st Floor',
    completeAddress: 'Shop #18, First Floor, Central Plaza, Mobile Accessories Market, Lahore',
    city: 'Lahore',
    categoriesSupplied: ['Smart Watches', 'Earbuds', 'Chargers', 'Data Cables'],
    paymentMethod: 'Cash / Easypaisa on Dispatch',
    bankDetails: 'Meezan Bank - 02140105828471 (Ahmed Traders)',
    easypaisaJazzCash: '03001234567 (Easypaisa)',
    warrantyPolicy: '7 Days Checking Warranty on sealed boxes. No warranty on water damage or burnt pins.',
    replacementPolicy: 'Faulty items replaced in next weekly visit or adjusted in new bill.',
    notes: 'Very reliable for smart watches and M10 earbuds. Updates stock daily on WhatsApp group at 11 AM.',
    rating: 5,
    status: 'Active',
    createdAt: '2026-09-01',
  },
  {
    id: 'SUP-002',
    businessName: 'Bilal Mobile Accessories',
    contactPerson: 'Bilal Khan',
    phone: '03219876543',
    whatsapp: '923219876543',
    marketName: 'Star City Wholesale Mall',
    shopNumber: 'Shop #42, Basment',
    completeAddress: 'Shop #42, Basement B, Star City Mall, Saddar, Karachi',
    city: 'Karachi',
    categoriesSupplied: ['Power Banks', 'Chargers', 'AirPods', 'Earbuds'],
    paymentMethod: 'Bank Transfer Advance',
    bankDetails: 'Bank Alfalah - 551982001928 (Bilal Khan)',
    easypaisaJazzCash: '03219876543 (JazzCash)',
    warrantyPolicy: '3 Days Checking Warranty. Physical damage void.',
    replacementPolicy: 'Exchange within 5 days of delivery.',
    notes: 'Good rates for GaN chargers and power banks. Ships via Daewoo cargo same day.',
    rating: 4,
    status: 'Active',
    createdAt: '2026-09-10',
  },
  {
    id: 'SUP-003',
    businessName: 'Karachi Wholesale Hub',
    contactPerson: 'Usman Ghani',
    phone: '03335551234',
    whatsapp: '923335551234',
    marketName: 'Hall Road Electronics Plaza',
    shopNumber: 'Shop #05, Ground Floor',
    completeAddress: 'Shop #05, Main Entrance, Hall Road, Lahore',
    city: 'Lahore',
    categoriesSupplied: ['Smart Watches', 'Mobile Accessories', 'Data Cables'],
    paymentMethod: 'Cash on Pick / Bilty',
    bankDetails: 'Habib Bank Limited - 100293847291',
    easypaisaJazzCash: '03335551234',
    warrantyPolicy: 'Check at counter or same-day video proof required.',
    replacementPolicy: 'Adjustment in ledger.',
    notes: 'Has backup stock when Ahmed Traders runs out.',
    rating: 4,
    status: 'Active',
    createdAt: '2026-09-15',
  },
];

// Seed Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'SW-001',
    name: 'T800 Ultra Smart Watch',
    category: 'Smart Watches',
    brand: 'Generic / Ultra Series',
    model: 'T800 Ultra 49mm',
    color: 'Orange Strap / Titanium Body',
    variant: '1.99 inch HD Display, Wireless Charging',
    description: `Bluetooth Calling & Notification Alerts\nFitness & Heart Rate Tracker\nMultiple Watch Faces & Games\nAndroid & iPhone Compatible with FitPro app`,
    imageUrl: '/src/assets/images/smart_watch_t800_1791104327806.jpg',
    images: ['/src/assets/images/smart_watch_t800_1791104327806.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-001',
        supplierName: 'Ahmed Traders',
        supplierPhone: '03001234567',
        supplierShop: 'Shop #18',
        supplierMarket: 'Mobile Accessories Market',
        supplierCode: 'AT-T800-ORG',
        wholesalePrice: 1650,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-10-04',
        isPrimary: true,
        notes: 'Best quality batch with orange box',
      },
      {
        supplierId: 'SUP-002',
        supplierName: 'Bilal Mobile Accessories',
        supplierPhone: '03219876543',
        supplierShop: 'Shop #42',
        supplierMarket: 'Star City Wholesale Mall',
        supplierCode: 'BM-T800U',
        wholesalePrice: 1690,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-28',
        isPrimary: false,
        notes: 'Backup supplier if Ahmed runs out',
      },
      {
        supplierId: 'SUP-003',
        supplierName: 'Karachi Wholesale Hub',
        supplierPhone: '03335551234',
        supplierShop: 'Shop #05',
        supplierMarket: 'Hall Road Electronics Plaza',
        supplierCode: 'KW-800-UL',
        wholesalePrice: 1720,
        stockStatus: 'Low Stock',
        lastPriceUpdated: '2026-09-20',
        isPrimary: false,
        notes: 'Higher price, only for emergency',
      },
    ],
    primarySupplierId: 'SUP-001',
    primarySupplierName: 'Ahmed Traders',
    wholesalePrice: 1650,
    retailPrice: 2299,
    minSellingPrice: 2050,
    packagingCost: 40,
    transportCost: 30,
    adCost: 80,
    totalCost: 1800,
    profitAmount: 499,
    profitPercentage: 27.7,
    stockType: 'Both',
    stockStatus: 'Available',
    stockQuantity: 45,
    ownStockQuantity: 12,
    ownStockPurchasePrice: 1650,
    lowStockThreshold: 5,
    checkingWarranty: '7 Days Checking Warranty',
    warrantyNotes: 'Screen crack or water ingress not covered.',
    lastPriceChecked: '2026-10-04',
    lastUpdated: '2026-10-04',
    priceHistory: [
      { date: '2026-09-25', wholesalePrice: 1550, supplierName: 'Ahmed Traders', notes: 'Initial shipment' },
      { date: '2026-10-01', wholesalePrice: 1600, supplierName: 'Ahmed Traders', notes: 'Dollar rate hike' },
      { date: '2026-10-04', wholesalePrice: 1650, supplierName: 'Ahmed Traders', notes: 'Verified today via WhatsApp' },
    ],
    notes: 'Hot selling product! Always keep minimum 10 in own stock.',
    createdAt: '2026-09-20',
  },
  {
    id: 'prod-002',
    sku: 'EB-001',
    name: 'M10 Earbuds TWS Wireless Headset',
    category: 'Earbuds',
    brand: 'TWS',
    model: 'M10 V5.3',
    color: 'Glossy Black',
    variant: 'LED Battery Display & Emergency Power Bank Function',
    description: `Hi-Fi Stereo Sound & Deep Bass\nLED Digital Power Display on Charging Case\nTouch Control & Built-in Mic for Calls\n2000mAh Case can charge phone in emergency`,
    imageUrl: '/src/assets/images/m10_earbuds_case_1791104341524.jpg',
    images: ['/src/assets/images/m10_earbuds_case_1791104341524.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-001',
        supplierName: 'Ahmed Traders',
        supplierPhone: '03001234567',
        supplierShop: 'Shop #18',
        supplierMarket: 'Mobile Accessories Market',
        supplierCode: 'AT-M10-BLK',
        wholesalePrice: 850,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-10-03',
        isPrimary: true,
        notes: 'Original chip version',
      },
      {
        supplierId: 'SUP-002',
        supplierName: 'Bilal Mobile Accessories',
        supplierPhone: '03219876543',
        supplierShop: 'Shop #42',
        supplierMarket: 'Star City Wholesale Mall',
        supplierCode: 'BM-M10-TWS',
        wholesalePrice: 880,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-29',
        isPrimary: false,
        notes: 'Includes free silicone tips',
      },
      {
        supplierId: 'SUP-003',
        supplierName: 'Karachi Wholesale Hub',
        supplierPhone: '03335551234',
        supplierShop: 'Shop #05',
        supplierMarket: 'Hall Road Electronics Plaza',
        supplierCode: 'KW-M10',
        wholesalePrice: 900,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-18',
        isPrimary: false,
      },
    ],
    primarySupplierId: 'SUP-001',
    primarySupplierName: 'Ahmed Traders',
    wholesalePrice: 850,
    retailPrice: 1399,
    minSellingPrice: 1200,
    packagingCost: 30,
    transportCost: 20,
    adCost: 50,
    totalCost: 950,
    profitAmount: 449,
    profitPercentage: 47.3,
    stockType: 'Both',
    stockStatus: 'Available',
    stockQuantity: 60,
    ownStockQuantity: 18,
    ownStockPurchasePrice: 850,
    lowStockThreshold: 6,
    checkingWarranty: '7 Days Checking Warranty',
    warrantyNotes: 'Ensure customer charges with 5V 1A adapter only.',
    lastPriceChecked: '2026-10-03',
    lastUpdated: '2026-10-03',
    priceHistory: [
      { date: '2026-09-15', wholesalePrice: 820, supplierName: 'Ahmed Traders' },
      { date: '2026-10-03', wholesalePrice: 850, supplierName: 'Ahmed Traders', notes: 'New import consignment' },
    ],
    notes: 'Highest volume item. High profit margin.',
    createdAt: '2026-09-15',
  },
  {
    id: 'prod-003',
    sku: 'CH-001',
    name: '65W GaN Fast Charger with Type-C Port',
    category: 'Chargers',
    brand: 'SuperFast GaN',
    model: 'GaN-65W Pro',
    color: 'White',
    variant: 'Dual Port (1x Type-C 65W PD + 1x USB-A 30W QC)',
    description: `Next-Gen GaN Technology - Ultra Compact\nCharges Laptops, MacBooks, iPads & Fast Charge Phones\nOverheat & Short Circuit Protection\nSupports Samsung Super Fast Charging 2.0 (45W)`,
    imageUrl: '/src/assets/images/fast_charger_cable_1791104351789.jpg',
    images: ['/src/assets/images/fast_charger_cable_1791104351789.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-002',
        supplierName: 'Bilal Mobile Accessories',
        supplierPhone: '03219876543',
        supplierShop: 'Shop #42',
        supplierMarket: 'Star City Wholesale Mall',
        supplierCode: 'BM-GAN65-W',
        wholesalePrice: 1150,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-24',
        isPrimary: true,
        notes: 'Original GaN heatsink model',
      },
      {
        supplierId: 'SUP-003',
        supplierName: 'Karachi Wholesale Hub',
        supplierPhone: '03335551234',
        supplierShop: 'Shop #05',
        supplierMarket: 'Hall Road Electronics Plaza',
        supplierCode: 'KW-65W-GAN',
        wholesalePrice: 1220,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-12',
        isPrimary: false,
      },
    ],
    primarySupplierId: 'SUP-002',
    primarySupplierName: 'Bilal Mobile Accessories',
    wholesalePrice: 1150,
    retailPrice: 1850,
    minSellingPrice: 1600,
    packagingCost: 40,
    transportCost: 30,
    adCost: 70,
    totalCost: 1290,
    profitAmount: 560,
    profitPercentage: 43.4,
    stockType: 'Own Stock',
    stockStatus: 'Available',
    stockQuantity: 20,
    ownStockQuantity: 8,
    ownStockPurchasePrice: 1150,
    lowStockThreshold: 4,
    checkingWarranty: '1 Month Replacement Warranty',
    warrantyNotes: 'Must keep original packaging box.',
    lastPriceChecked: '2026-09-24',
    lastUpdated: '2026-09-24',
    priceHistory: [
      { date: '2026-09-10', wholesalePrice: 1100, supplierName: 'Bilal Mobile Accessories' },
      { date: '2026-09-24', wholesalePrice: 1150, supplierName: 'Bilal Mobile Accessories', notes: 'Price adjusted' },
    ],
    notes: 'Needs price check soon (>10 days since checked).',
    createdAt: '2026-09-10',
  },
  {
    id: 'prod-004',
    sku: 'PB-001',
    name: 'Magnetic Wireless 10000mAh Power Bank',
    category: 'Power Banks',
    brand: 'MagCharge',
    model: 'MPB-10K',
    color: 'Titanium Gray',
    variant: '15W MagSafe Wireless + 20W PD Wired',
    description: `Strong Magnetic Hold for iPhone 12/13/14/15/16 Series\n10000mAh High Density Lithium Polymer Battery\nDigital LED Battery Indicator\nCompact pocket size`,
    imageUrl: '/src/assets/images/power_bank_pack_1791104362143.jpg',
    images: ['/src/assets/images/power_bank_pack_1791104362143.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-002',
        supplierName: 'Bilal Mobile Accessories',
        supplierPhone: '03219876543',
        supplierShop: 'Shop #42',
        supplierMarket: 'Star City Wholesale Mall',
        supplierCode: 'BM-PB10-MAG',
        wholesalePrice: 2100,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-10-02',
        isPrimary: true,
      },
      {
        supplierId: 'SUP-001',
        supplierName: 'Ahmed Traders',
        supplierPhone: '03001234567',
        supplierShop: 'Shop #18',
        supplierMarket: 'Mobile Accessories Market',
        supplierCode: 'AT-MAGPB-10',
        wholesalePrice: 2180,
        stockStatus: 'Low Stock',
        lastPriceUpdated: '2026-09-22',
        isPrimary: false,
      },
    ],
    primarySupplierId: 'SUP-002',
    primarySupplierName: 'Bilal Mobile Accessories',
    wholesalePrice: 2100,
    retailPrice: 3199,
    minSellingPrice: 2800,
    packagingCost: 50,
    transportCost: 40,
    adCost: 110,
    totalCost: 2300,
    profitAmount: 899,
    profitPercentage: 39.1,
    stockType: 'Supplier Stock',
    stockStatus: 'Available',
    stockQuantity: 25,
    ownStockQuantity: 2,
    ownStockPurchasePrice: 2100,
    lowStockThreshold: 3,
    checkingWarranty: '15 Days Checking Warranty',
    warrantyNotes: 'No physical drop dent allowed.',
    lastPriceChecked: '2026-10-02',
    lastUpdated: '2026-10-02',
    priceHistory: [
      { date: '2026-09-18', wholesalePrice: 2050, supplierName: 'Bilal Mobile Accessories' },
      { date: '2026-10-02', wholesalePrice: 2100, supplierName: 'Bilal Mobile Accessories' },
    ],
    notes: 'Top seller among iPhone users. Sells easily at Rs. 3199.',
    createdAt: '2026-09-18',
  },
  {
    id: 'prod-005',
    sku: 'CB-001',
    name: '100W Braided Type-C to Type-C Fast Data Cable',
    category: 'Data Cables',
    brand: 'SuperCord',
    model: 'SC-100W-1.2M',
    color: 'Black & Grey Braided',
    variant: '1.2 Meter / 100W 5A E-Marker Chip',
    description: `Supports 100W Power Delivery for Laptops and Phones\nHeavy duty military grade nylon braided wire\nHigh speed 480Mbps data transfer\nReinforced neck to prevent breakage`,
    imageUrl: '/src/assets/images/fast_charger_cable_1791104351789.jpg',
    images: ['/src/assets/images/fast_charger_cable_1791104351789.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-001',
        supplierName: 'Ahmed Traders',
        supplierPhone: '03001234567',
        supplierShop: 'Shop #18',
        supplierMarket: 'Mobile Accessories Market',
        supplierCode: 'AT-CBL-100W',
        wholesalePrice: 220,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-09-15',
        isPrimary: true,
      },
    ],
    primarySupplierId: 'SUP-001',
    primarySupplierName: 'Ahmed Traders',
    wholesalePrice: 220,
    retailPrice: 499,
    minSellingPrice: 400,
    packagingCost: 20,
    transportCost: 10,
    adCost: 30,
    totalCost: 280,
    profitAmount: 219,
    profitPercentage: 78.2,
    stockType: 'Own Stock',
    stockStatus: 'Low Stock',
    stockQuantity: 15,
    ownStockQuantity: 3,
    ownStockPurchasePrice: 220,
    lowStockThreshold: 10,
    checkingWarranty: '3 Days Checking Warranty',
    warrantyNotes: 'Wire must not be cut.',
    lastPriceChecked: '2026-09-15',
    lastUpdated: '2026-09-15',
    priceHistory: [
      { date: '2026-09-15', wholesalePrice: 220, supplierName: 'Ahmed Traders' },
    ],
    notes: 'Outdated price warning (>18 days). Need to verify rate with Ahmed.',
    createdAt: '2026-09-15',
  },
  {
    id: 'prod-006',
    sku: 'AP-001',
    name: 'AirPods Pro 2 ANC Master Clone (Type-C)',
    category: 'AirPods',
    brand: 'Pro Audio',
    model: 'Pro 2 Gen ANC',
    color: 'White',
    variant: 'Type-C Port with Active Noise Cancellation & Spatial Audio',
    description: `Working Active Noise Cancellation (ANC) & Transparency Mode\nPop-up connection window on iOS\nLanyard loop and speaker on charging case\nTouch volume slider control on stems`,
    imageUrl: '/src/assets/images/m10_earbuds_case_1791104341524.jpg',
    images: ['/src/assets/images/m10_earbuds_case_1791104341524.jpg'],
    supplierQuotes: [
      {
        supplierId: 'SUP-002',
        supplierName: 'Bilal Mobile Accessories',
        supplierPhone: '03219876543',
        supplierShop: 'Shop #42',
        supplierMarket: 'Star City Wholesale Mall',
        supplierCode: 'BM-AP2-ANC',
        wholesalePrice: 2400,
        stockStatus: 'Available',
        lastPriceUpdated: '2026-10-01',
        isPrimary: true,
      },
    ],
    primarySupplierId: 'SUP-002',
    primarySupplierName: 'Bilal Mobile Accessories',
    wholesalePrice: 2400,
    retailPrice: 3499,
    minSellingPrice: 3100,
    packagingCost: 50,
    transportCost: 40,
    adCost: 110,
    totalCost: 2600,
    profitAmount: 899,
    profitPercentage: 34.6,
    stockType: 'Supplier Stock',
    stockStatus: 'Available',
    stockQuantity: 30,
    ownStockQuantity: 4,
    ownStockPurchasePrice: 2400,
    lowStockThreshold: 4,
    checkingWarranty: '7 Days Checking Warranty',
    warrantyNotes: 'Mic and both buds tested before dispatch.',
    lastPriceChecked: '2026-10-01',
    lastUpdated: '2026-10-01',
    priceHistory: [
      { date: '2026-09-20', wholesalePrice: 2350, supplierName: 'Bilal Mobile Accessories' },
      { date: '2026-10-01', wholesalePrice: 2400, supplierName: 'Bilal Mobile Accessories' },
    ],
    notes: 'Premium packaging box with Apple logo lookalike.',
    createdAt: '2026-09-20',
  },
];

// Seed Orders
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-0001',
    orderDate: '2026-10-04',
    customerName: 'Muhammad Hamza',
    customerPhone: '03124567890',
    altPhone: '03019876543',
    city: 'Rawalpindi',
    completeAddress: 'House 45, Street 8, Sector F-8/2, Rawalpindi',
    landmark: 'Near Commercial Market',
    productId: 'prod-001',
    productSku: 'SW-001',
    productName: 'T800 Ultra Smart Watch',
    productImageUrl: '/src/assets/images/smart_watch_t800_1791104327806.jpg',
    quantity: 1,
    sellingPrice: 2299,
    productCost: 1800,
    deliveryCharges: 200,
    totalAmount: 2499,
    profit: 499,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 0,
    remainingPayment: 2499,
    courierCompany: 'Trax',
    trackingNumber: 'TRX-99482104',
    status: 'New Order',
    notes: 'Customer requested orange strap confirmation call before dispatch.',
  },
  {
    id: 'ORD-0002',
    orderDate: '2026-10-03',
    customerName: 'Ali Hassan',
    customerPhone: '03451239876',
    altPhone: '',
    city: 'Lahore',
    completeAddress: 'Flat 302, Green Heights, Gulberg III, Lahore',
    landmark: 'Opposite Pace Shopping Mall',
    productId: 'prod-002',
    productSku: 'EB-001',
    productName: 'M10 Earbuds TWS Wireless Headset',
    productImageUrl: '/src/assets/images/m10_earbuds_case_1791104341524.jpg',
    quantity: 2,
    sellingPrice: 1399,
    productCost: 950,
    deliveryCharges: 0,
    totalAmount: 2798,
    profit: 898,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 0,
    remainingPayment: 2798,
    courierCompany: 'TCS',
    trackingNumber: 'TCS-77182904',
    status: 'Confirmed',
    notes: 'Free delivery offered for ordering 2 pairs.',
  },
  {
    id: 'ORD-0003',
    orderDate: '2026-10-02',
    customerName: 'Usman Tariq',
    customerPhone: '03009988776',
    altPhone: '03221144556',
    city: 'Karachi',
    completeAddress: 'Plot B-14, Block 13-D, Gulshan-e-Iqbal, Karachi',
    landmark: 'Behind Disco Bakery',
    productId: 'prod-004',
    productSku: 'PB-001',
    productName: 'Magnetic Wireless 10000mAh Power Bank',
    productImageUrl: '/src/assets/images/power_bank_pack_1791104362143.jpg',
    quantity: 1,
    sellingPrice: 3199,
    productCost: 2300,
    deliveryCharges: 250,
    totalAmount: 3449,
    profit: 899,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 500,
    remainingPayment: 2949,
    courierCompany: 'Trax',
    trackingNumber: 'TRX-88392100',
    status: 'Dispatched',
    notes: 'Advance Rs. 500 received on JazzCash as shipping guarantee.',
  },
  {
    id: 'ORD-0004',
    orderDate: '2026-10-01',
    customerName: 'Zainab Bibi',
    customerPhone: '03348765432',
    altPhone: '',
    city: 'Faisalabad',
    completeAddress: 'House # 12, Street 3, Madina Town, Faisalabad',
    landmark: 'Near Susan Road',
    productId: 'prod-003',
    productSku: 'CH-001',
    productName: '65W GaN Fast Charger with Type-C Port',
    productImageUrl: '/src/assets/images/fast_charger_cable_1791104351789.jpg',
    quantity: 1,
    sellingPrice: 1850,
    productCost: 1290,
    deliveryCharges: 200,
    totalAmount: 2050,
    profit: 560,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 0,
    remainingPayment: 2050,
    courierCompany: 'Leopard',
    trackingNumber: 'LEO-44182903',
    status: 'Delivered',
    notes: 'Delivered successfully. Payment cleared in courier portal.',
  },
  {
    id: 'ORD-0005',
    orderDate: '2026-09-30',
    customerName: 'Farhan Zaidi',
    customerPhone: '03215544332',
    altPhone: '',
    city: 'Multan',
    completeAddress: 'House 88, Bosan Road, Multan',
    landmark: 'Opposite BZU Gate',
    productId: 'prod-006',
    productSku: 'AP-001',
    productName: 'AirPods Pro 2 ANC Master Clone (Type-C)',
    productImageUrl: '/src/assets/images/m10_earbuds_case_1791104341524.jpg',
    quantity: 1,
    sellingPrice: 3499,
    productCost: 2600,
    deliveryCharges: 200,
    totalAmount: 3699,
    profit: 899,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 0,
    remainingPayment: 3699,
    courierCompany: 'Trax',
    trackingNumber: 'TRX-10293847',
    status: 'Delivered',
    notes: 'Customer gave 5-star feedback on WhatsApp.',
  },
  {
    id: 'ORD-0006',
    orderDate: '2026-09-29',
    customerName: 'Kashif Mehmood',
    customerPhone: '03027788990',
    altPhone: '',
    city: 'Peshawar',
    completeAddress: 'University Town, Street 4, Peshawar',
    landmark: 'Near Khyber Teaching Hospital',
    productId: 'prod-001',
    productSku: 'SW-001',
    productName: 'T800 Ultra Smart Watch',
    productImageUrl: '/src/assets/images/smart_watch_t800_1791104327806.jpg',
    quantity: 1,
    sellingPrice: 2299,
    productCost: 1800,
    deliveryCharges: 250,
    totalAmount: 2549,
    profit: 499,
    paymentMethod: 'Cash on Delivery (COD)',
    advancePayment: 0,
    remainingPayment: 2549,
    courierCompany: 'PostEx',
    trackingNumber: 'PEX-77889911',
    status: 'Cancelled',
    notes: 'Customer did not pick up confirmation call 3 times. Cancelled before dispatch.',
  },
];

// Seed Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Muhammad Hamza',
    phone: '03124567890',
    whatsapp: '923124567890',
    city: 'Rawalpindi',
    address: 'House 45, Street 8, Sector F-8/2, Rawalpindi',
    orderCount: 1,
    totalSpend: 2499,
    lastOrderDate: '2026-10-04',
    type: 'New Customer',
    notes: 'Interested in smart watch straps.',
    createdAt: '2026-10-04',
  },
  {
    id: 'CUST-002',
    name: 'Ali Hassan',
    phone: '03451239876',
    whatsapp: '923451239876',
    city: 'Lahore',
    address: 'Flat 302, Green Heights, Gulberg III, Lahore',
    orderCount: 2,
    totalSpend: 5497,
    lastOrderDate: '2026-10-03',
    type: 'Repeat Customer',
    notes: 'Always orders 2+ items for friends. Prompt receiver.',
    createdAt: '2026-09-15',
  },
  {
    id: 'CUST-003',
    name: 'Usman Tariq',
    phone: '03009988776',
    whatsapp: '923009988776',
    city: 'Karachi',
    address: 'Plot B-14, Block 13-D, Gulshan-e-Iqbal, Karachi',
    orderCount: 3,
    totalSpend: 9800,
    lastOrderDate: '2026-10-02',
    type: 'VIP Customer',
    notes: 'Pays advance readily. Buys premium electronics.',
    createdAt: '2026-08-20',
  },
  {
    id: 'CUST-004',
    name: 'Farhan Zaidi',
    phone: '03215544332',
    whatsapp: '923215544332',
    city: 'Multan',
    address: 'House 88, Bosan Road, Multan',
    orderCount: 1,
    totalSpend: 3699,
    lastOrderDate: '2026-09-30',
    type: 'New Customer',
    notes: 'Happy with AirPods Pro clone sound.',
    createdAt: '2026-09-30',
  },
  {
    id: 'CUST-005',
    name: 'Kashif Mehmood',
    phone: '03027788990',
    whatsapp: '923027788990',
    city: 'Peshawar',
    address: 'University Town, Street 4, Peshawar',
    orderCount: 1,
    totalSpend: 0,
    lastOrderDate: '2026-09-29',
    type: 'Problem Customer',
    notes: 'Did not attend verification calls. Always take advance shipping fee before booking.',
    createdAt: '2026-09-29',
  },
];

// Seed Expenses
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-001',
    date: '2026-10-03',
    category: 'Ads',
    amount: 1500,
    description: 'Facebook & Instagram Sponsored Reels for T800 Watch',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-002',
    date: '2026-10-02',
    category: 'Packaging',
    amount: 1200,
    description: 'Bought 100 bubble wrap flyers & security tape roll',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-003',
    date: '2026-10-01',
    category: 'Transport',
    amount: 600,
    description: 'Bike petrol for Hall Road wholesale market pickup visit',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-004',
    date: '2026-09-28',
    category: 'Internet',
    amount: 2200,
    description: 'Monthly office Wi-Fi high speed connection bill',
    recordedBy: 'Admin',
  },
  {
    id: 'EXP-005',
    date: '2026-09-25',
    category: 'Courier',
    amount: 800,
    description: 'Bilty cargo charges from Karachi wholesale to Lahore',
    recordedBy: 'Admin',
  },
];

// Seed Policy
export const INITIAL_POLICIES: BusinessPolicy = {
  noChangeOfMind: 'We do not offer returns or exchanges if a customer changes their mind, prefers another color after delivery, or did not read product specs.',
  wrongItem: 'If you receive an incorrect product, model, or color variant different from your invoice, we provide free immediate exchange via courier pickup.',
  damagedParcel: 'If parcel flyer is visibly torn or opened, do not accept from courier rider. If accepted, unboxing video is mandatory for damage claims.',
  manufacturingDefect: '7 Days Checking Warranty covers hardware defects (dead device, charging port failure). Customer must notify within 7 days of delivery.',
  unboxingVideo: 'A continuous, uncut 360-degree video starting from the sealed courier flyer until testing the device is strictly REQUIRED for any missing or damaged item claims.',
  complaintTimeLimit: 'All warranty complaints must be registered on WhatsApp within 7 calendar days of parcel delivery tracking timestamp.',
  supplierWarrantyTerms: 'Checking warranty only. Physical breakage, water exposure, fire, power surges from faulty local chargers, or scratches are excluded.',
  customMessageTemplate: `🔥 {PRODUCT_NAME}

{DESCRIPTION}
🛡️ Warranty: {WARRANTY}

💰 Wholesale Direct Price: {RETAIL_PRICE}
🚚 Cash on Delivery Available Across Pakistan!

📦 Product Code: {SKU}

📲 Send a WhatsApp message to {CONTACT} to confirm your order now!`,
};

// Seed Settings
export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Buyzaar',
  tagline: 'Shop smartly, Shop online with Buyzaar,',
  phone: '03131130239',
  whatsapp: '03131130239',
  currency: 'Rs.',
  defaultCourier: 'Trax',
  city: 'Lahore',
  address: '',
};

// Storage Engine
export const storageService = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },
  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getSuppliers(): Supplier[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  },
  saveSuppliers(suppliers: Supplier[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },
  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getPolicies(): BusinessPolicy {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POLICIES);
      return data ? JSON.parse(data) : INITIAL_POLICIES;
    } catch {
      return INITIAL_POLICIES;
    }
  },
  savePolicies(policies: BusinessPolicy): void {
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
  },

  getSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return INITIAL_SETTINGS;
      const parsed = JSON.parse(data);
      // Automatically migrate from old default settings to Buyzaar
      if (
        parsed.businessName === 'ResellHub Electronics' ||
        parsed.phone === '03001234567' ||
        parsed.tagline?.includes('Wholesale Electronics') ||
        parsed.address?.includes('Commercial Plaza, Hall Road')
      ) {
        const updated = {
          ...parsed,
          businessName: 'Buyzaar',
          tagline: 'Shop smartly, Shop online with Buyzaar,',
          phone: '03131130239',
          whatsapp: '03131130239',
          address: '',
        };
        this.saveSettings(updated);
        return updated;
      }
      return parsed;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(settings: BusinessSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSession(): UserSession {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data
        ? JSON.parse(data)
        : {
            role: 'Admin',
            name: 'Business Owner',
            email: 'admin@buyzaar.pk',
            isLoggedIn: true,
          };
    } catch {
      return {
        role: 'Admin',
        name: 'Business Owner',
        email: 'admin@buyzaar.pk',
        isLoggedIn: true,
      };
    }
  },
  saveSession(session: UserSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  getCategories(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },
  saveCategories(categories: string[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  addCategory(newCategory: string): string[] {
    const trimmed = newCategory.trim();
    if (!trimmed) return this.getCategories();
    const existing = this.getCategories();
    if (!existing.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...existing, trimmed];
      this.saveCategories(updated);
      return updated;
    }
    return existing;
  },
  deleteCategory(categoryToDelete: string): string[] {
    const existing = this.getCategories();
    const updated = existing.filter(c => c.toLowerCase() !== categoryToDelete.trim().toLowerCase());
    this.saveCategories(updated);
    return updated;
  },

  resetAll(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(INITIAL_POLICIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  },

  exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      app: 'Buyzaar Online Selling Manager',
      products: this.getProducts(),
      suppliers: this.getSuppliers(),
      orders: this.getOrders(),
      customers: this.getCustomers(),
      expenses: this.getExpenses(),
      policies: this.getPolicies(),
      settings: this.getSettings(),
      categories: this.getCategories(),
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products) this.saveProducts(parsed.products);
      if (parsed.suppliers) this.saveSuppliers(parsed.suppliers);
      if (parsed.orders) this.saveOrders(parsed.orders);
      if (parsed.customers) this.saveCustomers(parsed.customers);
      if (parsed.expenses) this.saveExpenses(parsed.expenses);
      if (parsed.policies) this.savePolicies(parsed.policies);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.categories) this.saveCategories(parsed.categories);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  },
};
