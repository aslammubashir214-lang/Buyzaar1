import React, { useState } from 'react';
import {
  Plus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Edit2,
  Trash2,
  Package,
  Download,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Supplier, Product, BusinessSettings } from '../../types';
import { exportToCsv } from '../../services/helpers';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  settings: BusinessSettings;
  onOpenNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
  onSelectProduct: (product: Product) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  settings,
  onOpenNewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onSelectProduct,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<Supplier | null>(
    null
  );

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.businessName.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.marketName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.shopNumber.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  });

  // Calculate products linked to a supplier
  const getSupplierProducts = (supplierId: string, businessName: string) => {
    return products.filter(
      p =>
        p.primarySupplierId === supplierId ||
        p.primarySupplierName === businessName ||
        p.supplierQuotes?.some(q => q.supplierId === supplierId || q.supplierName === businessName)
    );
  };

  const handleExportCsv = () => {
    const rows = suppliers.map(s => {
      const linked = getSupplierProducts(s.id, s.businessName);
      return {
        SupplierID: s.id,
        BusinessName: s.businessName,
        ContactPerson: s.contactPerson,
        Phone: s.phone,
        WhatsApp: s.whatsapp,
        MarketName: s.marketName,
        ShopNumber: s.shopNumber,
        City: s.city,
        CompleteAddress: s.completeAddress,
        Categories: s.categoriesSupplied.join(', '),
        PaymentMethod: s.paymentMethod,
        BankDetails: s.bankDetails || '',
        EasypaisaJazzCash: s.easypaisaJazzCash || '',
        WarrantyPolicy: s.warrantyPolicy,
        ReplacementPolicy: s.replacementPolicy,
        Rating: s.rating,
        Status: s.status,
        LinkedProductsCount: linked.length,
      };
    });
    exportToCsv(`ResellHub_Suppliers_${new Date().toISOString().split('T')[0]}`, rows);
    onShowToast('Exported suppliers to CSV!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Wholesaler Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage your daily wholesale suppliers from markets across Pakistan
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
            onClick={onOpenNewSupplier}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search wholesaler name, contact person, market, shop, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#EF5F18] focus:bg-white"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(supplier => {
          const linkedProducts = getSupplierProducts(supplier.id, supplier.businessName);

          return (
            <div
              key={supplier.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-[#261A66]/40 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-[#261A66]">
                      {supplier.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        supplier.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {supplier.businessName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Contact: {supplier.contactPerson || 'Proprietor'}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: supplier.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                {/* Market & Shop info */}
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#EF5F18] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">{supplier.shopNumber}</span>,{' '}
                    <span>{supplier.marketName}</span>, <span className="font-medium">{supplier.city}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
                  {supplier.categoriesSupplied.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Payment & Warranty notes */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div>
                    <strong>Payment:</strong> {supplier.paymentMethod}
                  </div>
                  <div>
                    <strong>Warranty:</strong> {supplier.warrantyPolicy}
                  </div>
                </div>

                {/* Linked Products Count Preview */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{linkedProducts.length}</strong> linked products
                  </span>

                  {linkedProducts.length > 0 && (
                    <button
                      onClick={() => setSelectedSupplierForProducts(supplier)}
                      className="text-[#261A66] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Products</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp Wholesaler */}
                  <a
                    href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(supplier.contactPerson)}%20bhai,%20aaj%20ki%20fresh%20wholesale%20stock%20list%20aur%20prices%20share%20karein.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                    title="WhatsApp Wholesaler"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Call Wholesaler */}
                  <a
                    href={`tel:${supplier.phone}`}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                    title="Call Wholesaler"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditSupplier(supplier)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200"
                    title="Edit Wholesaler"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSupplier(supplier)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
                    title="Delete Wholesaler"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Linked Products Drawer/Modal */}
      {selectedSupplierForProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Products supplied by {selectedSupplierForProducts.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSupplierForProducts.shopNumber}, {selectedSupplierForProducts.marketName}
                </p>
              </div>
              <button
                onClick={() => setSelectedSupplierForProducts(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {getSupplierProducts(
                selectedSupplierForProducts.id,
                selectedSupplierForProducts.businessName
              ).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedSupplierForProducts(null);
                    onSelectProduct(p);
                  }}
                  className="p-3 rounded-lg border border-slate-200 hover:bg-orange-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono-numbers">
                        SKU: {p.sku} · {p.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 font-mono-numbers">
                      Wholesale: {p.wholesalePrice}
                    </div>
                    <div className="text-[11px] text-[#EF5F18] font-bold font-mono-numbers">
                      Retail: {p.retailPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSupplierForProducts(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
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
