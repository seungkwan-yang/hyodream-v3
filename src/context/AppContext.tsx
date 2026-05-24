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

// Base menu packages
export interface BaseMenu {
  id: string;
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
}

// Initial Mock Catalog Items (Individual Dishes)
const defaultCatalogItems: CatalogItem[] = [
  {
    id: 'item-jeon-01',
    name: '수제 명품 동태전',
    description: '비린맛이 전혀 없는 신선한 동태포를 엄선하여 가시를 완벽히 발라낸 뒤, 노란 계란물을 곱게 입혀 새벽녘 구워냅니다.',
    category: 'jeon',
    ingredients: '동태(러시아산/선상급), 신선란(국내산), 밀가루(국내산)',
    points: ['가시 완벽 발라냄', '당일 즉석 제조', '부드러운 식감'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-jeon-02',
    name: '정성 가득 고기완자전 (동그랑땡)',
    description: '신선한 국산 돈육과 두부, 각종 야채를 잘게 다져 치댄 뒤 도톰하게 빚어 육즙이 새어나가지 않게 지져냅니다.',
    category: 'jeon',
    ingredients: '돼지고기(국내산 1등급), 두부(국내산), 부추, 양파',
    points: ['풍부한 육즙', '수제 수작업 빚음', '두툼한 두께'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-jeon-03',
    name: '오색 꼬지전',
    description: '맛살, 햄, 부추, 단무지, 새송이버섯을 정밀하게 재단하여 알록달록 고운 색감으로 정성스레 꽂아 낸 누구나 좋아하는 전.',
    category: 'jeon',
    ingredients: '새송이버섯(국내산), 쪽파(국내산), 햄, 맛살',
    points: ['정밀 재단 오색 빛깔', '정갈함의 끝판왕'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-jeok-01',
    name: '명품 육적 (산적 소고기)',
    description: '최상급 소고기 부위를 효드림 비법 과일 양념에 12시간 숙성시켜 그릴에 직화로 구워 겉은 바삭하고 속은 촉촉합니다.',
    category: 'jeok',
    ingredients: '소고기(우둔/설도 등 등급별), 배/양파즙(국내산)',
    points: ['직화 그릴 구이', '천연 과일 양념 숙성', '연한 육질'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-jeok-02',
    name: '동해안 참조기 구이 (어적)',
    description: '비늘 and 아가미를 깔끔하게 다듬고 천일염으로 슴슴하게 간하여 한 마리 한 마리 노릇노릇하고 꼿꼿하게 구워 올립니다.',
    category: 'jeok',
    ingredients: '참조기(국내산 천일염 염장)',
    points: ['비늘/내장 수작업 제거', '특대 사이즈 조기', '꼿꼿한 자태 유지'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-jeok-03',
    name: '궁중식 한우 갈비찜',
    description: '횡성 한우 갈비 부위를 특제 양념장에 푹 고아내어 뼈가 부드럽게 발라지며, 밤과 대추를 아낌없이 올린 프리미엄 요리.',
    category: 'jeok',
    ingredients: '한우 갈비(국내산), 알밤(국내산), 대추(국내산)',
    points: ['부드럽고 쫄깃함', '가마솥 방식 고아냄', '완벽 보냉 포장'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-namul-01',
    name: '정갈한 삼색 나물 (고사리/도라지/시금치)',
    description: '뿌리를 다듬고 아린맛을 완전히 뺀 뒤, 들기름과 재래간장으로 볶아내고 살쳐내어 깊은 고소함이 일품인 삼색 고유의 나물.',
    category: 'namul',
    ingredients: '고사리(제주산), 백도라지(국내산), 시금치(국내산)',
    points: ['아린맛 완벽 제거', '전통 들기름 사용', '고유 색감 보존'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-tang-01',
    name: '깊고 맑은 가마솥 탕국',
    description: '무와 양지머리 소고기, 두부를 큼직하게 썰어 가마솥에 오랜 시간 고아내어 국물맛이 깊고 맑아 제사 상차림의 깊이를 더해줍니다.',
    category: 'tang',
    ingredients: '소고기 양지(국내산), 무(국내산), 국산 두부',
    points: ['가마솥 맑은 육수', '도톰하게 썰어낸 제수 두부', '기름기 완벽 제거'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-fruit-01',
    name: '특상품 제수용 과일 (사과/배/감 등)',
    description: '가락시장에서 당일 새벽 공수하는 과일 중 크기가 크고 상처가 없으며 색깔이 선명한 특등급 제수용 과일만을 꼼꼼히 엄선합니다.',
    category: 'fruit',
    ingredients: '배(신고/국내산), 사과(부사/국내산), 곶감(상주/국내산)',
    points: ['특등급 새벽 낙찰', '상처 무결점 엄선', '개별 완충 포장'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'item-fruit-02',
    name: '전통 제과 & 부가 품목 (약과/산자/제문)',
    description: '전통 한과 명가에서 빚은 쫀득한 수제 찹쌀 약과와 산자, 그리고 제를 모시는 데 필수적인 제문 및 향, 초 일체를 포함합니다.',
    category: 'fruit',
    ingredients: '찹쌀(국내산), 조청(국내산)',
    points: ['전통 한과 명가 제작', '향/초/제문 일체 포함'],
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80'
  }
];

// Initial Mock Base Packages (itemIds map inside them)
const defaultBaseMenus: BaseMenu[] = [
  {
    id: 'kisso',
    name: '소가족 실속상 (기제사 소)',
    description: '1~2인 가구 및 핵가족을 위한 실속형 상차림. 필수 제수로 알차게 구성하여 예에 정성을 다했습니다.',
    price: 220000,
    tags: ['실속형', '1~2인', '기제사'],
    itemIds: ['item-jeon-01', 'item-jeon-02', 'item-namul-01', 'item-tang-01'],
    visible: true
  },
  {
    id: 'kijung',
    name: '표준 맞춤상 (기제사 중)',
    description: '가장 많이 찾으시는 대중적인 3~4인용 표준 상차림. 넉넉하고 정갈한 음식으로 제를 모실 수 있습니다.',
    price: 350000,
    tags: ['인기', '3~4인', '기제사'],
    itemIds: ['item-jeon-01', 'item-jeon-02', 'item-jeon-03', 'item-jeok-01', 'item-jeok-02', 'item-namul-01', 'item-tang-01', 'item-fruit-01'],
    visible: true
  },
  {
    id: 'kidae',
    name: '명가 전통상 (기제사 대)',
    description: '대가족 및 5인 이상 가족을 위한 품격 높은 풍성한 상차림. 엄선된 식재료와 장인의 손길로 준비됩니다.',
    price: 480000,
    tags: ['프리미엄', '5인이상', '기제사'],
    itemIds: ['item-jeon-01', 'item-jeon-02', 'item-jeon-03', 'item-jeok-01', 'item-jeok-02', 'item-jeok-03', 'item-namul-01', 'item-tang-01', 'item-fruit-01', 'item-fruit-02'],
    visible: true
  },
  {
    id: 'gosa',
    name: '개업 고사상 / 시제상',
    description: '사업 번창과 가문의 평안을 기원하는 맞춤형 제사상. 돼지머리(실물 또는 모형선택) 및 떡, 과일 구성.',
    price: 290000,
    tags: ['고사/시제', '맞춤형'],
    itemIds: ['item-fruit-01', 'item-fruit-02'],
    visible: true
  }
];

const defaultCustomOptions: CustomOption[] = [
  {
    id: 'abalone',
    name: '완도산 명품 활전복 숙회 (5미)',
    price: 35000,
    type: 'addition',
    description: '주문 당일 활어 상태의 전복을 스팀하여 부드럽고 쫄깃한 식감의 고급 적(炙) 품목'
  },
  {
    id: 'beef',
    name: '한우 갈비찜 업그레이드',
    price: 40000,
    type: 'addition',
    description: '수입산 육적을 최고급 횡성 한우 양념 갈비찜으로 업그레이드하여 차림의 품격을 높임'
  },
  {
    id: 'ricecake',
    name: '수제 삼색경단 및 약식 추가',
    price: 15000,
    type: 'addition',
    description: '천연재료로 빚은 고소한 삼색경단과 밤, 대추가 듬뿍 들어간 수제 궁중 약식 추가 구성'
  },
  {
    id: 'sikhye',
    name: '수제 전통 식혜 (1.8L)',
    price: 10000,
    type: 'addition',
    description: '전통 방식 그대로 가마솥에 엿기름을 삭혀 깊은 단맛을 낸 홈메이드 전통 음료'
  },
  {
    id: 'utensils',
    name: '고급 제구 & 제문 세트 대여',
    price: 0,
    type: 'addition',
    description: '품격 있는 목제 제기 및 제문, 향로, 초 등을 무료로 대여해 드립니다.'
  },
  {
    id: 'noincense',
    name: '향/초/제문 세트 제외',
    price: -5000,
    type: 'subtraction',
    description: '가정에 이미 제구 및 향/초가 구비되어 있어 필요 없는 경우 적용하는 차감 옵션'
  },
  {
    id: 'simplefruit',
    name: '과일류 간소화',
    price: -20000,
    type: 'subtraction',
    description: '제사상에 필수적인 3색 과일(대추, 밤, 감/배)만 유지하고 기타 제철 과일을 제외하는 간소화 옵션'
  }
];

const defaultInquiries: Inquiry[] = [
  {
    id: 'HD-2026-0001',
    customerName: '김민준',
    phone: '010-3456-7890',
    ritualType: '표준 맞춤상 (기제사 중)',
    date: '2026-05-28',
    timeSlot: '오후 4:00 ~ 오후 6:00 (제사 전 도착)',
    address: '인천광역시 연수구 송도동 123-45',
    addressDetail: '송도자이더스타 104동 1502호',
    specialRequests: '간이 싱거웠으면 좋겠고 생선은 조기로 꼭 튼실한 놈으로 보내주세요.',
    customizations: ['한우 갈비찜 업그레이드', '수제 전통 식혜 (1.8L)'],
    subtractions: [],
    totalPrice: 400000,
    createdAt: '2026-05-24 07:15',
    status: 'pending',
    adminNotes: '배송 당일 전화 요청함. 조기 사이즈 30cm 이상 선별 필수.',
    paymentMethod: '토스페이',
    paymentStatus: 'paid',
    tossTransactionId: 'toss_tx_20260524mj89'
  },
  {
    id: 'HD-2026-0002',
    customerName: '이지혜',
    phone: '010-8765-4321',
    ritualType: '소가족 실속상 (기제사 소)',
    date: '2026-05-26',
    timeSlot: '오전 10:00 ~ 오후 12:00',
    address: '인천광역시 부평구 평천로 150',
    addressDetail: '부평래미안아파트 201동 304호',
    specialRequests: '현관 공동현관 비밀번호는 #0226* 입니다. 벨 누르지 마시고 문 앞에 놔주세요.',
    customizations: ['고급 제구 & 제문 세트 대여'],
    subtractions: ['향/초/제문 세트 제외'],
    totalPrice: 215000,
    createdAt: '2026-05-23 18:30',
    status: 'approved',
    adminNotes: '문 앞 배송 확인 문자 전송 요망. 대여 제기는 다음 날 회수 예정.',
    paymentMethod: '신용카드 (신한카드)',
    paymentStatus: 'paid',
    tossTransactionId: 'toss_tx_20260523jh54'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('hd_viewMode');
    return (saved as ViewMode) || 'customer';
  });

  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  const [baseMenus, setBaseMenus] = useState<BaseMenu[]>(() => {
    const saved = localStorage.getItem('hd_baseMenus');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Guarantee all fields (itemIds, visible) are populated even on older structures
        return parsed.map((m: any) => ({
          ...m,
          itemIds: m.itemIds || [],
          visible: m.visible !== undefined ? m.visible : true
        }));
      } catch (e) {
        return defaultBaseMenus;
      }
    }
    return defaultBaseMenus;
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem('hd_catalogItems');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          imageUrl: item.imageUrl || item.category || 'jeon'
        }));
      } catch (e) {
        return defaultCatalogItems;
      }
    }
    return defaultCatalogItems;
  });

  const [customOptions, setCustomOptions] = useState<CustomOption[]>(() => {
    const saved = localStorage.getItem('hd_customOptions');
    return saved ? JSON.parse(saved) : defaultCustomOptions;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('hd_inquiries');
    return saved ? JSON.parse(saved) : defaultInquiries;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hd_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('hd_baseMenus', JSON.stringify(baseMenus));
  }, [baseMenus]);

  useEffect(() => {
    localStorage.setItem('hd_catalogItems', JSON.stringify(catalogItems));
  }, [catalogItems]);

  useEffect(() => {
    localStorage.setItem('hd_customOptions', JSON.stringify(customOptions));
  }, [customOptions]);

  useEffect(() => {
    localStorage.setItem('hd_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Update base menu price
  const updateBaseMenuPrice = (id: string, price: number) => {
    setBaseMenus(prev =>
      prev.map(item => (item.id === id ? { ...item, price } : item))
    );
  };

  // Assign items to base menu package
  const updateBaseMenuItems = (packageId: string, itemIds: string[]) => {
    setBaseMenus(prev =>
      prev.map(pkg => (pkg.id === packageId ? { ...pkg, itemIds } : pkg))
    );
  };

  // Toggle base menu package visibility
  const toggleBaseMenuVisibility = (id: string) => {
    setBaseMenus(prev =>
      prev.map(pkg => (pkg.id === id ? { ...pkg, visible: !pkg.visible } : pkg))
    );
  };

  // Add base menu package
  const addBaseMenu = (menuData: Omit<BaseMenu, 'id' | 'visible'>) => {
    const newId = `menu-${Date.now()}`;
    const newMenu: BaseMenu = {
      ...menuData,
      id: newId,
      visible: true
    };
    setBaseMenus(prev => [...prev, newMenu]);
    return newMenu;
  };

  // Update base menu package details
  const updateBaseMenu = (id: string, updated: Partial<BaseMenu>) => {
    setBaseMenus(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  // Delete base menu package
  const deleteBaseMenu = (id: string) => {
    setBaseMenus(prev => prev.filter(item => item.id !== id));
  };

  // Catalog Item CMS Actions
  const addCatalogItem = (itemData: Omit<CatalogItem, 'id'>) => {
    const newId = `item-${itemData.category}-${Date.now()}`;
    const newItem: CatalogItem = {
      ...itemData,
      id: newId
    };
    setCatalogItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateCatalogItem = (id: string, updated: Partial<CatalogItem>) => {
    setCatalogItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteCatalogItem = (id: string) => {
    setCatalogItems(prev => prev.filter(item => item.id !== id));
    
    // Also clean up references in base menu packages!
    setBaseMenus(prev =>
      prev.map(pkg => ({
        ...pkg,
        itemIds: pkg.itemIds.filter(itemId => itemId !== id)
      }))
    );
  };

  const toggleCatalogItemVisibility = (id: string) => {
    setCatalogItems(prev =>
      prev.map(item => (item.id === id ? { ...item, visible: !item.visible } : item))
    );
  };

  // Custom Option CMS Actions
  const addCustomOption = (optionData: Omit<CustomOption, 'id'>) => {
    const newId = `opt-${optionData.type}-${Date.now()}`;
    const newOption: CustomOption = {
      ...optionData,
      id: newId
    };
    setCustomOptions(prev => [...prev, newOption]);
    return newOption;
  };

  const updateCustomOption = (id: string, updated: Partial<CustomOption>) => {
    setCustomOptions(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteCustomOption = (id: string) => {
    setCustomOptions(prev => prev.filter(item => item.id !== id));
  };

  // Option price editor
  const updateCustomOptionPrice = (id: string, price: number) => {
    setCustomOptions(prev =>
      prev.map(item => (item.id === id ? { ...item, price } : item))
    );
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
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus) => {
    setInquiries(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const updateInquiryNotes = (id: string, notes: string) => {
    setInquiries(prev =>
      prev.map(item => (item.id === id ? { ...item, adminNotes: notes } : item))
    );
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(item => item.id !== id));
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
        deleteInquiry
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
