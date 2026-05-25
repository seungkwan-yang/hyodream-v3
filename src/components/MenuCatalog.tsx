import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Info } from 'lucide-react';
import { DishImage } from './DishImage';

export const MenuCatalog: React.FC = () => {
  const { catalogItems } = useApp();
  const [activeTab, setActiveTab] = useState<string>('jeon');

  const categories = [
    { id: 'jeon', label: '전 / 부침류' },
    { id: 'jeok', label: '적 / 육류' },
    { id: 'namul', label: '나물류' },
    { id: 'tang', label: '탕 / 국류' },
    { id: 'fruit', label: '과일 / 한과 / 기타' }
  ];

  // Filter visible items in the currently active category tab
  const visibleItems = catalogItems.filter(
    item => item.category === activeTab && item.visible
  );

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in-up">
      {/* Visual Header banner */}
      <div className="glass-panel korean-border-box" style={{
        padding: '32px',
        borderRadius: '24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <ChefHat size={28} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h3 className="serif-font" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            최고의 명인들과 전담 셰프들이 새벽에 정성껏 빚습니다
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '4px' }}>
            모든 요리는 공장에서 기계로 찍어내지 않으며, 모든 과정이 숙련된 명인들의 수작업으로 준비됩니다.
          </p>
        </div>
      </div>

      {/* Categories Switch Tabs */}
      <div className="catalog-tabs-container">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`catalog-tab-btn ${activeTab === c.id ? 'active' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <div key={item.id} className="premium-card korean-border-box" style={{
              padding: '32px 24px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Premium Image Header Section */}
              <div
                className="dish-image-container"
                style={{
                  position: 'relative',
                  width: 'calc(100% + 48px)', // Bleeds out to card margins
                  height: '220px',
                  margin: '-32px -24px 20px -24px',
                  overflow: 'hidden',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: '#FAF8F5'
                }}
              >
                <DishImage
                  imageUrl={item.imageUrl}
                  category={item.category}
                  name={item.name}
                  style={{
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                
                {/* Translucent overlay gradients */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.18) 100%)',
                  pointerEvents: 'none'
                }} />

                {/* Overlaid Tag Badges */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  zIndex: 2
                }}>
                  {item.points.map((p, i) => (
                    <span key={i} style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-dark)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(58, 80, 59, 0.15)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="serif-font" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              {/* Ingredients Footnote */}
              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px dashed var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px'
              }}>
                <Info size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong>엄선 성분 및 원산지:</strong> {item.ingredients}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            padding: '80px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            현재 등록 또는 노출 설정된 <strong>{getCategoryLabel(activeTab)}</strong> 요리가 존재하지 않습니다.
            <br />
            관리자 모드에서 언제든지 새로운 요리를 등록하거나 보이기 상태로 토글할 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
};
