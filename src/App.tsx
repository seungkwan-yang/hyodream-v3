import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Estimator } from './components/Estimator';
import { InquiryForm } from './components/InquiryForm';
import { MenuCatalog } from './components/MenuCatalog';
import { FAQ } from './components/FAQ';
import { Reviews } from './components/Reviews';
import { WriteReview } from './components/WriteReview';
import { AdminDashboard } from './admin/AdminDashboard';
import { Phone, MapPin, Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, customerTab, setCustomerTab } = useApp();
  
  // Custom Estimator Config selected to proceed to Form
  const [estimatorConfig, setEstimatorConfig] = useState<any>(null);

  const handleProceedToForm = (config: any) => {
    setEstimatorConfig(config);
  };

  const handleResetEstimator = () => {
    setEstimatorConfig(null);
  };

  // Render Customer Screen based on Active Tab
  const renderCustomerTab = () => {
    switch (customerTab) {
      case 'home':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            <HeroSection />
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
              <Reviews />
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
              <FAQ />
            </div>
          </div>
        );
      case 'estimator':
        if (estimatorConfig) {
          return (
            <InquiryForm
              initialConfig={estimatorConfig}
              onReset={handleResetEstimator}
            />
          );
        }
        return <Estimator onProceedToForm={handleProceedToForm} />;
      case 'menu':
        return <MenuCatalog />;
      case 'reviews':
        return <Reviews />;
      case 'faq':
        return <FAQ />;
      case 'write-review':
        return <WriteReview />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      transition: 'var(--transition-smooth)'
    }}>
      {/* Universal Sticky Header (includes View Mode Toggle Switch) */}
      <Header />

      {/* Primary Workspace Panel */}
      {viewMode === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          <main style={{
            flex: 1,
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
          }} className="main-content">
            {renderCustomerTab()}
          </main>

          {/* Premium Traditional Traditional Footer */}
          <footer className="site-footer" style={{
            backgroundColor: '#2C2621',
            color: '#A89F95',
            borderTop: '1.5px solid #3C352E',
            fontSize: '0.85rem',
            lineHeight: 1.8
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr',
              gap: '40px',
            }} className="footer-grid">
              
              {/* Col 1: Branding and contacts */}
              <div>
                <h4 className="serif-font" style={{ color: '#FDFBF7', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                  (주) 효드림 제사 대행 서비스
                </h4>
                <p style={{ color: '#A89F95', marginBottom: '16px' }}>
                  효드림은 정성과 격식, 위생을 가장 소중한 자존심으로 여기며 부모님을 대하는 마음으로 매 기일과 명절을 정성껏 보살핍니다.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--color-gold)' }} />
                    고객센터 단축번호: <strong>1600-6341</strong> (상담시간 오전 9:00 ~ 오후 8:00)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                    본사 직영 시설: 인천광역시 부평구 평천로 353 1층 효드림 빌딩
                  </span>
                </div>
              </div>

              {/* Col 2: Site maps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h5 style={{ color: '#FDFBF7', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>바로가기 서비스</h5>
                <span onClick={() => { setCustomerTab('home'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.color='#FFF'} onMouseLeave={(e)=>e.currentTarget.style.color='#A89F95'}>효드림 브랜드 스토리</span>
                <span onClick={() => { setCustomerTab('estimator'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.color='#FFF'} onMouseLeave={(e)=>e.currentTarget.style.color='#A89F95'}>실시간 상차림 주문 및 맞춤 설정</span>
                <span onClick={() => { setCustomerTab('menu'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.color='#FFF'} onMouseLeave={(e)=>e.currentTarget.style.color='#A89F95'}>가래떡, 명품동태전 품목 상세 갤러리</span>
                <span onClick={() => { setCustomerTab('faq'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.color='#FFF'} onMouseLeave={(e)=>e.currentTarget.style.color='#A89F95'}>이용 고객 안심 포토 후기</span>
              </div>

              {/* Col 3: Legal compliance numbers */}
              <div>
                <h5 style={{ color: '#FDFBF7', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>위생 및 사업 정보</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#887E75', fontSize: '0.8rem' }}>
                  <span>사업자등록번호: 131-86-63412 | 통신판매업신고: 제 2026-인천부평-0428호</span>
                  <span>식품위생영업허가: 제 2026-018264호 | HACCP 직영 인증 시설 승인</span>
                  <span>대표이사: 김철수 | 개인정보관리책임자: 박영희</span>
                  <span style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)' }}>
                    <Shield size={14} /> 안심 직배송 차량 100% 현대화 종합보험 가입
                  </span>
                </div>
              </div>

            </div>

            {/* Copyright */}
            <div style={{
              maxWidth: '1200px',
              margin: '40px auto 0 auto',
              borderTop: '1px solid #3C352E',
              paddingTop: '24px',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#887E75'
            }}>
              Copyright © 2026 HyoDream Inc. All Rights Reserved. 본 사이트의 맞춤 상차림 주문 방식은 고유 지식재산권으로 보호됩니다.
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
