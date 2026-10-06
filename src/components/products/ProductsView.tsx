import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  CopyPlus,
  Check,
  AlertCircle,
  Eye,
  ShoppingCart,
  TrendingUp,
  FolderPlus,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, Supplier, ProductCategory, BusinessSettings } from '../../types';
import {
  formatCurrency,
  getPriceCheckStatus,
  exportToCsv,
  downloadImage,
  downloadAllProductImages,
  getCategoryPrefix,
} from '../../services/helpers';

interface ProductsViewProps {
  products: Product[];
  suppliers: Supplier[];
  categories: string[];
  settings: BusinessSettings;
  onSelectProduct: (product: Product) => void;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onToggleStockStatus: (product: Product) => void;
  onNewOrderForProduct: (product: Product) => void;
  onAddNewCategory?: (newCategory: string) => void;
  onDeleteCategory?: (category: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  suppliers,
  categories,
  settings,
  onSelectProduct,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleStockStatus,
  onNewOrderForProduct,
  onAddNewCategory,
  onDeleteCategory,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'cheapest' | 'highest_profit' | 'recently_updated' | 'recently_added' | 'name'
  >('recently_updated');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Category management modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Dynamic Categories filter list
  const categoryFilterList: (string | 'all')[] = ['all', ...categories];

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.primarySupplierName.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'alert'
          ? getPriceCheckStatus(p.lastPriceChecked).level !== 'ok'
          : p.stockStatus === selectedStatus);

      const matchesSupplier =
        selectedSupplier === 'all' ||
        p.primarySupplierId === selectedSupplier ||
        p.supplierQuotes?.some(q => q.supplierId === selectedSupplier);

      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedSupplier]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'cheapest':
          return a.wholesalePrice - b.wholesalePrice;
        case 'highest_profit':
          return b.profitAmount - a.profitAmount;
        case 'recently_updated':
          return (
            new Date(b.lastPriceChecked || b.lastUpdated).getTime() -
            new Date(a.lastPriceChecked || a.lastUpdated).getTime()
          );
        case 'recently_added':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  const handleExportCsv = () => {
    const rows = sortedProducts.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      Model: p.model,
      Color: p.color,
      Brand: p.brand,
      PrimarySupplier: p.primarySupplierName,
      WholesalePrice: p.wholesalePrice,
      RetailPrice: p.retailPrice,
      MinPrice: p.minSellingPrice,
      PackagingCost: p.packagingCost,
      TransportCost: p.transportCost,
      AdCost: p.adCost,
      TotalCost: p.totalCost,
      Profit: p.profitAmount,
      ProfitPercent: `${p.profitPercentage}%`,
      StockStatus: p.stockStatus,
      StockQuantity: p.stockQuantity,
      OwnStockQuantity: p.ownStockQuantity,
      Warranty: p.checkingWarranty,
      LastPriceChecked: p.lastPriceChecked,
    }));
    exportToCsv(`ResellHub_Products_${new Date().toISOString().split('T')[0]}`, rows);
    onShowToast('Exported products to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Products Catalog</h2>
          <p className="text-xs text-slate-500">
            {filteredProducts.length} of {products.length} products listed
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
            onClick={onOpenNewProduct}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search query */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, model, supplier, brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
            />
          </div>

          {/* Supplier filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            >
              <option value="all">All Wholesalers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.businessName}
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="alert">⚠️ Price Check Alert</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            >
              <option value="recently_updated">Recently Updated</option>
              <option value="cheapest">Cheapest Wholesale</option>
              <option value="highest_profit">Highest Profit</option>
              <option value="recently_added">Recently Added</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {categoryFilterList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#261A66] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-colors bg-orange-50 hover:bg-orange-100 text-[#EF5F18] border border-orange-200 flex items-center gap-1 shadow-2xs"
              title="Create or Manage Product Categories"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Add Category</span>
            </button>
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Content: Grid or Table */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-orange-50 text-[#EF5F18] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query, clearing filters, or adding a new electronics product.
          </p>
          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg transition-colors"
          >
            + Add First Product
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map(product => {
            const priceStatus = getPriceCheckStatus(product.lastPriceChecked);
            const cheapestQuote =
              product.supplierQuotes && product.supplierQuotes.length > 0
                ? [...product.supplierQuotes].sort((a, b) => a.wholesalePrice - b.wholesalePrice)[0]
                : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-[#EF5F18]/50 hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Image and badges */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-video sm:aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="font-mono-numbers text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                      {product.sku}
                    </span>
                    {priceStatus.level !== 'ok' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Price {priceStatus.days}d</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={async e => {
                        e.stopPropagation();
                        const ok = await downloadImage(product.imageUrl, `${product.name}_${product.sku}`);
                        if (ok) onShowToast(`Downloaded photo for ${product.name}!`, 'success');
                      }}
                      className="px-2 py-0.5 rounded bg-black/75 hover:bg-[#EF5F18] text-white transition-all shadow-md flex items-center gap-1 text-[10px] font-semibold backdrop-blur-xs"
                      title="1-Click Download Product Photo"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs ${
                        product.stockStatus === 'Available'
                          ? 'bg-emerald-600 text-white'
                          : product.stockStatus === 'Low Stock'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {product.stockStatus}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {product.category}
                    </div>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-sm font-bold text-slate-900 cursor-pointer hover:text-[#EF5F18] line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </h3>

                    {/* Supplier info */}
                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate">
                        Wholesaler: <strong className="text-slate-700">{product.primarySupplierName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Wholesale:</span>
                      <span className="font-mono-numbers font-semibold text-slate-800">
                        {formatCurrency(product.wholesalePrice, settings.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Retail:</span>
                      <span className="font-mono-numbers font-bold text-[#EF5F18]">
                        {formatCurrency(product.retailPrice, settings.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-emerald-700 font-medium">Profit:</span>
                      <span className="font-mono-numbers font-bold text-emerald-600">
                        +{formatCurrency(product.profitAmount, settings.currency)} ({product.profitPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Multi-supplier highlight if exists */}
                  {product.supplierQuotes && product.supplierQuotes.length > 1 && cheapestQuote && (
                    <div className="text-[11px] text-indigo-900 bg-indigo-50/70 p-1.5 rounded border border-indigo-100 flex items-center justify-between">
                      <span>{product.supplierQuotes.length} Wholesalers</span>
                      <span className="font-medium text-emerald-700 font-mono-numbers">
                        Best: {formatCurrency(cheapestQuote.wholesalePrice, settings.currency)}
                      </span>
                    </div>
                  )}

                  {/* Quick Card Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                    <button
                      onClick={async () => {
                        const ok = await downloadImage(product.imageUrl, `${product.name}_${product.sku}`);
                        if (ok) onShowToast(`Downloaded photo for ${product.name}!`, 'success');
                      }}
                      className="px-2 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                      title="1-Click Download Product Photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Photo</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateProduct(product)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                      title="Duplicate Product"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNewOrderForProduct(product)}
                      className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-md transition-colors flex items-center justify-center gap-1 shadow-xs ml-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High Density Table View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">SKU & Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Wholesaler</th>
                  <th className="py-3 px-4 font-semibold">Wholesale</th>
                  <th className="py-3 px-4 font-semibold">Retail</th>
                  <th className="py-3 px-4 font-semibold">Profit</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Price Check</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map(p => {
                  const status = getPriceCheckStatus(p.lastPriceChecked);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-mono-numbers font-bold text-[11px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {p.sku}
                            </span>
                            <div
                              onClick={() => onSelectProduct(p)}
                              className="font-bold text-slate-900 cursor-pointer hover:text-[#EF5F18] mt-0.5 line-clamp-1"
                            >
                              {p.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{p.primarySupplierName}</span>
                        {p.supplierQuotes && p.supplierQuotes.length > 1 && (
                          <span className="block text-[10px] text-indigo-600">
                            +{p.supplierQuotes.length - 1} more quotes
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-numbers font-semibold text-slate-900">
                        {formatCurrency(p.wholesalePrice, settings.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono-numbers font-bold text-[#EF5F18]">
                        {formatCurrency(p.retailPrice, settings.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono-numbers font-bold text-emerald-600 block">
                          +{formatCurrency(p.profitAmount, settings.currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-numbers">
                          {p.profitPercentage}% margin
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            p.stockStatus === 'Available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.stockStatus === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.stockStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono-numbers font-medium ${
                            status.level === 'ok'
                              ? 'text-emerald-600'
                              : status.level === 'warning'
                              ? 'text-amber-600'
                              : 'text-rose-600 font-bold'
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNewOrderForProduct(p)}
                            className="px-2 py-1 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded shadow-xs"
                          >
                            Order
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await downloadImage(p.imageUrl, `${p.name}_${p.sku}`);
                              if (ok) onShowToast(`Downloaded photo for ${p.name}!`, 'success');
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-1 transition-colors"
                            title="1-Click Download Photo"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Photo</span>
                          </button>
                          <button
                            onClick={() => onSelectProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EF5F18] flex items-center justify-center">
                  <FolderPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Categories</h3>
                  <p className="text-[11px] text-slate-500">Create new categories to organize products</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryInput('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Add New Category form */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const trimmed = newCategoryInput.trim();
                  if (!trimmed) return;
                  if (onAddNewCategory) {
                    onAddNewCategory(trimmed);
                  }
                  setNewCategoryInput('');
                }}
                className="space-y-2 bg-orange-50/70 p-3.5 rounded-xl border border-orange-200"
              >
                <label className="block text-xs font-bold text-slate-800">
                  Add New Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Smart Glasses, Tripods, Speakers..."
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryInput.trim()}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] disabled:opacity-50 rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    + Add
                  </button>
                </div>
                {newCategoryInput.trim() && (
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    Auto SKU Prefix will be: <strong className="text-[#261A66]">{getCategoryPrefix(newCategoryInput.trim())}</strong>
                  </p>
                )}
              </form>

              {/* Categories List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  All Current Categories ({categories.length})
                </span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {categories.map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                            {getCategoryPrefix(cat)}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{cat}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {count} {count === 1 ? 'product' : 'products'}
                          </span>
                          {count === 0 && onDeleteCategory && (
                            <button
                              type="button"
                              onClick={() => onDeleteCategory(cat)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title={`Delete category "${cat}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
