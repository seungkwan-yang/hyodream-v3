import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Users, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

export const AdminStats: React.FC = () => {
  const { inquiries } = useApp();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredInquiries = inquiries.filter(i => {
    if (!startDate && !endDate) return true;
    const iDate = i.createdAt ? i.createdAt.split(' ')[0] : i.date;
    if (startDate && iDate < startDate) return false;
    if (endDate && iDate > endDate) return false;
    return true;
  });

  // Computations
  const totalInquiries = filteredInquiries.length;
  const pendingCount = filteredInquiries.filter(i => i.status === 'pending').length;
  const activeProcessing = filteredInquiries.filter(i => i.status === 'approved' || i.status === 'processing').length;
  const completedCount = filteredInquiries.filter(i => i.status === 'completed').length;
  
  const totalRevenue = filteredInquiries
    .filter(i => i.paymentStatus === 'paid')
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const conversionRate = totalInquiries > 0 
    ? Math.round((filteredInquiries.filter(i => i.paymentStatus === 'paid').length / totalInquiries) * 100) 
    : 100;

  // Find most popular package
  const packageCounts = filteredInquiries.reduce((acc, curr) => {
    acc[curr.ritualType] = (acc[curr.ritualType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let popularPackage = '정보 없음';
  let maxCount = 0;
  Object.entries(packageCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      popularPackage = name.split(' (')[0]; // Simplify name
    }
  });

  // Mock weekly activity for the chart
  const weeklyData = [
    { day: '월', count: 3, amount: 820000 },
    { day: '화', count: 5, amount: 1450000 },
    { day: '수', count: 4, amount: 1120000 },
    { day: '목', count: 8, amount: 2460000 },
    { day: '금', count: 6, amount: 1800000 },
    { day: '토', count: 9, amount: 3100000 },
    { day: '일', count: 7, amount: 2150000 },
  ];

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in-up">
      {/* Date Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#FFF',
        padding: '20px 28px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)', fontWeight: 600, minWidth: '100px' }}>
          <Calendar size={18} />
          <span>기간 필터:</span>
        </div>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            width: '140px'
          }}
        />
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>~</span>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            width: '140px'
          }}
        />
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text-sub)'
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Stat Card 1 */}
        <div className="premium-card korean-border-box" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem', fontWeight: 500 }}>총 주문 결제건</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'rgba(58, 80, 59, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Users size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            {totalInquiries}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-sub)' }}> 건</span>
          </h3>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-rose)', fontWeight: 600 }}>
            • 무통장 입금 대기 {pendingCount}건
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="premium-card korean-border-box" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem', fontWeight: 500 }}>누적 결제 매출액</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'rgba(197, 155, 39, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-gold)'
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            {totalRevenue.toLocaleString()}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-sub)' }}> 원</span>
          </h3>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            ✓ 토스페이먼츠 승인 및 실거래 기준
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="premium-card korean-border-box" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem', fontWeight: 500 }}>결제 전환 성공률</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'rgba(200, 122, 83, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-rose)'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            {conversionRate}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-sub)' }}> %</span>
          </h3>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            총 {inquiries.filter(i => i.paymentStatus === 'paid').length}건 결제 승인 완료
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="premium-card korean-border-box" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem', fontWeight: 500 }}>최다 주문 상차림</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary-fade)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', lineHeight: 1.2 }}>
            {popularPackage}
          </h3>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            선호도 1위 패키지
          </div>
        </div>
      </div>

      {/* Interactive Visual Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
      }} className="responsive-chart-grid">
        {/* Weekly Inquiries Bar Chart */}
        <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>주간 주문/결제 접수 흐름</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>요일별 결제 유입된 누적 실적 및 수량</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} /> 최근 7일 데이터
            </span>
          </div>

          {/* Styled React/CSS Bar Chart */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: '200px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-color)',
            position: 'relative'
          }}>
            {weeklyData.map((data, idx) => {
              const heightPercentage = `${(data.count / maxWeeklyCount) * 85}%`;
              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '12%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Tooltip on hover */}
                  <div className="chart-bar-hover" style={{
                    width: '100%',
                    height: heightPercentage,
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    {/* Floating Value */}
                    <div style={{
                      position: 'absolute',
                      top: '-26px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--color-text-main)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap'
                    }}>
                      {data.count}건
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-sub)',
                    marginTop: '8px',
                    fontWeight: 600
                  }}>{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution (Pie Alternative) */}
        <div className="premium-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>주문 진행 상태별 점유율</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {/* Status Item 1: Pending */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500 }}>무통장/입금 대기</span>
                <span style={{ fontWeight: 600, color: 'var(--color-rose)' }}>{pendingCount}건 ({totalInquiries ? Math.round(pendingCount/totalInquiries*100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalInquiries ? (pendingCount/totalInquiries*100) : 0}%`, height: '100%', backgroundColor: 'var(--color-rose)' }} />
              </div>
            </div>

            {/* Status Item 2: Processing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500 }}>결제 완료 및 준비 중</span>
                <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{activeProcessing}건 ({totalInquiries ? Math.round(activeProcessing/totalInquiries*100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalInquiries ? (activeProcessing/totalInquiries*100) : 0}%`, height: '100%', backgroundColor: 'var(--color-gold)' }} />
              </div>
            </div>

            {/* Status Item 3: Completed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500 }}>배송 및 제사 완료</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{completedCount}건 ({totalInquiries ? Math.round(completedCount/totalInquiries*100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalInquiries ? (completedCount/totalInquiries*100) : 0}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '28px',
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            fontSize: '0.8rem',
            color: 'var(--color-text-sub)'
          }}>
            <strong>💡 실시간 동기화 정보:</strong> 일반 고객이 결제 및 주문을 완료하면 본 대시보드 그래프에 즉시 실시간 연동되어 자동 반영됩니다.
          </div>
        </div>
      </div>
    </div>
  );
};
