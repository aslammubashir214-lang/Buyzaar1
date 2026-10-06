import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Customer, CustomerType } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const CUSTOMER_TYPES: CustomerType[] = [
  'New Customer',
  'Repeat Customer',
  'VIP Customer',
  'Problem Customer',
];

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customerToEdit,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [whatsapp, setWhatsapp] = useState(customerToEdit?.whatsapp || '');
  const [city, setCity] = useState(customerToEdit?.city || 'Lahore');
  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [type, setType] = useState<CustomerType>(customerToEdit?.type || 'New Customer');
  const [notes, setNotes] = useState(customerToEdit?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let cleanWa = whatsapp.trim().replace(/\D/g, '') || phone.trim().replace(/\D/g, '');
    if (cleanWa.startsWith('03')) cleanWa = '92' + cleanWa.substring(1);

    const savedCustomer: Customer = {
      id: customerToEdit?.id || `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: cleanWa,
      city: city.trim(),
      address: address.trim(),
      orderCount: customerToEdit?.orderCount || 0,
      totalSpend: customerToEdit?.totalSpend || 0,
      lastOrderDate: customerToEdit?.lastOrderDate || new Date().toISOString().split('T')[0],
      type,
      notes: notes.trim(),
      createdAt: customerToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(savedCustomer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Usman Tariq"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="03001234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="03001234567"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Lahore / Karachi"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Status
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CustomerType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {CUSTOMER_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complete Delivery Address
            </label>
            <input
              type="text"
              placeholder="House, Street, Sector"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Notes / History
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Always pays advance on JazzCash. VIP electronics enthusiast."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg shadow-sm"
            >
              {customerToEdit ? 'Save Changes' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
