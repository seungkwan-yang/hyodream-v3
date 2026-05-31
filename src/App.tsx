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
import { Phone, MapPin } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, customerTab } = useApp();
  
  // Custom Estimator Config selected to proceed to Form
  const [estimatorConfig, setEstimatorConfig] = useState<any>(null);

  // Auto-scroll to top smoothly when customer tab or ordering sub-steps change (crucial for mobile conversion rate)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [customerTab, estimatorConfig]);

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
        return <HeroSection />;
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
            lineHeight: 1.8,
            padding: '40px 20px'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              paddingBottom: '32px',
              borderBottom: '1px solid #3C352E'
            }}>
              {/* Branding and contacts */}
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
                    본사 직영 시설: 인천광역시 부평구 평천로 353 1층
                  </span>
                </div>
              </div>
            </div>

            {/* Centered Business & Copyright Information matching user image exactly */}
            <div style={{
              maxWidth: '1200px',
              margin: '24px auto 0 auto',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#887E75',
              lineHeight: 1.8
            }}>
              <div style={{ marginBottom: '6px' }}>
                주소:인천광역시 부평구 평천로 353 1층 | 사업자등록번호 : 157-26-00529 <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=1572600529" target="_blank" rel="noopener noreferrer" style={{ color: '#A89F95', textDecoration: 'none', backgroundColor: '#554A42', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', marginLeft: '6px', display: 'inline-block', fontWeight: 600, transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#6C5E55'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#554A42'}>사업자 정보확인</a>
              </div>
              <div style={{ marginBottom: '6px' }}>
                통신판매업신고번호 : 2018-인천부평-0718호 | 개인정보관리자 : 김성기 | 대표 : 김성기 | 상호명 : 효드림
              </div>
              <div style={{ marginBottom: '20px' }}>
                전화번호 : 1600-6341 | 이메일 : hoydream1@gmail.com
              </div>
              <div style={{ fontWeight: 700, color: '#A89F95', fontSize: '0.85rem', marginTop: '16px' }}>
                Copyright@효드림.com Allright right reserved.
              </div>
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
