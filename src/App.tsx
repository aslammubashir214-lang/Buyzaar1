import React, { useState, useEffect } from 'react';
import {
  Product,
  ProductStockStatus,
  Supplier,
  Order,
  Customer,
  Expense,
  BusinessPolicy,
  BusinessSettings,
  UserSession,
  UserRole,
  OrderStatus,
} from './types';
import { storageService } from './services/storage';
import { getPriceCheckStatus } from './services/helpers';

// Layout components
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Common components
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ConfirmationModal } from './components/common/ConfirmationModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { ProductFormModal } from './components/products/ProductFormModal';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { SupplierFormModal } from './components/suppliers/SupplierFormModal';
import { OrdersView } from './components/orders/OrdersView';
import { OrderFormModal } from './components/orders/OrderFormModal';
import { OrderSlipModal } from './components/orders/OrderSlipModal';
import { CustomersView } from './components/customers/CustomersView';
import { CustomerFormModal } from './components/customers/CustomerFormModal';
import { PriceCheckView } from './components/prices/PriceCheckView';
import { InventoryView } from './components/inventory/InventoryView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { SocialShareView } from './components/social/SocialShareView';
import { PoliciesView } from './components/policies/PoliciesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent Domain States
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storageService.getSuppliers());
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses());
  const [policies, setPolicies] = useState<BusinessPolicy>(() => storageService.getPolicies());
  const [settings, setSettings] = useState<BusinessSettings>(() => storageService.getSettings());
  const [session, setSession] = useState<UserSession>(() => storageService.getSession());
  const [categories, setCategories] = useState<string[]>(() => storageService.getCategories());

  // Modal Visibility States
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [presetProductForOrder, setPresetProductForOrder] = useState<Product | null>(null);
  const [orderSlipToPrint, setOrderSlipToPrint] = useState<Order | null>(null);

  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Generic Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Sync state changes to storageService
  useEffect(() => {
    storageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    storageService.saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    storageService.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    storageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    storageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    storageService.savePolicies(policies);
  }, [policies]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveSession(session);
  }, [session]);

  useEffect(() => {
    storageService.saveCategories(categories);
  }, [categories]);

  const handleAddNewCategory = (newCat: string) => {
    const updated = storageService.addCategory(newCat);
    setCategories(updated);
    showToast(`Category "${newCat}" added!`, 'success');
  };

  const handleDeleteCategory = (cat: string) => {
    const productsInCat = products.filter(p => p.category === cat);
    if (productsInCat.length > 0) {
      showToast(
        `Cannot delete "${cat}" because ${productsInCat.length} products belong to it!`,
        'error'
      );
      return;
    }
    const updated = storageService.deleteCategory(cat);
    setCategories(updated);
    showToast(`Deleted category "${cat}"`, 'info');
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Badge Counts
  const priceCheckAlertCount = products.filter(p => {
    const status = getPriceCheckStatus(p.lastPriceChecked);
    return status.level !== 'ok';
  }).length;

  const lowStockCount = products.filter(
    p => p.stockStatus === 'Low Stock' || (p.stockType !== 'Supplier Stock' && p.ownStockQuantity <= p.lowStockThreshold)
  ).length;

  const newOrdersCount = orders.filter(
    o => o.status === 'New Order' || o.status === 'Customer Confirmation Pending'
  ).length;

  // --- Handlers: Products ---
  const handleSaveProduct = (savedProduct: Product) => {
    const exists = products.some(p => p.id === savedProduct.id);
    if (exists) {
      setProducts(prev => prev.map(p => (p.id === savedProduct.id ? savedProduct : p)));
      showToast(`Updated product "${savedProduct.name}"!`, 'success');
    } else {
      setProducts(prev => [savedProduct, ...prev]);
      showToast(`Added new product "${savedProduct.name}"!`, 'success');
    }
    setProductFormOpen(false);
    setProductToEdit(null);
    if (selectedProductDetail?.id === savedProduct.id) {
      setSelectedProductDetail(savedProduct);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete "${product.name}" (${product.sku})? This cannot be undone.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setSelectedProductDetail(null);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast(`Deleted product "${product.name}"`, 'info');
      },
    });
  };

  const handleDuplicateProduct = (product: Product) => {
    const clone: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      priceHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          wholesalePrice: product.wholesalePrice,
          supplierName: product.primarySupplierName,
          notes: 'Cloned from ' + product.sku,
        },
      ],
    };
    setProducts(prev => [clone, ...prev]);
    showToast(`Duplicated product as "${clone.name}"`, 'success');
  };

  const handleToggleStockStatus = (product: Product) => {
    const nextStatus: ProductStockStatus =
      product.stockStatus === 'Available' ? 'Out of Stock' : 'Available';
    const updated: Product = { ...product, stockStatus: nextStatus };
    setProducts(prev => prev.map(p => (p.id === product.id ? updated : p)));
    setSelectedProductDetail(updated);
    showToast(`Marked ${product.name} as ${nextStatus}!`, 'info');
  };

  const handleMarkPriceVerifiedToday = (productId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const updatedHistory = [
            ...(p.priceHistory || []),
            {
              date: today,
              wholesalePrice: p.wholesalePrice,
              supplierName: p.primarySupplierName,
              notes: 'Verified today via WhatsApp',
            },
          ];
          return {
            ...p,
            lastPriceChecked: today,
            priceHistory: updatedHistory,
          };
        }
        return p;
      })
    );
  };

  const handleUpdateProductPrice = (
    productId: string,
    newWholesalePrice: number,
    supplierName: string,
    note?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const totalCost = newWholesalePrice + p.packagingCost + p.transportCost + p.adCost;
          const profitAmount = p.retailPrice - totalCost;
          const profitPercentage = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;
          const updatedHistory = [
            ...(p.priceHistory || []),
            {
              date: today,
              wholesalePrice: newWholesalePrice,
              supplierName,
              notes: note || 'Wholesale update',
            },
          ];
          return {
            ...p,
            wholesalePrice: newWholesalePrice,
            totalCost,
            profitAmount,
            profitPercentage: Math.round(profitPercentage * 10) / 10,
            lastPriceChecked: today,
            priceHistory: updatedHistory,
          };
        }
        return p;
      })
    );
  };

  // --- Handlers: Suppliers ---
  const handleSaveSupplier = (savedSupplier: Supplier) => {
    const exists = suppliers.some(s => s.id === savedSupplier.id);
    if (exists) {
      setSuppliers(prev => prev.map(s => (s.id === savedSupplier.id ? savedSupplier : s)));
      showToast(`Updated wholesaler "${savedSupplier.businessName}"!`, 'success');
    } else {
      setSuppliers(prev => [savedSupplier, ...prev]);
      showToast(`Added new wholesaler "${savedSupplier.businessName}"!`, 'success');
    }
    setSupplierFormOpen(false);
    setSupplierToEdit(null);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Wholesaler',
      message: `Are you sure you want to delete ${supplier.businessName}? Products linked to this wholesaler will remain in catalog.`,
      confirmLabel: 'Delete Wholesaler',
      isDangerous: true,
      onConfirm: () => {
        setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast(`Deleted wholesaler "${supplier.businessName}"`, 'info');
      },
    });
  };

  // --- Handlers: Orders ---
  const handleSaveOrder = (savedOrder: Order) => {
    const exists = orders.some(o => o.id === savedOrder.id);
    if (exists) {
      setOrders(prev => prev.map(o => (o.id === savedOrder.id ? savedOrder : o)));
      showToast(`Updated order ${savedOrder.id}!`, 'success');
    } else {
      setOrders(prev => [savedOrder, ...prev]);
      showToast(`Booked new order ${savedOrder.id} successfully!`, 'success');

      // Update or create customer record
      setCustomers(prev => {
        const existingCust = prev.find(
          c => c.phone.trim() === savedOrder.customerPhone.trim()
        );
        if (existingCust) {
          return prev.map(c =>
            c.id === existingCust.id
              ? {
                  ...c,
                  orderCount: c.orderCount + 1,
                  totalSpend: c.totalSpend + savedOrder.totalAmount,
                  lastOrderDate: savedOrder.orderDate,
                  type: c.orderCount >= 2 ? 'Repeat Customer' : c.type,
                }
              : c
          );
        } else {
          const newCust: Customer = {
            id: `cust-${Date.now()}`,
            name: savedOrder.customerName,
            phone: savedOrder.customerPhone,
            whatsapp: savedOrder.customerPhone,
            city: savedOrder.city,
            address: savedOrder.completeAddress,
            orderCount: 1,
            totalSpend: savedOrder.totalAmount,
            lastOrderDate: savedOrder.orderDate,
            type: 'New Customer',
            notes: 'Acquired via online booking',
            createdAt: savedOrder.orderDate,
          };
          return [newCust, ...prev];
        }
      });

      // Deduct own physical stock if applicable
      setProducts(prev =>
        prev.map(p => {
          if (p.id === savedOrder.productId && p.stockType !== 'Supplier Stock') {
            const nextQty = Math.max(0, p.ownStockQuantity - savedOrder.quantity);
            return {
              ...p,
              ownStockQuantity: nextQty,
              stockStatus: nextQty === 0 ? 'Low Stock' : p.stockStatus,
            };
          }
          return p;
        })
      );
    }

    setOrderFormOpen(false);
    setOrderToEdit(null);
    setPresetProductForOrder(null);
  };

  const handleDeleteOrder = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order Record',
      message: `Delete order ${order.id} for ${order.customerName}?`,
      confirmLabel: 'Delete Order',
      isDangerous: true,
      onConfirm: () => {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast(`Deleted order ${order.id}`, 'info');
      },
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // --- Handlers: Customers ---
  const handleSaveCustomer = (savedCustomer: Customer) => {
    const exists = customers.some(c => c.id === savedCustomer.id);
    if (exists) {
      setCustomers(prev => prev.map(c => (c.id === savedCustomer.id ? savedCustomer : c)));
      showToast(`Updated customer "${savedCustomer.name}"!`, 'success');
    } else {
      setCustomers(prev => [savedCustomer, ...prev]);
      showToast(`Added customer "${savedCustomer.name}"!`, 'success');
    }
    setCustomerFormOpen(false);
    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${customer.name}?`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        setCustomers(prev => prev.filter(c => c.id !== customer.id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast(`Deleted customer ${customer.name}`, 'info');
      },
    });
  };

  // --- Handlers: Expenses ---
  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    showToast('Deleted expense entry', 'info');
  };

  // --- Handlers: Stock adjustment ---
  const handleUpdateStock = (productId: string, newQty: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              ownStockQuantity: newQty,
              stockStatus: newQty === 0 ? 'Out of Stock' : newQty <= p.lowStockThreshold ? 'Low Stock' : 'Available',
            }
          : p
      )
    );
  };

  // --- Handlers: Reset Data ---
  const handleResetAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset to Sample Data',
      message: 'This will reset all products, wholesalers, orders, and expenses back to the initial preloaded dataset. Are you sure?',
      confirmLabel: 'Reset Everything',
      isDangerous: true,
      onConfirm: () => {
        storageService.resetAll();
        setProducts(storageService.getProducts());
        setSuppliers(storageService.getSuppliers());
        setOrders(storageService.getOrders());
        setCustomers(storageService.getCustomers());
        setExpenses(storageService.getExpenses());
        setPolicies(storageService.getPolicies());
        setSettings(storageService.getSettings());
        setCategories(storageService.getCategories());
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('System reset to pre-loaded sample data!', 'success');
      },
    });
  };

  const handleRestoreBackup = (jsonStr: string): boolean => {
    const ok = storageService.restoreBackup(jsonStr);
    if (ok) {
      setProducts(storageService.getProducts());
      setSuppliers(storageService.getSuppliers());
      setOrders(storageService.getOrders());
      setCustomers(storageService.getCustomers());
      setExpenses(storageService.getExpenses());
      setPolicies(storageService.getPolicies());
      setSettings(storageService.getSettings());
      setCategories(storageService.getCategories());
    }
    return ok;
  };

  // Role toggle for quick test
  const handleToggleRole = () => {
    const roles: UserRole[] = ['Admin', 'Staff', 'Order Manager'];
    const nextIdx = (roles.indexOf(session.role) + 1) % roles.length;
    const nextRole = roles[nextIdx];
    setSession(prev => ({ ...prev, role: nextRole }));
    showToast(`Role switched to ${nextRole}!`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        priceCheckAlertCount={priceCheckAlertCount}
        lowStockCount={lowStockCount}
        newOrdersCount={newOrdersCount}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewOrder={() => {
            setOrderToEdit(null);
            setPresetProductForOrder(null);
            setOrderFormOpen(true);
          }}
          onOpenNewProduct={() => {
            setProductToEdit(null);
            setProductFormOpen(true);
          }}
          products={products}
          onSelectProduct={p => setSelectedProductDetail(p)}
          session={session}
          onToggleRole={handleToggleRole}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              products={products}
              suppliers={suppliers}
              orders={orders}
              expenses={expenses}
              settings={settings}
              setActiveTab={setActiveTab}
              onSelectProduct={p => setSelectedProductDetail(p)}
              onOpenNewOrder={() => {
                setOrderToEdit(null);
                setPresetProductForOrder(null);
                setOrderFormOpen(true);
              }}
              onOpenNewProduct={() => {
                setProductToEdit(null);
                setProductFormOpen(true);
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              suppliers={suppliers}
              categories={categories}
              settings={settings}
              onSelectProduct={p => setSelectedProductDetail(p)}
              onOpenNewProduct={() => {
                setProductToEdit(null);
                setProductFormOpen(true);
              }}
              onEditProduct={p => {
                setProductToEdit(p);
                setProductFormOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onToggleStockStatus={handleToggleStockStatus}
              onNewOrderForProduct={p => {
                setPresetProductForOrder(p);
                setOrderToEdit(null);
                setOrderFormOpen(true);
              }}
              onAddNewCategory={handleAddNewCategory}
              onDeleteCategory={handleDeleteCategory}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              products={products}
              settings={settings}
              onOpenNewSupplier={() => {
                setSupplierToEdit(null);
                setSupplierFormOpen(true);
              }}
              onEditSupplier={s => {
                setSupplierToEdit(s);
                setSupplierFormOpen(true);
              }}
              onDeleteSupplier={handleDeleteSupplier}
              onSelectProduct={p => setSelectedProductDetail(p)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              settings={settings}
              onOpenNewOrder={() => {
                setOrderToEdit(null);
                setPresetProductForOrder(null);
                setOrderFormOpen(true);
              }}
              onEditOrder={o => {
                setOrderToEdit(o);
                setOrderFormOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onPrintOrderSlip={o => setOrderSlipToPrint(o)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              settings={settings}
              onOpenNewCustomer={() => {
                setCustomerToEdit(null);
                setCustomerFormOpen(true);
              }}
              onEditCustomer={c => {
                setCustomerToEdit(c);
                setCustomerFormOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'prices' && (
            <PriceCheckView
              products={products}
              suppliers={suppliers}
              settings={settings}
              onUpdateProductPrice={handleUpdateProductPrice}
              onMarkPriceVerifiedToday={handleMarkPriceVerifiedToday}
              onSelectProduct={p => setSelectedProductDetail(p)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              settings={settings}
              onUpdateStock={handleUpdateStock}
              onSelectProduct={p => setSelectedProductDetail(p)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              orders={orders}
              settings={settings}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'social' && (
            <SocialShareView
              products={products}
              settings={settings}
              onUpdateTemplate={newTmpl => {
                setSettings(prev => ({ ...prev, customMessageTemplate: newTmpl }));
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'policies' && (
            <PoliciesView
              policies={policies}
              onSavePolicies={setPolicies}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              products={products}
              suppliers={suppliers}
              orders={orders}
              expenses={expenses}
              settings={settings}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              session={session}
              onSaveSettings={setSettings}
              onSwitchRole={r => setSession(prev => ({ ...prev, role: r }))}
              onResetAllData={handleResetAllData}
              onRestoreBackup={handleRestoreBackup}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* --- Global Modals --- */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        suppliers={suppliers}
        settings={settings}
        onClose={() => setSelectedProductDetail(null)}
        onEdit={p => {
          setSelectedProductDetail(null);
          setProductToEdit(p);
          setProductFormOpen(true);
        }}
        onDelete={handleDeleteProduct}
        onDuplicate={handleDuplicateProduct}
        onMarkPriceVerified={p => {
          handleMarkPriceVerifiedToday(p.id);
          showToast(`Marked ${p.name} price verified today!`, 'success');
        }}
        onToggleStockStatus={handleToggleStockStatus}
        onNewOrderForProduct={p => {
          setSelectedProductDetail(null);
          setPresetProductForOrder(p);
          setOrderToEdit(null);
          setOrderFormOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={productFormOpen}
        productToEdit={productToEdit}
        suppliers={suppliers}
        existingProducts={products}
        categories={categories}
        onAddNewCategory={handleAddNewCategory}
        onClose={() => {
          setProductFormOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Wholesaler Form Modal */}
      <SupplierFormModal
        isOpen={supplierFormOpen}
        supplierToEdit={supplierToEdit}
        existingSuppliers={suppliers}
        onClose={() => {
          setSupplierFormOpen(false);
          setSupplierToEdit(null);
        }}
        onSave={handleSaveSupplier}
      />

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={orderFormOpen}
        orderToEdit={orderToEdit}
        presetProduct={presetProductForOrder}
        products={products}
        customers={customers}
        existingOrders={orders}
        onClose={() => {
          setOrderFormOpen(false);
          setOrderToEdit(null);
          setPresetProductForOrder(null);
        }}
        onSave={handleSaveOrder}
      />

      {/* Order Packing Slip Modal */}
      <OrderSlipModal
        order={orderSlipToPrint}
        settings={settings}
        onClose={() => setOrderSlipToPrint(null)}
      />

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={customerFormOpen}
        customerToEdit={customerToEdit}
        onClose={() => {
          setCustomerFormOpen(false);
          setCustomerToEdit(null);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
