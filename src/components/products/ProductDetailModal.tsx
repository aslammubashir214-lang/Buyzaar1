import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  CopyPlus,
  ShoppingCart,
  TrendingUp,
  Tag,
  Share2,
  Download,
} from 'lucide-react';
import { Product, Supplier, BusinessSettings } from '../../types';
import {
  formatCurrency,
  getPriceCheckStatus,
  generateSocialMessage,
  generateFacebookPost,
  downloadImage,
  downloadAllProductImages,
} from '../../services/helpers';

interface ProductDetailModalProps {
  product: Product | null;
  suppliers: Supplier[];
  settings: BusinessSettings;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onMarkPriceVerified: (product: Product) => void;
  onToggleStockStatus: (product: Product) => void;
  onNewOrderForProduct: (product: Product) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  suppliers,
  settings,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onMarkPriceVerified,
  onToggleStockStatus,
  onNewOrderForProduct,
  onShowToast,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const currentImage = allImages[activeImageIndex] || product.imageUrl;

  const primarySupplier = suppliers.find(
    s => s.id === product.primarySupplierId || s.businessName === product.primarySupplierName
  );

  const priceStatus = getPriceCheckStatus(product.lastPriceChecked);

  // Find cheapest supplier among quotes
  const sortedQuotes = product.supplierQuotes && product.supplierQuotes.length > 0
    ? [...product.supplierQuotes].sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    : [];
  const cheapestQuote = sortedQuotes.length > 0 ? sortedQuotes[0] : null;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadActiveImage = async () => {
    const filename = `${product.name.replace(/\s+/g, '_')}_${product.sku}_photo_${activeImageIndex + 1}`;
    const success = await downloadImage(currentImage, filename);
    if (success) {
      onShowToast(`Downloaded photo for ${product.name}!`, 'success');
    } else {
      onShowToast(`Failed to download picture`, 'error');
    }
  };

  const handleDownloadAllPhotos = async () => {
    onShowToast(`Downloading ${allImages.length} pictures...`, 'info');
    const count = await downloadAllProductImages(product);
    if (count > 0) {
      onShowToast(`Downloaded ${count} pictures for ${product.name}!`, 'success');
    } else {
      onShowToast(`Failed to download pictures`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {product.sku}
            </span>
            <span className="text-xs text-slate-500 font-medium">{product.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewOrderForProduct(product)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Hero: Image & Key Economics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview & Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
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

                {/* One-click Download Button on Image */}
                <button
                  type="button"
                  onClick={handleDownloadActiveImage}
                  className="absolute bottom-2 right-2 px-2.5 py-1 text-xs font-bold text-white bg-slate-900/80 hover:bg-[#EF5F18] rounded-lg transition-colors flex items-center gap-1.5 shadow-md backdrop-blur-xs"
                  title="1-Click Download this photo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Action buttons below image */}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadActiveImage}
                  className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>1-Click Download Photo</span>
                </button>

                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllPhotos}
                    className="w-full py-1.5 px-3 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download All Photos ({allImages.length})</span>
                  </button>
                )}
              </div>

              {/* Thumbnails if multiple images exist */}
              {allImages.length > 1 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Product Gallery ({allImages.length} photos) — Click to view:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          activeImageIndex === i
                            ? 'border-[#EF5F18] ring-2 ring-[#EF5F18]/40 scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        title={`View photo ${i + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Thumb ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Core Pricing Overview */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h2>
                  <button
                    onClick={() => handleCopy(product.name, 'name', 'Product Name')}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy Name"
                  >
                    {copiedKey === 'name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Model: <strong>{product.model || 'Standard'}</strong></span>
                  <span>·</span>
                  <span>Color: <strong>{product.color || 'Standard'}</strong></span>
                  <span>·</span>
                  <span>Brand: <strong>{product.brand || 'Generic'}</strong></span>
                </div>
              </div>

              {/* Price Cards Banner */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500">Wholesale Price</div>
                  <div className="text-base font-bold text-slate-900 font-mono-numbers">
                    {formatCurrency(product.wholesalePrice, settings.currency)}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {product.primarySupplierName}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500">Retail Price</div>
                  <div className="text-base font-bold text-[#EF5F18] font-mono-numbers">
                    {formatCurrency(product.retailPrice, settings.currency)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Min: {formatCurrency(product.minSellingPrice, settings.currency)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500">Net Profit / Unit</div>
                  <div className="text-base font-bold text-emerald-600 font-mono-numbers">
                    +{formatCurrency(product.profitAmount, settings.currency)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold font-mono-numbers">
                    {product.profitPercentage}% margin
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Details */}
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span>Wholesale: {formatCurrency(product.wholesalePrice, settings.currency)}</span>
                <span>+ Pkg: {formatCurrency(product.packagingCost, settings.currency)}</span>
                <span>+ Trans: {formatCurrency(product.transportCost, settings.currency)}</span>
                <span>+ Ads: {formatCurrency(product.adCost, settings.currency)}</span>
                <span className="font-bold text-slate-900">
                  = Total Cost: {formatCurrency(product.totalCost, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Wholesaler Details Card (Exact match to user's quick search requirement) */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#261A66]" />
                <span className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
                  Primary Wholesaler & Market Location
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {product.primarySupplierName}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Shop Number:</span>
                <span className="font-semibold text-slate-900">
                  {primarySupplier?.shopNumber || 'Shop 18'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Wholesale Market:</span>
                <span className="font-semibold text-slate-900">
                  {primarySupplier?.marketName || 'Mobile Accessories Market'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contact Phone:</span>
                <span className="font-mono-numbers font-semibold text-slate-900">
                  {primarySupplier?.phone || '03001234567'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Warranty:</span>
                <span className="font-semibold text-emerald-700">
                  {product.checkingWarranty || '7 Days Checking Warranty'}
                </span>
              </div>
            </div>

            {/* Quick Supplier Contact Buttons */}
            {primarySupplier && (
              <div className="pt-2 flex items-center gap-2 border-t border-indigo-100/60">
                <a
                  href={`https://wa.me/${primarySupplier.whatsapp.replace(/\D/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(primarySupplier.contactPerson)}%20bhai,%20kya%20${encodeURIComponent(product.name)}%20available%20hai?%20Latest%20wholesale%20rate%20confirm%20karein.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Wholesaler</span>
                </a>
                <a
                  href={`tel:${primarySupplier.phone}`}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: {primarySupplier.phone}</span>
                </a>
              </div>
            )}
          </div>

          {/* Multiple Suppliers Comparison Table (Module 3 Requirement) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Wholesaler Comparison for this Product
              </h4>
              <span className="text-[11px] text-slate-500">
                {product.supplierQuotes?.length || 0} attached suppliers
              </span>
            </div>

            {sortedQuotes.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Supplier</th>
                      <th className="py-2.5 px-3 font-semibold">Shop / Market</th>
                      <th className="py-2.5 px-3 font-semibold">Wholesale Price</th>
                      <th className="py-2.5 px-3 font-semibold">Stock</th>
                      <th className="py-2.5 px-3 font-semibold">Last Checked</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedQuotes.map((quote, idx) => {
                      const isCheapest = idx === 0;
                      const isPrimary = quote.isPrimary || quote.supplierId === product.primarySupplierId;

                      return (
                        <tr
                          key={quote.supplierId + idx}
                          className={isCheapest ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {quote.supplierName}
                            {quote.supplierCode && (
                              <span className="block text-[10px] text-slate-400 font-mono-numbers">
                                Code: {quote.supplierCode}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {quote.supplierShop || 'Shop #18'}, {quote.supplierMarket || 'Wholesale Plaza'}
                          </td>
                          <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900">
                            {formatCurrency(quote.wholesalePrice, settings.currency)}
                            {isCheapest && (
                              <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                Cheapest
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                quote.stockStatus === 'Available'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {quote.stockStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono-numbers">
                            {quote.lastPriceUpdated}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isPrimary ? (
                              <span className="text-[10px] font-bold text-[#261A66] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                Primary
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Backup</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-lg text-center">
                No additional wholesaler quotes attached. Edit product to add backup suppliers.
              </div>
            )}
          </div>

          {/* Price Verification & History Tracker (Module 6) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Price Check Status & History
                </h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Last checked: <strong className="font-mono-numbers">{product.lastPriceChecked}</strong> (
                  <span
                    className={
                      priceStatus.level === 'ok'
                        ? 'text-emerald-600 font-semibold'
                        : 'text-rose-600 font-bold'
                    }
                  >
                    {priceStatus.label}
                  </span>
                  )
                </div>
              </div>

              <button
                onClick={() => onMarkPriceVerified(product)}
                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Verified Today</span>
              </button>
            </div>

            {product.priceHistory && product.priceHistory.length > 0 && (
              <div className="text-xs space-y-1 pt-1">
                <span className="text-[11px] text-slate-500 font-medium">Recent Price Logs:</span>
                <div className="flex flex-wrap gap-2">
                  {product.priceHistory.slice(-4).map((entry, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono-numbers text-[11px]"
                    >
                      <span>{entry.date}: </span>
                      <strong className="text-slate-900">{formatCurrency(entry.wholesalePrice, settings.currency)}</strong>
                      {entry.notes && <span className="text-slate-400"> ({entry.notes})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Copy / WhatsApp Selling Tools (Module 9) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#EF5F18]" />
              <span>WhatsApp & Social Media Copy Center</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleCopy(product.name, 'pname', 'Product Name')}
                className="p-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-center transition-colors"
              >
                📋 Copy Name
              </button>
              <button
                onClick={() => handleCopy(formatCurrency(product.retailPrice, settings.currency), 'price', 'Retail Price')}
                className="p-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-center transition-colors"
              >
                💰 Copy Price
              </button>
              <button
                onClick={() => handleCopy(generateSocialMessage(product, settings.customMessageTemplate, settings.whatsapp), 'wa', 'WhatsApp Message')}
                className="p-2.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 text-center transition-colors"
              >
                💬 Copy WhatsApp Ad
              </button>
              <button
                onClick={() => handleCopy(generateFacebookPost(product, settings.whatsapp), 'fb', 'Facebook Post')}
                className="p-2.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 text-center transition-colors"
              >
                📱 Copy FB Post
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStockStatus(product)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              {product.stockStatus === 'Available' ? 'Mark Out of Stock' : 'Mark Available'}
            </button>
            <button
              onClick={() => onDuplicate(product)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDownloadActiveImage}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#261A66] hover:bg-[#1f1552] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
