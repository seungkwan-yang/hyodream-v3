import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { BaseMenu, CustomOption } from '../context/AppContext';
import { Check, HelpCircle, ArrowRight, ShoppingBag } from 'lucide-react';

interface EstimatorProps {
  onProceedToForm: (data: {
    selectedPackage: BaseMenu;
    selectedAdditions: CustomOption[];
    selectedSubtractions: CustomOption[];
    calculatedTotal: number;
  }) => void;
}

export const Estimator: React.FC<EstimatorProps> = ({ onProceedToForm }) => {
  const { baseMenus, customOptions, catalogItems } = useApp();
  
  // Set default package as standard (kijung) or first available
  const [selectedPkgId, setSelectedPkgId] = useState<string>('kijung');
  const [checkedOptionIds, setCheckedOptionIds] = useState<Record<string, boolean>>({});
  const [displayedPrice, setDisplayedPrice] = useState(0);

  const visibleBaseMenus = baseMenus.filter(m => m.visible);
  const selectedPackage = baseMenus.find(m => m.id === selectedPkgId && m.visible) || visibleBaseMenus[0] || baseMenus[0];

  // Get dynamic included dishes list
  const includedDishes = catalogItems.filter(
    item => (selectedPackage?.itemIds || []).includes(item.id) && item.visible
  );

  // Separate custom options
  const additions = customOptions.filter(o => o.type === 'addition');
  const subtractions = customOptions.filter(o => o.type === 'subtraction');

  // Compute total price
  const calculateTotal = () => {
    let total = selectedPackage.price;
    customOptions.forEach(opt => {
      if (checkedOptionIds[opt.id]) {
        total += opt.price;
      }
    });
    return total;
  };

  const currentTotal = calculateTotal();

  // Smooth price number animation effect
  useEffect(() => {
    let start = displayedPrice;
    const end = currentTotal;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + (end - start) * easeProgress);
      
      setDisplayedPrice(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentTotal]);

  const handleToggleOption = (id: string) => {
    setCheckedOptionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSelectedAdditions = () => {
    return additions.filter(a => checkedOptionIds[a.id]);
  };

  const getSelectedSubtractions = () => {
    return subtractions.filter(s => checkedOptionIds[s.id]);
  };

  const handleProceed = () => {
    onProceedToForm({
      selectedPackage,
      selectedAdditions: getSelectedAdditions(),
      selectedSubtractions: getSelectedSubtractions(),
      calculatedTotal: currentTotal
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.8fr 1.2fr',
      gap: '32px',
      alignItems: 'start'
    }} className="animate-fade-in-up responsive-chart-grid">
      
      {/* Left Column: Interactive Customization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Step 1: Base Table Selection */}
        <div className="premium-card" style={{ padding: '32px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary)', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700
            }}>1</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>기본 상차림 세트 선택</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', marginBottom: '24px' }}>
            모시는 인원과 기제사/행사의 규모에 맞게 알맞은 베이스 패키지를 선택해 주세요.
          </p>

          {/* Table Tab Cards */}
          {visibleBaseMenus.length > 0 ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px'
              }}>
                {visibleBaseMenus.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => setSelectedPkgId(menu.id)}
                    style={{
                      padding: '20px 16px',
                      borderRadius: '16px',
                      border: selectedPkgId === menu.id ? '2.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedPkgId === menu.id ? 'var(--color-primary-fade)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-spring)',
                      position: 'relative'
                    }}
                  >
                    {selectedPkgId === menu.id && (
                      <div style={{
                        position: 'absolute', top: '-10px', right: '-6px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)', color: '#FFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={12} />
                      </div>
                    )}
                    
                    <span className="serif-font" style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'block',
                      color: selectedPkgId === menu.id ? 'var(--color-primary-dark)' : 'var(--color-text-main)'
                    }}>
                      {menu.name.split(' (')[0]}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {menu.name.includes('(') ? `(${menu.name.split('(')[1]}` : ''}
                    </span>

                    <strong style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      display: 'block',
                      marginTop: '12px',
                      color: selectedPkgId === menu.id ? 'var(--color-primary)' : 'var(--color-text-sub)'
                    }}>
                      {menu.price.toLocaleString()}원
                    </strong>
                  </div>
                ))}
              </div>

              {/* Active Package Detailed Description & Dynamic Included Dishes */}
              <div style={{
                marginTop: '24px',
                padding: '24px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                borderLeft: '4px solid var(--color-primary)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>{selectedPackage.name} 특징</strong>
                  <p style={{ color: 'var(--color-text-sub)', lineHeight: 1.5 }}>{selectedPackage.description}</p>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
                  <strong style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    ✓ 기본 상차림 포함 요리 ({includedDishes.length}종)
                  </strong>
                  
                  {includedDishes.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {includedDishes.map((dish) => (
                        <span
                          key={dish.id}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--color-text-sub)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {dish.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      등록된 포함 구성 요리가 없습니다. 관리자 모드에서 채워주세요.
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem'
            }}>
              현재 선택 가능한 상차림 패키지 세트가 존재하지 않습니다.
              <br />
              상단의 <strong>'관리자 모드'</strong>로 진입하여 차림 세트 노출 상태를 활성화해 주세요.
            </div>
          )}
        </div>

        {/* Step 2: Custom Additions */}
        <div className="premium-card" style={{ padding: '32px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary)', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700
            }}>2</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>프리미엄 요리 및 실속 품목 추가 (선택)</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', marginBottom: '24px' }}>
            상차림을 더욱 풍성하고 가치 있게 만들어 주는 고급 수제 특선 요리들입니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {additions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleToggleOption(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: checkedOptionIds[opt.id] ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                  backgroundColor: checkedOptionIds[opt.id] ? 'var(--color-primary-fade)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Custom Checkbox */}
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px',
                  border: checkedOptionIds[opt.id] ? 'none' : '1.5px solid var(--border-color)',
                  backgroundColor: checkedOptionIds[opt.id] ? 'var(--color-primary)' : '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', flexShrink: 0
                }}>
                  {checkedOptionIds[opt.id] && <Check size={14} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{opt.name}</strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      +{opt.price.toLocaleString()}원
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                    {opt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Subtractions & Simple Options */}
        <div className="premium-card" style={{ padding: '32px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary)', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700
            }}>3</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>제외 및 품목 간소화 조절 (선택)</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', marginBottom: '24px' }}>
            이미 집에 준비된 품목이거나 실속 상차림을 위해 일부 메뉴를 간소화하고 할인 혜택을 받습니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {subtractions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleToggleOption(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: checkedOptionIds[opt.id] ? '1.5px solid var(--color-rose)' : '1px solid var(--border-color)',
                  backgroundColor: checkedOptionIds[opt.id] ? 'rgba(200, 122, 83, 0.04)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Custom Checkbox */}
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px',
                  border: checkedOptionIds[opt.id] ? 'none' : '1.5px solid var(--border-color)',
                  backgroundColor: checkedOptionIds[opt.id] ? 'var(--color-rose)' : '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', flexShrink: 0
                }}>
                  {checkedOptionIds[opt.id] && <Check size={14} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{opt.name}</strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-rose)' }}>
                      {opt.price.toLocaleString()}원
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                    {opt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Live Glassmorphism Invoice Receipt */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        position: 'sticky',
        top: '112px',
        border: '2px solid var(--color-primary)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Receipt Visual Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <ShoppingBag size={24} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
          <h4 className="serif-font" style={{ fontSize: '1.25rem', fontWeight: 700 }}>실시간 맞춤상 명세서</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>기호에 맞춰 즉석 변경 반영</span>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: 'var(--border-color)', margin: '12px auto 0 auto' }} />
        </div>

        {/* Detailed Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          
          {/* Base Menu Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-sub)' }}>• {selectedPackage.name.split(' (')[0]}</span>
            <span style={{ fontWeight: 600 }}>{selectedPackage.price.toLocaleString()}원</span>
          </div>

          {/* Additions */}
          {getSelectedAdditions().map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-primary-light)', paddingLeft: '10px' }}>
              <span>+ {a.name.split(' (')[0]}</span>
              <span>+{a.price.toLocaleString()}원</span>
            </div>
          ))}

          {/* Subtractions */}
          {getSelectedSubtractions().map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-rose)', paddingLeft: '10px' }}>
              <span>- {s.name}</span>
              <span>{s.price.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '20px', marginBottom: '28px' }}>
          
          {/* Grand Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="serif-font" style={{ fontSize: '1.05rem', fontWeight: 700 }}>총 주문 금액</span>
            {/* Animated Pricing Metric */}
            <span className="serif-fontPrice" style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--color-primary)',
              transition: 'var(--transition-smooth)'
            }}>
              {displayedPrice.toLocaleString()}<span style={{ fontSize: '1.1rem', fontWeight: 700 }}>원</span>
            </span>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
            marginTop: '12px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '8px 12px',
            borderRadius: '8px'
          }}>
            ✓ 인천 및 경기 전 지역 안전 차량 직배송비 포함
          </p>
        </div>

        {/* Go to inquiry stepper wizard button */}
        <button
          onClick={handleProceed}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '16px 20px',
            fontSize: '1rem',
            borderRadius: '16px'
          }}
        >
          주문 진행 및 결제하기 <ArrowRight size={18} />
        </button>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: 'var(--color-text-sub)'
        }}>
          <HelpCircle size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span>안전한 토스 결제 시스템이 적용됩니다.</span>
        </div>
      </div>

    </div>
  );
};
