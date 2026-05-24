import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Inquiry, InquiryStatus } from '../context/AppContext';
import { Search, Calendar, MapPin, Phone, Eye, Trash2, Clipboard, X, CheckCircle, Clock, Truck, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderList: React.FC = () => {
  const { inquiries, updateInquiryStatus, updateInquiryNotes, deleteInquiry } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [noteText, setNoteText] = useState('');

  // Filtering & Search
  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.phone.includes(searchTerm) ||
                          item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNoteText(inquiry.adminNotes || '');
  };

  const handleStatusChange = (id: string, newStatus: InquiryStatus) => {
    updateInquiryStatus(id, newStatus);
    
    // Update local selected state to refresh modal UI
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
    }

    // Celebration on Completion
    if (newStatus === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3A503B', '#C59B27', '#EAEFEA', '#C87A53']
      });
    }
  };

  const handleSaveNotes = () => {
    if (selectedInquiry) {
      updateInquiryNotes(selectedInquiry.id, noteText);
      setSelectedInquiry(prev => prev ? { ...prev, adminNotes: noteText } : null);
      alert('관리자 메모가 임시 저장되었습니다.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('해당 주문 및 결제 내역을 삭제하시겠습니까? (복구할 수 없습니다.)')) {
      deleteInquiry(id);
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return <Clock size={15} />;
      case 'approved': return <CheckCircle size={15} />;
      case 'processing': return <Truck size={15} />;
      case 'completed': return <Award size={15} />;
    }
  };

  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return '접수/입금대기';
      case 'approved': return '결제완료';
      case 'processing': return '배송준비';
      case 'completed': return '배송완료';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in-up">
      {/* Filtering Control Bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            placeholder="고객명, 연락처, 배송지 주소로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '42px', borderRadius: '12px' }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {['all', 'pending', 'approved', 'processing', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: statusFilter === status ? '#FFF' : 'var(--color-text-sub)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {status === 'all' ? '전체 내역' : getStatusLabel(status as InquiryStatus)}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiry Data List */}
      <div className="premium-card" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>주문 번호</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>고객명</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>상차림 종류</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>제사 일정</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>총 금액</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>결제 수단</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>진행 상태</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)', textAlign: 'center' }}>동작</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                    <td style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{item.id}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{item.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={12} /> {item.phone}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: 500 }}>{item.ritualType}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Calendar size={14} style={{ color: 'var(--color-text-sub)' }} />
                        {item.date}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                      {item.totalPrice.toLocaleString()}원
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: item.paymentMethod?.includes('토스페이') ? '#0050FF' : 'var(--color-primary)',
                        backgroundColor: item.paymentMethod?.includes('토스페이') ? '#F2F6FF' : 'var(--color-primary-fade)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: item.paymentMethod?.includes('토스페이') ? '1px solid rgba(0, 80, 255, 0.15)' : '1px solid rgba(58, 80, 59, 0.15)',
                        display: 'inline-block'
                      }}>
                        {item.paymentMethod || '토스페이'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${item.status}`} style={{ gap: '6px' }}>
                        {getStatusIcon(item.status)}
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenDetail(item)}
                          title="상세 보기"
                          style={{
                            width: '32px', height: '32px', border: '1px solid var(--border-color)',
                            borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-text-sub)', transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-sub)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="삭제"
                          style={{
                            width: '32px', height: '32px', border: '1px solid rgba(200, 122, 83, 0.2)',
                            borderRadius: '6px', cursor: 'pointer', backgroundColor: '#FFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-rose)', transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(200, 122, 83, 0.05)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    일치하는 결제 및 주문 내역이 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traditional Receipt Modal (Detail Viewer) */}
      {selectedInquiry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(44, 38, 33, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in-up" style={{
            maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: '24px', padding: '32px', position: 'relative', border: '2px solid var(--color-primary)'
          }}>
            {/* Header decoration */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '8px',
              background: 'repeating-linear-gradient(45deg, var(--color-primary), var(--color-primary) 10px, var(--color-gold) 10px, var(--color-gold) 20px)'
            }} />

            {/* Close Button */}
            <button
              onClick={() => setSelectedInquiry(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', border: 'none',
                background: 'none', cursor: 'pointer', color: 'var(--color-text-sub)'
              }}
            >
              <X size={20} />
            </button>

            {/* Traditional Receipt Frame */}
            <div style={{
              backgroundColor: '#FAF7EF', border: '1px dashed var(--border-color)',
              borderRadius: '16px', padding: '24px', marginTop: '10px', position: 'relative',
              boxShadow: 'inset 0 0 40px rgba(44, 38, 33, 0.03)'
            }}>
              {/* Receipt Title */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span className="serif-font" style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: 'var(--color-primary)', fontWeight: 700 }}>
                  정성 배송 의뢰서
                </span>
                <h2 className="serif-font" style={{ fontSize: '1.6rem', marginTop: '4px', fontWeight: 700 }}>
                  효 드 림 영 수 증
                </h2>
                <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-primary)', margin: '8px auto' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>발급번호: {selectedInquiry.id}</span>
              </div>

              {/* Status Stepper inside Receipt */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 16px', backgroundColor: 'rgba(58, 80, 59, 0.04)',
                borderRadius: '8px', marginBottom: '24px', alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>진행 상태 설정:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['pending', 'approved', 'processing', 'completed'] as InquiryStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedInquiry.id, st)}
                      style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        border: 'none', cursor: 'pointer',
                        backgroundColor: selectedInquiry.status === st ? 'var(--color-primary)' : 'rgba(44, 38, 33, 0.05)',
                        color: selectedInquiry.status === st ? '#FFF' : 'var(--color-text-sub)',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {getStatusLabel(st)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Client Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>주문자명</span> <strong>{selectedInquiry.customerName}</strong></div>
                <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>연락처</span> <span>{selectedInquiry.phone}</span></div>
                <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>제사 일정</span> <span style={{ fontWeight: 600 }}>{selectedInquiry.date}</span></div>
                <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>배송 희망</span> <span style={{ fontSize: '0.85rem' }}>{selectedInquiry.timeSlot}</span></div>
                <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />배송지</span> <span style={{ fontSize: '0.85rem' }}>{selectedInquiry.address} {selectedInquiry.addressDetail}</span></div>
                <div style={{ display: 'flex', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>결제 수단</span> <strong style={{ color: 'var(--color-primary)' }}>{selectedInquiry.paymentMethod || '토스페이'}</strong></div>
                {selectedInquiry.tossTransactionId && (
                  <div style={{ display: 'flex' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>토스 승인 ID</span> <span style={{ fontFamily: 'monospace', color: '#0050FF', fontWeight: 600 }}>{selectedInquiry.tossTransactionId}</span></div>
                )}
              </div>

              {/* Order Summary Itemization */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>선택 품목 내역</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Base Product */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>• {selectedInquiry.ritualType}</span>
                    <span style={{ fontWeight: 500 }}>기본가 포함</span>
                  </div>

                  {/* Additions */}
                  {selectedInquiry.customizations.length > 0 && selectedInquiry.customizations.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-primary-light)', paddingLeft: '12px' }}>
                      <span>+ {c}</span>
                      <span>추가단가 적용</span>
                    </div>
                  ))}

                  {/* Subtractions */}
                  {selectedInquiry.subtractions.length > 0 && selectedInquiry.subtractions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-rose)', paddingLeft: '12px' }}>
                      <span>- {s}</span>
                      <span>차감단가 적용</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '12px 0', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>소비자 특별 요청</span>
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text-sub)' }}>
                  {selectedInquiry.specialRequests ? `"${selectedInquiry.specialRequests}"` : '"요청 사항 없음"'}
                </p>
              </div>

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                <span className="serif-font" style={{ fontSize: '1.05rem', fontWeight: 700 }}>총 결제 금액</span>
                <span className="serif-font" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {selectedInquiry.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Secret Admin Memo Form */}
            <div style={{ marginTop: '24px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Clipboard size={14} /> 관리자 전용 작업 지시서 및 메모
              </label>
              <textarea
                rows={3}
                placeholder="주문 메모, 배송 연락 조율 사항, 선별 요망 원자재 기록..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                style={{ fontSize: '0.85rem', borderRadius: '12px', border: '1.5px solid var(--border-color)', resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={handleSaveNotes}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  메모 임시 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
