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
import { FloatingCS } from './components/FloatingCS';
import { AdminDashboard } from './admin/AdminDashboard';
import { Login } from './components/Login';
import { RegisterAgreement } from './components/RegisterAgreement';
import { RegisterForm } from './components/RegisterForm';
import { MyPage } from './components/MyPage';
import { Phone, MapPin } from 'lucide-react';
import { TOSS_PENDING_ORDER_KEY } from './config/toss';

const PaymentReturnHandler: React.FC = () => {
  const { addInquiry } = useApp();
  const [message, setMessage] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<any>(null);
  const handledRef = React.useRef(false);

  React.useEffect(() => {
    if (handledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('paymentResult');

    if (!paymentResult) return;
    handledRef.current = true;

    if (paymentResult === 'fail') {
      const reason = params.get('message') || '결제가 취소되었거나 실패했습니다.';
      localStorage.removeItem(TOSS_PENDING_ORDER_KEY);
      setMessage(reason);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (paymentResult !== 'success') return;

    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    const rawPendingOrder = localStorage.getItem(TOSS_PENDING_ORDER_KEY);

    const confirmPayment = async () => {
      try {
        if (!paymentKey || !orderId || !amount || !rawPendingOrder) {
          throw new Error('결제 승인에 필요한 정보가 없습니다.');
        }

        const pendingOrder = JSON.parse(rawPendingOrder);
        if (pendingOrder.orderId !== orderId || Number(pendingOrder.tossAmount) !== amount) {
          throw new Error('결제 정보가 주문 정보와 일치하지 않습니다.');
        }

        setMessage('결제를 승인하고 있습니다...');
        const response = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const payment = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payment?.error || payment?.message || '결제 승인에 실패했습니다.');
        }

        const methodLabel = pendingOrder.paymentMethod || payment.method || '토스페이';
        const savedOrder = addInquiry({
          ...pendingOrder.order,
          id: orderId,
          paymentMethod: methodLabel,
          paymentStatus: payment.status === 'WAITING_FOR_DEPOSIT' ? 'pending' : 'paid',
          status: payment.status === 'WAITING_FOR_DEPOSIT' ? 'pending' : 'approved',
          tossTransactionId: payment.paymentKey || paymentKey,
        });

        localStorage.removeItem(TOSS_PENDING_ORDER_KEY);
        window.history.replaceState({}, '', window.location.pathname);
        setCompletedOrder(savedOrder);
        setMessage('결제가 정상 완료되었습니다.');
      } catch (err) {
        console.error('[HyoDream Toss] confirm failed:', err);
        setMessage(err instanceof Error ? err.message : '결제 승인 처리 중 오류가 발생했습니다.');
      }
    };

    confirmPayment();
  }, [addInquiry]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3000,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="premium-card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '28px' }}>
        <strong style={{ display: 'block', marginBottom: '10px' }}>결제 결과</strong>
        <p style={{ color: 'var(--color-text-sub)', lineHeight: 1.5 }}>{message}</p>
        {completedOrder && (
          <div style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.86rem'
          }}>
            <div><strong>주문번호</strong> <span style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>{completedOrder.id}</span></div>
            <div><strong>주문자</strong> {completedOrder.customerName}</div>
            <div><strong>연락처</strong> {completedOrder.phone}</div>
            <div><strong>제사 날짜</strong> {completedOrder.date}</div>
            <div><strong>배송지</strong> {completedOrder.address} {completedOrder.addressDetail}</div>
            <div><strong>결제금액</strong> {Number(completedOrder.totalPrice || 0).toLocaleString()}원</div>
          </div>
        )}
        <button className="btn-primary" onClick={() => setMessage(null)} style={{ marginTop: '16px' }}>
          확인
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { viewMode, customerTab, checkoutIntentStep, isLoading } = useApp();
  
  // Custom Estimator Config selected to proceed to Form
  const [estimatorConfig, setEstimatorConfig] = useState<any>(null);

  // Auto-scroll to top smoothly when customer tab or ordering sub-steps change (crucial for mobile conversion rate)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [customerTab, estimatorConfig]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>
          효드림 데이터를 준비하고 있습니다...
        </p>
      </div>
    );
  }

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
              <Reviews limit={3} />
            </div>
          </div>
        );
      case 'estimator':
        if (estimatorConfig) {
          return (
            <InquiryForm
              initialConfig={estimatorConfig}
              initialStep={checkoutIntentStep || 1}
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
      case 'login':
        return <Login />;
      case 'register-agreement':
        return <RegisterAgreement />;
      case 'register-form':
        return <RegisterForm />;
      case 'mypage':
        return <MyPage />;
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
      <PaymentReturnHandler />

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
          <FloatingCS />
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
