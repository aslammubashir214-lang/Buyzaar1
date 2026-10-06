import React from 'react';
import {
  LayoutDashboard,
  Package,
  Users2,
  ShoppingCart,
  UserCheck,
  TrendingDown,
  Warehouse,
  Receipt,
  MessageSquareShare,
  ShieldCheck,
  BarChart3,
  Settings,
  AlertCircle,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'suppliers'
  | 'orders'
  | 'customers'
  | 'prices'
  | 'inventory'
  | 'expenses'
  | 'social'
  | 'policies'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  priceCheckAlertCount: number;
  lowStockCount: number;
  newOrdersCount: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  priceCheckAlertCount,
  lowStockCount,
  newOrdersCount,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'text-amber-600 bg-amber-50',
    },
    { id: 'suppliers', label: 'Suppliers', icon: Users2 },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      badge: newOrdersCount > 0 ? `${newOrdersCount} new` : undefined,
      badgeColor: 'text-emerald-700 bg-emerald-50',
    },
    { id: 'customers', label: 'Customers', icon: UserCheck },
    {
      id: 'prices',
      label: 'Price Check',
      icon: TrendingDown,
      badge: priceCheckAlertCount > 0 ? `${priceCheckAlertCount} alert` : undefined,
      badgeColor: 'text-rose-600 bg-rose-50',
    },
    { id: 'inventory', label: 'Inventory / Stock', icon: Warehouse },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'social', label: 'WhatsApp & Social', icon: MessageSquareShare },
    { id: 'policies', label: 'Return Policies', icon: ShieldCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#261A66] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-indigo-950/60 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EF5F18] flex items-center justify-center font-black text-white shadow-sm text-lg">
              B
            </div>
            <div>
              <div className="font-bold text-base tracking-tight leading-none text-white">
                Buyzaar
              </div>
              <div className="text-[11px] text-indigo-200 mt-1 font-medium">Shop smartly, Shop online</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-indigo-300 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Quick price check highlight bar if alerts exist */}
        {priceCheckAlertCount > 0 && (
          <div
            onClick={() => handleSelect('prices')}
            className="mx-3 mt-3 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-lg cursor-pointer hover:bg-rose-900/40 transition-colors flex items-center gap-2 text-xs text-rose-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold">{priceCheckAlertCount} products</span> have outdated prices!
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EF5F18] text-white font-semibold shadow-sm'
                    : 'text-indigo-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span
                    className={`text-[11px] font-mono-numbers px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Session footer */}
        <div className="p-4 border-t border-indigo-950/60 bg-[#1e1452]/60">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-semibold text-white">Electronics Store Admin</div>
              <div className="text-[11px] text-indigo-300">Daily Wholesaler Sync</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="System Ready" />
          </div>
        </div>
      </aside>
    </>
  );
};
