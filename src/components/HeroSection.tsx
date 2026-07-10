import React from 'react';
import { useApp } from '../context/AppContext';
import { ImageIcon, Sparkles, Tag } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setCustomerTab, menuCategories, baseMenus } = useApp();
  const firstPriorityCategory = menuCategories
    .filter(category => category.visible)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0];
  const firstCategoryMenus = firstPriorityCategory
    ? baseMenus.filter(menu => menu.visible && menu.categoryId === firstPriorityCategory.id)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }} className="animate-fade-in-up traditional-bg">
      {/* Visual Hero Banner */}
      <section className="responsive-hero-banner" style={{
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(253, 251, 247, 0) 100%)',
        borderRadius: '32px',
        border: '1px solid rgba(232, 226, 213, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Korean traditional pattern badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-primary-fade)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: 'var(--color-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '24px'
        }}>
          <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
          인천·경기 대표 제사상 대행 서비스
        </div>

        <h1 className="serif-font responsive-title" style={{
          fontWeight: 900,
          color: 'var(--color-text-main)',
          marginBottom: '24px',
          letterSpacing: '-0.03em'
        }}>
          마음을 다해 준비하는<br />
          정성의 한 상, <span style={{ color: 'var(--color-primary)' }}>효드림</span>
        </h1>

        <p className="responsive-subtitle" style={{
          color: 'var(--color-text-sub)',
          maxWidth: '650px',
          margin: '0 auto 40px auto',
          fontWeight: 500,
        }}>
          오랜 전통의 예법은 깍듯이 지키고, 번거로움은 덜어드립니다.<br />
          엄선된 우리 식재료로 부모님을 대접하는 정성을 담아 새벽녘 정성스레 조리합니다.
        </p>

        <div className="responsive-btn-container">
          <button
            onClick={() => setCustomerTab('estimator')}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
          >
            맞춤상 주문하기
          </button>
          <button
            onClick={() => setCustomerTab('menu')}
            className="btn-secondary"
            style={{ padding: '14px 34px', fontSize: '1.05rem' }}
          >
            차림 품목 둘러보기
          </button>
        </div>
      </section>

      {/* First priority category base menus */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800 }}>
            {firstPriorityCategory ? firstPriorityCategory.name : '기본 상차림 목록'}
          </h2>
          <div className="korean-divider" />
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-sub)' }}>
            우선순위가 가장 높은 상차림 카테고리의 기본 상차림 목록입니다.
          </p>
        </div>

        {firstCategoryMenus.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {firstCategoryMenus.map(menu => (
              <div key={menu.id} className="premium-card korean-border-box" style={{
                padding: '28px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px',
                overflow: 'hidden'
              }}>
                {menu.imageUrl ? (
                  <div style={{
                    width: 'calc(100% + 56px)',
                    height: '190px',
                    margin: '-28px -28px 22px -28px',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: '#FAF8F5'
                  }}>
                    <img
                      src={menu.imageUrl}
                      alt={`${menu.name} 이미지`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: 'calc(100% + 56px)',
                    minHeight: '96px',
                    margin: '-28px -28px 22px -28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    <ImageIcon size={18} />
                    상차림 이미지 준비 중
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 className="serif-font" style={{ fontSize: '1.24rem', fontWeight: 800, lineHeight: 1.35 }}>
                      {menu.name}
                    </h3>
                    <span style={{
                      flexShrink: 0,
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-fade)',
                      borderRadius: '999px',
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {menu.itemIds.length}품목
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: 1.62, marginBottom: '18px' }}>
                    {menu.description}
                  </p>

                  {menu.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {menu.tags.map(tag => (
                        <span key={tag} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-text-sub)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '999px',
                          padding: '5px 9px'
                        }}>
                          <Tag size={11} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '18px',
                  borderTop: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}>
                  <strong className="serif-font" style={{ fontSize: '1.22rem', color: 'var(--color-primary)' }}>
                    {menu.price.toLocaleString()}원
                  </strong>
                  <button
                    onClick={() => setCustomerTab('estimator')}
                    className="btn-secondary"
                    style={{ padding: '9px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
                  >
                    구성 선택
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="premium-card korean-border-box" style={{ padding: '48px 24px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
              우선순위가 가장 높은 카테고리에 아직 노출 가능한 기본 상차림이 없습니다.
            </p>
            <button
              onClick={() => setCustomerTab('estimator')}
              className="btn-secondary"
              style={{ marginTop: '18px', padding: '12px 24px' }}
            >
              상차림 주문기로 이동
            </button>
          </div>
        )}
      </section>

      {/* Simple Information Guide Block */}
      <section className="glass-panel hero-info-panel" style={{
        padding: '48px',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ flex: '1' }}>
          <h3 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            처음이라 상차림 구성이 고민이신가요?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: 1.5 }}>
            효드림 실시간 맞춤 주문을 이용해 보세요. 가구 인원수와 특별 요리를 고려해 직접 추가 품목을 가감하여 그 자리에서 정확한 주문 가격과 구성표를 받아보고 안전하게 결제하실 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setCustomerTab('estimator')}
          className="btn-primary"
          style={{ padding: '16px 28px', whiteSpace: 'nowrap' }}
        >
          주문 및 결제
        </button>
      </section>
    </div>
  );
};
