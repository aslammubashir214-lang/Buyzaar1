import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Supplier, ProductCategory } from '../../types';
import { generateNextSupplierId } from '../../services/helpers';

interface SupplierFormModalProps {
  isOpen: boolean;
  supplierToEdit: Supplier | null;
  existingSuppliers: Supplier[];
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
}

const ALL_CATEGORIES: ProductCategory[] = [
  'Smart Watches',
  'AirPods',
  'Earbuds',
  'Chargers',
  'Data Cables',
  'Power Banks',
  'Mobile Accessories',
  'Other',
];

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  supplierToEdit,
  existingSuppliers,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [id] = useState(
    supplierToEdit?.id || generateNextSupplierId(existingSuppliers)
  );
  const [businessName, setBusinessName] = useState(supplierToEdit?.businessName || '');
  const [contactPerson, setContactPerson] = useState(supplierToEdit?.contactPerson || '');
  const [phone, setPhone] = useState(supplierToEdit?.phone || '');
  const [whatsapp, setWhatsapp] = useState(supplierToEdit?.whatsapp || '');
  const [marketName, setMarketName] = useState(supplierToEdit?.marketName || '');
  const [shopNumber, setShopNumber] = useState(supplierToEdit?.shopNumber || '');
  const [completeAddress, setCompleteAddress] = useState(supplierToEdit?.completeAddress || '');
  const [city, setCity] = useState(supplierToEdit?.city || 'Lahore');
  const [categoriesSupplied, setCategoriesSupplied] = useState<ProductCategory[]>(
    supplierToEdit?.categoriesSupplied || ['Smart Watches', 'Earbuds']
  );
  const [paymentMethod, setPaymentMethod] = useState(
    supplierToEdit?.paymentMethod || 'Cash / Easypaisa on Pickup'
  );
  const [bankDetails, setBankDetails] = useState(supplierToEdit?.bankDetails || '');
  const [easypaisaJazzCash, setEasypaisaJazzCash] = useState(
    supplierToEdit?.easypaisaJazzCash || ''
  );
  const [warrantyPolicy, setWarrantyPolicy] = useState(
    supplierToEdit?.warrantyPolicy || '7 Days Checking Warranty. No water/burn damage.'
  );
  const [replacementPolicy, setReplacementPolicy] = useState(
    supplierToEdit?.replacementPolicy || 'Replaced in next visit or adjusted in new bill.'
  );
  const [notes, setNotes] = useState(supplierToEdit?.notes || '');
  const [rating, setRating] = useState<number>(supplierToEdit?.rating || 5);
  const [status, setStatus] = useState<'Active' | 'Inactive'>(
    supplierToEdit?.status || 'Active'
  );

  const toggleCategory = (cat: ProductCategory) => {
    if (categoriesSupplied.includes(cat)) {
      setCategoriesSupplied(categoriesSupplied.filter(c => c !== cat));
    } else {
      setCategoriesSupplied([...categoriesSupplied, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;

    // Normalize WhatsApp number
    let cleanWa = whatsapp.trim().replace(/\D/g, '');
    if (!cleanWa) cleanWa = phone.trim().replace(/\D/g, '');
    if (cleanWa.startsWith('03')) cleanWa = '92' + cleanWa.substring(1);

    const savedSupplier: Supplier = {
      id,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      whatsapp: cleanWa,
      marketName: marketName.trim(),
      shopNumber: shopNumber.trim(),
      completeAddress: completeAddress.trim(),
      city: city.trim(),
      categoriesSupplied,
      paymentMethod: paymentMethod.trim(),
      bankDetails: bankDetails.trim(),
      easypaisaJazzCash: easypaisaJazzCash.trim(),
      warrantyPolicy: warrantyPolicy.trim(),
      replacementPolicy: replacementPolicy.trim(),
      notes: notes.trim(),
      rating,
      status,
      createdAt: supplierToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(savedSupplier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {supplierToEdit ? 'Edit Wholesaler' : 'Add New Wholesaler / Supplier'}
            </h3>
            <p className="text-xs text-slate-500">
              Wholesale shop details, market location, phone, and terms
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier ID
              </label>
              <input
                type="text"
                disabled
                value={id}
                className="w-full px-3 py-2 text-sm font-mono-numbers bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Traders"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmed Raza"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

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

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Number *
              </label>
              <input
                type="text"
                required
                placeholder="Shop #18, 1st Floor"
                value={shopNumber}
                onChange={e => setShopNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wholesale Market Name *
              </label>
              <input
                type="text"
                required
                placeholder="Mobile Accessories Market"
                value={marketName}
                onChange={e => setMarketName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Lahore / Karachi"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complete Address
            </label>
            <input
              type="text"
              placeholder="Shop #18, Central Plaza, Main Market..."
              value={completeAddress}
              onChange={e => setCompleteAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            />
          </div>

          {/* Categories supplied */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Categories Supplied
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    categoriesSupplied.includes(cat)
                      ? 'bg-[#261A66] text-white border-[#261A66]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Payment & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="Cash on Pick / Easypaisa / Bank"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Easypaisa / JazzCash
              </label>
              <input
                type="text"
                placeholder="03001234567 (Account Title)"
                value={easypaisaJazzCash}
                onChange={e => setEasypaisaJazzCash(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bank Details (Optional)
            </label>
            <input
              type="text"
              placeholder="Bank Name, Account Number, Title"
              value={bankDetails}
              onChange={e => setBankDetails(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            />
          </div>

          {/* Policies & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Policy
              </label>
              <textarea
                rows={2}
                value={warrantyPolicy}
                onChange={e => setWarrantyPolicy(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Replacement Policy
              </label>
              <textarea
                rows={2}
                value={replacementPolicy}
                onChange={e => setReplacementPolicy(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          {/* Rating, Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                placeholder="e.g. Daily WhatsApp updates"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg transition-colors shadow-sm"
            >
              {supplierToEdit ? 'Save Changes' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
