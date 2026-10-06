import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Save,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { BusinessSettings, UserSession, UserRole, CourierCompany } from '../../types';
import { storageService } from '../../services/storage';

interface SettingsViewProps {
  settings: BusinessSettings;
  session: UserSession;
  onSaveSettings: (settings: BusinessSettings) => void;
  onSwitchRole: (role: UserRole) => void;
  onResetAllData: () => void;
  onRestoreBackup: (jsonStr: string) => boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const COURIERS: CourierCompany[] = [
  'Trax',
  'TCS',
  'Leopard',
  'PostEx',
  'M&P',
  'Call Courier',
  'Rider',
  'Self Pickup / Local',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  session,
  onSaveSettings,
  onSwitchRole,
  onResetAllData,
  onRestoreBackup,
  onShowToast,
}) => {
  const [formSettings, setFormSettings] = useState<BusinessSettings>(settings);
  const [backupJson, setBackupJson] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    onShowToast('Business settings saved successfully!', 'success');
  };

  const handleDownloadBackup = () => {
    const backupStr = storageService.exportFullBackup();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Buyzaar_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    onShowToast('Database backup downloaded!', 'success');
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupJson.trim()) return;

    const success = onRestoreBackup(backupJson);
    if (success) {
      onShowToast('Database successfully restored from backup!', 'success');
      setShowRestoreModal(false);
      setBackupJson('');
    } else {
      onShowToast('Failed to parse backup JSON. Please check file formatting.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Data Control</h2>
        <p className="text-xs text-slate-500">
          Manage business identity, staff permission role, and full database JSON backups
        </p>
      </div>

      {/* Role & Security (Module 13) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-[#261A66]" />
          <h3 className="text-sm font-bold text-slate-900">User Access & Staff Permissions</h3>
        </div>

        <p className="text-xs text-slate-600">
          Toggle between roles to test staff access boundaries:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Admin', 'Staff', 'Order Manager'] as UserRole[]).map(role => (
            <div
              key={role}
              onClick={() => {
                onSwitchRole(role);
                onShowToast(`Switched active role to ${role}!`, 'info');
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                session.role === role
                  ? 'bg-indigo-50 border-[#261A66] ring-1 ring-[#261A66]'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{role}</span>
                {session.role === role && <CheckCircle2 className="w-4 h-4 text-[#261A66]" />}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {role === 'Admin'
                  ? 'Full access to all products, profit margins & expenses'
                  : role === 'Order Manager'
                  ? 'Manage orders, courier dispatch & customer tracking'
                  : 'Standard catalog and price verification view'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Identity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-4 h-4 text-[#EF5F18]" />
          <h3 className="text-sm font-bold text-slate-900">Store Profile & Invoicing Defaults</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={formSettings.businessName}
                onChange={e => setFormSettings({ ...formSettings, businessName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formSettings.tagline}
                onChange={e => setFormSettings({ ...formSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Phone
              </label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={e => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Business Number
              </label>
              <input
                type="text"
                value={formSettings.whatsapp}
                onChange={e => setFormSettings({ ...formSettings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formSettings.currency}
                onChange={e => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono-numbers border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Courier Service
              </label>
              <select
                value={formSettings.defaultCourier}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    defaultCourier: e.target.value as CourierCompany,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {COURIERS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formSettings.city}
                onChange={e => setFormSettings({ ...formSettings, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store / Office Address (Printed on slips)
            </label>
            <input
              type="text"
              value={formSettings.address}
              onChange={e => setFormSettings({ ...formSettings, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#EF5F18] hover:bg-[#d85012] rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Business Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Disaster Recovery (Module 12) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Database Backup & Storage Safety</h3>
        </div>

        <p className="text-xs text-slate-600">
          Your entire data (products, multi-supplier rates, customer orders, expense ledger, policies) is safely saved in local storage. You can download an offline JSON backup or restore it anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Backup JSON</span>
          </button>

          <button
            onClick={() => setShowRestoreModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup JSON</span>
          </button>

          <button
            onClick={onResetAllData}
            className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Pre-loaded Demo Data</span>
          </button>
        </div>
      </div>

      {/* Restore JSON Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Restore Database from JSON</h3>
            <p className="text-xs text-slate-500 mb-3">Paste your previously downloaded backup JSON content below:</p>

            <form onSubmit={handleRestoreSubmit} className="space-y-3">
              <textarea
                rows={8}
                required
                placeholder='Paste {"products": [...], ...}'
                value={backupJson}
                onChange={e => setBackupJson(e.target.value)}
                className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#EF5F18]"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg shadow-sm"
                >
                  Confirm Restore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
