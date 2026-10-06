import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Users2,
  PieChart,
} from 'lucide-react';
import { Product, Supplier, Order, Expense, BusinessSettings } from '../../types';
import { formatCurrency, exportToCsv } from '../../services/helpers';

interface ReportsViewProps {
  products: Product[];
  suppliers: Supplier[];
  orders: Order[];
  expenses: Expense[];
  settings: BusinessSettings;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  suppliers,
  orders,
  expenses,
  settings,
  onShowToast,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter orders by time and category/supplier
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date filter
      if (timeRange === 'today' && order.orderDate !== todayStr) return false;
      if (timeRange === 'month') {
        const currentMonth = todayStr.substring(0, 7);
        if (!order.orderDate.startsWith(currentMonth)) return false;
      }
      if (timeRange === 'week') {
        const orderDate = new Date(order.orderDate);
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      }

      // Category filter
      const prod = products.find(p => p.id === order.productId || p.sku === order.productSku);
      if (selectedCategory !== 'all' && prod?.category !== selectedCategory) return false;

      // Supplier filter
      if (
        selectedSupplier !== 'all' &&
        prod?.primarySupplierId !== selectedSupplier &&
        prod?.primarySupplierName !== selectedSupplier
      ) {
        return false;
      }

      return true;
    });
  }, [orders, timeRange, selectedCategory, selectedSupplier, products, todayStr]);

  // Financial Metrics for the filtered range
  const validOrders = filteredOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Returned');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCostOfGoods = validOrders.reduce((sum, o) => sum + o.productCost * o.quantity, 0);
  const grossProfit = totalRevenue - totalCostOfGoods;

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    if (timeRange === 'today' && e.date !== todayStr) return false;
    if (timeRange === 'month') {
      const currentMonth = todayStr.substring(0, 7);
      if (!e.date.startsWith(currentMonth)) return false;
    }
    if (timeRange === 'week') {
      const expDate = new Date(e.date);
      const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) return false;
    }
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBusinessProfit = grossProfit - totalExpenseAmount;

  // Product-wise profit table
  const productProfitMap: Record<
    string,
    { name: string; sku: string; unitsSold: number; revenue: number; profit: number }
  > = {};
  validOrders.forEach(o => {
    if (!productProfitMap[o.productId]) {
      productProfitMap[o.productId] = {
        name: o.productName,
        sku: o.productSku,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
      };
    }
    productProfitMap[o.productId].unitsSold += o.quantity;
    productProfitMap[o.productId].revenue += o.sellingPrice * o.quantity;
    productProfitMap[o.productId].profit += o.profit;
  });

  const productProfitList = Object.values(productProfitMap).sort((a, b) => b.profit - a.profit);

  // Supplier-wise volume
  const supplierPurchaseMap: Record<string, { name: string; units: number; spend: number }> = {};
  validOrders.forEach(o => {
    const prod = products.find(p => p.id === o.productId || p.sku === o.productSku);
    const supName = prod?.primarySupplierName || 'Direct Wholesaler';
    if (!supplierPurchaseMap[supName]) {
      supplierPurchaseMap[supName] = { name: supName, units: 0, spend: 0 };
    }
    supplierPurchaseMap[supName].units += o.quantity;
    supplierPurchaseMap[supName].spend += (prod?.wholesalePrice || o.productCost) * o.quantity;
  });

  const supplierPurchaseList = Object.values(supplierPurchaseMap).sort((a, b) => b.spend - a.spend);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCsv = () => {
    const rows = productProfitList.map(p => ({
      SKU: p.sku,
      Product: p.name,
      UnitsSold: p.unitsSold,
      Revenue: p.revenue,
      Profit: p.profit,
    }));
    exportToCsv(`ResellHub_Performance_Report_${todayStr}`, rows);
    onShowToast('Exported performance report to CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Performance Reports
          </h2>
          <p className="text-xs text-slate-500">
            Daily, weekly & monthly profit audits, supplier purchases, and category breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSummaryCsv}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-bold bg-[#261A66] hover:bg-[#1f1552] text-white rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Time range pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['today', 'week', 'month', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === 'week'
                  ? 'Last 7 Days'
                  : range === 'month'
                  ? 'This Month'
                  : 'All Time'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Smart Watches">Smart Watches</option>
              <option value="Earbuds">Earbuds</option>
              <option value="Chargers">Chargers</option>
              <option value="Power Banks">Power Banks</option>
              <option value="AirPods">AirPods</option>
            </select>

            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Wholesalers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.businessName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Statement Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Sales Revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{validOrders.length} successful orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Wholesale Product Costs</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-700 font-mono-numbers mt-1">
            {formatCurrency(totalCostOfGoods, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cost of Goods Sold (COGS)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Operating Expenses</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 font-mono-numbers mt-1">
            {formatCurrency(totalExpenseAmount, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ads, packaging, cargo</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-xs text-emerald-800 font-bold">Net Business Profit</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono-numbers mt-1">
            {formatCurrency(netBusinessProfit, settings.currency)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Margin: {totalRevenue > 0 ? Math.round((netBusinessProfit / totalRevenue) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Dual Table: Product-wise Profit & Supplier Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product-wise Profit Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Product Profitability Breakdown</h3>
            <span className="text-xs text-slate-500 font-medium">Ranked by Net Profit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Product</th>
                  <th className="py-2.5 px-3.5 font-semibold text-center">Sold</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Revenue</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productProfitList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {item.name}
                      <span className="text-[10px] text-slate-400 font-mono-numbers block">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-mono-numbers font-medium text-slate-800">
                      {item.unitsSold}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers text-slate-700">
                      {formatCurrency(item.revenue, settings.currency)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers font-bold text-emerald-600">
                      +{formatCurrency(item.profit, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Purchases Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Supplier-wise Purchase Spending</h3>
            <span className="text-xs text-slate-500 font-medium">Wholesale Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Wholesaler</th>
                  <th className="py-2.5 px-3.5 font-semibold text-center">Items Sourced</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Total Wholesale Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierPurchaseList.map((sup, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">{sup.name}</td>
                    <td className="py-2.5 px-3.5 text-center font-mono-numbers font-medium text-slate-800">
                      {sup.units} pcs
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers font-bold text-[#261A66]">
                      {formatCurrency(sup.spend, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
