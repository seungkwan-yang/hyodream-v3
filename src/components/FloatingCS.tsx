import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone, Clock, MessageCircle, CreditCard, Headphones } from 'lucide-react';

export const FloatingCS: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  // Default to closed on mobile, open on desktop
  const [isOpen, setIsOpen] = useState(() => window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          border: '2px solid var(--color-gold)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Headphones size={24} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        width: '320px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 10px 24px',
          backgroundColor: '#FFF',
          borderBottom: '1px dashed var(--border-color)'
        }}
      >
        <h3 className="serif-font" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
          CS CENTER
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--color-primary)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#FFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#FFF' }}>
        
        {/* Phone */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0
          }}>
            <Phone size={20} />
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '2px' }}>대표전화</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>1600-6341</span>
              {isMobile && (
                <a 
                  href="tel:1600-6341"
                  style={{
                    backgroundColor: 'var(--color-gold)', color: '#FFF',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  전화걸기
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0,
            border: '1px solid var(--border-color)'
          }}>
            <Clock size={20} />
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '2px' }}>운영시간</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              월 ~ 일 (연중무휴)<br/>
              AM 10:00 - PM 07:00
            </div>
          </div>
        </div>

        {/* KakaoTalk */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FAE100',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B1E1E', flexShrink: 0,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <MessageCircle size={20} fill="#3B1E1E" />
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '2px' }}>카카오톡 상담</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              ID: 효드림
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />

        {/* Bank Account */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0,
            border: '1px solid var(--border-color)'
          }}>
            <CreditCard size={20} />
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '2px' }}>무통장입금</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              농협 302-3227-7989-71<br/>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', fontWeight: 500 }}>(예금주: 김성기)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
