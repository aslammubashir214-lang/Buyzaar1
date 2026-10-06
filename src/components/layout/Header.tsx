import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  ShoppingCart,
  Bell,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Product, UserSession } from '../../types';
import { ActiveTab } from './Sidebar';
import { formatCurrency, getPriceCheckStatus } from '../../services/helpers';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  session: UserSession;
  onToggleRole: () => void;
  setIsMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOrder,
  onOpenNewProduct,
  products,
  onSelectProduct,
  session,
  onToggleRole,
  setIsMobileOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Price alerts (>3 days)
  const alertedProducts = products.filter(p => {
    const status = getPriceCheckStatus(p.lastPriceChecked);
    return status.level !== 'ok';
  });

  // Filter products for quick search
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(p => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.primarySupplierName.toLowerCase().includes(q) ||
            p.color.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSelectSearchResult = (p: Product) => {
    setSearchQuery('');
    setShowSearchResults(false);
    onSelectProduct(p);
  };

  const getBreadcrumbTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Business Overview';
      case 'products':
        return 'Product Management';
      case 'suppliers':
        return 'Wholesaler Directory';
      case 'orders':
        return 'Order Management';
      case 'customers':
        return 'Customer Directory';
      case 'prices':
        return 'Price Verification';
      case 'inventory':
        return 'Stock & Inventory';
      case 'expenses':
        return 'Business Expenses';
      case 'social':
        return 'WhatsApp & Social Media Tools';
      case 'policies':
        return 'Store Warranty Policies';
      case 'reports':
        return 'Analytics & Reports';
      case 'settings':
        return 'Settings & Backup';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left zone: Mobile toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="text-xs text-slate-500 font-medium">Buyzaar</div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            {getBreadcrumbTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Middle zone: Instant Global Product Search */}
      <div className="relative flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search product, SKU (e.g. T800 Ultra, SW-001)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between">
              <span>Matching Products ({filteredProducts.length})</span>
              <span className="text-slate-400">Click to view details</span>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const cheapestSupplier =
                    p.supplierQuotes && p.supplierQuotes.length > 0
                      ? [...p.supplierQuotes].sort((a, b) => a.wholesalePrice - b.wholesalePrice)[0]
                      : null;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSearchResult(p)}
                      className="p-3 hover:bg-orange-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-sm text-slate-900 leading-tight">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono-numbers font-medium text-slate-700">
                              {p.sku}
                            </span>
                            <span>·</span>
                            <span>{p.category}</span>
                            <span>·</span>
                            <span className="text-[#261A66] font-medium">
                              {p.primarySupplierName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">
                          Wholesale:{' '}
                          <span className="font-mono-numbers font-medium text-slate-800">
                            {formatCurrency(p.wholesalePrice)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Retail:{' '}
                          <span className="font-mono-numbers font-bold text-[#EF5F18]">
                            {formatCurrency(p.retailPrice)}
                          </span>
                        </div>
                        {cheapestSupplier && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Best: {formatCurrency(cheapestSupplier.wholesalePrice)} ({cheapestSupplier.supplierName})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                No products found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right zone: Price notification + Actions + Role */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Outdated price alerts bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Price Check Alerts"
          >
            <Bell className="w-5 h-5" />
            {alertedProducts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF5F18] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono-numbers">
                {alertedProducts.length}
              </span>
            )}
          </button>

          {/* Price Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900">
                    Price Verification Alerts ({alertedProducts.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {alertedProducts.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  All product wholesale prices verified recently!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {alertedProducts.slice(0, 5).map(prod => {
                    const status = getPriceCheckStatus(prod.lastPriceChecked);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('prices');
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50/50 cursor-pointer text-xs border border-slate-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-800">{prod.name}</span>
                          <span className="font-mono-numbers text-[11px] text-rose-600 font-semibold">
                            {status.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                          <span>Supplier: {prod.primarySupplierName}</span>
                          <span className="font-mono-numbers">
                            Wholesale: {formatCurrency(prod.wholesalePrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => {
                  setShowNotifications(false);
                  setActiveTab('prices');
                }}
                className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-[#EF5F18] hover:bg-orange-50 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                Go to Price Check Module <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Product */}
        <button
          onClick={onOpenNewProduct}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#261A66] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/50"
        >
          <Plus className="w-3.5 h-3.5 text-[#EF5F18]" />
          <span>Add Product</span>
        </button>

        {/* Quick New Order Button */}
        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg transition-colors shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Order</span>
          <span className="xs:hidden">Order</span>
        </button>

        {/* Role toggle button (Admin / Staff) */}
        <button
          onClick={onToggleRole}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="Click to toggle role preview"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Role: <strong className="text-slate-900">{session.role}</strong></span>
        </button>
      </div>
    </header>
  );
};
