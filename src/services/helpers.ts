import { Product, ProductCategory, Order, Supplier, Customer, Expense } from '../types';

export function getCategoryPrefix(category: ProductCategory): string {
  if (!category) return 'OT';
  const trimmed = category.trim();
  switch (trimmed) {
    case 'Smart Watches':
      return 'SW';
    case 'AirPods':
      return 'AP';
    case 'Earbuds':
      return 'EB';
    case 'Chargers':
      return 'CH';
    case 'Data Cables':
      return 'CB';
    case 'Power Banks':
      return 'PB';
    case 'Mobile Accessories':
      return 'MA';
    default: {
      // Generate clean 2-letter uppercase prefix from words
      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return trimmed.substring(0, 2).toUpperCase() || 'OT';
    }
  }
}

export function generateNextSku(category: ProductCategory, existingProducts: Product[]): string {
  const prefix = getCategoryPrefix(category);
  const regex = new RegExp(`^${prefix}-(\\d+)$`);
  let maxNum = 0;

  for (const product of existingProducts) {
    const match = product.sku?.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = (maxNum + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNum}`;
}

export function generateNextOrderId(existingOrders: Order[]): string {
  let maxNum = 0;
  for (const order of existingOrders) {
    const match = order.id?.match(/^ORD-(\\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = (maxNum + 1).toString().padStart(4, '0');
  return `ORD-${nextNum}`;
}

export function generateNextSupplierId(existingSuppliers: Supplier[]): string {
  let maxNum = 0;
  for (const s of existingSuppliers) {
    const match = s.id?.match(/^SUP-(\\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = (maxNum + 1).toString().padStart(3, '0');
  return `SUP-${nextNum}`;
}

export function formatCurrency(amount: number, currency: string = 'Rs.'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currency} 0`;
  return `${currency} ${amount.toLocaleString('en-PK')}`;
}

export function calculateCostAndProfit(
  wholesalePrice: number,
  packagingCost: number = 0,
  transportCost: number = 0,
  adCost: number = 0,
  retailPrice: number = 0
) {
  const totalCost = Number(wholesalePrice || 0) + Number(packagingCost || 0) + Number(transportCost || 0) + Number(adCost || 0);
  const profitAmount = Number(retailPrice || 0) - totalCost;
  const profitPercentage = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

  return {
    totalCost: Math.round(totalCost),
    profitAmount: Math.round(profitAmount),
    profitPercentage: Math.round(profitPercentage * 10) / 10,
  };
}

export function getDaysSince(dateString: string): number {
  if (!dateString) return 999;
  const targetDate = new Date(dateString);
  const today = new Date();
  // Strip time for exact day calculation
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - targetDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function getPriceCheckStatus(lastPriceCheckedDate: string): {
  days: number;
  level: 'ok' | 'warning' | 'urgent' | 'critical';
  label: string;
} {
  const days = getDaysSince(lastPriceCheckedDate);
  if (days <= 3) {
    return { days, level: 'ok', label: days === 0 ? 'Verified Today' : `${days}d ago` };
  } else if (days <= 7) {
    return { days, level: 'warning', label: `${days}d ago (Needs Check)` };
  } else if (days <= 15) {
    return { days, level: 'urgent', label: `${days}d ago (Check Wholesale)` };
  } else {
    return { days, level: 'critical', label: `${days}d ago (Outdated Price!)` };
  }
}

export function generateSocialMessage(
  product: Product,
  template?: string,
  businessContact: string = '03131130239'
): string {
  if (template) {
    return template
      .replace(/{PRODUCT_NAME}/g, product.name)
      .replace(/{SKU}/g, product.sku)
      .replace(/{CATEGORY}/g, product.category)
      .replace(/{RETAIL_PRICE}/g, formatCurrency(product.retailPrice))
      .replace(/{MIN_PRICE}/g, formatCurrency(product.minSellingPrice))
      .replace(/{WARRANTY}/g, product.checkingWarranty || '7 Days Checking Warranty')
      .replace(/{DESCRIPTION}/g, product.description || '')
      .replace(/{CONTACT}/g, businessContact);
  }

  return `🔥 ${product.name}

${product.description ? product.description.split('\n').map(line => `✅ ${line}`).join('\n') : `✅ Model: ${product.model || 'Standard'}\n✅ High Quality Build\n✅ Premium Finish`}
${product.checkingWarranty ? `🛡️ ${product.checkingWarranty}` : '🛡️ 7 Days Checking Warranty'}

💰 Price: ${formatCurrency(product.retailPrice)}
🚚 Cash on Delivery Available All Over Pakistan!

📦 Product Code: ${product.sku}

📲 To order or inquire, reply to this message or WhatsApp us on ${businessContact}!`;
}

export function generateFacebookPost(
  product: Product,
  businessContact: string = '03131130239'
): string {
  return `⚡ NEW ARRIVAL: ${product.name} ⚡

Upgrade your tech with the latest ${product.category}!
${product.description ? `\nFeatures:\n${product.description}\n` : ''}
💎 Retail Price: ${formatCurrency(product.retailPrice)}
🛡️ Warranty: ${product.checkingWarranty || 'Checking Warranty included'}
📦 SKU / Code: ${product.sku}

🚀 Limited wholesale batch available. First come, first served!
📩 DM us now or WhatsApp: ${businessContact} to place your Cash on Delivery order.`;
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const rawVal = row[k];
            let cell = rawVal === null || rawVal === undefined ? '' : rawVal;
            if (typeof cell === 'object') {
              cell = JSON.stringify(cell);
            }
            const cellStr = String(cell);
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadImage(imageUrl: string, filename?: string): Promise<boolean> {
  if (!imageUrl) return false;

  const cleanFilename = filename
    ? filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    : `product_image_${Date.now()}`;
  const finalFilename = cleanFilename.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
    ? cleanFilename
    : `${cleanFilename}.jpg`;

  try {
    // If it's already a base64 Data URL, download directly
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // Try fetching as Blob
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    return true;
  } catch (err) {
    // Fallback using direct anchor or canvas
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
      }
    } catch {
      // Last-ditch direct anchor
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = finalFilename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }
    return false;
  }
}

export async function downloadAllProductImages(product: Product): Promise<number> {
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  let count = 0;
  for (let i = 0; i < images.length; i++) {
    const filename = `${product.name.replace(/\s+/g, '_')}_${product.sku}_photo_${i + 1}`;
    const ok = await downloadImage(images[i], filename);
    if (ok) count++;
    if (i < images.length - 1) {
      await new Promise(r => setTimeout(r, 250));
    }
  }
  return count;
}
