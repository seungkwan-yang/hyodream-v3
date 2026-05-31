import React from 'react';
import { useApp } from '../context/AppContext';
import type { ThemeType } from '../context/AppContext';
import { Check } from 'lucide-react';

export const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useApp();

  const themes: { id: ThemeType; name: string; primary: string; secondary: string; text: string }[] = [
    {
      id: 'sage',
      name: '세이지 그린 (기본)',
      primary: '#526E54',
      secondary: '#EBF0EA',
      text: '#2C332D'
    },
    {
      id: 'indigo',
      name: '쪽빛 인디고',
      primary: '#3A5173',
      secondary: '#E8EEF5',
      text: '#1C232E'
    },
    {
      id: 'burgundy',
      name: '옻칠 버건디',
      primary: '#7B3B3B',
      secondary: '#F2EBEB',
      text: '#2E1C1C'
    },
    {
      id: 'slate',
      name: '먹색 슬레이트',
      primary: '#3E4A5A',
      secondary: '#EAECEF',
      text: '#1C2025'
    },
    {
      id: 'terracotta',
      name: '황토 테라코타',
      primary: '#8B5E3C',
      secondary: '#F3EBE3',
      text: '#2E231C'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#FFF',
      borderRadius: 'var(--radius-md)',
      padding: '32px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--color-text-main)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        메인 테마 설정
      </h2>

      <p style={{
        color: 'var(--color-text-sub)',
        marginBottom: '32px',
        fontSize: '0.95rem'
      }}>
        효드림 서비스에 적용할 메인 컬러 테마를 선택해주세요. 선택 즉시 서비스 전체에 반영되며 방문 고객들에게도 동일하게 보여집니다.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {themes.map((t) => {
          const isSelected = theme === t.id;
          
          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                backgroundColor: isSelected ? 'var(--color-primary-fade)' : '#FFF'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFF',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '16px'
              }}>
                {t.name}
              </h3>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: t.primary,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} title="Primary Color" />
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: t.secondary,
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }} title="Secondary Background" />
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: t.text,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} title="Text Color" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
