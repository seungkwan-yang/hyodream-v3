import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import type { Inquiry, InquiryStatus } from '../context/AppContext';
import { Search, Calendar, MapPin, Phone, Edit3, Trash2, Clipboard, X, CheckCircle, Clock, Truck, Award, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

// Fallback menu list (used when DB data hasn't loaded yet or backend is unavailable)
const FALLBACK_MENUS = [
  { id: 'kisso',  name: '소가족 실속상 (기제사 소)', price: 220000 },
  { id: 'kijung', name: '표준 맞춤상 (기제사 중)',  price: 350000 },
  { id: 'kidae',  name: '명가 전통상 (기제사 대)',  price: 480000 },
  { id: 'gosa',   name: '개업 고사상 / 시제상',    price: 290000 },
];

export const OrderList: React.FC = () => {
  const { inquiries, updateInquiryStatus, updateInquiryNotes, deleteInquiry, addInquiry, baseMenus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearMonthFilter, setYearMonthFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [noteText, setNoteText] = useState('');

  // Use DB menus if loaded, otherwise fall back to hardcoded list
  const effectiveMenus = baseMenus.length > 0 ? baseMenus : FALLBACK_MENUS;

  // Add Manual Order States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    ritualType: FALLBACK_MENUS[0].name,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '오전 10:00 ~ 오후 12:00',
    address: '',
    addressDetail: '',
    paymentMethod: '무통장 입금',
    totalPrice: FALLBACK_MENUS[0].price,
    status: 'pending' as InquiryStatus
  });

  const handleAddNewOrder = () => {
    if (!newOrder.customerName || !newOrder.phone || !newOrder.date) {
      alert('고객명, 연락처, 제사 일정은 필수 입력 사항입니다.');
      return;
    }
    // Using the addInquiry from the top level useApp hook
    const newInquiry = {
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      ritualType: newOrder.ritualType,
      date: newOrder.date,
      timeSlot: newOrder.timeSlot,
      address: newOrder.address,
      addressDetail: newOrder.addressDetail,
      specialRequests: '관리자 수동 등록',
      customizations: [],
      subtractions: [],
      totalPrice: Number(newOrder.totalPrice),
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status,
      paymentStatus: newOrder.status === 'pending' ? 'pending' : 'paid' as any
    };

    addInquiry(newInquiry);
    
    alert('수동 주문이 성공적으로 추가되었습니다.');
    setIsAddModalOpen(false);
    
    // Reset form
    setNewOrder({
      customerName: '',
      phone: '',
      ritualType: effectiveMenus[0]?.name || FALLBACK_MENUS[0].name,
      date: new Date().toISOString().split('T')[0],
      timeSlot: '오전 10:00 ~ 오후 12:00',
      address: '',
      addressDetail: '',
      paymentMethod: '무통장 입금',
      totalPrice: effectiveMenus[0]?.price || FALLBACK_MENUS[0].price,
      status: 'pending'
    });
  };

  // Filtering & Search
  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.phone.includes(searchTerm) ||
                          item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    // Year/Month logic
    const createdDate = item.createdAt ? item.createdAt.split(' ')[0] : item.date;
    const yearMonth = createdDate.slice(0, 7); // YYYY-MM
    const matchesYearMonth = yearMonthFilter === 'all' || yearMonth === yearMonthFilter;

    // Payment Method logic
    const resolvedMethod = item.paymentMethod || '무통장 입금 (기본)';
    let matchesPayment = true;
    if (paymentMethodFilter !== 'all') {
      if (paymentMethodFilter === 'toss') matchesPayment = resolvedMethod.includes('토스페이');
      else if (paymentMethodFilter === 'card') matchesPayment = resolvedMethod.includes('카드');
      else if (paymentMethodFilter === 'transfer') matchesPayment = resolvedMethod.includes('계좌이체') || resolvedMethod.includes('무통장') || resolvedMethod.includes('은행');
    }

    return matchesSearch && matchesStatus && matchesYearMonth && matchesPayment;
  });

  // Extract unique Year/Month for dropdown
  const uniqueYearMonths = Array.from(new Set(
    inquiries.map(item => {
      const createdDate = item.createdAt ? item.createdAt.split(' ')[0] : item.date;
      return createdDate.slice(0, 7);
    })
  )).sort().reverse();

  // CSV Export logic
  const handleExportCSV = () => {
    const headers = ['주문 번호', '고객명', '연락처', '상차림 종류', '제사 일정', '총 금액', '결제 수단', '진행 상태', '생성일'];
    const rows = filteredInquiries.map(item => [
      item.id,
      item.customerName,
      item.phone,
      item.ritualType,
      `${item.date} ${item.timeSlot}`,
      item.totalPrice.toString(),
      item.paymentMethod || '무통장 입금 (기본)',
      getStatusLabel(item.status),
      item.createdAt || item.date
    ]);

    // Build CSV string with BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hyodream_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const getPaymentMethodBadgeStyle = (method: string | undefined) => {
    const resolvedMethod = method || '토스페이';
    if (resolvedMethod.includes('토스페이')) {
      return {
        color: '#0050FF',
        backgroundColor: '#F2F6FF',
        borderColor: 'rgba(0, 80, 255, 0.15)'
      };
    } else if (resolvedMethod.includes('카드')) {
      return {
        color: '#4F46E5',
        backgroundColor: '#EEF2FF',
        borderColor: 'rgba(79, 70, 229, 0.15)'
      };
    } else if (resolvedMethod.includes('계좌이체') || resolvedMethod.includes('무통장') || resolvedMethod.includes('가상계좌') || resolvedMethod.includes('은행')) {
      return {
        color: '#0D9488',
        backgroundColor: '#F0FDFA',
        borderColor: 'rgba(13, 148, 136, 0.15)'
      };
    } else {
      return {
        color: 'var(--color-primary)',
        backgroundColor: 'var(--color-primary-fade)',
        borderColor: 'rgba(82, 110, 84, 0.15)'
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in-up">
      {/* Filtering Control Bar */}
      <div className="glass-panel" style={{
        padding: '12px 16px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '120px', maxWidth: '300px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            placeholder="고객명, 연락처, 주소 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Filters and Actions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
          {/* Year/Month Dropdown */}
          <select
            value={yearMonthFilter}
            onChange={(e) => setYearMonthFilter(e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              outline: 'none',
              backgroundColor: '#FFF'
            }}
          >
            <option value="all">전체 기간</option>
            {uniqueYearMonths.map(ym => (
              <option key={ym} value={ym}>{ym}</option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              outline: 'none',
              backgroundColor: '#FFF'
            }}
          >
            <option value="all">결제수단</option>
            <option value="toss">토스페이</option>
            <option value="card">카드결제</option>
            <option value="transfer">계좌이체</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              outline: 'none',
              backgroundColor: '#FFF'
            }}
          >
            <option value="all">전체 상태</option>
            <option value="pending">입금대기</option>
            <option value="approved">결제완료</option>
            <option value="processing">배송준비</option>
            <option value="completed">배송완료</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid var(--color-primary)',
              cursor: 'pointer',
              backgroundColor: '#FFF',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition-smooth)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Download size={14} />
            CSV
          </button>

          {/* Add Manual Order Button */}
          <button
            onClick={() => {
              setNewOrder({
                ...newOrder,
                ritualType: baseMenus[0]?.name || '',
                totalPrice: baseMenus[0]?.price || 0
              });
              setIsAddModalOpen(true);
            }}
            className="btn-primary"
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Clipboard size={14} />
            수동 추가
          </button>
          
          {/* Spacer for horizontal scroll cutoff fix */}
          <div style={{ width: '4px', flexShrink: 0 }} />
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
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        color: getPaymentMethodBadgeStyle(item.paymentMethod).color,
                        backgroundColor: getPaymentMethodBadgeStyle(item.paymentMethod).backgroundColor,
                        border: `1px solid ${getPaymentMethodBadgeStyle(item.paymentMethod).borderColor}`
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
                          <Edit3 size={15} />
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
      {selectedInquiry && createPortal(
        <div 
          onClick={() => setSelectedInquiry(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(44, 38, 33, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="glass-panel animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px', width: '100%', maxHeight: '90vh',
              borderRadius: '24px', position: 'relative', border: '2px solid var(--color-primary)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header decoration */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '8px',
              background: 'repeating-linear-gradient(45deg, var(--color-primary), var(--color-primary) 10px, var(--color-gold) 10px, var(--color-gold) 20px)',
              zIndex: 60,
              borderTopLeftRadius: '22px', borderTopRightRadius: '22px'
            }} />

            {/* Close Button - Sticky float top right */}
            <button
              onClick={() => setSelectedInquiry(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', color: 'var(--color-text-sub)',
                zIndex: 50, width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-smooth)',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.color = 'var(--color-text-sub)'; }}
            >
              <X size={16} />
            </button>

            {/* Scrollable container for modal contents */}
            <div className="admin-modal-content">
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
                  <div style={{ display: 'flex', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}><span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>결제 수단</span> <strong style={{ color: getPaymentMethodBadgeStyle(selectedInquiry.paymentMethod).color }}>{selectedInquiry.paymentMethod || '토스페이'}</strong></div>
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
        </div>,
        document.body
      )}
      {/* Add Manual Order Modal */}
      {isAddModalOpen && createPortal(
        <div 
          onClick={() => setIsAddModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(44, 38, 33, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="glass-panel animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px', width: '100%', maxHeight: '90vh',
              borderRadius: '24px', position: 'relative', border: '2px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              backgroundColor: '#FFF'
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="serif-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                수동 주문 추가
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-sub)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="admin-modal-content" style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>고객명</label>
                  <input 
                    type="text" 
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                    placeholder="홍길동"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>연락처</label>
                  <input 
                    type="text" 
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                    placeholder="010-0000-0000"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>상차림 종류</label>
                  <select 
                    value={newOrder.ritualType}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const selectedMenu = effectiveMenus.find(m => m.name === selectedName);
                      setNewOrder({
                        ...newOrder, 
                        ritualType: selectedName,
                        totalPrice: selectedMenu ? selectedMenu.price : newOrder.totalPrice
                      });
                    }}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  >
                    {effectiveMenus.map(menu => (
                      <option key={menu.id} value={menu.name}>{menu.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>제사 일정</label>
                  <input 
                    type="date" 
                    value={newOrder.date}
                    onChange={(e) => setNewOrder({...newOrder, date: e.target.value})}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>시간대</label>
                  <select 
                    value={newOrder.timeSlot}
                    onChange={(e) => setNewOrder({...newOrder, timeSlot: e.target.value})}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  >
                    <option value="오전 10:00 ~ 오후 12:00">오전 10:00 ~ 오후 12:00</option>
                    <option value="오후 3:00 ~ 오후 5:00">오후 3:00 ~ 오후 5:00</option>
                    <option value="저녁 7:00 ~ 저녁 9:00">저녁 7:00 ~ 저녁 9:00</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>배송지 주소</label>
                  <input 
                    type="text" 
                    value={newOrder.address}
                    onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                    placeholder="서울시 강남구..."
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                  <input 
                    type="text" 
                    value={newOrder.addressDetail}
                    onChange={(e) => setNewOrder({...newOrder, addressDetail: e.target.value})}
                    placeholder="상세 주소"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>결제 수단</label>
                  <select 
                    value={newOrder.paymentMethod}
                    onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  >
                    <option value="무통장 입금">무통장 입금</option>
                    <option value="카드 결제">카드 결제</option>
                    <option value="토스페이">토스페이</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>총 결제 금액</label>
                  <input 
                    type="number" 
                    value={newOrder.totalPrice}
                    onChange={(e) => setNewOrder({...newOrder, totalPrice: Number(e.target.value)})}
                    placeholder="250000"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: '#FFF', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleAddNewOrder}
                  className="btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  주문 추가
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
