import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Filter,
  Printer,
  MessageCircle,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus, CourierCompany, BusinessSettings } from '../../types';
import { formatCurrency, exportToCsv } from '../../services/helpers';

interface OrdersViewProps {
  orders: Order[];
  settings: BusinessSettings;
  onOpenNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onPrintOrderSlip: (order: Order) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  settings,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateOrderStatus,
  onPrintOrderSlip,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New Order':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Customer Confirmation Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Supplier Stock Check':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Product Purchased':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Ready to Dispatch':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Dispatched':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Returned':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Complaint':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.productSku.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      const matchesCourier = selectedCourier === 'all' || o.courierCompany === selectedCourier;

      return matchesSearch && matchesStatus && matchesCourier;
    });
  }, [orders, searchQuery, selectedStatus, selectedCourier]);

  const handleExportCsv = () => {
    const rows = filteredOrders.map(o => ({
      OrderID: o.id,
      Date: o.orderDate,
      CustomerName: o.customerName,
      CustomerPhone: o.customerPhone,
      City: o.city,
      Address: o.completeAddress,
      ProductSKU: o.productSku,
      ProductName: o.productName,
      Quantity: o.quantity,
      SellingPrice: o.sellingPrice,
      ProductCost: o.productCost,
      DeliveryCharges: o.deliveryCharges,
      TotalAmount: o.totalAmount,
      Profit: o.profit,
      PaymentMethod: o.paymentMethod,
      AdvancePayment: o.advancePayment,
      RemainingCOD: o.remainingPayment,
      CourierCompany: o.courierCompany,
      TrackingNumber: o.trackingNumber,
      Status: o.status,
      Notes: o.notes,
    }));
    exportToCsv(`ResellHub_Orders_${new Date().toISOString().split('T')[0]}`, rows);
    onShowToast('Exported orders to CSV!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order Management</h2>
          <p className="text-xs text-slate-500">
            {filteredOrders.length} orders listed · Live courier tracking & fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, phone, city, SKU, tracking..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            >
              <option value="all">All Order Statuses</option>
              <option value="New Order">New Order</option>
              <option value="Customer Confirmation Pending">Customer Confirmation Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Supplier Stock Check">Supplier Stock Check</option>
              <option value="Ready to Dispatch">Ready to Dispatch</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCourier}
              onChange={e => setSelectedCourier(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            >
              <option value="all">All Couriers</option>
              <option value="Trax">Trax</option>
              <option value="TCS">TCS</option>
              <option value="Leopard">Leopard</option>
              <option value="PostEx">PostEx</option>
              <option value="M&P">M&P</option>
              <option value="Call Courier">Call Courier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No customer orders match your active search and status filter.
          </p>
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg"
          >
            + Create New Order
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Order ID & Date</th>
                  <th className="py-3 px-3.5 font-semibold">Customer & Destination</th>
                  <th className="py-3 px-3.5 font-semibold">Product</th>
                  <th className="py-3 px-3.5 font-semibold">Total Amount</th>
                  <th className="py-3 px-3.5 font-semibold">Profit</th>
                  <th className="py-3 px-3.5 font-semibold">Courier & Tracking</th>
                  <th className="py-3 px-3.5 font-semibold">Status</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const cleanPhone = order.customerPhone.replace(/\D/g, '');
                  const waNumber = cleanPhone.startsWith('03') ? '92' + cleanPhone.substring(1) : cleanPhone;
                  const waMessage = encodeURIComponent(
                    `Assalam-o-Alaikum ${order.customerName}! Your order ${order.id} for ${order.productName} (Total: ${formatCurrency(order.totalAmount, settings.currency)}) has been booked. Courier: ${order.courierCompany} ${order.trackingNumber ? `(Tracking: ${order.trackingNumber})` : ''}. Thank you for shopping with ${settings.businessName}!`
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono-numbers font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {order.id}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                          {order.orderDate}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-slate-500 font-mono-numbers text-[11px] mt-0.5">
                          {order.customerPhone}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[180px]">
                          {order.city} - {order.completeAddress}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={order.productImageUrl}
                            alt={order.productName}
                            className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1 max-w-[150px]">
                              {order.productName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono-numbers">
                              {order.quantity}x @ {formatCurrency(order.sellingPrice, settings.currency)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono-numbers font-bold text-slate-900">
                          {formatCurrency(order.totalAmount, settings.currency)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {order.remainingPayment > 0 ? (
                            <span className="text-[#EF5F18] font-bold font-mono-numbers">
                              COD: {formatCurrency(order.remainingPayment, settings.currency)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold">Paid</span>
                          )}
                        </div>
                      </td>

                      {/* Profit */}
                      <td className="py-3 px-3.5 font-mono-numbers font-bold text-emerald-600">
                        +{formatCurrency(order.profit, settings.currency)}
                      </td>

                      {/* Courier & Tracking */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800">{order.courierCompany}</div>
                        {order.trackingNumber ? (
                          <span className="font-mono-numbers text-[10px] text-slate-500 bg-slate-50 px-1 rounded border border-slate-200 block truncate max-w-[110px]">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium">Pending Tracking</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Fast Action Buttons */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Fast status state buttons */}
                          {order.status === 'New Order' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(order.id, 'Confirmed');
                                onShowToast(`Order ${order.id} marked as Confirmed!`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                              title="Mark Confirmed"
                            >
                              Confirm
                            </button>
                          )}

                          {order.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(order.id, 'Dispatched');
                                onShowToast(`Order ${order.id} marked as Dispatched!`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors flex items-center gap-1"
                              title="Mark Dispatched"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {order.status === 'Dispatched' && (
                            <button
                              onClick={() => {
                                onUpdateOrderStatus(order.id, 'Delivered');
                                onShowToast(`Order ${order.id} marked as Delivered!`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors flex items-center gap-1"
                              title="Mark Delivered"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </button>
                          )}

                          {/* Print Slip */}
                          <button
                            onClick={() => onPrintOrderSlip(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="Print Packing Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Customer */}
                          <a
                            href={`https://wa.me/${waNumber}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="Edit Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel / Delete */}
                          <button
                            onClick={() => onDeleteOrder(order)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
