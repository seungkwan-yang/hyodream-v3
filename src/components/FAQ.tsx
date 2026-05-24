import React, { useState } from 'react';
import { Star, ChevronDown, CheckCircle2, Award, Heart } from 'lucide-react';

interface Review {
  name: string;
  rating: number;
  date: string;
  content: string;
  packageType: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const reviews: Review[] = [
    {
      name: '이*호 (인천 연수구)',
      rating: 5,
      date: '2026-05-18',
      content: '어머님 기제사로 급히 주문했습니다. 3일 전에 주문했는데 당일에 전용 차량으로 정갈하게 박싱되어 와서 안심했어요. 전 종류가 특히 도톰하고 기름 쩐내 없이 새벽에 부친 게 티가 나더군요. 친척 어르신들도 칭찬 많이 하셔서 뿌듯했습니다.',
      packageType: '표준 맞춤상 (기제사 중)'
    },
    {
      name: '박*정 (인천 부평구)',
      rating: 5,
      date: '2026-05-12',
      content: '핵가족이라 소가족 실속상으로 주문했어요. 과일도 흠집 하나 없이 특등과들만 왔고 밤 깎은 정성도 보였네요. 전복 추가했는데 꼬들하니 아주 인기 좋았습니다. 앞으로 제사때마다 효드림만 애용할 생각입니다.',
      packageType: '소가족 실속상 + 활전복 추가'
    },
    {
      name: '최*환 (경기도 부천시)',
      rating: 5,
      date: '2026-05-04',
      content: '사무실 새로 이전하면서 개업 고사상 대행으로 예약했는데 완전 마음에 듭니다. 돼지머리 상태도 아주 훌륭했고 시루떡이 진짜 김이 모락모락 나는 채로 와서 놀랐습니다. 번창하겠습니다 대박나세요!',
      packageType: '개업 고사상'
    }
  ];

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
      answer: '효드림 본사가 있는 인천광역시 전 지역(연수구, 부평구, 남동구, 서구, 계양구, 중구 등 영종도 포함) 및 인근 경기 일부 지역(부천시, 김포시, 시흥시, 광명시, 일산 일부)까지 효드림 직접 안전 탑차로 직접 무료 직배송을 진행하고 있습니다. 그 외 경기 외곽 지역은 상담 전화(1600-6341)를 통해 조율 가능합니다.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }} className="animate-fade-in-up">
      
      {/* Visual Review Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(197, 155, 39, 0.1)',
            padding: '6px 14px',
            borderRadius: '20px',
            color: 'var(--color-gold)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Heart size={14} style={{ fill: 'var(--color-gold)' }} />
            정성 가득 리얼 평점 5.0 만족도
          </div>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800 }}>효드림을 이용하신 가족들의 후기</h2>
          <div className="korean-divider" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {reviews.map((rev, idx) => (
            <div key={idx} className="premium-card korean-border-box" style={{
              padding: '32px 28px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                {/* Rating stars */}
                <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)', marginBottom: '14px' }}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={16} style={{ fill: 'var(--color-gold)' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-sub)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{rev.content}"
                </p>
              </div>

              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px dashed var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem'
              }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>주문상품: {rev.packageType}</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          효드림은 모든 위생 조리 시설과 배송 차량에 대해 매일 위생 검수를 시행하고 있습니다. 어르신들의 칭찬과 성원에 보답하겠습니다.
        </p>
      </section>

    </div>
  );
};
