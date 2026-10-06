import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Camera,
  Star,
  Check,
  CheckCircle2,
  FolderPlus,
  AlertCircle,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  ProductStockStatus,
  StockType,
  Supplier,
  ProductSupplierQuote,
} from '../../types';
import {
  generateNextSku,
  calculateCostAndProfit,
  downloadImage,
  downloadAllProductImages,
  getCategoryPrefix,
} from '../../services/helpers';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  suppliers: Supplier[];
  existingProducts: Product[];
  categories: string[];
  onAddNewCategory?: (newCategory: string) => void;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const PRESET_IMAGES = [
  { label: 'Smart Watch', url: '/src/assets/images/smart_watch_t800_1791104327806.jpg' },
  { label: 'Earbuds', url: '/src/assets/images/m10_earbuds_case_1791104341524.jpg' },
  { label: 'GaN Charger', url: '/src/assets/images/fast_charger_cable_1791104351789.jpg' },
  { label: 'Power Bank', url: '/src/assets/images/power_bank_pack_1791104362143.jpg' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  suppliers,
  existingProducts,
  categories,
  onAddNewCategory,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(productToEdit?.name || '');
  const [sku, setSku] = useState(
    productToEdit?.sku || generateNextSku(categories[0] || 'Smart Watches', existingProducts)
  );
  const [category, setCategory] = useState<ProductCategory>(
    productToEdit?.category || categories[0] || 'Smart Watches'
  );
  const [brand, setBrand] = useState(productToEdit?.brand || '');
  const [model, setModel] = useState(productToEdit?.model || '');
  const [color, setColor] = useState(productToEdit?.color || '');
  const [variant, setVariant] = useState(productToEdit?.variant || '');
  const [description, setDescription] = useState(productToEdit?.description || '');

  // Category creation inline state
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Pictures states: support primary imageUrl and array of images
  const initialImages: string[] = productToEdit?.images?.length
    ? productToEdit.images
    : productToEdit?.imageUrl
    ? [productToEdit.imageUrl]
    : [];

  const [imagesList, setImagesList] = useState<string[]>(initialImages);
  const [imageUrl, setImageUrl] = useState<string>(
    productToEdit?.imageUrl || initialImages[0] || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Pricing & Costs
  const [wholesalePrice, setWholesalePrice] = useState<number>(
    productToEdit?.wholesalePrice || 1500
  );
  const [retailPrice, setRetailPrice] = useState<number>(productToEdit?.retailPrice || 2200);
  const [minSellingPrice, setMinSellingPrice] = useState<number>(
    productToEdit?.minSellingPrice || 2000
  );
  const [packagingCost, setPackagingCost] = useState<number>(
    productToEdit?.packagingCost ?? 40
  );
  const [transportCost, setTransportCost] = useState<number>(
    productToEdit?.transportCost ?? 30
  );
  const [adCost, setAdCost] = useState<number>(productToEdit?.adCost ?? 80);

  // Suppliers quotes list (Multi-supplier support)
  const [supplierQuotes, setSupplierQuotes] = useState<ProductSupplierQuote[]>(
    productToEdit?.supplierQuotes ||
      (suppliers.length > 0
        ? [
            {
              supplierId: suppliers[0].id,
              supplierName: suppliers[0].businessName,
              supplierPhone: suppliers[0].phone,
              supplierShop: suppliers[0].shopNumber,
              supplierMarket: suppliers[0].marketName,
              supplierCode: '',
              wholesalePrice: 1500,
              stockStatus: 'Available',
              lastPriceUpdated: new Date().toISOString().split('T')[0],
              isPrimary: true,
            },
          ]
        : [])
  );

  // Stock & Inventory
  const [stockType, setStockType] = useState<StockType>(
    productToEdit?.stockType || 'Both'
  );
  const [stockStatus, setStockStatus] = useState<ProductStockStatus>(
    productToEdit?.stockStatus || 'Available'
  );
  const [stockQuantity, setStockQuantity] = useState<number>(
    productToEdit?.stockQuantity ?? 20
  );
  const [ownStockQuantity, setOwnStockQuantity] = useState<number>(
    productToEdit?.ownStockQuantity ?? 5
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    productToEdit?.lowStockThreshold ?? 5
  );
  const [checkingWarranty, setCheckingWarranty] = useState(
    productToEdit?.checkingWarranty || '7 Days Checking Warranty'
  );
  const [warrantyNotes, setWarrantyNotes] = useState(
    productToEdit?.warrantyNotes || 'Covers manufacturing fault only.'
  );
  const [notes, setNotes] = useState(productToEdit?.notes || '');

  // Auto SKU update when category changes on NEW products
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    if (!productToEdit) {
      setSku(generateNextSku(newCat, existingProducts));
    }
  };

  // Create new category handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (onAddNewCategory) {
      onAddNewCategory(trimmed);
    }
    handleCategoryChange(trimmed);
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  // Picture Upload Handlers
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    let processed = 0;
    const newBase64Images: string[] = [];

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          newBase64Images.push(result);
        }
        processed++;
        if (processed === imageFiles.length) {
          setImagesList(prev => {
            const combined = [...prev, ...newBase64Images];
            // If no primary image set yet or list was empty, set first newly uploaded image as primary
            if (!imageUrl || prev.length === 0) {
              setImageUrl(newBase64Images[0]);
            }
            return combined;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadAllImagesInForm = async () => {
    if (imagesList.length === 0) return;
    for (let i = 0; i < imagesList.length; i++) {
      const filename = `${name.trim() || 'product'}_${sku.trim() || 'code'}_photo_${i + 1}`;
      await downloadImage(imagesList[i], filename);
      if (i < imagesList.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleSetPrimaryImage = (img: string) => {
    setImageUrl(img);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = imagesList.filter((_, idx) => idx !== indexToRemove);
    setImagesList(updated);
    if (imageUrl === imagesList[indexToRemove]) {
      setImageUrl(updated[0] || '');
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setImagesList(prev => [...prev, url]);
    if (!imageUrl) setImageUrl(url);
    setCustomUrlInput('');
    setIsUrlInputOpen(false);
  };

  // Duplicate product detection
  const isDuplicateName = existingProducts.some(
    p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.id !== productToEdit?.id
  );

  // Synchronize primary supplier wholesale price
  const primaryQuote = supplierQuotes.find(q => q.isPrimary) || supplierQuotes[0];
  const effectiveWholesale = primaryQuote ? primaryQuote.wholesalePrice : wholesalePrice;

  // Real-time calculation of total cost & profit
  const economics = calculateCostAndProfit(
    effectiveWholesale,
    packagingCost,
    transportCost,
    adCost,
    retailPrice
  );

  const handleAddSupplierQuote = () => {
    const unpicked =
      suppliers.find(s => !supplierQuotes.some(q => q.supplierId === s.id)) || suppliers[0];

    if (!unpicked) return;

    setSupplierQuotes([
      ...supplierQuotes,
      {
        supplierId: unpicked.id,
        supplierName: unpicked.businessName,
        supplierPhone: unpicked.phone,
        supplierShop: unpicked.shopNumber,
        supplierMarket: unpicked.marketName,
        supplierCode: '',
        wholesalePrice: effectiveWholesale,
        stockStatus: 'Available',
        lastPriceUpdated: new Date().toISOString().split('T')[0],
        isPrimary: supplierQuotes.length === 0,
      },
    ]);
  };

  const handleRemoveSupplierQuote = (index: number) => {
    const updated = [...supplierQuotes];
    updated.splice(index, 1);
    if (updated.length > 0 && !updated.some(q => q.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setSupplierQuotes(updated);
  };

  const handleSupplierQuoteChange = (
    index: number,
    field: keyof ProductSupplierQuote,
    value: any
  ) => {
    const updated = [...supplierQuotes];
    if (field === 'supplierId') {
      const sup = suppliers.find(s => s.id === value);
      if (sup) {
        updated[index] = {
          ...updated[index],
          supplierId: sup.id,
          supplierName: sup.businessName,
          supplierPhone: sup.phone,
          supplierShop: sup.shopNumber,
          supplierMarket: sup.marketName,
        };
      }
    } else if (field === 'isPrimary') {
      updated.forEach((q, i) => {
        q.isPrimary = i === index;
      });
      setWholesalePrice(updated[index].wholesalePrice);
    } else {
      (updated[index] as any)[field] = value;
      if (field === 'wholesalePrice' && updated[index].isPrimary) {
        setWholesalePrice(Number(value));
      }
    }
    setSupplierQuotes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const primary = supplierQuotes.find(q => q.isPrimary) || supplierQuotes[0];
    const today = new Date().toISOString().split('T')[0];

    const fallbackPreset =
      PRESET_IMAGES.find(p => p.label.toLowerCase().includes(category.toLowerCase()))?.url ||
      PRESET_IMAGES[0].url;
    const finalPrimaryImage = imageUrl || imagesList[0] || fallbackPreset;
    const finalImagesList = imagesList.length > 0 ? imagesList : [finalPrimaryImage];

    const newProduct: Product = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      sku: sku.trim() || generateNextSku(category, existingProducts),
      name: name.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      color: color.trim(),
      variant: variant.trim(),
      description: description.trim(),
      imageUrl: finalPrimaryImage,
      images: finalImagesList,
      supplierQuotes,
      primarySupplierId: primary ? primary.supplierId : suppliers[0]?.id || 'SUP-001',
      primarySupplierName: primary ? primary.supplierName : suppliers[0]?.businessName || 'Ahmed Traders',
      wholesalePrice: Number(effectiveWholesale),
      retailPrice: Number(retailPrice),
      minSellingPrice: Number(minSellingPrice),
      packagingCost: Number(packagingCost),
      transportCost: Number(transportCost),
      adCost: Number(adCost),
      totalCost: economics.totalCost,
      profitAmount: economics.profitAmount,
      profitPercentage: economics.profitPercentage,
      stockType,
      stockStatus,
      stockQuantity: Number(stockQuantity),
      ownStockQuantity: Number(ownStockQuantity),
      ownStockPurchasePrice: Number(effectiveWholesale),
      lowStockThreshold: Number(lowStockThreshold),
      checkingWarranty: checkingWarranty.trim(),
      warrantyNotes: warrantyNotes.trim(),
      lastPriceChecked: today,
      lastUpdated: today,
      priceHistory: productToEdit
        ? [
            ...productToEdit.priceHistory,
            {
              date: today,
              wholesalePrice: Number(effectiveWholesale),
              supplierName: primary?.supplierName || 'Ahmed Traders',
              notes: 'Price updated in form',
            },
          ]
        : [
            {
              date: today,
              wholesalePrice: Number(effectiveWholesale),
              supplierName: primary?.supplierName || 'Ahmed Traders',
              notes: 'Initial price',
            },
          ],
      notes: notes.trim(),
      createdAt: productToEdit?.createdAt || today,
    };

    onSave(newProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Upload product photos, set categories, wholesaler rates, and retail margins
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Duplicate Product Alert */}
          {isDuplicateName && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Warning:</strong> A product with the name "{name}" already exists in your inventory.
              </span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
              1. Basic Product Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T800 Ultra Smart Watch"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>SKU / Product Code *</span>
                  <span className="text-[10px] text-slate-400">Auto</span>
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18] uppercase"
                />
              </div>
            </div>

            {/* Category selection with Add New Category option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-xs font-semibold text-[#EF5F18] hover:text-[#d85012] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-orange-50 border border-transparent hover:border-orange-200"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>{isAddingNewCategory ? 'Cancel' : '+ Create New Category'}</span>
                </button>
              </div>

              {isAddingNewCategory ? (
                <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-[#EF5F18]" />
                      <span>Add New Category</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono-numbers">
                      SKU Code Prefix: <strong className="text-[#261A66]">{newCategoryName.trim() ? getCategoryPrefix(newCategoryName.trim()) : 'OT'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Smart Glasses, Neckbands, Speakers, Car Mounts..."
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory(e);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18] shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                    >
                      Save & Select
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={e => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddingNewCategory(true);
                    } else {
                      handleCategoryChange(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18] bg-white font-medium text-slate-800"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__ADD_NEW__">➕ + Create New Category...</option>
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Generic / TWS"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  placeholder="e.g. T800 Ultra 49mm"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color / Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orange / Black"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Description & Features
              </label>
              <textarea
                rows={2}
                placeholder="Key bullet points for WhatsApp / Facebook ads..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            {/* Picture Upload & Gallery Management */}
            <div className="space-y-3 pt-2">
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleFilesSelected(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => handleFilesSelected(e.target.files)}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#EF5F18]" />
                  <span>Product Pictures ({imagesList.length})</span>
                </label>

                <div className="flex items-center gap-2">
                  {imagesList.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllImagesInForm}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                      title="1-Click Download all uploaded product photos"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download All ({imagesList.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    {isUrlInputOpen ? 'Hide URL link' : 'Paste Image URL'}
                  </button>
                </div>
              </div>

              {/* Upload Action Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200 text-[#EF5F18] rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Pictures from Device / WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs shadow-xs"
                >
                  <Camera className="w-4 h-4 text-[#261A66]" />
                  <span>Take Photo with Camera</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#EF5F18] bg-orange-50/90 scale-[1.01]'
                    : 'border-slate-300 hover:border-[#EF5F18] hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-800">
                  Or drag and drop multiple product pictures here
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Supports multiple photos (front, back, open case, box). JPG, PNG, WEBP.
                </div>
              </div>

              {/* Optional URL input */}
              {isUrlInputOpen && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    placeholder="Paste image web link (https://...)"
                    value={customUrlInput}
                    onChange={e => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#EF5F18]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#261A66] rounded-md hover:bg-[#1f1552]"
                  >
                    Add URL
                  </button>
                </div>
              )}

              {/* Uploaded Images Gallery Strip */}
              {imagesList.length > 0 ? (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>
                      Attached Pictures ({imagesList.length}) — Click star to set Primary Display Photo:
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#EF5F18] hover:underline font-bold text-[11px]"
                    >
                      + Add More
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {imagesList.map((img, idx) => {
                      const isPrimary = img === imageUrl || (idx === 0 && !imageUrl);
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-lg overflow-hidden border bg-white shadow-xs flex flex-col ${
                            isPrimary ? 'border-[#EF5F18] ring-2 ring-[#EF5F18]/40' : 'border-slate-200'
                          }`}
                        >
                          <div className="aspect-square bg-slate-100 overflow-hidden relative">
                            <img
                              src={img}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />

                            {/* Primary Badge */}
                            {isPrimary && (
                              <span className="absolute top-1 left-1 bg-[#EF5F18] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Primary</span>
                              </span>
                            )}
                          </div>

                          {/* Action Strip on Card */}
                          <div className="p-1 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(img)}
                                className="p-1 rounded text-slate-600 hover:text-[#EF5F18] hover:bg-orange-50 transition-colors"
                                title="Set as Primary Picture"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1 text-amber-500" title="Active Primary">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => downloadImage(img, `${name || 'product'}_photo_${idx + 1}`)}
                              className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="1-Click Download Picture"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Picture"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-center space-y-1">
                  <p className="text-xs text-amber-800 font-medium">
                    No pictures attached yet for this product.
                  </p>
                  <p className="text-[11px] text-amber-700/80">
                    Upload photos above, or pick one of the sample presets below:
                  </p>
                </div>
              )}

              {/* Quick sample presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">Sample Presets:</span>
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!imagesList.includes(preset.url)) {
                        setImagesList(prev => [...prev, preset.url]);
                      }
                      setImageUrl(preset.url);
                    }}
                    className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-orange-50 hover:text-[#EF5F18] rounded border border-slate-200 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Supplier Rates (Module 3 requirement) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
                  2. Wholesaler Pricing & Quotes
                </h4>
                <p className="text-[11px] text-slate-500">
                  Attach multiple suppliers. System automatically flags the cheapest wholesale rate.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSupplierQuote}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-[#261A66] rounded-md transition-colors flex items-center gap-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier Quote</span>
              </button>
            </div>

            <div className="space-y-2">
              {supplierQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Supplier
                    </label>
                    <select
                      value={quote.supplierId}
                      onChange={e => handleSupplierQuoteChange(idx, 'supplierId', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.businessName} ({s.marketName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Wholesale (Rs.)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quote.wholesalePrice}
                      onChange={e =>
                        handleSupplierQuoteChange(idx, 'wholesalePrice', Number(e.target.value))
                      }
                      className="w-full px-2 py-1.5 text-xs font-mono-numbers border border-slate-300 rounded"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Stock
                    </label>
                    <select
                      value={quote.stockStatus}
                      onChange={e =>
                        handleSupplierQuoteChange(idx, 'stockStatus', e.target.value as any)
                      }
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="Available">Available</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="primarySupplierRadio"
                        checked={quote.isPrimary}
                        onChange={() => handleSupplierQuoteChange(idx, 'isPrimary', true)}
                        className="text-[#EF5F18] focus:ring-[#EF5F18]"
                      />
                      <span className="font-semibold text-slate-700">Primary</span>
                    </label>

                    {supplierQuotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSupplierQuote(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                        title="Remove Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Cost & Profit Calculations (Automatic calculations) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
              3. Selling Price & Automatic Cost/Profit Formula
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Retail Selling Price (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={retailPrice}
                  onChange={e => setRetailPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers font-bold text-[#EF5F18] border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Selling Price (Rs.)
                </label>
                <input
                  type="number"
                  min={1}
                  value={minSellingPrice}
                  onChange={e => setMinSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Cost (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  value={packagingCost}
                  onChange={e => setPackagingCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery / Ads Cost (Rs.)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    placeholder="Trans"
                    title="Transport Cost"
                    value={transportCost}
                    onChange={e => setTransportCost(Number(e.target.value))}
                    className="w-1/2 px-2 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Ads"
                    title="Ad Cost"
                    value={adCost}
                    onChange={e => setAdCost(Number(e.target.value))}
                    className="w-1/2 px-2 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Math Summary Card */}
            <div className="p-3.5 bg-gradient-to-r from-orange-50 to-indigo-50 border border-orange-200/60 rounded-xl grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Calculated Cost</span>
                <span className="text-base font-bold text-slate-900 font-mono-numbers">
                  Rs. {economics.totalCost}
                </span>
                <span className="text-[10px] text-slate-400 block">Wholesale + Pkg + Trans + Ads</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Profit Amount</span>
                <span className="text-base font-bold text-emerald-600 font-mono-numbers">
                  +Rs. {economics.profitAmount}
                </span>
                <span className="text-[10px] text-slate-400 block">Retail - Total Cost</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Profit Margin</span>
                <span className="text-base font-bold text-[#EF5F18] font-mono-numbers">
                  {economics.profitPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 block">Profit / Cost × 100</span>
              </div>
            </div>
          </div>

          {/* Section 4: Inventory, Stock & Warranty */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
              4. Inventory & Warranty Rules
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Type
                </label>
                <select
                  value={stockType}
                  onChange={e => setStockType(e.target.value as StockType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Both">Both (Own + Supplier)</option>
                  <option value="Own Stock">Own Stock (Physical)</option>
                  <option value="Supplier Stock">Supplier Stock (Order-based)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={stockStatus}
                  onChange={e => setStockStatus(e.target.value as ProductStockStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="Price Check Required">Price Check Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Own Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={ownStockQuantity}
                  onChange={e => setOwnStockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Low Stock Alert At
                </label>
                <input
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Checking Warranty Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7 Days Checking Warranty"
                  value={checkingWarranty}
                  onChange={e => setCheckingWarranty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty & Testing Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Check screen and charging port before sending"
                  value={warrantyNotes}
                  onChange={e => setWarrantyNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
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
              {productToEdit ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
