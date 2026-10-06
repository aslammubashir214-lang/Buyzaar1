export type ProductCategory = string;

export type ProductStockStatus =
  | 'Available'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Discontinued'
  | 'Price Check Required';

export type StockType = 'Supplier Stock' | 'Own Stock' | 'Both';

export interface ProductSupplierQuote {
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierShop?: string;
  supplierMarket?: string;
  supplierCode?: string;
  wholesalePrice: number;
  stockStatus: 'Available' | 'Low Stock' | 'Out of Stock';
  lastPriceUpdated: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface PriceHistoryEntry {
  date: string;
  wholesalePrice: number;
  supplierName: string;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  color: string;
  variant: string;
  description: string;
  imageUrl: string;
  images: string[];
  supplierQuotes: ProductSupplierQuote[];
  primarySupplierId: string;
  primarySupplierName: string;
  wholesalePrice: number;
  retailPrice: number;
  minSellingPrice: number;
  packagingCost: number;
  transportCost: number;
  adCost: number;
  totalCost: number;
  profitAmount: number;
  profitPercentage: number;
  stockType: StockType;
  stockStatus: ProductStockStatus;
  stockQuantity: number;
  ownStockQuantity: number;
  ownStockPurchasePrice: number;
  lowStockThreshold: number;
  checkingWarranty: string;
  warrantyNotes: string;
  lastPriceChecked: string;
  lastUpdated: string;
  priceHistory: PriceHistoryEntry[];
  notes: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  marketName: string;
  shopNumber: string;
  completeAddress: string;
  city: string;
  categoriesSupplied: ProductCategory[];
  paymentMethod: string;
  bankDetails?: string;
  easypaisaJazzCash?: string;
  warrantyPolicy: string;
  replacementPolicy: string;
  notes: string;
  rating: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type OrderStatus =
  | 'New Order'
  | 'Customer Confirmation Pending'
  | 'Confirmed'
  | 'Supplier Stock Check'
  | 'Product Purchased'
  | 'Ready to Dispatch'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Complaint';

export type PaymentMethod =
  | 'Cash on Delivery (COD)'
  | 'Advance Bank Transfer'
  | 'Easypaisa'
  | 'JazzCash'
  | 'Partial Advance';

export type CourierCompany =
  | 'Trax'
  | 'TCS'
  | 'Leopard'
  | 'PostEx'
  | 'M&P'
  | 'Call Courier'
  | 'Rider'
  | 'Self Pickup / Local';

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  altPhone: string;
  city: string;
  completeAddress: string;
  landmark: string;
  productId: string;
  productSku: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  sellingPrice: number;
  productCost: number;
  deliveryCharges: number;
  totalAmount: number;
  profit: number;
  paymentMethod: PaymentMethod;
  advancePayment: number;
  remainingPayment: number;
  courierCompany: CourierCompany;
  trackingNumber: string;
  status: OrderStatus;
  notes: string;
}

export type CustomerType =
  | 'New Customer'
  | 'Repeat Customer'
  | 'VIP Customer'
  | 'Problem Customer';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string;
  type: CustomerType;
  notes: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Ads'
  | 'Courier'
  | 'Packaging'
  | 'Transport'
  | 'Office Expense'
  | 'Internet'
  | 'Mobile'
  | 'Refund'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  recordedBy?: string;
}

export interface BusinessPolicy {
  noChangeOfMind: string;
  wrongItem: string;
  damagedParcel: string;
  manufacturingDefect: string;
  unboxingVideo: string;
  complaintTimeLimit: string;
  supplierWarrantyTerms: string;
  customMessageTemplate: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  currency: string;
  defaultCourier: CourierCompany;
  city: string;
  address: string;
  customMessageTemplate?: string;
}

export type UserRole = 'Admin' | 'Staff' | 'Order Manager';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  isLoggedIn: boolean;
}
