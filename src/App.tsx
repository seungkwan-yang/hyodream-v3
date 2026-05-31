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

          {/* Organized Footer matching user image exactly */}
          <footer className="site-footer" style={{
            backgroundColor: '#f5f5f5',
            color: '#666666',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.75rem',
            lineHeight: 2.0,
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", helvetica, sans-serif'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              wordBreak: 'keep-all'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
                <span>주소:인천광역시 부평구 평천로 353 1층</span>
                <span style={{ color: '#cccccc' }}>|</span>
                <span>사업자등록번호 : 157-26-00529</span>
                <a 
                  href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=1572600529" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none', 
                    backgroundColor: '#8a8a8a', 
                    padding: '2px 6px', 
                    borderRadius: '2px', 
                    fontSize: '11px', 
                    display: 'inline-block', 
                    lineHeight: '1.4',
                    fontWeight: 500,
                    verticalAlign: 'middle',
                    marginLeft: '2px'
                  }}
                >
                  사업자 정보확인
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
                <span>통신판매업신고번호 : 2018-인천부평-0718호</span>
                <span style={{ color: '#cccccc' }}>|</span>
                <span>개인정보관리자 : 김성기</span>
                <span style={{ color: '#cccccc' }}>|</span>
                <span>대표 : 김성기</span>
                <span style={{ color: '#cccccc' }}>|</span>
                <span>상호명 : 효드림</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
                <span>전화번호 : 1600-6341</span>
                <span style={{ color: '#cccccc' }}>|</span>
                <span>이메일 : hoydream1@gmail.com</span>
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#000000', 
                fontSize: '0.85rem', 
                marginTop: '20px',
                letterSpacing: '-0.3px'
              }}>
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
