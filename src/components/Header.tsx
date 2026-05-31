import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CustomerTab, ViewMode } from '../context/AppContext';
import { Sparkles, CalendarCheck, ShieldAlert, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    customerTab,
    setCustomerTab,
    adminTab,
    setAdminTab,
    addInquiry,
    inquiries
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: CustomerTab) => {
    setCustomerTab(tab);
    setIsMobileMenuOpen(false);
    // Auto-scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleViewMode = () => {
    const newMode: ViewMode = viewMode === 'customer' ? 'admin' : 'customer';
    setViewMode(newMode);
    setIsMobileMenuOpen(false);
    
    // Smooth scroll to top when mode changes
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleCreateMockInquiry = () => {
    const mockNames = ['정우성', '한소희', '이정재', '송혜교', '공유'];
    const mockPhones = ['010-4321-8765', '010-1234-5678', '010-9876-5432', '010-2345-6789', '010-5678-1234'];
    const mockPackages = [
      '소가족 실속상 (기제사 소)',
      '표준 맞춤상 (기제사 중)',
      '명가 전통상 (기제사 대)',
      '개업 고사상 / 시제상'
    ];
    const mockAddresses = [
      '인천광역시 미추홀구 경인로 42',
      '인천광역시 중구 영종대로 100',
      '경기도 부천시 소사구 경인로 88',
      '인천광역시 서구 청라라임로 30',
      '경기도 시흥시 배곧5로 12'
    ];
    const mockDetails = [
      '푸르지오 아파트 102동 1104호',
      '하늘도시 우미린 204동 502호',
      '삼성래미안 101동 301호',
      '청라웰카운티 3단지 506동 1202호',
      '호반써밋 205동 1801호'
    ];
    const mockRequests = [
      '전 부침류는 따뜻하게 배송 부탁드립니다. 밤 대추 신선한 걸로 부탁해요.',
      '생선은 비늘 깔끔히 제거하고 소금간 슴슴하게 해주세요.',
      '식혜를 시원하게 보관해둔 상태로 배송받고 싶습니다.',
      '공동현관 비밀번호는 없으니 경비실 벨 눌러주세요.',
      '음식들 밀폐용기에 안전하게 포장 부탁드립니다.'
    ];

    const randomIndex = Math.floor(Math.random() * mockNames.length);
    const randomPackageIndex = Math.floor(Math.random() * mockPackages.length);

    // Calculate mock total based on base package
    let basePrice = 220000;
    if (randomPackageIndex === 1) basePrice = 350000;
    if (randomPackageIndex === 2) basePrice = 480000;
    if (randomPackageIndex === 3) basePrice = 290000;

    // Simulate random customizations
    const customizations = ['한우 갈비찜 업그레이드'];
    const extraCharge = 40000;

    const newMock = addInquiry({
      customerName: mockNames[randomIndex],
      phone: mockPhones[randomIndex],
      ritualType: mockPackages[randomPackageIndex],
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days later
      timeSlot: '오후 3:00 ~ 오후 5:00',
      address: mockAddresses[randomIndex],
      addressDetail: mockDetails[randomIndex],
      specialRequests: mockRequests[randomIndex],
      customizations: customizations,
      subtractions: [],
      totalPrice: basePrice + extraCharge
    });

    alert(`[가상 예약 발생]\n고객명: ${newMock.customerName}\n신청 상품: ${newMock.ritualType}\n금액: ${newMock.totalPrice.toLocaleString()}원\n\n대시보드와 예약 관리 탭에서 실시간 업데이트를 즉시 확인할 수 있습니다!`);
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      height: '80px',
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(253, 251, 247, 0.85)'
    }}>
      {/* Brand Logo */}
      <div
        onClick={() => handleTabChange('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-gold)',
          fontWeight: 800,
          fontSize: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          효
        </div>
        <div>
          <h1 className="serif-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '0.05em', lineHeight: 1.1 }}>
            효드림
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.15em', display: 'block', marginTop: '1px' }}>
            정성 제사음식 대행
          </span>
        </div>
      </div>

      {/* Customer Navigation Links - Only show if in customer mode */}
      {viewMode === 'customer' && (
        <nav className="pc-nav" style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'home', label: '브랜드 홈' },
            { id: 'estimator', label: '실시간 상차림 주문기' },
            { id: 'menu', label: '정갈한 품목 소개' },
            { id: 'reviews', label: '고객 포토 후기' },
            { id: 'faq', label: '자주 묻는 질문' },
            { id: 'write-review', label: '후기작성' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CustomerTab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '8px',
                color: customerTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                backgroundColor: customerTab === tab.id ? 'var(--color-primary-fade)' : 'transparent',
                transition: 'var(--transition-smooth)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Right Mode Controls & Mobile Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {viewMode === 'customer' && (
          <button
            onClick={() => handleTabChange('estimator')}
            className="btn-primary pc-header-btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '10px',
              boxShadow: 'none'
            }}
          >
            <CalendarCheck size={16} /> 실시간 맞춤 주문
          </button>
        )}

        <div
          onClick={handleToggleViewMode}
          className="pulse-gold pc-header-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: viewMode === 'admin' ? 'var(--color-primary-dark)' : 'var(--color-gold)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'var(--transition-spring)',
            userSelect: 'none',
            boxShadow: '0 4px 10px rgba(197, 155, 39, 0.2)'
          }}
        >
          {viewMode === 'admin' ? (
            <>
              <ShieldAlert size={14} />
              <span>고객 화면으로</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>관리자 모드 전환</span>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          className="mobile-menu-trigger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="모바일 메뉴 토글"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Floating Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-panel">
          {viewMode === 'customer' ? (
            <>
              {[
                { id: 'home', label: '브랜드 홈' },
                { id: 'estimator', label: '실시간 상차림 주문기' },
                { id: 'menu', label: '정갈한 품목 소개' },
                { id: 'reviews', label: '고객 포토 후기' },
                { id: 'faq', label: '자주 묻는 질문' },
                { id: 'write-review', label: '후기작성' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as CustomerTab)}
                  className={`mobile-nav-link ${customerTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
              {/* Quick action buttons added for better UX inside mobile menu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  onClick={() => handleTabChange('estimator')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.9rem', borderRadius: '12px' }}
                >
                  <CalendarCheck size={16} /> 실시간 맞춤 주문하기
                </button>
                <div
                  onClick={() => { handleToggleViewMode(); setIsMobileMenuOpen(false); }}
                  className="pulse-gold"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-gold)',
                    color: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: 'none'
                  }}
                >
                  <Sparkles size={14} />
                  <span>관리자 모드 전환</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin Navigation in Mobile Dropdown */}
              {[
                { id: 'dashboard', label: '현황 대시보드' },
                { id: 'inquiries', label: '주문 및 결제 내역 관리' },
                { id: 'pricing', label: '메뉴 단가/옵션 관리' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAdminTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`mobile-nav-link ${adminTab === tab.id ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'inquiries' && inquiries.filter(i => i.status === 'pending').length > 0 && (
                    <span style={{
                      backgroundColor: 'var(--color-rose)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      display: 'inline-block'
                    }}>
                      {inquiries.filter(i => i.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {/* Simulator Trigger */}
                <button
                  onClick={() => {
                    handleCreateMockInquiry();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.9rem', borderRadius: '12px', borderColor: 'var(--color-primary)' }}
                >
                  <Sparkles size={16} /> 가상 주문 시뮬레이션 실행
                </button>

                {/* Back to customer view */}
                <div
                  onClick={() => { handleToggleViewMode(); setIsMobileMenuOpen(false); }}
                  className="pulse-gold"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-primary-dark)',
                    color: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: 'none'
                  }}
                >
                  <ShieldAlert size={14} />
                  <span>고객 화면으로 전환</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
