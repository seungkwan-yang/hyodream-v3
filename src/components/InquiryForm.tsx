import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { BaseMenu, CustomOption } from '../context/AppContext';
import { Calendar, MapPin, User, ChevronRight, ChevronLeft, Check, HelpCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TossCheckout } from './TossCheckout';

interface InquiryFormProps {
  initialConfig: {
    selectedPackage: BaseMenu;
    selectedAdditions: CustomOption[];
    selectedSubtractions: CustomOption[];
    calculatedTotal: number;
  };
  onReset: () => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ initialConfig, onReset }) => {
  const { addInquiry } = useApp();
  const [step, setStep] = useState(1);
  const [showTossModal, setShowTossModal] = useState(false);
  
  // Step 2 Fields
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('오후 3:00 ~ 오후 5:00');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  
  // Step 3 Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Created Order Details for Step 4
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  // Set minimum date to tomorrow
  const getMinDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleNextStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!date) newErrors.date = '제사/행사 날짜를 반드시 지정해 주세요.';
      if (!address) newErrors.address = '배송지 기본 주소를 기입해 주세요.';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (step === 3) {
      if (!customerName.trim()) newErrors.customerName = '주문자(신청인) 성함을 입력해 주세요.';
      if (!phone.trim() || !/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) {
        newErrors.phone = '올바른 연락처 형식(예: 010-1234-5678)으로 입력해 주세요.';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Open the Toss Payments checkout window!
      setShowTossModal(true);
      return;
    }

    setErrors({});
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep(prev => prev - 1);
  };

  const handlePaymentSuccess = (paymentMethod: string, transactionId: string) => {
    setShowTossModal(false);
    
    const customizations = initialConfig.selectedAdditions.map(a => a.name);
    const subtractions = initialConfig.selectedSubtractions.map(s => s.name);

    // Save paid order to global context
    const order = addInquiry({
      customerName,
      phone,
      ritualType: initialConfig.selectedPackage.name,
      date,
      timeSlot,
      address,
      addressDetail,
      specialRequests,
      customizations,
      subtractions,
      totalPrice: initialConfig.calculatedTotal,
      status: 'approved', // Pre-approve paid orders
      paymentMethod,
      paymentStatus: 'paid',
      tossTransactionId: transactionId
    });

    setSubmittedOrder(order);
    setStep(4);

    // Trigger celebration confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#3A503B', '#C59B27', '#EAEFEA', '#C87A53']
    });
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }} className="animate-fade-in-up">
      {/* Stepper Status Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '0 20px'
      }}>
        {[
          { num: 1, label: '상차림 확인' },
          { num: 2, label: '일정 및 배송지' },
          { num: 3, label: '주문자 정보' },
          { num: 4, label: '결제 및 완료' }
        ].map(s => (
          <div key={s.num} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            flex: 1
          }}>
            {/* Step Number Circle */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: step >= s.num ? 'var(--color-primary)' : 'var(--border-color)',
              color: step >= s.num ? '#FFFFFF' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem', zIndex: 2,
              transition: 'var(--transition-smooth)'
            }}>
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            
            <span style={{
              fontSize: '0.8rem',
              color: step >= s.num ? 'var(--color-text-main)' : 'var(--color-text-muted)',
              fontWeight: step === s.num ? 700 : 500,
              marginTop: '8px'
            }}>{s.label}</span>

            {/* Connector Line */}
            {s.num < 4 && (
              <div style={{
                position: 'absolute',
                top: '18px',
                left: 'calc(50% + 18px)',
                right: 'calc(-50% + 18px)',
                height: '2px',
                backgroundColor: step > s.num ? 'var(--color-primary)' : 'var(--border-color)',
                zIndex: 1,
                transition: 'var(--transition-smooth)'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Content Panel */}
      <div className="premium-card" style={{ padding: '40px', backgroundColor: '#FFFFFF', borderRadius: '24px' }}>
        
        {/* STEP 1: Configuration Summary Check */}
        {step === 1 && (
          <div>
            <h3 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
              선택하신 상차림 구성을 확인해 주세요
            </h3>
            
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>선택 상차림 패키지</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{initialConfig.selectedPackage.name}</strong>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {initialConfig.selectedPackage.price.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Additions List */}
              {initialConfig.selectedAdditions.length > 0 && (
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>추가 프리미엄 품목</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {initialConfig.selectedAdditions.map(a => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-primary-light)' }}>+ {a.name}</span>
                        <span style={{ fontWeight: 600 }}>+{a.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtractions List */}
              {initialConfig.selectedSubtractions.length > 0 && (
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>제외 및 간소화 설정</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {initialConfig.selectedSubtractions.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-rose)' }}>- {s.name}</span>
                        <span style={{ fontWeight: 600 }}>{s.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                <span className="serif-font" style={{ fontSize: '1.05rem', fontWeight: 700 }}>상차림 주문 금액</span>
                <span className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {initialConfig.calculatedTotal.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={onReset} className="btn-secondary">
                <ChevronLeft size={16} /> 구성 수정하기
              </button>
              <button onClick={handleNextStep} className="btn-primary">
                일정 및 배송지 입력 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Delivery Schedule & Address */}
        {step === 2 && (
          <div>
            <h3 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
              배송 일정 및 주소지 기입
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Date Input */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  제사/행사 치르는 날짜 선택
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{
                    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)', pointerEvents: 'none'
                  }} />
                  <input
                    type="date"
                    min={getMinDateString()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
                {errors.date && <span style={{ color: 'var(--color-rose)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginTop: '6px' }}>{errors.date}</span>}
              </div>

              {/* Time Slots Selection */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  배송 희망 시간대 선택
                </label>
                <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                  <option value="오전 10:00 ~ 오후 12:00">오전 10:00 ~ 오후 12:00</option>
                  <option value="오후 12:00 ~ 오후 2:00">오후 12:00 ~ 오후 2:00</option>
                  <option value="오후 2:00 ~ 오후 4:00">오후 2:00 ~ 오후 4:00</option>
                  <option value="오후 4:00 ~ 오후 6:00 (제사 전 도착)">오후 4:00 ~ 오후 6:00 (제사 전 권장)</option>
                  <option value="오후 6:00 ~ 오후 8:00">오후 6:00 ~ 오후 8:00</option>
                </select>
              </div>

              {/* Address inputs */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  배송 받으실 주소 (인천·경기 전역 배송)
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{
                      position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)', pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      placeholder="기본 주소를 입력해 주세요 (인천광역시 부평구 평천로 353...)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="상세 주소 (아파트 동/호수 또는 상가 층수 입력)"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                  />
                </div>
                {errors.address && <span style={{ color: 'var(--color-rose)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginTop: '6px' }}>{errors.address}</span>}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={handlePrevStep} className="btn-secondary">
                <ChevronLeft size={16} /> 이전 단계
              </button>
              <button onClick={handleNextStep} className="btn-primary">
                주문 고객정보 입력 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Customer Information & Phone */}
        {step === 3 && (
          <div>
            <h3 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
              주문자 인적 사항 기입
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customer Name */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  주문/의뢰인 성함
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{
                    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)', pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
                {errors.customerName && <span style={{ color: 'var(--color-rose)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginTop: '6px' }}>{errors.customerName}</span>}
              </div>

              {/* Phone number */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  연락처 (안내 문자 및 배송 소통 연락망)
                </label>
                <input
                  type="tel"
                  placeholder="010-1234-5678 (하이픈 포함)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span style={{ color: 'var(--color-rose)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginTop: '6px' }}>{errors.phone}</span>}
              </div>

              {/* Special Requests Notes */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'block', marginBottom: '8px' }}>
                  배송 특이사항 및 요리 조절 요청 (선택)
                </label>
                <textarea
                  rows={4}
                  placeholder="예: 싱겁게 조리 요망, 공동현관 비밀번호 #1004*, 벨을 누르지 말고 문 앞에 둔 뒤 사진을 전송해 주세요 등"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            {/* Stepper buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={handlePrevStep} className="btn-secondary">
                <ChevronLeft size={16} /> 이전 단계
              </button>
              <button onClick={handleNextStep} className="btn-primary" style={{ gap: '8px' }}>
                <ShieldCheck size={16} /> 토스 안전 결제 진행 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation receipt sheet */}
        {step === 4 && submittedOrder && (
          <div style={{ textAlign: 'center' }} className="animate-fade-in-up">
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: '#EAEFEA', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto',
              border: '2px solid var(--color-primary)'
            }}>
              <Check size={36} />
            </div>

            <h3 className="serif-font" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
              결제 및 주문이 완료되었습니다!
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-sub)', maxWidth: '540px', margin: '0 auto 36px auto', lineHeight: 1.5 }}>
              토스 페이먼츠(Toss Payments)를 통한 안전 결제 승인과 주문서 접수가 완료되었습니다. 
              <br />
              기재하신 일정 및 주소지에 맞춰, 효드림 셰프팀이 당일 새벽에 정성을 다해 직접 빚고 안전하게 전담 배송해 드리겠습니다.
            </p>

            {/* Confirmed Receipt Card */}
            <div style={{
              backgroundColor: '#FAF7EF',
              border: '1px dashed var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '520px',
              margin: '0 auto 36px auto',
              textAlign: 'left',
              boxShadow: 'inset 0 0 30px rgba(44, 38, 33, 0.02)',
              position: 'relative'
            }}>
              {/* Paid Stamp graphic overlay */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: '3px double #2F6330',
                borderRadius: '8px',
                color: '#2F6330',
                padding: '4px 10px',
                fontWeight: 900,
                fontSize: '0.85rem',
                transform: 'rotate(12deg)',
                fontFamily: 'system-ui',
                letterSpacing: '1px',
                backgroundColor: 'rgba(234, 239, 234, 0.9)',
                pointerEvents: 'none',
                zIndex: 5
              }}>
                결제완료 (TOSS)
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="serif-font" style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-primary)', fontWeight: 700 }}>
                  결제 승인 증명서
                </span>
                <h4 className="serif-font" style={{ fontSize: '1.35rem', marginTop: '2px', fontWeight: 700 }}>
                  효 드 림 영 수 증
                </h4>
                <div style={{ width: '30px', height: '1px', backgroundColor: 'var(--color-primary)', margin: '6px auto' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>주문 번호: {submittedOrder.id}</span>
              </div>

              {/* Grid detail summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div><span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>주문자명:</span> <strong>{submittedOrder.customerName}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>연락처:</span> <span>{submittedOrder.phone}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>제사 날짜:</span> <span style={{ fontWeight: 600 }}>{submittedOrder.date}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>배송 주소:</span> <span style={{ fontSize: '0.8rem' }}>{submittedOrder.address} {submittedOrder.addressDetail}</span></div>
                <div style={{ borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>결제 수단:</span> <strong style={{ color: 'var(--color-primary)' }}>{submittedOrder.paymentMethod || '토스페이'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', width: '80px', display: 'inline-block' }}>토스 거래 ID:</span> <span style={{ fontFamily: 'monospace', color: '#0050FF', fontWeight: 600 }}>{submittedOrder.tossTransactionId || 'N/A'}</span>
                </div>
              </div>

              {/* Order breakdown summary */}
              <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>• {submittedOrder.ritualType.split(' (')[0]}</span>
                  <span>{initialConfig.selectedPackage.price.toLocaleString()}원</span>
                </div>

                {submittedOrder.customizations.map((c: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-primary-light)', paddingLeft: '10px' }}>
                    <span>+ {c.split(' (')[0]}</span>
                    <span>추가 적용</span>
                  </div>
                ))}

                {submittedOrder.subtractions.map((s: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-rose)', paddingLeft: '10px' }}>
                    <span>- {s}</span>
                    <span>차감 적용</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
                <span className="serif-font" style={{ fontSize: '0.95rem', fontWeight: 700 }}>총 결제 금액</span>
                <span className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {submittedOrder.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: 'var(--color-text-sub)',
              marginBottom: '32px'
            }}>
              <HelpCircle size={14} style={{ color: 'var(--color-primary)' }} />
              <span>상단의 <strong>'관리자 모드'</strong>로 전환하여 방금 접수 및 결제 완료된 주문을 즉시 관리하고 처리해 보세요!</span>
            </div>

            <br />
            
            <button onClick={onReset} className="btn-primary" style={{ padding: '14px 28px' }}>
              처음으로 돌아가기
            </button>
          </div>
        )}

      </div>
      
      {showTossModal && (
        <TossCheckout
          amount={initialConfig.calculatedTotal}
          orderName={initialConfig.selectedPackage.name}
          customerName={customerName}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowTossModal(false)}
        />
      )}
    </div>
  );
};
