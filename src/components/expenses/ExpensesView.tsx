import React, { useState } from 'react';
import {
  Plus,
  Search,
  Receipt,
  Download,
  Trash2,
  TrendingDown,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { Expense, ExpenseCategory, Order, BusinessSettings } from '../../types';
import { formatCurrency, exportToCsv } from '../../services/helpers';

interface ExpensesViewProps {
  expenses: Expense[];
  orders: Order[];
  settings: BusinessSettings;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Ads',
  'Courier',
  'Packaging',
  'Transport',
  'Office Expense',
  'Internet',
  'Mobile',
  'Refund',
  'Miscellaneous',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  orders,
  settings,
  onAddExpense,
  onDeleteExpense,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('Ads');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  const filteredExpenses = expenses.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Financial Ledger Math
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalProductCosts = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.productCost * o.quantity, 0);

  const grossOrdersProfit = totalSales - totalProductCosts;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBusinessProfit = grossOrdersProfit - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const newExp: Expense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date,
      category,
      amount: Number(amount),
      description: description.trim(),
      recordedBy: 'Admin',
    };

    onAddExpense(newExp);
    onShowToast(`Recorded expense of ${formatCurrency(amount, settings.currency)}!`, 'success');
    setIsModalOpen(false);
    setDescription('');
    setAmount(1000);
  };

  const handleExportCsv = () => {
    const rows = filteredExpenses.map(e => ({
      ID: e.id,
      Date: e.date,
      Category: e.category,
      Amount: e.amount,
      Description: e.description,
      RecordedBy: e.recordedBy || 'Admin',
    }));
    exportToCsv(`ResellHub_Expenses_${new Date().toISOString().split('T')[0]}`, rows);
    onShowToast('Exported expenses to CSV!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Operating Expense Management
          </h2>
          <p className="text-xs text-slate-500">
            Log marketing, courier cargo, flyers, petrol, and utility costs
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
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Net Profit Formula Card (Matching Module 8 Prompt Requirement) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#261A66] to-[#1c134d] text-white shadow-sm">
        <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
          Business Net Profit Formula
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <div className="text-[11px] text-indigo-200">Total Sales</div>
            <div className="text-lg sm:text-xl font-bold font-mono-numbers text-white">
              {formatCurrency(totalSales, settings.currency)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-indigo-200">(-) Product Costs</div>
            <div className="text-lg sm:text-xl font-bold font-mono-numbers text-indigo-200">
              {formatCurrency(totalProductCosts, settings.currency)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-indigo-200">(-) Total Expenses</div>
            <div className="text-lg sm:text-xl font-bold font-mono-numbers text-rose-300">
              {formatCurrency(totalExpenses, settings.currency)}
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/20">
            <div className="text-[11px] text-orange-300 font-bold">(=) Net Business Profit</div>
            <div className="text-xl sm:text-2xl font-black font-mono-numbers text-emerald-400">
              {formatCurrency(netBusinessProfit, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense description or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
          >
            <option value="all">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Expense ID & Date</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Recorded By</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono-numbers font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {expense.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-numbers block mt-0.5">
                      {expense.date}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                    {expense.description}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{expense.recordedBy || 'Admin'}</td>
                  <td className="py-3 px-4 text-right font-mono-numbers font-bold text-rose-600 text-sm">
                    -{formatCurrency(expense.amount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Business Expense</h3>
            <p className="text-xs text-slate-500 mb-4">Record ads, courier cargo, or packaging cost</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers font-bold text-[#EF5F18] border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facebook Ads campaign or 100 flyer bags"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
