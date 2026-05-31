import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminStats } from './AdminStats';
import { OrderList } from './OrderList';
import { PriceManager } from './PriceManager';
import { LayoutDashboard, ClipboardList, Settings, Sparkles } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminTab, setAdminTab, addInquiry, inquiries } = useApp();

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

  const renderActiveTab = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminStats />;
      case 'inquiries':
        return <OrderList />;
      case 'pricing':
        return <PriceManager />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="admin-theme admin-theme-container">
      {/* Admin Sidebar Navigation */}
      <aside className="glass-panel admin-sidebar">
        {/* Branding header inside sidebar */}
        <div style={{ padding: '0 12px 12px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="serif-font" style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
            효드림 관리 시스템
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            HyoDream Admin Console
          </span>
        </div>

        {/* Sidebar Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button
            onClick={() => setAdminTab('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              textAlign: 'left', transition: 'var(--transition-smooth)',
              backgroundColor: adminTab === 'dashboard' ? 'var(--color-primary-fade)' : 'transparent',
              color: adminTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-text-sub)'
            }}
          >
            <LayoutDashboard size={18} />
            현황 대시보드
          </button>

          <button
            onClick={() => setAdminTab('inquiries')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              textAlign: 'left', transition: 'var(--transition-smooth)',
              backgroundColor: adminTab === 'inquiries' ? 'var(--color-primary-fade)' : 'transparent',
              color: adminTab === 'inquiries' ? 'var(--color-primary)' : 'var(--color-text-sub)'
            }}
          >
            <ClipboardList size={18} />
            주문 및 결제 내역 관리
            {inquiries.filter(i => i.status === 'pending').length > 0 && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: 'var(--color-rose)',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px'
              }}>
                {inquiries.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('pricing')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              textAlign: 'left', transition: 'var(--transition-smooth)',
              backgroundColor: adminTab === 'pricing' ? 'var(--color-primary-fade)' : 'transparent',
              color: adminTab === 'pricing' ? 'var(--color-primary)' : 'var(--color-text-sub)'
            }}
          >
            <Settings size={18} />
            메뉴 단가/옵션 관리
          </button>
        </nav>

        {/* Mock trigger card */}
        <div className="korean-border-box" style={{
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
            <Sparkles size={14} /> 가상 시뮬레이터
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', lineHeight: 1.4 }}>
            고객의 임의 신청 상황을 실시간으로 확인하고 테스트할 수 있습니다.
          </p>
          <button
            onClick={handleCreateMockInquiry}
            className="btn-primary"
            style={{
              padding: '10px 14px',
              fontSize: '0.8rem',
              borderRadius: '8px',
              justifyContent: 'center',
              width: '100%',
              boxShadow: 'none'
            }}
          >
            가상 주문 발생시키기
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="admin-main-content">
        {/* Page Title Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="serif-font" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {adminTab === 'dashboard' && '실시간 현황판 (Overview)'}
              {adminTab === 'inquiries' && '주문 및 결제 내역 관리'}
              {adminTab === 'pricing' && '상품 단가 및 맞춤 옵션 관리'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', marginTop: '4px' }}>
              {adminTab === 'dashboard' && '효드림 사이트에 유입되는 매출 지표와 핵심 현황 통계입니다.'}
              {adminTab === 'inquiries' && '고객이 주문하고 결제한 실시간 주문 명세서를 열람하고 상태를 조율합니다.'}
              {adminTab === 'pricing' && '상차림 패키지 가격 및 프리미엄 단품 단가를 실시간으로 변경합니다.'}
            </p>
          </div>

          {/* Sync status indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#FFF', padding: '8px 16px', borderRadius: '12px',
            border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#2F6330', display: 'block',
              animation: 'pulseGold 2s infinite'
            }} />
            고객 사이트와 실시간 연동 활성화
          </div>
        </div>

        {/* Content Box */}
        {renderActiveTab()}
      </main>
    </div>
  );
};
