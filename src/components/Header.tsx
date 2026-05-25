import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CustomerTab, ViewMode } from '../context/AppContext';
import { Sparkles, CalendarCheck, ShieldAlert, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    customerTab,
    setCustomerTab
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: CustomerTab) => {
    setCustomerTab(tab);
    setIsMobileMenuOpen(false);
    // Auto-scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleViewMode = () => {
    const newMode: ViewMode = viewMode === 'customer' ? 'admin' : 'customer';
    setViewMode(newMode);
    
    // Smooth scroll to top when mode changes
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      height: '80px',
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(253, 251, 247, 0.85)'
    }}>
      {/* Brand Logo */}
      <div
        onClick={() => handleTabChange('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-gold)',
          fontWeight: 800,
          fontSize: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          효
        </div>
        <div>
          <h1 className="serif-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '0.05em', lineHeight: 1.1 }}>
            효드림
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.15em', display: 'block', marginTop: '1px' }}>
            정성 제사음식 대행
          </span>
        </div>
      </div>

      {/* Customer Navigation Links - Only show if in customer mode */}
      {viewMode === 'customer' && (
        <nav className="pc-nav" style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'home', label: '브랜드 홈' },
            { id: 'estimator', label: '실시간 상차림 주문기' },
            { id: 'menu', label: '정갈한 품목 소개' },
            { id: 'reviews', label: '고객 포토 후기' },
            { id: 'faq', label: '자주 묻는 질문' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CustomerTab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '8px',
                color: customerTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                backgroundColor: customerTab === tab.id ? 'var(--color-primary-fade)' : 'transparent',
                transition: 'var(--transition-smooth)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Right Mode Controls & Mobile Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {viewMode === 'customer' && (
          <button
            onClick={() => handleTabChange('estimator')}
            className="btn-primary pc-header-btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '10px',
              boxShadow: 'none'
            }}
          >
            <CalendarCheck size={16} /> 실시간 맞춤 주문
          </button>
        )}

        <div
          onClick={handleToggleViewMode}
          className="pulse-gold pc-header-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: viewMode === 'admin' ? 'var(--color-primary-dark)' : 'var(--color-gold)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'var(--transition-spring)',
            userSelect: 'none',
            boxShadow: '0 4px 10px rgba(197, 155, 39, 0.2)'
          }}
        >
          {viewMode === 'admin' ? (
            <>
              <ShieldAlert size={14} />
              <span>고객 화면으로</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>관리자 모드 전환</span>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        {viewMode === 'customer' && (
          <button
            className="mobile-menu-trigger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="모바일 메뉴 토글"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Floating Dropdown Navigation */}
      {isMobileMenuOpen && viewMode === 'customer' && (
        <div className="mobile-nav-panel">
          {[
            { id: 'home', label: '브랜드 홈' },
            { id: 'estimator', label: '실시간 상차림 주문기' },
            { id: 'menu', label: '정갈한 품목 소개' },
            { id: 'reviews', label: '고객 포토 후기' },
            { id: 'faq', label: '자주 묻는 질문' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CustomerTab)}
              className={`mobile-nav-link ${customerTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
          {/* Quick action buttons added for better UX inside mobile menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              onClick={() => handleTabChange('estimator')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.9rem', borderRadius: '12px' }}
            >
              <CalendarCheck size={16} /> 실시간 맞춤 주문하기
            </button>
            <div
              onClick={() => { handleToggleViewMode(); setIsMobileMenuOpen(false); }}
              className="pulse-gold"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-gold)',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: 'none'
              }}
            >
              <Sparkles size={14} />
              <span>관리자 모드 전환</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
