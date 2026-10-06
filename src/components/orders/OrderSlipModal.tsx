import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order, BusinessSettings } from '../../types';
import { formatCurrency } from '../../services/helpers';

interface OrderSlipModalProps {
  order: Order | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const OrderSlipModal: React.FC<OrderSlipModalProps> = ({ order, settings, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-none print:m-0 print:w-full">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Packing Slip / Delivery Invoice</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#261A66] hover:bg-[#1f1552] rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-order-slip" className="p-8 text-slate-900 space-y-6 bg-white">
          {/* Slip Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black text-[#261A66] tracking-tight">
                {settings.businessName || 'Buyzaar'}
              </h1>
              {settings.tagline && (
                <div className="text-xs text-slate-600 mt-1">{settings.tagline}</div>
              )}
              {settings.phone && (
                <div className="text-xs text-slate-600">
                  Whatsapp: {settings.phone}
                </div>
              )}
              {settings.address && <div className="text-xs text-slate-600">{settings.address}</div>}
            </div>

            <div className="text-right">
              <span className="font-mono-numbers text-lg font-black text-[#EF5F18] block">
                {order.id}
              </span>
              <div className="text-xs text-slate-500 font-mono-numbers">Date: {order.orderDate}</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">
                Courier: {order.courierCompany}
              </div>
              {order.trackingNumber && (
                <div className="text-xs font-mono-numbers font-semibold text-slate-700">
                  Track: {order.trackingNumber}
                </div>
              )}
            </div>
          </div>

          {/* Consignee / Customer Details Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ship To Customer:
            </div>
            <div className="text-base font-bold text-slate-900">{order.customerName}</div>
            <div className="text-sm font-semibold font-mono-numbers text-slate-800">
              📞 {order.customerPhone} {order.altPhone ? `/ ${order.altPhone}` : ''}
            </div>
            <div className="text-xs text-slate-700 leading-relaxed pt-1">
              <strong>Address:</strong> {order.completeAddress}, <strong>{order.city}</strong>
              {order.landmark && (
                <div className="text-slate-500 mt-0.5">
                  <strong>Landmark:</strong> {order.landmark}
                </div>
              )}
            </div>
          </div>

          {/* Ordered Products Table */}
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2.5 border border-slate-200 font-semibold">SKU / Code</th>
                <th className="p-2.5 border border-slate-200 font-semibold">Product Description</th>
                <th className="p-2.5 border border-slate-200 font-semibold text-center">Qty</th>
                <th className="p-2.5 border border-slate-200 font-semibold text-right">Price</th>
                <th className="p-2.5 border border-slate-200 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2.5 border border-slate-200 font-mono-numbers font-bold">
                  {order.productSku}
                </td>
                <td className="p-2.5 border border-slate-200 font-medium">
                  {order.productName}
                </td>
                <td className="p-2.5 border border-slate-200 text-center font-bold font-mono-numbers">
                  {order.quantity}
                </td>
                <td className="p-2.5 border border-slate-200 text-right font-mono-numbers">
                  {formatCurrency(order.sellingPrice, settings.currency)}
                </td>
                <td className="p-2.5 border border-slate-200 text-right font-mono-numbers font-bold">
                  {formatCurrency(order.sellingPrice * order.quantity, settings.currency)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pricing Totals & Payment Method */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs space-y-1 text-xs">
              <div>
                <strong>Payment Mode:</strong>{' '}
                <span className="font-semibold text-[#261A66]">{order.paymentMethod}</span>
              </div>
              {order.advancePayment > 0 && (
                <div>
                  <strong>Advance Received:</strong>{' '}
                  <span className="font-mono-numbers text-emerald-700">
                    {formatCurrency(order.advancePayment, settings.currency)}
                  </span>
                </div>
              )}
              {order.notes && (
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 mt-2">
                  <strong>Order Note:</strong> {order.notes}
                </div>
              )}
            </div>

            <div className="w-56 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono-numbers">
                  {formatCurrency(order.sellingPrice * order.quantity, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span className="font-mono-numbers">
                  {formatCurrency(order.deliveryCharges, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>TOTAL AMOUNT:</span>
                <span className="font-mono-numbers">
                  {formatCurrency(order.totalAmount, settings.currency)}
                </span>
              </div>
              {order.remainingPayment > 0 && (
                <div className="flex justify-between text-base font-black text-[#EF5F18] pt-1">
                  <span>COD DUE:</span>
                  <span className="font-mono-numbers">
                    {formatCurrency(order.remainingPayment, settings.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Notice */}
          <div className="pt-4 border-t border-dashed border-slate-300 text-[11px] text-slate-500 text-center leading-relaxed">
            Please make an uncut 360° unboxing video while opening parcel to claim any warranty or missing items.
            Thank you for shopping with {settings.businessName}!
          </div>
        </div>
      </div>
    </div>
  );
};
