import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Check, Smartphone, Landmark, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TossCheckoutProps {
  amount: number;
  orderName: string;
  customerName: string;
  onSuccess: (paymentMethod: string, transactionId: string) => void;
  onCancel: () => void;
}

export const TossCheckout: React.FC<TossCheckoutProps> = ({
  amount,
  orderName,
  customerName,
  onSuccess,
  onCancel
}) => {
  const [method, setMethod] = useState<'tosspay' | 'card' | 'transfer' | 'virtual'>('tosspay');
  const [selectedCard, setSelectedCard] = useState<string>('shinhan');
  const [step, setStep] = useState<'select' | 'processing' | 'card_password' | 'biometric' | 'success'>('select');
  
  // Loading timers
  const [progress, setProgress] = useState(0);

  const cardOptions = [
    { id: 'shinhan', label: '신한카드', color: '#003399' },
    { id: 'hyundai', label: '현대카드', color: '#000000' },
    { id: 'kb', label: 'KB국민카드', color: '#797063' },
    { id: 'samsung', label: '삼성카드', color: '#0054A6' },
    { id: 'nh', label: 'NH농협카드', color: '#009944' }
  ];

  // Start checkout processing animation
  const handlePaymentSubmit = () => {
    if (method === 'tosspay') {
      setStep('biometric');
    } else if (method === 'card') {
      setStep('card_password');
    } else {
      // Transfer/Virtual Account goes straight to processing
      startProcessing();
    }
  };

  const startProcessing = () => {
    setStep('processing');
    setProgress(0);
  };

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('success');
              // Celebrate payment completion!
              triggerConfetti();
            }, 500);
            return 100;
          }
          return prev + 8;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  function triggerConfetti() {
    // Elegant left and right spray
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const generateTxId = () => {
    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `toss_tx_${dateStr}${randomStr}`;
  };

  const [finalTxId] = useState(() => generateTxId());

  const handleFinalConfirm = () => {
    let methodLabel = '토스페이';
    if (method === 'card') {
      const card = cardOptions.find(c => c.id === selectedCard);
      methodLabel = `신용카드 (${card?.label || '신한카드'})`;
    } else if (method === 'transfer') {
      methodLabel = '실시간 계좌이체';
    } else if (method === 'virtual') {
      methodLabel = '가상계좌 (무통장)';
    }

    onSuccess(methodLabel, finalTxId);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }} className="animate-fade-in-up">
        
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #F2F4F7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FCFCFD'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Toss payments logo mock style */}
            <span style={{
              color: '#0050FF',
              fontWeight: 900,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em'
            }}>toss</span>
            <span style={{
              color: '#4E5968',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '-0.01em',
              backgroundColor: '#EAEFEF',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>payments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2F6330', fontWeight: 600 }}>
            <ShieldCheck size={14} style={{ color: '#2F6330' }} />
            안전 결제
          </div>
        </div>

        {/* STEP 1: Method Selector */}
        {step === 'select' && (
          <div style={{ padding: '28px' }}>
            {/* Order summary info */}
            <div style={{
              backgroundColor: '#F8F9FA',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7684', display: 'block', marginBottom: '4px' }}>가맹점명: 효드림</span>
              <strong style={{ fontSize: '0.95rem', color: '#191F28', display: 'block' }}>{orderName}</strong>
              <div style={{
                borderTop: '1px solid #E5E8EB',
                marginTop: '12px',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#4E5968' }}>결제할 금액</span>
                <strong style={{ fontSize: '1.35rem', color: '#0050FF', fontWeight: 800 }}>
                  {amount.toLocaleString()} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>원</span>
                </strong>
              </div>
            </div>

            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#191F28',
              display: 'block',
              marginBottom: '12px'
            }}>결제 수단 선택</span>

            {/* Methods Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '28px'
            }}>
              {/* Toss Pay */}
              <button
                onClick={() => setMethod('tosspay')}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: method === 'tosspay' ? '2px solid #0050FF' : '1px solid #E5E8EB',
                  backgroundColor: method === 'tosspay' ? '#F2F6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: method === 'tosspay' ? '#0050FF' : '#4E5968',
                  transition: 'all 0.2s'
                }}
              >
                <Smartphone size={20} />
                <span>토스페이 간편결제</span>
              </button>

              {/* Credit Card */}
              <button
                onClick={() => setMethod('card')}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: method === 'card' ? '2px solid #0050FF' : '1px solid #E5E8EB',
                  backgroundColor: method === 'card' ? '#F2F6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: method === 'card' ? '#0050FF' : '#4E5968',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={20} />
                <span>신용카드 결제</span>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setMethod('transfer')}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: method === 'transfer' ? '2px solid #0050FF' : '1px solid #E5E8EB',
                  backgroundColor: method === 'transfer' ? '#F2F6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: method === 'transfer' ? '#0050FF' : '#4E5968',
                  transition: 'all 0.2s'
                }}
              >
                <Landmark size={20} />
                <span>실시간 계좌이체</span>
              </button>

              {/* Virtual Account */}
              <button
                onClick={() => setMethod('virtual')}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: method === 'virtual' ? '2px solid #0050FF' : '1px solid #E5E8EB',
                  backgroundColor: method === 'virtual' ? '#F2F6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: method === 'virtual' ? '#0050FF' : '#4E5968',
                  transition: 'all 0.2s'
                }}
              >
                <Landmark size={20} />
                <span>가상계좌 (입금)</span>
              </button>
            </div>

            {/* If Credit Card selected: Card selection */}
            {method === 'card' && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                border: '1px solid #E5E8EB'
              }} className="animate-fade-in-up">
                <span style={{ fontSize: '0.75rem', color: '#6B7684', display: 'block', marginBottom: '8px', fontWeight: 600 }}>카드회사 선택</span>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  style={{
                    fontSize: '0.85rem',
                    padding: '8px 12px',
                    borderColor: '#CBD5E1',
                    borderRadius: '8px',
                    backgroundColor: '#FFF'
                  }}
                >
                  {cardOptions.map(card => (
                    <option key={card.id} value={card.id}>{card.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Toss secure notice */}
            <div style={{
              display: 'flex',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#6B7684',
              lineHeight: 1.4,
              marginBottom: '28px'
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                토스페이먼츠의 보안 등급 신용카드 거래 기술 및 정보보호 인증(PCI-DSS v4)에 의해 고객님의 데이터는 완전하게 암호화됩니다.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#F2F4F7',
                  color: '#4E5968',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                취소하기
              </button>
              <button
                onClick={handlePaymentSubmit}
                style={{
                  flex: 2,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#0050FF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 80, 255, 0.18)'
                }}
              >
                안전하게 결제하기
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Biometric Fingerprint (Toss Pay unique flow) */}
        {step === 'biometric' && (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#191F28', display: 'block', marginBottom: '8px' }}>
              토스 간편 비밀번호 / 생체인증
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7684', display: 'block', marginBottom: '32px' }}>
              모바일 토스 앱 보안 인증 과정을 가상 시뮬레이션합니다
            </span>

            {/* Big biometric scanner illustration */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#F2F6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px auto',
              border: '2px dashed #0050FF',
              animation: 'pulseGold 2s infinite',
              cursor: 'pointer'
            }} onClick={startProcessing}>
              <Smartphone size={36} style={{ color: '#0050FF' }} />
            </div>

            <p style={{ fontSize: '0.85rem', color: '#4E5968', marginBottom: '32px', lineHeight: 1.5 }}>
              휴대폰 지문 접촉 또는 토스 비밀번호 입력을 대신해<br />
              위의 <strong>[스마트폰 아이콘]</strong>을 클릭하면 즉시 인증 승인됩니다.
            </p>

            <button
              onClick={() => setStep('select')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F2F4F7',
                color: '#4E5968',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              이전 단계로
            </button>
          </div>
        )}

        {/* STEP 3: Card Password Input */}
        {step === 'card_password' && (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: cardOptions.find(c => c.id === selectedCard)?.color || '#000',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              {cardOptions.find(c => c.id === selectedCard)?.label}
            </div>
            
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#191F28', display: 'block', marginBottom: '8px' }}>
              카드 결제 비밀번호 입력
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7684', display: 'block', marginBottom: '28px' }}>
              안전을 위해 앞 2자리를 기입해 주세요
            </span>

            {/* Virtual PIN entry circles */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#0050FF' }} />
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#0050FF' }} />
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2.5px solid #CBD5E1' }} />
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2.5px solid #CBD5E1' }} />
            </div>

            <button
              onClick={startProcessing}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0050FF',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              비밀번호 입력 완료 (가상 승인)
            </button>
            <button
              onClick={() => setStep('select')}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6B7684',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              다른 결제 수단 선택
            </button>
          </div>
        )}

        {/* STEP 4: Processing Payment Loading Screen */}
        {step === 'processing' && (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <Loader2 size={40} style={{ color: '#0050FF', margin: '0 auto 20px auto', animation: 'spin 1.5s linear infinite' }} />
            
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#191F28', display: 'block', marginBottom: '8px' }}>
              토스 페이먼츠 안전 결제 진행 중
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7684', display: 'block', marginBottom: '24px' }}>
              신용 거래 보호 기술에 의해 거래가 안전하게 처리 중입니다
            </span>

            {/* Custom progress bar */}
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#E5E8EB',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#0050FF',
                transition: 'width 0.1s linear'
              }} />
            </div>
          </div>
        )}

        {/* STEP 5: Success Payment Confirmation */}
        {step === 'success' && (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EAEFEA',
              color: '#2F6330',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '2px solid #2F6330'
            }}>
              <Check size={28} />
            </div>

            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#191F28', display: 'block', marginBottom: '6px' }}>
              결제가 정상 완료되었습니다!
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7684', display: 'block', marginBottom: '24px' }}>
              이용해 주셔서 감사합니다. 정성 어린 상차림으로 예에 최선을 다하겠습니다.
            </span>

            {/* Receipt Summary inside checkout */}
            <div style={{
              backgroundColor: '#F8F9FA',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '28px',
              border: '1px solid #F2F4F7'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7684' }}>주문자명</span>
                <strong style={{ color: '#191F28' }}>{customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7684' }}>상품명</span>
                <strong style={{ color: '#191F28' }}>{orderName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7684' }}>결제 수단</span>
                <strong style={{ color: '#191F28' }}>
                  {method === 'tosspay' ? '토스페이 간편결제' : method === 'card' ? `신용카드 (${cardOptions.find(c => c.id === selectedCard)?.label})` : method === 'transfer' ? '실시간 계좌이체' : '가상계좌 (무통장)'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E5E8EB', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ color: '#6B7684' }}>토스 승인 ID</span>
                <strong style={{ color: '#0050FF', fontFamily: 'monospace' }}>{finalTxId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800 }}>
                <span style={{ color: '#191F28' }}>결제 금액</span>
                <strong style={{ color: '#0050FF' }}>{amount.toLocaleString()}원</strong>
              </div>
            </div>

            <button
              onClick={handleFinalConfirm}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#2F6330',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(47, 99, 48, 0.15)'
              }}
            >
              주문 완료 확인
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
