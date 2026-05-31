import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Award } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: '언제까지 예약을 주문 완료해야 하나요?',
      answer: '모든 음식은 당일 새벽 조리 및 식자재 수급을 조율하므로, 제사/행사 당일 최소 3일 전까지 주문 및 결제를 완료해 주셔야 합니다. 주문 완료 직후 전담 매니저가 연락처로 확인 통화를 드릴 예정입니다. 명절(설/추석) 차례상의 경우 주문 조기 마감이 발생할 수 있어 보름 전 주문을 권장합니다.'
    },
    {
      question: '음식은 어떤 패키지에 담겨 어떻게 배송되나요?',
      answer: '위생적으로 소독된 친환경 밀폐 플라스틱 보관 용기에 낱개 개별 포장되어 포장 상자 안에 안전하게 동봉됩니다. 배송은 일반 퀵서비스 오토바이 배달을 절대 하지 않으며, 온도 관리가 가능한 효드림 안심 차량 직배송으로 안전하게 고객님 댁 앞문까지 도어 투 도어로 도달합니다.'
    },
    {
      question: '음식을 받은 후 제사를 모시기 전까지 보관 및 데우는 법은 어떻게 되나요?',
      answer: '배송받으신 후 제사 모시기 전까지는 냉장 보관을 권장하며, 배송 당일 새벽에 갓 조리된 음식들이므로 상에 올리기 전 탕국은 냄비에 한 번 끓이고, 적과 전 종류는 가볍게 후라이팬이나 에어프라이어에 데우시면 갓 지진 맛 그대로 촉촉하고 노릇하게 드실 수 있습니다.'
    },
    {
      question: '배송 가능한 지역은 정확히 어디인가요?',
      answer: '효드림 본사가 있는 인천광역시 전 지역(연수구, 부평구, 남동구, 서구, 계양구, 중구 등 영종도 포함) 및 인근 경기 일부 지역(부천시, 김포시, 시흥시, 광명시, 일산 일부)까지 효드림 직원이 직접 무료 직배송을 진행하고 있습니다. 그 외 경기 외곽 지역은 상담 전화(1600-6341)를 통해 조율 가능합니다.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }} className="animate-fade-in-up">
      {/* Accordion FAQ Area */}
      <section style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800 }}>효드림 자주 묻는 질문</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', marginTop: '8px' }}>
            궁금해하시는 핵심 내용들을 정리해 드립니다.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="premium-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: openFAQIndex === idx ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)'
              }}
            >
              {/* Question Trigger Header */}
              <div
                onClick={() => setOpenFAQIndex(openFAQIndex === idx ? null : idx)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: openFAQIndex === idx ? 'var(--color-primary-fade)' : 'transparent'
                }}
              >
                <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                  Q. {faq.question}
                </strong>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFAQIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'var(--transition-smooth)',
                    color: 'var(--color-primary)'
                  }}
                />
              </div>

              {/* Answer Expandable Area */}
              {openFAQIndex === idx && (
                <div style={{
                  padding: '20px 24px',
                  borderTop: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-sub)',
                  backgroundColor: '#FFF',
                  lineHeight: 1.6,
                  animation: 'fadeInUp 0.3s ease-out'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Floating Trust Footnote */}
      <section className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', color: 'var(--color-primary)' }}>
          <Award size={20} />
          <CheckCircle2 size={20} />
        </div>
        <h4 className="serif-font" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
          부모님을 모시는 효(孝)의 마음, 약속을 지키겠습니다
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', maxWidth: '500px', lineHeight: 1.5 }}>
          효드림은 모든 위생 조리 시설 및 배송 차량에 대해 매일 위생 검수를 시행하고 있습니다. 어르신들의 칭찬과 성원에 보답하겠습니다.
        </p>
      </section>
    </div>
  );
};
