import React from 'react';
import {
  Package,
  Users2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Product, Supplier, Order, Expense, BusinessSettings } from '../../types';
import { formatCurrency, getPriceCheckStatus } from '../../services/helpers';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  products: Product[];
  suppliers: Supplier[];
  orders: Order[];
  expenses: Expense[];
  settings: BusinessSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectProduct: (product: Product) => void;
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  suppliers,
  orders,
  expenses,
  settings,
  setActiveTab,
  onSelectProduct,
  onOpenNewOrder,
  onOpenNewProduct,
}) => {
  // Key Stats Calculations
  const totalProducts = products.length;
  const totalSuppliers = suppliers.length;
  const productsAvailable = products.filter(p => p.stockStatus === 'Available').length;
  const productsOutOfStock = products.filter(p => p.stockStatus === 'Out of Stock').length;
  const lowStockProducts = products.filter(
    p => p.stockStatus === 'Low Stock' || (p.stockType !== 'Supplier Stock' && p.ownStockQuantity <= p.lowStockThreshold)
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    o => o.status === 'New Order' || o.status === 'Customer Confirmation Pending' || o.status === 'Supplier Stock Check'
  ).length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready to Dispatch').length;
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled' || o.status === 'Returned').length;

  // Financial calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.orderDate === todayStr && o.status !== 'Cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Month-to-date calculation (current month)
  const currentYearMonth = todayStr.substring(0, 7); // e.g. "2026-10"
  const monthlyOrders = orders.filter(
    o => o.orderDate.startsWith(currentYearMonth) && o.status !== 'Cancelled'
  );
  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const monthlyOrderProfit = monthlyOrders.reduce((sum, o) => sum + o.profit, 0);

  // Monthly expenses
  const monthlyExpenses = expenses
    .filter(e => e.date.startsWith(currentYearMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyNetProfit = monthlyOrderProfit - monthlyExpenses;

  // All time
  const totalOrderProfit = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.profit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNetProfit = totalOrderProfit - totalExpenses;

  // Best Selling Products calculation
  const productSalesMap: Record<string, { product: Product; count: number; revenue: number }> = {};
  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      if (!productSalesMap[o.productId]) {
        const prod = products.find(p => p.id === o.productId || p.sku === o.productSku);
        if (prod) {
          productSalesMap[o.productId] = { product: prod, count: 0, revenue: 0 };
        }
      }
      if (productSalesMap[o.productId]) {
        productSalesMap[o.productId].count += o.quantity;
        productSalesMap[o.productId].revenue += o.sellingPrice * o.quantity;
      }
    }
  });

  const bestSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Recently updated prices (Module 6)
  const recentlyUpdatedPrices = [...products]
    .sort((a, b) => new Date(b.lastPriceChecked).getTime() - new Date(a.lastPriceChecked).getTime())
    .slice(0, 5);

  // Top Selling Categories data for donut chart
  const categorySalesMap: Record<string, number> = {};
  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      const prod = products.find(p => p.id === o.productId || p.sku === o.productSku);
      const cat = prod?.category || 'Other';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + o.quantity;
    }
  });

  const categoryChartData = Object.entries(categorySalesMap).map(([name, value]) => ({
    name,
    value,
  }));
  const totalUnitsSold = categoryChartData.reduce((acc, c) => acc + c.value, 0) || 1;

  // Monthly Sales & Profit Trend (Simulated 6 months data including current)
  const monthlyTrendData = [
    { month: 'May', sales: 48500, profit: 14200 },
    { month: 'Jun', sales: 62000, profit: 18900 },
    { month: 'Jul', sales: 78000, profit: 24500 },
    { month: 'Aug', sales: 91000, profit: 29000 },
    { month: 'Sep', sales: 112000, profit: 34500 },
    { month: 'Oct', sales: Math.max(monthlySales, 32000), profit: Math.max(monthlyNetProfit, 9800) },
  ];
  const maxTrendSales = Math.max(...monthlyTrendData.map(d => d.sales));

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Fast Action CTA */}
      <div className="bg-gradient-to-r from-[#261A66] to-[#3a2899] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Electronics Reselling Control Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Welcome to {settings.businessName}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-xl">
            WhatsApp wholesaler price sync, fast product lookup, automated profit margins, and order fulfillment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewProduct}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/15"
          >
            + Add Product
          </button>
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            + New Order
          </button>
        </div>
      </div>

      {/* Core Business Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Today's Sales</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono-numbers">
            {formatCurrency(todaySales, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {todayOrders.length} orders booked today
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Monthly Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono-numbers">
            {formatCurrency(monthlySales, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {monthlyOrders.length} orders this month
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Monthly Net Profit</span>
            <span className="text-[10px] font-bold text-[#EF5F18] bg-orange-50 px-1.5 py-0.5 rounded">
              After Expenses
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#EF5F18] font-mono-numbers">
            {formatCurrency(monthlyNetProfit, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Expenses: {formatCurrency(monthlyExpenses, settings.currency)}
          </div>
        </div>

        {/* Total Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">All-Time Net Profit</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              Net
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#261A66] font-mono-numbers">
            {formatCurrency(totalNetProfit, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Orders Profit: {formatCurrency(totalOrderProfit, settings.currency)}
          </div>
        </div>
      </div>

      {/* Inventory & Operational Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Products */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#EF5F18] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Products</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers">{totalProducts}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium font-mono-numbers">{productsAvailable} in stock</span>
            <span>·</span>
            <span className="text-rose-500 font-medium font-mono-numbers">{productsOutOfStock} out</span>
          </div>
        </div>

        {/* Suppliers */}
        <div
          onClick={() => setActiveTab('suppliers')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#EF5F18] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Wholesalers</span>
            <Users2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers">{totalSuppliers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active market vendors</div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#EF5F18] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers">{totalOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-amber-600 font-medium font-mono-numbers">{pendingOrders} pending</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#EF5F18] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono-numbers">
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Need supplier restock</div>
        </div>
      </div>

      {/* Orders By Status Breakdown Pipeline */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Order Pipeline & Status</h3>
            <p className="text-xs text-slate-500">Live order fulfillment cycle</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-semibold text-[#EF5F18] hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60">
            <div className="text-[11px] font-semibold text-amber-800">Pending / New</div>
            <div className="text-lg font-bold text-amber-900 font-mono-numbers mt-0.5">
              {pendingOrders}
            </div>
            <div className="text-[10px] text-amber-700">Verification needed</div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/60">
            <div className="text-[11px] font-semibold text-blue-800">Confirmed</div>
            <div className="text-lg font-bold text-blue-900 font-mono-numbers mt-0.5">
              {confirmedOrders}
            </div>
            <div className="text-[10px] text-blue-700">Ready for packing</div>
          </div>

          <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-200/60">
            <div className="text-[11px] font-semibold text-purple-800">Dispatched</div>
            <div className="text-lg font-bold text-purple-900 font-mono-numbers mt-0.5">
              {dispatchedOrders}
            </div>
            <div className="text-[10px] text-purple-700">With courier rider</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
            <div className="text-[11px] font-semibold text-emerald-800">Delivered</div>
            <div className="text-lg font-bold text-emerald-900 font-mono-numbers mt-0.5">
              {deliveredOrders}
            </div>
            <div className="text-[10px] text-emerald-700">Payment received</div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200/60">
            <div className="text-[11px] font-semibold text-rose-800">Cancelled</div>
            <div className="text-lg font-bold text-rose-900 font-mono-numbers mt-0.5">
              {cancelledOrders}
            </div>
            <div className="text-[10px] text-rose-700">Returned/Rejected</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">Total Booked</div>
            <div className="text-lg font-bold text-slate-900 font-mono-numbers mt-0.5">
              {totalOrders}
            </div>
            <div className="text-[10px] text-slate-500">Lifetime volume</div>
          </div>
        </div>
      </div>

      {/* Visual Charts: Monthly Sales & Profit + Top Selling Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Sales & Profit Trend</h3>
              <p className="text-xs text-slate-500">Revenue growth & net reseller profit</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-[#261A66]" /> Sales
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-[#EF5F18]" /> Profit
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100">
            {monthlyTrendData.map((d, index) => {
              const salesHeight = (d.sales / maxTrendSales) * 160;
              const profitHeight = (d.profit / maxTrendSales) * 160;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono-numbers text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(d.sales, settings.currency)}
                  </div>
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1">
                    {/* Sales Bar */}
                    <div
                      style={{ height: `${Math.max(salesHeight, 8)}px` }}
                      className="w-1/2 bg-[#261A66] rounded-t hover:brightness-125 transition-all"
                      title={`${d.month} Sales: ${formatCurrency(d.sales, settings.currency)}`}
                    />
                    {/* Profit Bar */}
                    <div
                      style={{ height: `${Math.max(profitHeight, 4)}px` }}
                      className="w-1/2 bg-[#EF5F18] rounded-t hover:brightness-110 transition-all"
                      title={`${d.month} Profit: ${formatCurrency(d.profit, settings.currency)}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Average Monthly Revenue: {formatCurrency(78000, settings.currency)}</span>
            <span className="font-semibold text-emerald-600">Healthy Margin ~31%</span>
          </div>
        </div>

        {/* Top Selling Categories (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Selling Categories</h3>
            <p className="text-xs text-slate-500">Distribution by volume</p>
          </div>

          <div className="py-4 space-y-3">
            {categoryChartData.map((cat, idx) => {
              const pct = Math.round((cat.value / totalUnitsSold) * 100);
              const colors = ['bg-[#261A66]', 'bg-[#EF5F18]', 'bg-amber-500', 'bg-blue-600', 'bg-emerald-600'];
              const color = colors[idx % colors.length];

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-mono-numbers font-semibold text-slate-900">
                      {cat.value} pcs ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${color} rounded-full`} />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors border border-slate-200"
          >
            Explore Detailed Reports
          </button>
        </div>
      </div>

      {/* Tables Row: Best Selling Products & Recently Updated Wholesale Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#EF5F18]" />
              <h3 className="text-sm font-bold text-slate-900">Best Selling Products</h3>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-[#EF5F18] font-semibold hover:underline"
            >
              All Products
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {bestSellingProducts.map(({ product, count, revenue }) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-900 line-clamp-1">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono-numbers font-medium text-slate-700">
                        {product.sku}
                      </span>
                      <span>·</span>
                      <span className="text-[#261A66] font-medium">
                        {product.primarySupplierName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 font-mono-numbers">
                    {count} sold
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono-numbers">
                    {formatCurrency(revenue, settings.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Updated Prices */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#261A66]" />
              <h3 className="text-sm font-bold text-slate-900">Wholesale Price Updates</h3>
            </div>
            <button
              onClick={() => setActiveTab('prices')}
              className="text-xs text-[#261A66] font-semibold hover:underline"
            >
              Verify Prices
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentlyUpdatedPrices.map(product => {
              const status = getPriceCheckStatus(product.lastPriceChecked);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Supplier: <span className="font-medium text-slate-700">{product.primarySupplierName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 font-mono-numbers">
                      {formatCurrency(product.wholesalePrice, settings.currency)}
                    </div>
                    <div
                      className={`text-[10px] font-mono-numbers font-medium ${
                        status.level === 'ok'
                          ? 'text-emerald-600'
                          : status.level === 'warning'
                          ? 'text-amber-600'
                          : 'text-rose-600 font-bold'
                      }`}
                    >
                      {status.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
