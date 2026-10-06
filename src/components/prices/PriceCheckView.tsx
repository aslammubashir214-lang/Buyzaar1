import React, { useState } from 'react';
import {
  Check,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Edit3,
  Calendar,
  Search,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Product, Supplier, BusinessSettings } from '../../types';
import { formatCurrency, getPriceCheckStatus } from '../../services/helpers';

interface PriceCheckViewProps {
  products: Product[];
  suppliers: Supplier[];
  settings: BusinessSettings;
  onUpdateProductPrice: (
    productId: string,
    newWholesalePrice: number,
    supplierName: string,
    note?: string
  ) => void;
  onMarkPriceVerifiedToday: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PriceCheckView: React.FC<PriceCheckViewProps> = ({
  products,
  suppliers,
  settings,
  onUpdateProductPrice,
  onMarkPriceVerifiedToday,
  onSelectProduct,
  onShowToast,
}) => {
  const [filterAlert, setFilterAlert] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newWholesalePrice, setNewWholesalePrice] = useState<number>(0);
  const [priceUpdateNote, setPriceUpdateNote] = useState<string>('');

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.primarySupplierName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const status = getPriceCheckStatus(p.lastPriceChecked);
    if (filterAlert === 'all') return matchesSearch;
    if (filterAlert === 'critical') return matchesSearch && status.days > 15;
    if (filterAlert === 'urgent') return matchesSearch && status.days > 7;
    if (filterAlert === 'warning') return matchesSearch && status.days > 3;
    if (filterAlert === 'verified') return matchesSearch && status.days <= 3;
    return matchesSearch;
  });

  const handleOpenPriceModal = (product: Product) => {
    setEditingProduct(product);
    setNewWholesalePrice(product.wholesalePrice);
    setPriceUpdateNote('WhatsApp group rate update');
  };

  const handleSavePriceModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || newWholesalePrice <= 0) return;

    onUpdateProductPrice(
      editingProduct.id,
      Number(newWholesalePrice),
      editingProduct.primarySupplierName,
      priceUpdateNote.trim()
    );
    onShowToast(`Updated wholesale price for ${editingProduct.name}!`, 'success');
    setEditingProduct(null);
  };

  // Summary counts
  const criticalCount = products.filter(p => getPriceCheckStatus(p.lastPriceChecked).days > 15).length;
  const urgentCount = products.filter(p => {
    const d = getPriceCheckStatus(p.lastPriceChecked).days;
    return d > 7 && d <= 15;
  }).length;
  const warningCount = products.filter(p => {
    const d = getPriceCheckStatus(p.lastPriceChecked).days;
    return d > 3 && d <= 7;
  }).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Wholesale Price Verification Monitor
        </h2>
        <p className="text-xs text-slate-500">
          Electronics wholesaler rates fluctuate weekly. Verify prices before taking new customer orders.
        </p>
      </div>

      {/* Warning Alert Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterAlert('critical')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
            filterAlert === 'critical'
              ? 'bg-rose-100 border-rose-400'
              : 'bg-rose-50 border-rose-200 hover:bg-rose-100/70'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
            Critical Overdue (&gt;15 Days)
          </div>
          <div className="text-2xl font-bold text-rose-900 font-mono-numbers mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-700">High risk of price surge</div>
        </div>

        <div
          onClick={() => setFilterAlert('urgent')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
            filterAlert === 'urgent'
              ? 'bg-amber-100 border-amber-400'
              : 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Needs Check (&gt;7 Days)
          </div>
          <div className="text-2xl font-bold text-amber-900 font-mono-numbers mt-1">
            {urgentCount}
          </div>
          <div className="text-[11px] text-amber-700">Check with supplier</div>
        </div>

        <div
          onClick={() => setFilterAlert('warning')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
            filterAlert === 'warning'
              ? 'bg-yellow-100 border-yellow-400'
              : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100/70'
          }`}
        >
          <div className="text-[11px] font-bold text-yellow-800 uppercase tracking-wider">
            Warning (&gt;3 Days)
          </div>
          <div className="text-2xl font-bold text-yellow-900 font-mono-numbers mt-1">
            {warningCount}
          </div>
          <div className="text-[11px] text-yellow-700">Review WhatsApp message</div>
        </div>

        <div
          onClick={() => setFilterAlert('all')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
            filterAlert === 'all'
              ? 'bg-slate-200 border-slate-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            All Products
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-500">View complete catalog</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name, SKU, or supplier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
          />
        </div>
      </div>

      {/* Products Table with Price Check Tools */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Product & SKU</th>
                <th className="py-3 px-4 font-semibold">Wholesaler</th>
                <th className="py-3 px-4 font-semibold">Current Wholesale</th>
                <th className="py-3 px-4 font-semibold">Previous Wholesale</th>
                <th className="py-3 px-4 font-semibold">Price Diff</th>
                <th className="py-3 px-4 font-semibold">Retail Price</th>
                <th className="py-3 px-4 font-semibold">Last Checked</th>
                <th className="py-3 px-4 font-semibold text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const status = getPriceCheckStatus(product.lastPriceChecked);
                const history = product.priceHistory || [];
                const prevEntry = history.length > 1 ? history[history.length - 2] : null;
                const prevPrice = prevEntry ? prevEntry.wholesalePrice : product.wholesalePrice;
                const priceDiff = product.wholesalePrice - prevPrice;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-mono-numbers text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                          <div
                            onClick={() => onSelectProduct(product)}
                            className="font-bold text-slate-900 cursor-pointer hover:text-[#EF5F18] line-clamp-1"
                          >
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Wholesaler */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {product.primarySupplierName}
                    </td>

                    {/* Current Wholesale */}
                    <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900 text-sm">
                      {formatCurrency(product.wholesalePrice, settings.currency)}
                    </td>

                    {/* Previous Wholesale */}
                    <td className="py-3 px-4 font-mono-numbers text-slate-500">
                      {prevEntry
                        ? formatCurrency(prevEntry.wholesalePrice, settings.currency)
                        : formatCurrency(product.wholesalePrice, settings.currency)}
                    </td>

                    {/* Price Difference */}
                    <td className="py-3 px-4">
                      {priceDiff === 0 ? (
                        <span className="text-slate-400 font-mono-numbers">No change</span>
                      ) : priceDiff > 0 ? (
                        <span className="text-rose-600 font-mono-numbers font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{formatCurrency(priceDiff, settings.currency)}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-mono-numbers font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>-{formatCurrency(Math.abs(priceDiff), settings.currency)}</span>
                        </span>
                      )}
                    </td>

                    {/* Retail Price */}
                    <td className="py-3 px-4 font-mono-numbers font-bold text-[#EF5F18]">
                      {formatCurrency(product.retailPrice, settings.currency)}
                    </td>

                    {/* Last Checked */}
                    <td className="py-3 px-4">
                      <div className="font-mono-numbers text-slate-700">
                        {product.lastPriceChecked}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          status.level === 'ok'
                            ? 'bg-emerald-50 text-emerald-700'
                            : status.level === 'warning'
                            ? 'bg-yellow-50 text-yellow-800'
                            : status.level === 'urgent'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-700 font-bold'
                        }`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Instant Verify Today Button */}
                        <button
                          onClick={() => {
                            onMarkPriceVerifiedToday(product.id);
                            onShowToast(`Verified rate for ${product.name} today!`, 'success');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                          title="Confirm wholesale price is still active today"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verified Today</span>
                        </button>

                        {/* Edit Price Modal Button */}
                        <button
                          onClick={() => handleOpenPriceModal(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="Change Wholesale Price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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

      {/* Quick Edit Price Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Wholesale Price
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editingProduct.name}</p>

            <form onSubmit={handleSavePriceModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Wholesale Rate (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newWholesalePrice}
                  onChange={e => setNewWholesalePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-mono-numbers font-bold text-[#EF5F18] border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Source Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp wholesale broadcast group message"
                  value={priceUpdateNote}
                  onChange={e => setPriceUpdateNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg shadow-sm"
                >
                  Save & Log History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
