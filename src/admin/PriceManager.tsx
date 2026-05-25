import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CatalogItem, BaseMenu, MenuCategory } from '../context/AppContext';
import { DollarSign, Tag, Info, CheckCircle2, Eye, EyeOff, Trash2, Edit2, Plus, Sparkles, Check, Settings } from 'lucide-react';
import { DishImage } from '../components/DishImage';

export const PriceManager: React.FC = () => {
  const {
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
    updateCustomOptionPrice
  } = useApp();

  // Internal tab: 'pricing' vs 'cms'
  const [internalTab, setInternalTab] = useState<'pricing' | 'cms'>('pricing');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Menu Category CMS States
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Package Item Configurator State
  const [activePkgConfigId, setActivePkgConfigId] = useState<string | null>(null);

  // New Base Menu Form States
  const [showAddBaseMenuForm, setShowAddBaseMenuForm] = useState(false);
  const [newBaseName, setNewBaseName] = useState('');
  const [newBasePrice, setNewBasePrice] = useState('');
  const [newBaseDesc, setNewBaseDesc] = useState('');
  const [newBaseTags, setNewBaseTags] = useState('');
  const [newBaseCategoryId, setNewBaseCategoryId] = useState('');

  // Editing Base Menu States
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseName, setEditBaseName] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editBaseDesc, setEditBaseDesc] = useState('');
  const [editBaseTags, setEditBaseTags] = useState('');
  const [editBaseCategoryId, setEditBaseCategoryId] = useState('');

  // New Dish CMS Form States
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('jeon');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishIngr, setNewDishIngr] = useState('');
  const [newDishTags, setNewDishTags] = useState('');
  const [newDishImageUrl, setNewDishImageUrl] = useState('');

  // Editing Dish CMS State (Inline)
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishDesc, setEditDishDesc] = useState('');
  const [editDishIngr, setEditDishIngr] = useState('');
  const [editDishTags, setEditDishTags] = useState('');
  const [editDishImageUrl, setEditDishImageUrl] = useState('');

  // New Custom Option CMS Form States
  const [newOptName, setNewOptName] = useState('');
  const [newOptType, setNewOptType] = useState<'addition' | 'subtraction'>('addition');
  const [newOptPrice, setNewOptPrice] = useState('');
  const [newOptDesc, setNewOptDesc] = useState('');
  const [newOptImageUrl, setNewOptImageUrl] = useState('');
  const [showAddOptForm, setShowAddOptForm] = useState(false);

  // Editing Custom Option State (Inline)
  const [editingOptId, setEditingOptId] = useState<string | null>(null);
  const [editOptName, setEditOptName] = useState('');
  const [editOptType, setEditOptType] = useState<'addition' | 'subtraction'>('addition');
  const [editOptPrice, setEditOptPrice] = useState('');
  const [editOptDesc, setEditOptDesc] = useState('');
  const [editOptImageUrl, setEditOptImageUrl] = useState('');

  // Image Upload Loading States
  const [uploadingNewDish, setUploadingNewDish] = useState(false);
  const [uploadingEditDish, setUploadingEditDish] = useState(false);
  const [uploadingNewOpt, setUploadingNewOpt] = useState(false);
  const [uploadingEditOpt, setUploadingEditOpt] = useState(false);

  // Helper: Upload image file to server and return URL
  const uploadImageToServer = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize limit: Max dimension 800px for optimal balance of quality and size
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 70% quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            console.log(`[HyoDream Compressor] ${file.name} compressed: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedDataUrl.length / 1024).toFixed(1)}KB`);
            resolve(compressedDataUrl);
          } else {
            resolve(reader.result as string);
          }
        };
        img.onerror = () => {
          resolve(reader.result as string);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        alert('이미지를 처리하는 중 오류가 발생했습니다.');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  // Category CRUD Handlers
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력해 주세요.');
      return;
    }
    addMenuCategory({ name: newCategoryName });
    setNewCategoryName('');
    setShowAddCategoryForm(false);
    triggerFeedback('새로운 상차림 카테고리가 성공적으로 추가되었습니다.');
  };

  const startEditCategory = (cat: MenuCategory) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const handleSaveEditCategory = () => {
    if (!editCategoryName.trim()) {
      alert('카테고리 이름을 입력해 주세요.');
      return;
    }
    updateMenuCategory(editingCategoryId!, { name: editCategoryName });
    setEditingCategoryId(null);
    triggerFeedback('카테고리 명칭이 성공적으로 수정되었습니다.');
  };

  // Base Menu CMS Handlers
  const handleAddBaseMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaseName.trim()) {
      alert('상차림 이름을 기입해 주세요.');
      return;
    }
    const priceNum = parseInt(newBasePrice.replace(/,/g, '')) || 0;
    const tagsArray = newBaseTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const resolvedCategoryId = newBaseCategoryId || menuCategories[0]?.id || '';

    addBaseMenu({
      name: newBaseName,
      categoryId: resolvedCategoryId,
      price: priceNum,
      description: newBaseDesc || '상세 상차림 특징 설명이 없습니다.',
      tags: tagsArray.length > 0 ? tagsArray : ['맞춤 차림'],
      itemIds: []
    });

    setNewBaseName('');
    setNewBasePrice('');
    setNewBaseDesc('');
    setNewBaseTags('');
    setNewBaseCategoryId('');
    setShowAddBaseMenuForm(false);
    triggerFeedback('새로운 상차림 패키지가 정상적으로 추가되었습니다.');
  };

  const startEditBaseMenu = (menu: BaseMenu) => {
    setEditingBaseId(menu.id);
    setEditBaseName(menu.name);
    setEditBasePrice(String(menu.price));
    setEditBaseDesc(menu.description);
    setEditBaseTags(menu.tags.join(', '));
    setEditBaseCategoryId(menu.categoryId);
  };

  const handleSaveEditBaseMenu = () => {
    if (!editBaseName.trim()) {
      alert('상차림 이름을 입력해 주세요.');
      return;
    }
    const priceNum = parseInt(editBasePrice.replace(/,/g, '')) || 0;
    const tagsArray = editBaseTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    updateBaseMenu(editingBaseId!, {
      name: editBaseName,
      price: priceNum,
      description: editBaseDesc,
      tags: tagsArray,
      categoryId: editBaseCategoryId
    });

    setEditingBaseId(null);
    triggerFeedback('상차림 패키지 상세 정보가 성공적으로 수정되었습니다.');
  };

  // Custom Option CMS Handlers
  const handleAddOptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptName.trim()) {
      alert('옵션 이름을 기입해 주세요.');
      return;
    }
    const priceNum = parseInt(newOptPrice.replace(/,/g, '')) || 0;
    addCustomOption({
      name: newOptName,
      type: newOptType,
      price: newOptType === 'subtraction' ? -Math.abs(priceNum) : Math.abs(priceNum),
      description: newOptDesc || '상세 옵션 설명이 없습니다.',
      imageUrl: newOptImageUrl || undefined
    });
    setNewOptName('');
    setNewOptPrice('');
    setNewOptDesc('');
    setNewOptImageUrl('');
    setShowAddOptForm(false);
    triggerFeedback('새로운 맞요 옵션이 성공적으로 추가되었습니다.');
  };

  const startEditOpt = (opt: any) => {
    setEditingOptId(opt.id);
    setEditOptName(opt.name);
    setEditOptType(opt.type);
    setEditOptPrice(String(Math.abs(opt.price)));
    setEditOptDesc(opt.description);
    setEditOptImageUrl(opt.imageUrl || '');
  };

  const handleSaveEditOpt = () => {
    if (!editOptName.trim()) {
      alert('옵션 이름을 입력해 주세요.');
      return;
    }
    const priceNum = parseInt(editOptPrice.replace(/,/g, '')) || 0;
    updateCustomOption(editingOptId!, {
      name: editOptName,
      type: editOptType,
      price: editOptType === 'subtraction' ? -Math.abs(priceNum) : Math.abs(priceNum),
      description: editOptDesc,
      imageUrl: editOptImageUrl || undefined
    });
    setEditingOptId(null);
    setEditOptImageUrl('');
    triggerFeedback('맞춤 옵션 정보가 성공적으로 수정되었습니다.');
  };

  const triggerFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveEditingId(null);
    }, 2000);
  };

  const handleBasePriceChange = (id: string, value: string) => {
    const num = parseInt(value.replace(/,/g, '')) || 0;
    updateBaseMenuPrice(id, num);
    triggerFeedback('기본 상차림 가격이 실시간 반영되었습니다.');
    setActiveEditingId(id);
  };

  const handleOptionPriceChange = (id: string, value: string) => {
    const num = parseInt(value.replace(/,/g, '')) || 0;
    updateCustomOptionPrice(id, num);
    triggerFeedback('추가/제외 맞춤 옵션 단가가 즉시 업데이트되었습니다.');
    setActiveEditingId(id);
  };

  // Toggle dish assignment to a base package
  const handleTogglePackageItem = (packageId: string, itemId: string) => {
    const pkg = baseMenus.find(p => p.id === packageId);
    if (!pkg) return;

    let newItemIds = [...pkg.itemIds];
    if (newItemIds.includes(itemId)) {
      newItemIds = newItemIds.filter(id => id !== itemId);
    } else {
      newItemIds.push(itemId);
    }
    updateBaseMenuItems(packageId, newItemIds);
    triggerFeedback('상차림의 포함 구성품 목록이 변경되었습니다.');
  };

  // Dish CMS: Add New Dish
  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) {
      alert('품목 이름을 기입해 주세요.');
      return;
    }

    const tagsArray = newDishTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addCatalogItem({
      name: newDishName,
      category: newDishCategory,
      description: newDishDesc || '상세 요리 설명이 없습니다.',
      ingredients: newDishIngr || '원산지 미표기',
      points: tagsArray.length > 0 ? tagsArray : ['수제 조리'],
      visible: true,
      imageUrl: newDishImageUrl.trim() || newDishCategory // Default to category key if empty
    });

    // Reset Form
    setNewDishName('');
    setNewDishDesc('');
    setNewDishIngr('');
    setNewDishTags('');
    setNewDishImageUrl('');
    triggerFeedback('새로운 정성 차림 요리가 CMS에 정상 등록되었습니다.');
  };

  // Dish CMS: Edit Form triggers
  const startEditDish = (dish: CatalogItem) => {
    setEditingDishId(dish.id);
    setEditDishName(dish.name);
    setEditDishDesc(dish.description);
    setEditDishIngr(dish.ingredients);
    setEditDishTags(dish.points.join(', '));
    setEditDishImageUrl(dish.imageUrl || '');
  };

  const handleSaveEditDish = () => {
    if (!editDishName.trim()) {
      alert('품목 이름을 입력해 주세요.');
      return;
    }

    updateCatalogItem(editingDishId!, {
      name: editDishName,
      description: editDishDesc,
      ingredients: editDishIngr,
      points: editDishTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      imageUrl: editDishImageUrl.trim() || 'jeon' // fallback if empty
    });

    setEditingDishId(null);
    setEditDishImageUrl('');
    triggerFeedback('요리 정보 수정이 성공적으로 저장되었습니다.');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'jeon': return '전 / 부침류';
      case 'jeok': return '적 / 육류';
      case 'namul': return '나물류';
      case 'tang': return '탕 / 국류';
      case 'fruit': return '과일 / 한과 / 기타';
      default: return '기타 품목';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in-up">
      
      {/* Sub Menu Switch Navigation */}
      <div className="glass-panel" style={{
        display: 'flex',
        padding: '6px',
        borderRadius: '12px',
        maxWidth: '450px',
        margin: '0 auto'
      }}>
        <button
          onClick={() => setInternalTab('pricing')}
          style={{
            flex: 1, padding: '10px 18px', border: 'none', borderRadius: '8px',
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            backgroundColor: internalTab === 'pricing' ? 'var(--color-primary)' : 'transparent',
            color: internalTab === 'pricing' ? '#FFFFFF' : 'var(--color-text-sub)'
          }}
        >
          상차림 세트 & 옵션 단가 관리
        </button>
        <button
          onClick={() => setInternalTab('cms')}
          style={{
            flex: 1, padding: '10px 18px', border: 'none', borderRadius: '8px',
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            backgroundColor: internalTab === 'cms' ? 'var(--color-primary)' : 'transparent',
            color: internalTab === 'cms' ? '#FFFFFF' : 'var(--color-text-sub)'
          }}
        >
          세부 차림 품목 관리 (CMS)
        </button>
      </div>

      {/* VIEW 1: PRICING & OPTIONS MANAGER (with package-dish mappings) */}
      {internalTab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }} className="responsive-chart-grid">
          
          {/* Left Column: Categories and Base Packages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1차 상차림 카테고리 제어센터 */}
            <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>상차림 카테고리 관리 (1차 메뉴)</h3>
                </div>
                
                <button
                  onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                  className="btn-text"
                  style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-fade)', padding: '6px 12px', borderRadius: '8px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {showAddCategoryForm ? '✓ 닫기' : '+ 새 카테고리 추가'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                고객 페이지의 실시간 주문기에 반영될 대분류(1차 메뉴) 카테고리를 실시간으로 관리합니다.
              </p>

              {/* Add Category Form */}
              {showAddCategoryForm && (
                <div className="animate-fade-in-up" style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>새 카테고리 이름 *</label>
                      <input
                        type="text"
                        placeholder="예: 묘사 / 시제상"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '8px 12px', width: '100%' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '9px 16px', fontSize: '0.85rem', borderRadius: '8px', height: '38px' }}
                    >
                      추가
                    </button>
                  </form>
                </div>
              )}

              {/* Category Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {menuCategories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: editingCategoryId === cat.id ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {editingCategoryId === cat.id ? (
                      <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          style={{ flex: 1, fontSize: '0.85rem', padding: '6px 10px' }}
                        />
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveEditCategory}
                          className="btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '6px', boxShadow: 'none' }}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: cat.visible ? 'var(--color-primary)' : 'var(--color-text-muted)'
                          }} />
                          <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-main)' }}>{cat.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            (상차림: {baseMenus.filter(m => m.categoryId === cat.id).length}개)
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* Visibility Toggle */}
                          <button
                            onClick={() => {
                              updateMenuCategory(cat.id, { visible: !cat.visible });
                              triggerFeedback(`카테고리 노출 상태가 변경되었습니다.`);
                            }}
                            title={cat.visible ? '고객 페이지에서 숨기기' : '고객 페이지에 노출하기'}
                            style={{
                              width: '28px', height: '28px', border: '1px solid var(--border-color)',
                              borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: cat.visible ? 'var(--color-primary)' : 'var(--color-text-muted)'
                            }}
                          >
                            {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => startEditCategory(cat)}
                            title="이름 수정"
                            style={{
                              width: '28px', height: '28px', border: '1px solid var(--border-color)',
                              borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--color-gold)'
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`'${cat.name}' 카테고리를 영구 삭제하시겠습니까?\n이 카테고리에 속한 모든 세부 상차림 패키지들도 CASCADE 방식으로 동반 삭제됩니다.`)) {
                                deleteMenuCategory(cat.id);
                                triggerFeedback('카테고리와 연관 상차림들이 안전하게 삭제되었습니다.');
                              }
                            }}
                            title="삭제"
                            style={{
                              width: '28px', height: '28px', border: '1px solid rgba(200, 122, 83, 0.2)',
                              borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--color-rose)'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Base Packages Card */}
            <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>기본 상차림 가격 및 포함 품목 편집</h3>
                </div>
                
                <button
                  onClick={() => setShowAddBaseMenuForm(!showAddBaseMenuForm)}
                  className="btn-text"
                  style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-fade)', padding: '6px 12px', borderRadius: '8px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {showAddBaseMenuForm ? '✓ 닫기' : '+ 새 상차림 추가'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                메인 패키지의 단가를 조절하고, 각 세트에 <strong>포함될 구체적인 음식 구성품들을 실시간 체크박스로 매핑</strong>합니다.
              </p>

              {/* Expandable Add New Base Menu Form */}
              {showAddBaseMenuForm && (
                <div className="animate-fade-in-up" style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  marginBottom: '24px'
                }}>
                  <form onSubmit={handleAddBaseMenuSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>상차림 이름 *</label>
                        <input
                          type="text"
                          placeholder="예: 정성 전통상 (기제사 소)"
                          value={newBaseName}
                          onChange={(e) => setNewBaseName(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '8px 12px', width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>기본 가격 *</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 700 }}>원</span>
                          <input
                            type="text"
                            placeholder="250000"
                            value={newBasePrice}
                            onChange={(e) => setNewBasePrice(e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '8px 12px', textAlign: 'right', paddingRight: '28px', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>태그 (쉼표로 구분)</label>
                        <input
                          type="text"
                          placeholder="예: 실속형, 1~2인, 기제사"
                          value={newBaseTags}
                          onChange={(e) => setNewBaseTags(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '8px 12px', width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>소속 카테고리 *</label>
                        <select
                          value={newBaseCategoryId}
                          onChange={(e) => setNewBaseCategoryId(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '8px 12px', width: '100%', height: '38px' }}
                        >
                          <option value="">-- 카테고리 선택 --</option>
                          {menuCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>상차림 특징 설명</label>
                      <textarea
                        rows={2}
                        placeholder="예: 1~2인 가구 및 핵가족을 위한 실속형 상차림. 필수 제수로 알차게 구성하여 예에 정성을 다했습니다."
                        value={newBaseDesc}
                        onChange={(e) => setNewBaseDesc(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '8px 12px', resize: 'none', width: '100%' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', borderRadius: '10px', justifyContent: 'center' }}
                    >
                      상차림 패키지 등록
                    </button>
                  </form>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {baseMenus.map((menu) => (
                  <div
                    key={menu.id}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: menu.visible ? 'var(--bg-secondary)' : '#FAF8F5',
                      border: activeEditingId === menu.id || editingBaseId === menu.id ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                      opacity: menu.visible ? 1 : 0.8,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {editingBaseId === menu.id ? (
                      /* Base Menu Inline Editor */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-in-up">
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>상차림 이름</label>
                            <input
                              type="text"
                              value={editBaseName}
                              onChange={(e) => setEditBaseName(e.target.value)}
                              placeholder="상차림 이름"
                              style={{ fontSize: '0.8rem', padding: '6px 10px', width: '100%' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>기본 가격 (원)</label>
                            <input
                              type="text"
                              value={editBasePrice}
                              onChange={(e) => setEditBasePrice(e.target.value)}
                              placeholder="가격"
                              style={{ fontSize: '0.8rem', padding: '6px 10px', width: '100%', textAlign: 'right' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>태그 (쉼표 구분)</label>
                            <input
                              type="text"
                              value={editBaseTags}
                              onChange={(e) => setEditBaseTags(e.target.value)}
                              placeholder="태그"
                              style={{ fontSize: '0.8rem', padding: '6px 10px', width: '100%' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>소속 카테고리</label>
                            <select
                              value={editBaseCategoryId}
                              onChange={(e) => setEditBaseCategoryId(e.target.value)}
                              style={{ fontSize: '0.8rem', padding: '5px 10px', width: '100%', height: '32px' }}
                            >
                              {menuCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>상차림 특징 설명</label>
                          <textarea
                            rows={2}
                            value={editBaseDesc}
                            onChange={(e) => setEditBaseDesc(e.target.value)}
                            placeholder="설명"
                            style={{ fontSize: '0.8rem', padding: '6px 10px', width: '100%', resize: 'none' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                          <button
                            onClick={() => setEditingBaseId(null)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveEditBaseMenu}
                            className="btn-primary"
                            style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '6px', boxShadow: 'none' }}
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Header info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong style={{
                                fontSize: '0.95rem',
                                color: menu.visible ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                textDecoration: menu.visible ? 'none' : 'line-through'
                              }}>
                                {menu.name}
                              </strong>
                              <span style={{
                                padding: '2px 8px',
                                fontSize: '0.7rem',
                                backgroundColor: 'var(--color-primary-fade)',
                                color: 'var(--color-primary-dark)',
                                borderRadius: '12px',
                                fontWeight: 700
                              }}>
                                {menuCategories.find(c => c.id === menu.categoryId)?.name || '분류 미지정'}
                              </span>
                              {!menu.visible && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-rose)', fontWeight: 700 }}>[숨김 상태]</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                              {menu.tags.map((t, idx) => (
                                <span key={idx} style={{ marginRight: '6px', fontWeight: 600, color: 'var(--color-primary)' }}>#{t}</span>
                              ))}
                            </div>
                          </div>

                          {/* Pricing edit field & Toggler */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Eye visibility toggle button */}
                            <button
                              onClick={() => {
                                toggleBaseMenuVisibility(menu.id);
                                triggerFeedback(`상차림 패키지 노출 상태가 ${!menu.visible ? '활성화' : '숨김 처리'}되었습니다.`);
                              }}
                              title={menu.visible ? '고객 페이지에서 숨기기' : '고객 페이지에 노출하기'}
                              style={{
                                width: '32px', height: '32px', border: '1px solid var(--border-color)',
                                borderRadius: '8px', cursor: 'pointer', backgroundColor: '#FFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: menu.visible ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                transition: 'var(--transition-smooth)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                              {menu.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => startEditBaseMenu(menu)}
                              title="상차림 상세 수정"
                              style={{
                                width: '32px', height: '32px', border: '1px solid var(--border-color)',
                                borderRadius: '8px', cursor: 'pointer', backgroundColor: '#FFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-gold)',
                                transition: 'var(--transition-smooth)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`'${menu.name}' 상차림을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                                  deleteBaseMenu(menu.id);
                                  triggerFeedback('상차림 패키지가 정상적으로 삭제되었습니다.');
                                }
                              }}
                              title="상차림 패키지 삭제"
                              style={{
                                width: '32px', height: '32px', border: '1px solid rgba(200, 122, 83, 0.2)',
                                borderRadius: '8px', cursor: 'pointer', backgroundColor: '#FFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-rose)',
                                transition: 'var(--transition-smooth)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-rose)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                              <Trash2 size={14} />
                            </button>

                            <div style={{ position: 'relative', width: '150px' }}>
                              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: '0.85rem' }}>원</span>
                              <input
                                type="text"
                                value={menu.price.toLocaleString()}
                                onChange={(e) => handleBasePriceChange(menu.id, e.target.value)}
                                style={{
                                  paddingRight: '28px',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  color: 'var(--color-primary)',
                                  textAlign: 'right',
                                  padding: '6px 28px 6px 12px',
                                  borderRadius: '8px',
                                  width: '100%'
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dish configurator slider toggle */}
                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                          <button
                            onClick={() => setActivePkgConfigId(activePkgConfigId === menu.id ? null : menu.id)}
                            className="btn-text"
                            style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}
                          >
                            {activePkgConfigId === menu.id ? '✓ 구성품 편집 닫기' : `⚙ 포함될 구성품 편집 (${(menu.itemIds || []).length}개 선택됨)`}
                          </button>

                          {/* Checkboxes grid for dynamic package-item assignment */}
                          {activePkgConfigId === menu.id && (
                            <div className="animate-fade-in-up" style={{
                              marginTop: '12px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                              gap: '12px'
                            }}>
                              {catalogItems.filter(c => c.visible).map(dish => {
                                const isIncluded = menu.itemIds ? menu.itemIds.includes(dish.id) : false;
                                return (
                                  <div
                                    key={dish.id}
                                    onClick={() => handleTogglePackageItem(menu.id, dish.id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      border: isIncluded ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                                      backgroundColor: isIncluded ? 'var(--color-primary-fade)' : 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                      transition: '0.2s'
                                    }}
                                  >
                                    <div style={{
                                      width: '16px', height: '16px', borderRadius: '4px',
                                      border: isIncluded ? 'none' : '1.5px solid var(--border-color)',
                                      backgroundColor: isIncluded ? 'var(--color-primary)' : '#FFF',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: '#FFF', flexShrink: 0
                                    }}>
                                      {isIncluded && <Check size={10} />}
                                    </div>
                                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {dish.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Surcharges / Deductions Options CMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>추가/제외 맞춤 옵션 관리</h3>
                </div>
                
                {/* Plus button to toggle Add form */}
                <button
                  onClick={() => setShowAddOptForm(!showAddOptForm)}
                  className="btn-text"
                  style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-fade)', padding: '6px 12px', borderRadius: '8px'
                  }}
                >
                  {showAddOptForm ? '✓ 닫기' : '+ 새 옵션 추가'}
                </button>
              </div>

              {/* Expandable Add New Option Form */}
              {showAddOptForm && (
                <div className="animate-fade-in-up" style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <form onSubmit={handleAddOptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>옵션 이름 *</label>
                      <input
                        type="text"
                        placeholder="예: 수제 식혜 추가"
                        value={newOptName}
                        onChange={(e) => setNewOptName(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '8px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>유형 선택 *</label>
                        <select
                          value={newOptType}
                          onChange={(e) => setNewOptType(e.target.value as 'addition' | 'subtraction')}
                          style={{ fontSize: '0.8rem', padding: '8px' }}
                        >
                          <option value="addition">추가 요리</option>
                          <option value="subtraction">제외 차감</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>금액 *</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 700 }}>원</span>
                          <input
                            type="text"
                            placeholder="10000"
                            value={newOptPrice}
                            onChange={(e) => setNewOptPrice(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '8px', textAlign: 'right', paddingRight: '28px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>설명</label>
                      <input
                        type="text"
                        placeholder="예: 엿기름을 직접 삭힌 시원한 전통 식혜"
                        value={newOptDesc}
                        onChange={(e) => setNewOptDesc(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '8px' }}
                      />
                    </div>

                    {/* New Option Image Upload */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>옵션 이미지 (선택)</label>
                      <div style={{
                        border: `1.5px dashed ${uploadingNewOpt ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        borderRadius: '8px', padding: '10px',
                        textAlign: 'center', backgroundColor: '#FAF8F5',
                        cursor: uploadingNewOpt ? 'not-allowed' : 'pointer',
                        position: 'relative'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingNewOpt}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingNewOpt(true);
                            const url = await uploadImageToServer(file);
                            setUploadingNewOpt(false);
                            if (url) setNewOptImageUrl(url);
                            e.target.value = '';
                          }}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                        />
                        {uploadingNewOpt ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '18px', height: '18px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>업로드 중...</span>
                          </div>
                        ) : newOptImageUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'relative', zIndex: 20 }}>
                            <img src={newOptImageUrl} alt="opt-preview" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>✅ 이미지 등록됨</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewOptImageUrl(''); }}
                              style={{ fontSize: '0.65rem', color: 'var(--color-rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>삭제</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1rem' }}>🖼️</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-sub)' }}>클릭하여 옵션 이미지 업로드</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '10px', fontSize: '0.8rem', borderRadius: '8px', justifyContent: 'center' }}
                    >
                      맞춤 옵션 등록
                    </button>
                  </form>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {customOptions.map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: activeEditingId === opt.id || editingOptId === opt.id ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                      transition: 'var(--transition-smooth)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {editingOptId === opt.id ? (
                      /* Option Inline Editor */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="animate-fade-in-up">
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>옵션 명칭</label>
                          <input
                            type="text"
                            value={editOptName}
                            onChange={(e) => setEditOptName(e.target.value)}
                            placeholder="옵션 이름"
                            style={{ fontSize: '0.8rem', padding: '6px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>유형</label>
                            <select
                              value={editOptType}
                              onChange={(e) => setEditOptType(e.target.value as 'addition' | 'subtraction')}
                              style={{ fontSize: '0.8rem', padding: '6px' }}
                            >
                              <option value="addition">추가 품목</option>
                              <option value="subtraction">제외 차감</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>단가 금액</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: '0.8rem' }}>원</span>
                              <input
                                type="text"
                                value={editOptPrice}
                                onChange={(e) => setEditOptPrice(e.target.value)}
                                placeholder="금액 단가"
                                style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'right', paddingRight: '28px' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>옵션 설명</label>
                          <input
                            type="text"
                            value={editOptDesc}
                            onChange={(e) => setEditOptDesc(e.target.value)}
                            placeholder="옵션 상세 설명"
                            style={{ fontSize: '0.8rem', padding: '6px' }}
                          />
                        </div>
                        {/* Option Image Upload (Edit) */}
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>옵션 이미지</label>
                          <div style={{
                            border: `1.5px dashed ${uploadingEditOpt ? 'var(--color-primary)' : 'var(--border-color)'}`,
                            borderRadius: '8px', padding: '8px',
                            textAlign: 'center', backgroundColor: '#FAF8F5',
                            cursor: uploadingEditOpt ? 'not-allowed' : 'pointer',
                            position: 'relative'
                          }}>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingEditOpt}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingEditOpt(true);
                                const url = await uploadImageToServer(file);
                                setUploadingEditOpt(false);
                                if (url) setEditOptImageUrl(url);
                                e.target.value = '';
                              }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                            />
                            {uploadingEditOpt ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700 }}>업로드 중...</span>
                              </div>
                            ) : editOptImageUrl ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'relative', zIndex: 20 }}>
                                <img src={editOptImageUrl} alt="opt-preview" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700 }}>✅ 등록됨</span>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditOptImageUrl(''); }}
                                  style={{ fontSize: '0.65rem', color: 'var(--color-rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>삭제</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.85rem' }}>🖼️</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-sub)' }}>클릭하여 이미지 변경</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                          <button
                            onClick={() => setEditingOptId(null)}
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.7rem', borderRadius: '4px' }}
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveEditOpt}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px', boxShadow: 'none' }}
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard Render Row */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          {/* Option Image Thumbnail */}
                          <div style={{
                            width: '52px', height: '52px', flexShrink: 0,
                            borderRadius: '8px', overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            backgroundColor: opt.type === 'addition' ? 'rgba(82,110,84,0.06)' : 'rgba(200,122,83,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {opt.imageUrl ? (
                              <img
                                src={opt.imageUrl}
                                alt={opt.name}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.4rem' }}>
                                {opt.type === 'addition' ? '➕' : '➖'}
                              </span>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>{opt.name.split(' (')[0]}</strong>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                              {opt.description}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span className="badge" style={{
                              padding: '2px 8px', fontSize: '0.65rem',
                              backgroundColor: opt.type === 'addition' ? 'rgba(58, 80, 59, 0.08)' : 'rgba(200, 122, 83, 0.1)',
                              color: opt.type === 'addition' ? 'var(--color-primary)' : 'var(--color-rose)'
                            }}>
                              {opt.type === 'addition' ? '추가단가' : '제외차감'}
                            </span>

                            {/* Edit Action */}
                            <button
                              onClick={() => startEditOpt(opt)}
                              title="옵션 수정"
                              style={{
                                width: '24px', height: '24px', border: '1px solid var(--border-color)',
                                borderRadius: '4px', cursor: 'pointer', backgroundColor: '#FFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-gold)'
                              }}
                            >
                              <Edit2 size={12} />
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => {
                                if (window.confirm(`'${opt.name}' 맞춤 옵션을 영구 삭제하시겠습니까?`)) {
                                  deleteCustomOption(opt.id);
                                  triggerFeedback('맞춤 옵션이 CMS에서 성공적으로 삭제되었습니다.');
                                }
                              }}
                              title="옵션 삭제"
                              style={{
                                width: '24px', height: '24px', border: '1px solid rgba(200, 122, 83, 0.2)',
                                borderRadius: '4px', cursor: 'pointer', backgroundColor: '#FFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-rose)'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Price Input directly */}
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: '0.85rem' }}>원</span>
                          <input
                            type="text"
                            value={Math.abs(opt.price).toLocaleString()}
                            onChange={(e) => handleOptionPriceChange(opt.id, e.target.value)}
                            style={{
                              paddingRight: '28px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: opt.type === 'addition' ? 'var(--color-primary)' : 'var(--color-rose)',
                              textAlign: 'right',
                              padding: '4px 28px 4px 10px',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: DYNAMIC MENU CATALOG CMS */}
      {internalTab === 'cms' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }} className="responsive-chart-grid">
          
          {/* New Item Submission Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>새로운 차림 요리 등록</h3>
              </div>

              <form onSubmit={handleAddDishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    요리 이름 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 궁중 수제 잡채"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    음식 카테고리 분류 *
                  </label>
                  <select value={newDishCategory} onChange={(e) => setNewDishCategory(e.target.value)} style={{ fontSize: '0.85rem', padding: '10px 14px' }}>
                    <option value="jeon">전 / 부침류</option>
                    <option value="jeok">적 / 육류</option>
                    <option value="namul">나물류</option>
                    <option value="tang">탕 / 국류</option>
                    <option value="fruit">과일 / 한과 / 기타</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    원재료 및 원산지 정보
                  </label>
                  <input
                    type="text"
                    placeholder="예: 돼지고기(국내산), 당면(국내산), 당근"
                    value={newDishIngr}
                    onChange={(e) => setNewDishIngr(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    강조 해시태그 (콤마로 구분)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 당일 새벽 제조, 명가 비법 조리"
                    value={newDishTags}
                    onChange={(e) => setNewDishTags(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    요리 이미지 업로드 (로컬 이미지)
                  </label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    backgroundColor: '#FAF8F5',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingNewDish}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingNewDish(true);
                        const url = await uploadImageToServer(file);
                        setUploadingNewDish(false);
                        if (url) setNewDishImageUrl(url);
                        e.target.value = '';
                      }}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: uploadingNewDish ? 'not-allowed' : 'pointer', zIndex: 10
                      }}
                    />
                    {uploadingNewDish ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px',
                          border: '3px solid var(--color-primary)',
                          borderTopColor: 'transparent', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>서버에 업로드 중...</span>
                      </div>
                    ) : newDishImageUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 20 }}>
                        <img
                          src={newDishImageUrl}
                          alt="preview"
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>✅ 이미지 업로드 완료</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNewDishImageUrl('');
                          }}
                          style={{
                            fontSize: '0.7rem', color: 'var(--color-rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700
                          }}
                        >
                          삭제하고 기본 이미지 사용
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.5rem' }}>📷</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-sub)' }}>클릭하여 컴퓨터의 이미지 파일 업로드</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>권장 비율 4:3 (jpg, png, webp 등)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '6px' }}>
                    요리 상세 특징 설명
                  </label>
                  <textarea
                    rows={4}
                    placeholder="예: 신선한 시금치와 아낌없는 소고기를 비법 간장 소스에 조리하여 쫄깃하고 담백한 전통 궁중 요리입니다."
                    value={newDishDesc}
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '12px 14px', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '12px 20px', fontSize: '0.9rem',
                    borderRadius: '12px', justifyContent: 'center', width: '100%'
                  }}
                >
                  <Sparkles size={16} /> CMS 요리 등록 완료
                </button>
              </form>
            </div>
          </div>

          {/* Catalog Listing with Search & Dynamic Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>등록된 요리 품목 리스트 ({catalogItems.length}개)</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  * 보이기/숨기기는 실시간 연동됩니다
                </span>
              </div>

              {/* Items List arranged by Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
                {['jeon', 'jeok', 'namul', 'tang', 'fruit'].map(category => {
                  const items = catalogItems.filter(item => item.category === category);
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                        backgroundColor: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '4px',
                        display: 'inline-block', marginBottom: '10px'
                      }}>
                        {getCategoryLabel(category)}
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map(dish => {
                          const isEditing = editingDishId === dish.id;
                          return (
                            <div
                              key={dish.id}
                              style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: dish.visible ? '#FFFFFF' : '#FAF8F5',
                                opacity: dish.visible ? 1 : 0.75,
                                transition: 'var(--transition-smooth)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}
                            >
                              {isEditing ? (
                                /* Inline Editor */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-in-up">
                                  <input
                                    type="text"
                                    value={editDishName}
                                    onChange={(e) => setEditDishName(e.target.value)}
                                    placeholder="요리 이름"
                                    style={{ fontSize: '0.85rem', padding: '8px' }}
                                  />
                                  <input
                                    type="text"
                                    value={editDishIngr}
                                    onChange={(e) => setEditDishIngr(e.target.value)}
                                    placeholder="원산지 정보"
                                    style={{ fontSize: '0.8rem', padding: '8px' }}
                                  />
                                  <input
                                    type="text"
                                    value={editDishTags}
                                    onChange={(e) => setEditDishTags(e.target.value)}
                                    placeholder="해시태그 (쉼표 구분)"
                                    style={{ fontSize: '0.8rem', padding: '8px' }}
                                  />
                                  <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '4px' }}>
                                      요리 이미지 업로드 (로컬 이미지)
                                    </label>
                                    <div style={{
                                      border: `1.5px dashed ${uploadingEditDish ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                      borderRadius: '8px',
                                      padding: '12px',
                                      textAlign: 'center',
                                      backgroundColor: '#FAF8F5',
                                      cursor: uploadingEditDish ? 'not-allowed' : 'pointer',
                                      position: 'relative'
                                    }}>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        disabled={uploadingEditDish}
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setUploadingEditDish(true);
                                          const url = await uploadImageToServer(file);
                                          setUploadingEditDish(false);
                                          if (url) setEditDishImageUrl(url);
                                          e.target.value = '';
                                        }}
                                        style={{
                                          position: 'absolute',
                                          top: 0, left: 0, width: '100%', height: '100%',
                                          opacity: 0, cursor: uploadingEditDish ? 'not-allowed' : 'pointer', zIndex: 10
                                        }}
                                      />
                                      {uploadingEditDish ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                          <div style={{
                                            width: '20px', height: '20px',
                                            border: '2px solid var(--color-primary)',
                                            borderTopColor: 'transparent', borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                          }} />
                                          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>업로드 중...</span>
                                        </div>
                                      ) : editDishImageUrl ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', position: 'relative', zIndex: 20 }}>
                                          <img
                                            src={editDishImageUrl}
                                            alt="preview"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                          />
                                          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>✅ 이미지 등록됨</span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setEditDishImageUrl('');
                                            }}
                                            style={{
                                              fontSize: '0.7rem', color: 'var(--color-rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600
                                            }}
                                          >
                                            기본값으로 변경
                                          </button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                          <span style={{ fontSize: '1rem' }}>📷</span>
                                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-sub)' }}>클릭하여 컴퓨터 이미지 선택</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={editDishDesc}
                                    onChange={(e) => setEditDishDesc(e.target.value)}
                                    placeholder="요리 설명"
                                    style={{ fontSize: '0.8rem', padding: '8px', resize: 'none' }}
                                  />
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                    <button
                                      onClick={() => setEditingDishId(null)}
                                      className="btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={handleSaveEditDish}
                                      className="btn-primary"
                                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', boxShadow: 'none' }}
                                    >
                                      수정 저장
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Standard Render Card */
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                  {/* Dish Thumbnail */}
                                  <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)',
                                    flexShrink: 0,
                                    backgroundColor: '#FAF8F5'
                                  }}>
                                    <DishImage imageUrl={dish.imageUrl} category={dish.category} name={dish.name} />
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <strong style={{
                                        fontSize: '0.9rem',
                                        textDecoration: dish.visible ? 'none' : 'line-through',
                                        color: dish.visible ? 'var(--color-text-main)' : 'var(--color-text-muted)'
                                      }}>
                                        {dish.name}
                                      </strong>
                                      {!dish.visible && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--color-rose)', fontWeight: 700 }}>[숨김 상태]</span>
                                      )}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', marginTop: '4px', lineHeight: 1.4 }}>
                                      {dish.description}
                                    </p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                                      성분: {dish.ingredients}
                                    </div>
                                  </div>

                                  {/* Dish actions */}
                                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    {/* Toggle Eye */}
                                    <button
                                      onClick={() => toggleCatalogItemVisibility(dish.id)}
                                      title={dish.visible ? '숨기기' : '보이기'}
                                      style={{
                                        width: '28px', height: '28px', border: '1px solid var(--border-color)',
                                        borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: dish.visible ? 'var(--color-primary)' : 'var(--color-text-muted)'
                                      }}
                                    >
                                      {dish.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>

                                    {/* Edit */}
                                    <button
                                      onClick={() => startEditDish(dish)}
                                      title="수정"
                                      style={{
                                        width: '28px', height: '28px', border: '1px solid var(--border-color)',
                                        borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--color-gold)'
                                      }}
                                    >
                                      <Edit2 size={14} />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`'${dish.name}' 요리를 완전히 삭제하겠습니까? (이 요리를 사용하는 패키지에서도 자동 해제됩니다.)`)) {
                                          deleteCatalogItem(dish.id);
                                          triggerFeedback('차림 요리가 CMS 목록에서 안전하게 삭제되었습니다.');
                                        }
                                      }}
                                      title="삭제"
                                      style={{
                                        width: '28px', height: '28px', border: '1px solid rgba(200, 122, 83, 0.2)',
                                        borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--color-rose)'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating dynamic confirmation notice */}
      {successMessage && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          backgroundColor: 'var(--color-primary-dark)', color: '#FFFFFF',
          padding: '16px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--color-gold)' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {/* Synchronicity Information Alert */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '18px 24px', backgroundColor: 'var(--color-primary-fade)',
        borderLeft: '4px solid var(--color-primary)', borderRadius: '8px',
        fontSize: '0.85rem', color: 'var(--color-text-sub)'
      }}>
        <Info size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div>
          <strong>실시간 양방향 동기화 활성화됨:</strong> 여기서 설정한 요리 구성품 체크상태, 새 요리 등록/수정/삭제 및 보이기/숨기기 결과는 고객 화면의 <strong>'실시간 상차림 주문기'</strong> 및 <strong>'정갈한 품목 소개'</strong> 탭에 0.1초 이내에 자동 반영됩니다.
        </div>
      </div>
    </div>
  );
};
