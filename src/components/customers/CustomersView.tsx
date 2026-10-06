import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageCircle,
  Phone,
  Edit2,
  Trash2,
  Download,
  UserCheck,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { Customer, CustomerType, BusinessSettings } from '../../types';
import { formatCurrency, exportToCsv } from '../../services/helpers';

interface CustomersViewProps {
  customers: Customer[];
  settings: BusinessSettings;
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onOpenNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.notes.toLowerCase().includes(q);

    const matchesType = selectedType === 'all' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getBadgeStyle = (type: CustomerType) => {
    switch (type) {
      case 'VIP Customer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Repeat Customer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Problem Customer':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleExportCsv = () => {
    const rows = filteredCustomers.map(c => ({
      Name: c.name,
      Phone: c.phone,
      WhatsApp: c.whatsapp,
      City: c.city,
      Address: c.address,
      OrderCount: c.orderCount,
      TotalSpend: c.totalSpend,
      LastOrderDate: c.lastOrderDate,
      Type: c.type,
      Notes: c.notes,
    }));
    exportToCsv(`ResellHub_Customers_${new Date().toISOString().split('T')[0]}`, rows);
    onShowToast('Exported customers to CSV!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-500">
            {filteredCustomers.length} registered customers · Track order loyalty and COD reliability
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
            onClick={onOpenNewCustomer}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone, city, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18]"
          >
            <option value="all">All Customer Types</option>
            <option value="New Customer">New Customers</option>
            <option value="Repeat Customer">Repeat Customers</option>
            <option value="VIP Customer">VIP Customers</option>
            <option value="Problem Customer">Problem Customers (Refused COD)</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-4 font-semibold">Contact & City</th>
                <th className="py-3 px-4 font-semibold">Status / Tag</th>
                <th className="py-3 px-4 font-semibold">Orders Count</th>
                <th className="py-3 px-4 font-semibold">Total Spent</th>
                <th className="py-3 px-4 font-semibold">Notes / COD Trust</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(customer => {
                const waMessage = encodeURIComponent(
                  `Assalam-o-Alaikum ${customer.name}! Thank you for shopping with ${settings.businessName}. We have new exciting electronics arrivals in stock!`
                );

                return (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {customer.name}
                      <span className="block text-[10px] text-slate-400 font-mono-numbers">
                        Last order: {customer.lastOrderDate}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono-numbers text-slate-800 font-medium">
                        {customer.phone}
                      </div>
                      <div className="text-[11px] text-slate-500">{customer.city}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                          customer.type
                        )}`}
                      >
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900">
                      {customer.orderCount} orders
                    </td>
                    <td className="py-3 px-4 font-mono-numbers font-bold text-[#EF5F18]">
                      {formatCurrency(customer.totalSpend, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {customer.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${customer.whatsapp}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${customer.phone}`}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onEditCustomer(customer)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(customer)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Delete Customer"
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
    </div>
  );
};
