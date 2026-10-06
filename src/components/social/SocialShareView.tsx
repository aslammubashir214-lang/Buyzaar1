import React, { useState } from 'react';
import {
  MessageSquareShare,
  Copy,
  Check,
  Share2,
  Edit3,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { Product, BusinessSettings } from '../../types';
import {
  formatCurrency,
  generateSocialMessage,
  generateFacebookPost,
  downloadImage,
} from '../../services/helpers';

interface SocialShareViewProps {
  products: Product[];
  settings: BusinessSettings;
  onUpdateTemplate: (newTemplate: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SocialShareView: React.FC<SocialShareViewProps> = ({
  products,
  settings,
  onUpdateTemplate,
  onShowToast,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<string>(
    settings.customMessageTemplate || ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedProduct =
    products.find(p => p.id === selectedProductId) || products[0];

  const waMessage = selectedProduct
    ? generateSocialMessage(selectedProduct, customTemplate, settings.whatsapp)
    : '';

  const fbPost = selectedProduct
    ? generateFacebookPost(selectedProduct, settings.whatsapp)
    : '';

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTemplate(customTemplate);
    setIsEditingTemplate(false);
    onShowToast('Updated custom WhatsApp template!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            WhatsApp & Social Media Marketing Generator
          </h2>
          <p className="text-xs text-slate-500">
            Generate high-converting advertising copy for WhatsApp broadcast lists, Status, and Facebook groups
          </p>
        </div>

        <button
          onClick={() => setIsEditingTemplate(!isEditingTemplate)}
          className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#EF5F18]" />
          <span>{isEditingTemplate ? 'Close Editor' : 'Customize Template'}</span>
        </button>
      </div>

      {/* Template Customizer Modal / Drawer */}
      {isEditingTemplate && (
        <div className="p-5 bg-white rounded-xl border border-orange-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Customize WhatsApp Message Template
            </h3>
            <span className="text-[11px] text-slate-400">
              Tags: {'{PRODUCT_NAME}'}, {'{DESCRIPTION}'}, {'{RETAIL_PRICE}'}, {'{SKU}'}, {'{WARRANTY}'}, {'{CONTACT}'}
            </span>
          </div>

          <form onSubmit={handleSaveTemplate} className="space-y-3">
            <textarea
              rows={8}
              value={customTemplate}
              onChange={e => setCustomTemplate(e.target.value)}
              className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingTemplate(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#EF5F18] rounded-lg shadow-sm"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Dual Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selector List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col max-h-[680px]">
          <div className="p-3.5 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50">
            Select Product to Generate Copy
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`p-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  selectedProduct?.id === p.id ? 'bg-orange-50/80 border-l-4 border-[#EF5F18]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono-numbers">
                      {p.sku} · {p.category}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-[#EF5F18] font-mono-numbers">
                    {formatCurrency(p.retailPrice, settings.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Message Previews & One-Click Copy Tools (8 cols) */}
        {selectedProduct ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Micro-Copy Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Single-Field Copy & Download Tools
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => handleCopy(selectedProduct.name, 'name', 'Product Name')}
                  className="p-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Name</span>
                </button>

                <button
                  onClick={() =>
                    handleCopy(
                      formatCurrency(selectedProduct.retailPrice, settings.currency),
                      'price',
                      'Retail Price'
                    )
                  }
                  className="p-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'price' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Price</span>
                </button>

                <button
                  onClick={() => handleCopy(selectedProduct.sku, 'sku', 'SKU Code')}
                  className="p-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'sku' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SKU</span>
                </button>

                <button
                  onClick={() =>
                    handleCopy(selectedProduct.description, 'desc', 'Product Description')
                  }
                  className="p-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Specs</span>
                </button>

                <button
                  onClick={async () => {
                    const ok = await downloadImage(
                      selectedProduct.imageUrl,
                      `${selectedProduct.name}_${selectedProduct.sku}`
                    );
                    if (ok) onShowToast(`Downloaded photo for ${selectedProduct.name}!`, 'success');
                  }}
                  className="p-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Photo</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Ad Box */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    WhatsApp Broadcast & Status Message
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const ok = await downloadImage(
                        selectedProduct.imageUrl,
                        `${selectedProduct.name}_${selectedProduct.sku}`
                      );
                      if (ok) onShowToast(`Downloaded photo for ${selectedProduct.name}!`, 'success');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 rounded-md hover:bg-emerald-50 flex items-center gap-1 shadow-xs"
                    title="Download Product Picture"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Photo</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 shadow-xs"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Open in WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleCopy(waMessage, 'full_wa', 'WhatsApp Message')}
                    className="px-2.5 py-1 text-xs font-bold bg-white text-emerald-800 border border-emerald-300 rounded-md hover:bg-emerald-100/50 flex items-center gap-1"
                  >
                    {copiedKey === 'full_wa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>

              <div className="p-5 font-sans whitespace-pre-line text-xs sm:text-sm text-slate-800 bg-[#f9fafb] leading-relaxed select-all">
                {waMessage}
              </div>
            </div>

            {/* Facebook / Instagram Ad Box */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Facebook & Instagram Feed Post
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(fbPost, 'full_fb', 'Facebook Post')}
                  className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 shadow-xs"
                >
                  {copiedKey === 'full_fb' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy FB Post</span>
                </button>
              </div>

              <div className="p-5 font-sans whitespace-pre-line text-xs sm:text-sm text-slate-800 bg-[#f9fafb] leading-relaxed select-all">
                {fbPost}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
