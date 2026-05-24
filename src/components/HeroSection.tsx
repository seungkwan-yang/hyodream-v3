import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, ShieldCheck, Truck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setCustomerTab } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }} className="animate-fade-in-up traditional-bg">
      {/* Visual Hero Banner */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(253, 251, 247, 0) 100%)',
        borderRadius: '32px',
        border: '1px solid rgba(232, 226, 213, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Korean traditional pattern badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-primary-fade)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: 'var(--color-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '24px'
        }}>
          <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
          인천·경기 대표 제사상 대행 서비스
        </div>

        <h1 className="serif-font" style={{
          fontSize: '3rem',
          lineHeight: '1.3',
          fontWeight: 900,
          color: 'var(--color-text-main)',
          marginBottom: '24px',
          letterSpacing: '-0.03em'
        }}>
          마음을 다해 준비하는<br />
          정성의 한 상, <span style={{ color: 'var(--color-primary)' }}>효드림</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--color-text-sub)',
          maxWidth: '650px',
          margin: '0 auto 40px auto',
          fontWeight: 500,
          lineHeight: '1.7'
        }}>
          오랜 전통의 예법은 깍듯이 지키고, 번거로움은 덜어드립니다.<br />
          엄선된 우리 식재료로 부모님을 대접하는 정성을 담아 새벽녘 정성스레 조리합니다.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => setCustomerTab('estimator')}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
          >
            실시간 맞춤상 주문하기
          </button>
          <button
            onClick={() => setCustomerTab('menu')}
            className="btn-secondary"
            style={{ padding: '14px 34px', fontSize: '1.05rem' }}
          >
            차림 품목 둘러보기
          </button>
        </div>
      </section>

      {/* Core Core Values Section */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800 }}>효드림이 약속하는 3대 원칙</h2>
          <div className="korean-divider" />
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-sub)' }}>
            어려운 제사 음식, 위생적이고 정직한 시스템으로 신뢰를 올리겠습니다.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Card 1 */}
          <div className="premium-card korean-border-box" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary-fade)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)', margin: '0 auto 24px auto'
            }}>
              <Calendar size={28} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '1.25rem', marginBottom: '14px', fontWeight: 700 }}>
              배송 당일 새벽 조리 원칙
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: '1.6' }}>
              미리 만들어 급속 냉동해두는 기성품이 아닙니다. 제사 및 행사 일정 당일 새벽 1시부터 손수 장을 본 신선 식자재로 정성껏 준비하여 즉시 배송합니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="premium-card korean-border-box" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'rgba(197, 155, 39, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-gold)', margin: '0 auto 24px auto'
            }}>
              <ShieldCheck size={28} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '1.25rem', marginBottom: '14px', fontWeight: 700 }}>
              HACCP급 위생 조리 환경
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: '1.6' }}>
              부평에 위치한 직영 청결 클린룸 시설에서 소독된 조리 기구와 위생 장비를 입고 철저한 위생 감시 하에 조리합니다. 정갈함과 위생은 타협할 수 없는 효드림의 자존심입니다.
            </p>
          </div>

          {/* Card 3 */}
          <div className="premium-card korean-border-box" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'rgba(200, 122, 83, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-rose)', margin: '0 auto 24px auto'
            }}>
              <Truck size={28} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '1.25rem', marginBottom: '14px', fontWeight: 700 }}>
              안심 직배송 안전 탑차 배달
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: '1.6' }}>
              파손 위험이 있는 일반 퀵 서비스나 일반 택배 배송을 이용하지 않습니다. 보냉 밀폐 전용 플라스틱 패키지에 담아 효드림 전용 차량으로 안전하게 자택 현관문 앞까지 도어 투 도어로 배송합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Simple Information Guide Block */}
      <section className="glass-panel" style={{
        padding: '48px',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            처음이라 상차림 구성이 고민이신가요?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: 1.5 }}>
            효드림 실시간 맞춤 주문을 이용해 보세요. 가구 인원수와 특별 요리를 고려해 직접 추가 품목을 가감하여 그 자리에서 정확한 주문 가격과 구성표를 받아보고 안전하게 결제하실 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setCustomerTab('estimator')}
          className="btn-primary"
          style={{ padding: '16px 28px', whiteSpace: 'nowrap' }}
        >
          실시간 주문 및 결제
        </button>
      </section>
    </div>
  );
};
