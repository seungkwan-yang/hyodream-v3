import React, { createContext, useContext, useState, useEffect } from 'react';

// Type definitions
export type ViewMode = 'customer' | 'admin';
export type CustomerTab = 'home' | 'estimator' | 'menu' | 'reviews' | 'faq';
export type AdminTab = 'dashboard' | 'inquiries' | 'pricing';
export type InquiryStatus = 'pending' | 'approved' | 'processing' | 'completed';

// Individual dish/item in the catalog
export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string; // 'jeon' | 'jeok' | 'namul' | 'tang' | 'fruit'
  ingredients: string;
  points: string[]; // tag labels
  visible: boolean; // Show/Hide toggle status
  imageUrl: string; // Image path or category key
}

// Menu Category Grouping
export interface MenuCategory {
  id: string;
  name: string;
  visible: boolean;
}

// Base menu packages
export interface BaseMenu {
  id: string;
  categoryId: string; // Linked MenuCategory ID
  name: string;
  description: string;
  price: number;
  tags: string[];
  itemIds: string[]; // List of CatalogItem IDs included in this package
  visible: boolean;  // Show/Hide toggle status
}

export interface CustomOption {
  id: string;
  name: string;
  price: number;
  type: 'addition' | 'subtraction';
  description: string;
}

export interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  ritualType: string;
  date: string;
  timeSlot: string;
  address: string;
  addressDetail: string;
  specialRequests: string;
  customizations: string[]; // List of custom option names
  subtractions: string[];    // List of subtraction option names
  totalPrice: number;
  createdAt: string;
  status: InquiryStatus;
  adminNotes?: string;
  paymentMethod?: string; // e.g. '토스페이', '신용카드(신한)'
  paymentStatus?: 'paid' | 'pending' | 'cancelled';
  tossTransactionId?: string;
}

interface AppContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  
  // Menu Categories
  menuCategories: MenuCategory[];
  addMenuCategory: (category: Omit<MenuCategory, 'id' | 'visible'>) => MenuCategory;
  updateMenuCategory: (id: string, updated: Partial<MenuCategory>) => void;
  deleteMenuCategory: (id: string) => void;
  
  // Base Packages
  baseMenus: BaseMenu[];
  updateBaseMenuPrice: (id: string, price: number) => void;
  updateBaseMenuItems: (packageId: string, itemIds: string[]) => void; // Assign items to package
  toggleBaseMenuVisibility: (id: string) => void; // Toggle package visibility
  addBaseMenu: (menu: Omit<BaseMenu, 'id' | 'visible'>) => BaseMenu;
  updateBaseMenu: (id: string, updated: Partial<BaseMenu>) => void;
  deleteBaseMenu: (id: string) => void;
  
  // Catalog Items (CMS)
  catalogItems: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  updateCatalogItem: (id: string, updated: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;
  toggleCatalogItemVisibility: (id: string) => void;
  
  // Extra Custom Options
  customOptions: CustomOption[];
  addCustomOption: (option: Omit<CustomOption, 'id'>) => CustomOption;
  updateCustomOption: (id: string, updated: Partial<CustomOption>) => void;
  deleteCustomOption: (id: string) => void;
  updateCustomOptionPrice: (id: string, price: number) => void;
  
  // Inquiries
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { status?: InquiryStatus, paymentMethod?: string, paymentStatus?: 'paid' | 'pending' | 'cancelled', tossTransactionId?: string }) => Inquiry;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
  updateInquiryNotes: (id: string, notes: string) => void;
  deleteInquiry: (id: string) => void;

  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// API Base URL helper (Support both local development and cloud deploy environments)
const API_BASE = ''; // server.js is serving static files, meaning relative URL is optimal

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('hd_viewMode');
    return (saved as ViewMode) || 'customer';
  });

  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [baseMenus, setBaseMenus] = useState<BaseMenu[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all states from Neon DB API on mount
  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        setIsLoading(true);
        
        const [catRes, menuRes, itemRes, optRes, inqRes] = await Promise.all([
          fetch(`${API_BASE}/api/categories`),
          fetch(`${API_BASE}/api/base-menus`),
          fetch(`${API_BASE}/api/catalog-items`),
          fetch(`${API_BASE}/api/custom-options`),
          fetch(`${API_BASE}/api/inquiries`)
        ]);

        if (catRes.ok) setMenuCategories(await catRes.json());
        if (menuRes.ok) setBaseMenus(await menuRes.json());
        if (itemRes.ok) setCatalogItems(await itemRes.json());
        if (optRes.ok) setCustomOptions(await optRes.json());
        if (inqRes.ok) setInquiries(await inqRes.json());
      } catch (err) {
        console.error('[HyoDream API Fetch] Failed to load data from Neon DB backend:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDatabaseData();
  }, []);

  // Save viewMode locally for layout conveniences
  useEffect(() => {
    localStorage.setItem('hd_viewMode', viewMode);
  }, [viewMode]);

  // Categories CRUD
  const addMenuCategory = (catData: Omit<MenuCategory, 'id' | 'visible'>) => {
    const newId = `cat-${Date.now()}`;
    const newCategory: MenuCategory = {
      ...catData,
      id: newId,
      visible: true
    };
    
    // Optimistic UI update
    setMenuCategories(prev => [...prev, newCategory]);

    // DB Async Sync
    fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    }).catch(err => console.error('[HyoDream DB Sync] addMenuCategory failed:', err));

    return newCategory;
  };

  const updateMenuCategory = (id: string, updated: Partial<MenuCategory>) => {
    setMenuCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updated } : cat))
    );

    // Sync to backend DB
    const cat = menuCategories.find(c => c.id === id);
    if (cat) {
      fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cat, ...updated })
      }).catch(err => console.error('[HyoDream DB Sync] updateMenuCategory failed:', err));
    }
  };

  const deleteMenuCategory = (id: string) => {
    setMenuCategories(prev => prev.filter(cat => cat.id !== id));
    // Cascade delete on client side to match Postgres foreign key CASCADE behavior
    setBaseMenus(prev => prev.filter(m => m.categoryId !== id));

    fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[HyoDream DB Sync] deleteMenuCategory failed:', err));
  };

  // Base Menu Packages CRUD
  const updateBaseMenuPrice = (id: string, price: number) => {
    setBaseMenus(prev =>
      prev.map(item => (item.id === id ? { ...item, price } : item))
    );

    const pkg = baseMenus.find(p => p.id === id);
    if (pkg) {
      fetch(`${API_BASE}/api/base-menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, price })
      }).catch(err => console.error('[HyoDream DB Sync] updateBaseMenuPrice failed:', err));
    }
  };

  const updateBaseMenuItems = (packageId: string, itemIds: string[]) => {
    setBaseMenus(prev =>
      prev.map(pkg => (pkg.id === packageId ? { ...pkg, itemIds } : pkg))
    );

    const pkg = baseMenus.find(p => p.id === packageId);
    if (pkg) {
      fetch(`${API_BASE}/api/base-menus/${packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, itemIds })
      }).catch(err => console.error('[HyoDream DB Sync] updateBaseMenuItems failed:', err));
    }
  };

  const toggleBaseMenuVisibility = (id: string) => {
    let updatedVal = true;
    setBaseMenus(prev =>
      prev.map(pkg => {
        if (pkg.id === id) {
          updatedVal = !pkg.visible;
          return { ...pkg, visible: updatedVal };
        }
        return pkg;
      })
    );

    const pkg = baseMenus.find(p => p.id === id);
    if (pkg) {
      fetch(`${API_BASE}/api/base-menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, visible: updatedVal })
      }).catch(err => console.error('[HyoDream DB Sync] toggleBaseMenuVisibility failed:', err));
    }
  };

  const addBaseMenu = (menuData: Omit<BaseMenu, 'id' | 'visible'>) => {
    const newId = `menu-${Date.now()}`;
    const newMenu: BaseMenu = {
      ...menuData,
      id: newId,
      visible: true
    };
    
    setBaseMenus(prev => [...prev, newMenu]);

    fetch(`${API_BASE}/api/base-menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    }).catch(err => console.error('[HyoDream DB Sync] addBaseMenu failed:', err));

    return newMenu;
  };

  const updateBaseMenu = (id: string, updated: Partial<BaseMenu>) => {
    setBaseMenus(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );

    const pkg = baseMenus.find(p => p.id === id);
    if (pkg) {
      fetch(`${API_BASE}/api/base-menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, ...updated })
      }).catch(err => console.error('[HyoDream DB Sync] updateBaseMenu failed:', err));
    }
  };

  const deleteBaseMenu = (id: string) => {
    setBaseMenus(prev => prev.filter(item => item.id !== id));

    fetch(`${API_BASE}/api/base-menus/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[HyoDream DB Sync] deleteBaseMenu failed:', err));
  };

  // Catalog Item CMS Actions
  const addCatalogItem = (itemData: Omit<CatalogItem, 'id'>) => {
    const newId = `item-${itemData.category}-${Date.now()}`;
    const newItem: CatalogItem = {
      ...itemData,
      id: newId
    };
    
    setCatalogItems(prev => [...prev, newItem]);

    fetch(`${API_BASE}/api/catalog-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(err => console.error('[HyoDream DB Sync] addCatalogItem failed:', err));

    return newItem;
  };

  const updateCatalogItem = (id: string, updated: Partial<CatalogItem>) => {
    setCatalogItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );

    const item = catalogItems.find(i => i.id === id);
    if (item) {
      fetch(`${API_BASE}/api/catalog-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, ...updated })
      }).catch(err => console.error('[HyoDream DB Sync] updateCatalogItem failed:', err));
    }
  };

  const deleteCatalogItem = (id: string) => {
    setCatalogItems(prev => prev.filter(item => item.id !== id));
    
    // Also clean up references in base menu packages! (Matching CASCADE server behavior)
    setBaseMenus(prev =>
      prev.map(pkg => ({
        ...pkg,
        itemIds: pkg.itemIds.filter(itemId => itemId !== id)
      }))
    );

    fetch(`${API_BASE}/api/catalog-items/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[HyoDream DB Sync] deleteCatalogItem failed:', err));
  };

  const toggleCatalogItemVisibility = (id: string) => {
    let updatedVal = true;
    setCatalogItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          updatedVal = !item.visible;
          return { ...item, visible: updatedVal };
        }
        return item;
      })
    );

    const item = catalogItems.find(i => i.id === id);
    if (item) {
      fetch(`${API_BASE}/api/catalog-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, visible: updatedVal })
      }).catch(err => console.error('[HyoDream DB Sync] toggleCatalogItemVisibility failed:', err));
    }
  };

  // Custom Options CMS Actions
  const addCustomOption = (optionData: Omit<CustomOption, 'id'>) => {
    const newId = `opt-${optionData.type}-${Date.now()}`;
    const newOption: CustomOption = {
      ...optionData,
      id: newId
    };
    
    setCustomOptions(prev => [...prev, newOption]);

    fetch(`${API_BASE}/api/custom-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOption)
    }).catch(err => console.error('[HyoDream DB Sync] addCustomOption failed:', err));

    return newOption;
  };

  const updateCustomOption = (id: string, updated: Partial<CustomOption>) => {
    setCustomOptions(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );

    const opt = customOptions.find(o => o.id === id);
    if (opt) {
      fetch(`${API_BASE}/api/custom-options/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...opt, ...updated })
      }).catch(err => console.error('[HyoDream DB Sync] updateCustomOption failed:', err));
    }
  };

  const deleteCustomOption = (id: string) => {
    setCustomOptions(prev => prev.filter(item => item.id !== id));

    fetch(`${API_BASE}/api/custom-options/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[HyoDream DB Sync] deleteCustomOption failed:', err));
  };

  const updateCustomOptionPrice = (id: string, price: number) => {
    setCustomOptions(prev =>
      prev.map(item => (item.id === id ? { ...item, price } : item))
    );

    const opt = customOptions.find(o => o.id === id);
    if (opt) {
      fetch(`${API_BASE}/api/custom-options/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...opt, price })
      }).catch(err => console.error('[HyoDream DB Sync] updateCustomOptionPrice failed:', err));
    }
  };

  // Inquiry booking
  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { status?: InquiryStatus, paymentMethod?: string, paymentStatus?: 'paid' | 'pending' | 'cancelled', tossTransactionId?: string }) => {
    const year = new Date().getFullYear();
    const sequence = String(inquiries.length + 1).padStart(4, '0');
    const newId = `HD-${year}-${sequence}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newInquiry: Inquiry = {
      status: 'pending', // default status fallback
      ...inquiryData,
      id: newId,
      createdAt
    };

    setInquiries(prev => [newInquiry, ...prev]);

    fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiry)
    }).catch(err => console.error('[HyoDream DB Sync] addInquiry failed:', err));

    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus) => {
    setInquiries(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );

    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      fetch(`${API_BASE}/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: inq.adminNotes || '' })
      }).catch(err => console.error('[HyoDream DB Sync] updateInquiryStatus failed:', err));
    }
  };

  const updateInquiryNotes = (id: string, notes: string) => {
    setInquiries(prev =>
      prev.map(item => (item.id === id ? { ...item, adminNotes: notes } : item))
    );

    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      fetch(`${API_BASE}/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: inq.status, adminNotes: notes })
      }).catch(err => console.error('[HyoDream DB Sync] updateInquiryNotes failed:', err));
    }
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(item => item.id !== id));

    fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('[HyoDream DB Sync] deleteInquiry failed:', err));
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        customerTab,
        setCustomerTab,
        adminTab,
        setAdminTab,
        menuCategories,
        addMenuCategory,
        updateMenuCategory,
        deleteMenuCategory,
        baseMenus,
        updateBaseMenuPrice,
        updateBaseMenuItems,
        toggleBaseMenuVisibility,
        addBaseMenu,
        updateBaseMenu,
        deleteBaseMenu,
        catalogItems,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        toggleCatalogItemVisibility,
        customOptions,
        addCustomOption,
        updateCustomOption,
        deleteCustomOption,
        updateCustomOptionPrice,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        updateInquiryNotes,
        deleteInquiry,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
