import React, { useState } from 'react';
import {
  Warehouse,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Package,
  Boxes,
  TrendingDown,
} from 'lucide-react';
import { Product, BusinessSettings } from '../../types';
import { formatCurrency } from '../../services/helpers';

interface InventoryViewProps {
  products: Product[];
  settings: BusinessSettings;
  onUpdateStock: (productId: string, newOwnStockQuantity: number) => void;
  onSelectProduct: (product: Product) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  settings,
  onUpdateStock,
  onSelectProduct,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchesType =
      filterType === 'all' ||
      (filterType === 'low'
        ? p.ownStockQuantity <= p.lowStockThreshold
        : p.stockType === filterType);

    return matchesSearch && matchesType;
  });

  // Inventory valuation
  const totalPhysicalUnits = products.reduce((acc, p) => acc + (p.ownStockQuantity || 0), 0);
  const totalPhysicalValue = products.reduce(
    (acc, p) => acc + (p.ownStockQuantity || 0) * (p.ownStockPurchasePrice || p.wholesalePrice),
    0
  );
  const lowStockCount = products.filter(p => p.ownStockQuantity <= p.lowStockThreshold).length;

  const handleAdjustStock = (product: Product, delta: number) => {
    const updated = Math.max(0, product.ownStockQuantity + delta);
    onUpdateStock(product.id, updated);
    onShowToast(
      `Updated ${product.name} physical stock to ${updated} units.`,
      'info'
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Physical Stock & Inventory Valuation
        </h2>
        <p className="text-xs text-slate-500">
          Manage your physically held inventory vs. on-demand wholesaler stock
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#261A66] flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Physical Stock Units</div>
            <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
              {totalPhysicalUnits} pcs
            </div>
            <div className="text-[11px] text-slate-400">Stored at your location</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#EF5F18] flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Inventory Asset Value</div>
            <div className="text-2xl font-bold text-[#EF5F18] font-mono-numbers">
              {formatCurrency(totalPhysicalValue, settings.currency)}
            </div>
            <div className="text-[11px] text-slate-400">At purchase wholesale cost</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Low Stock Alerts</div>
            <div className="text-2xl font-bold text-amber-600 font-mono-numbers">
              {lowStockCount} items
            </div>
            <div className="text-[11px] text-slate-400">Below threshold level</div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory by product name, SKU, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
          >
            <option value="all">All Inventory</option>
            <option value="low">⚠️ Low Stock Alerts Only</option>
            <option value="Own Stock">Own Stock Only</option>
            <option value="Both">Both (Own + Supplier)</option>
            <option value="Supplier Stock">Supplier Stock (On Demand)</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU & Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Stock Model</th>
                <th className="py-3 px-4 font-semibold">Own Physical Stock</th>
                <th className="py-3 px-4 font-semibold">Unit Purchase Cost</th>
                <th className="py-3 px-4 font-semibold">Asset Value</th>
                <th className="py-3 px-4 font-semibold">Alert Level</th>
                <th className="py-3 px-4 font-semibold text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLow = product.ownStockQuantity <= product.lowStockThreshold;
                const assetVal =
                  product.ownStockQuantity * (product.ownStockPurchasePrice || product.wholesalePrice);

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
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

                    <td className="py-3 px-4 text-slate-600">{product.category}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {product.stockType}
                      </span>
                    </td>

                    {/* Own Stock Qty */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono-numbers text-sm font-bold ${
                            isLow ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {product.ownStockQuantity} pcs
                        </span>
                        {isLow && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3 px-4 font-mono-numbers text-slate-700">
                      {formatCurrency(
                        product.ownStockPurchasePrice || product.wholesalePrice,
                        settings.currency
                      )}
                    </td>

                    {/* Asset Value */}
                    <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900">
                      {formatCurrency(assetVal, settings.currency)}
                    </td>

                    {/* Threshold */}
                    <td className="py-3 px-4 font-mono-numbers text-slate-500">
                      Alert &le; {product.lowStockThreshold} pcs
                    </td>

                    {/* Adjusters */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAdjustStock(product, -1)}
                          className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold"
                          title="Decrease 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(product, 1)}
                          className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold"
                          title="Increase 1"
                        >
                          <Plus className="w-3 h-3" />
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
    </div>
  );
};
