import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, UserCheck, Package } from 'lucide-react';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  CourierCompany,
  Product,
  Customer,
} from '../../types';
import { generateNextOrderId, formatCurrency } from '../../services/helpers';

interface OrderFormModalProps {
  isOpen: boolean;
  orderToEdit: Order | null;
  presetProduct?: Product | null;
  products: Product[];
  customers: Customer[];
  existingOrders: Order[];
  onClose: () => void;
  onSave: (order: Order) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'New Order',
  'Customer Confirmation Pending',
  'Confirmed',
  'Supplier Stock Check',
  'Product Purchased',
  'Ready to Dispatch',
  'Dispatched',
  'Delivered',
  'Cancelled',
  'Returned',
  'Complaint',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash on Delivery (COD)',
  'Advance Bank Transfer',
  'Easypaisa',
  'JazzCash',
  'Partial Advance',
];

const COURIER_COMPANIES: CourierCompany[] = [
  'Trax',
  'TCS',
  'Leopard',
  'PostEx',
  'M&P',
  'Call Courier',
  'Rider',
  'Self Pickup / Local',
];

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  orderToEdit,
  presetProduct,
  products,
  customers,
  existingOrders,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [id] = useState(orderToEdit?.id || generateNextOrderId(existingOrders));
  const [orderDate, setOrderDate] = useState(
    orderToEdit?.orderDate || new Date().toISOString().split('T')[0]
  );

  // Customer Details
  const [customerName, setCustomerName] = useState(orderToEdit?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(orderToEdit?.customerPhone || '');
  const [altPhone, setAltPhone] = useState(orderToEdit?.altPhone || '');
  const [city, setCity] = useState(orderToEdit?.city || 'Lahore');
  const [completeAddress, setCompleteAddress] = useState(orderToEdit?.completeAddress || '');
  const [landmark, setLandmark] = useState(orderToEdit?.landmark || '');

  // Product Selection
  const defaultProd = presetProduct || products[0];
  const [selectedProductId, setSelectedProductId] = useState(
    orderToEdit?.productId || defaultProd?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(orderToEdit?.quantity || 1);
  const [sellingPrice, setSellingPrice] = useState<number>(
    orderToEdit?.sellingPrice || defaultProd?.retailPrice || 2299
  );
  const [productCost, setProductCost] = useState<number>(
    orderToEdit?.productCost || defaultProd?.totalCost || 1800
  );
  const [deliveryCharges, setDeliveryCharges] = useState<number>(
    orderToEdit?.deliveryCharges ?? 200
  );

  // Payment & Courier
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    orderToEdit?.paymentMethod || 'Cash on Delivery (COD)'
  );
  const [advancePayment, setAdvancePayment] = useState<number>(
    orderToEdit?.advancePayment || 0
  );
  const [courierCompany, setCourierCompany] = useState<CourierCompany>(
    orderToEdit?.courierCompany || 'Trax'
  );
  const [trackingNumber, setTrackingNumber] = useState(orderToEdit?.trackingNumber || '');
  const [status, setStatus] = useState<OrderStatus>(orderToEdit?.status || 'New Order');
  const [notes, setNotes] = useState(orderToEdit?.notes || '');

  // Handle product selection change
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setSellingPrice(prod.retailPrice);
      setProductCost(prod.totalCost || prod.wholesalePrice);
    }
  };

  // Quick lookup customer by phone to auto-fill address if existing
  const handlePhoneBlur = () => {
    if (!customerPhone.trim()) return;
    const matched = customers.find(c => c.phone.includes(customerPhone.trim()));
    if (matched && !customerName) {
      setCustomerName(matched.name);
      setCity(matched.city);
      setCompleteAddress(matched.address);
    }
  };

  // Computations
  const totalAmount = Number(sellingPrice) * Number(quantity) + Number(deliveryCharges);
  const remainingPayment = Math.max(0, totalAmount - Number(advancePayment));
  const profit = (Number(sellingPrice) - Number(productCost)) * Number(quantity);

  const selectedProduct =
    products.find(p => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedProduct) return;

    const newOrder: Order = {
      id,
      orderDate,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      altPhone: altPhone.trim(),
      city: city.trim(),
      completeAddress: completeAddress.trim(),
      landmark: landmark.trim(),
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      productImageUrl: selectedProduct.imageUrl,
      quantity: Number(quantity),
      sellingPrice: Number(sellingPrice),
      productCost: Number(productCost),
      deliveryCharges: Number(deliveryCharges),
      totalAmount,
      profit,
      paymentMethod,
      advancePayment: Number(advancePayment),
      remainingPayment,
      courierCompany,
      trackingNumber: trackingNumber.trim(),
      status,
      notes: notes.trim(),
    };

    onSave(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#261A66]">
              {id}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {orderToEdit ? 'Edit Customer Order' : 'Create New Customer Order'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Product Selection & Pricing */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#EF5F18]" />
              <span>1. Product Selection & Economics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product *
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#EF5F18]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} - Retail: Rs. {p.retailPrice} ({p.primarySupplierName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price / Unit *
                </label>
                <input
                  type="number"
                  required
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers font-bold text-[#EF5F18] border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Cost / Unit
                </label>
                <input
                  type="number"
                  required
                  value={productCost}
                  onChange={e => setProductCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Charges
                </label>
                <input
                  type="number"
                  min={0}
                  value={deliveryCharges}
                  onChange={e => setDeliveryCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calculated Profit
                </label>
                <div className="px-3 py-2 text-sm font-mono-numbers font-bold text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
                  +Rs. {profit}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Shipping Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#261A66]" />
              <span>2. Customer & Delivery Address</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="03001234567"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Raza"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternative Phone
                </label>
                <input
                  type="text"
                  placeholder="03211234567 (Optional)"
                  value={altPhone}
                  onChange={e => setAltPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Karachi, Rawalpindi"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House #, Street #, Sector / Area"
                  value={completeAddress}
                  onChange={e => setCompleteAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Nearest Famous Place
              </label>
              <input
                type="text"
                placeholder="e.g. Near Commercial Market, Behind PSO Pump"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Section 3: Payment, Courier & Status */}
          <div className="space-y-4 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
              3. Payment & Courier Fulfillment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance Payment (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  value={advancePayment}
                  onChange={e => setAdvancePayment(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remaining COD Due
                </label>
                <div className="px-3 py-2 text-sm font-mono-numbers font-bold text-[#EF5F18] bg-orange-50 rounded-lg border border-orange-200">
                  Rs. {remainingPayment}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Courier Company
                </label>
                <select
                  value={courierCompany}
                  onChange={e => setCourierCompany(e.target.value as CourierCompany)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {COURIER_COMPANIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-99482104"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Status *
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Notes / Customer Special Requests
              </label>
              <input
                type="text"
                placeholder="e.g. Call before delivery, requested orange strap"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Total Order Amount: <strong className="text-slate-900 font-mono-numbers">Rs. {totalAmount}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg transition-colors shadow-sm"
              >
                {orderToEdit ? 'Update Order' : 'Book Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
