import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit2,
  Save,
  Copy,
  Check,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { BusinessPolicy } from '../../types';

interface PoliciesViewProps {
  policies: BusinessPolicy;
  onSavePolicies: (updated: BusinessPolicy) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  onSavePolicies,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<BusinessPolicy>(policies);
  const [copied, setCopied] = useState(false);

  const policyItems = [
    {
      key: 'noChangeOfMind' as const,
      title: '1. No Change of Mind Returns',
      desc: 'Electronics items cannot be returned or refunded if a customer changes their mind or ordered the wrong variant.',
    },
    {
      key: 'unboxingVideo' as const,
      title: '2. Mandatory 360° Unboxing Video Requirement',
      desc: 'An uncut video starting from the sealed flyer is required to claim any missing accessories, damage, or defect.',
    },
    {
      key: 'wrongItem' as const,
      title: '3. Wrong Item or Color Replacement',
      desc: 'Free immediate courier exchange if the customer receives an item different from the booked invoice.',
    },
    {
      key: 'damagedParcel' as const,
      title: '4. Damaged or Tampered Parcel at Delivery',
      desc: 'Instructions for customers if courier flyer arrives torn, wet, or opened by rider.',
    },
    {
      key: 'manufacturingDefect' as const,
      title: '5. Manufacturing Hardware Defects',
      desc: 'Checking warranty coverage for dead on arrival, battery charging failure, or touch issues.',
    },
    {
      key: 'complaintTimeLimit' as const,
      title: '6. Complaint Time Limit',
      desc: 'Days within which complaints must be submitted via WhatsApp (typically within 7 calendar days).',
    },
    {
      key: 'supplierWarrantyTerms' as const,
      title: '7. Wholesaler Warranty Exclusions',
      desc: 'Physical drops, water ingress, burnt IC chips from heavy 65W local plugs, and screen cracks are void.',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePolicies(formValues);
    setIsEditing(false);
    onShowToast('Store warranty policies updated!', 'success');
  };

  const fullPolicyText = `🛡️ STORE WARRANTY & RETURN POLICY 🛡️

1. NO CHANGE OF MIND:
${formValues.noChangeOfMind}

2. UNBOXING VIDEO MANDATORY:
${formValues.unboxingVideo}

3. WRONG ITEM RECEIVED:
${formValues.wrongItem}

4. DAMAGED PARCEL:
${formValues.damagedParcel}

5. CHECKING WARRANTY:
${formValues.manufacturingDefect}

6. COMPLAINT DEADLINE:
${formValues.complaintTimeLimit}

7. EXCLUSIONS:
${formValues.supplierWarrantyTerms}

Please read terms before confirming your order.`;

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(fullPolicyText);
    setCopied(true);
    onShowToast('Copied full policy to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Store Warranty & Return Policies
          </h2>
          <p className="text-xs text-slate-500">
            Define clear terms for electronics customers to avoid false disputes and unboxing claim fraud
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPolicy}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Policy for WhatsApp</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-bold bg-[#EF5F18] hover:bg-[#d85012] text-white rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Cancel Edit' : 'Edit Policies'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policyItems.map(item => (
              <div
                key={item.key}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-[#261A66] uppercase tracking-wider">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-2">{item.desc}</p>
                </div>

                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formValues[item.key]}
                    onChange={e =>
                      setFormValues({ ...formValues, [item.key]: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {policies[item.key]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormValues(policies);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg shadow-sm"
              >
                Save All Policies
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
