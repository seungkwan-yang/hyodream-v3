import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Calendar, CheckCircle, Clock, MapPin, Save, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Inquiry, InquiryStatus } from '../context/AppContext';

interface OrderEditorModalProps {
  order: Inquiry;
  onClose: () => void;
}

const statusOptions: InquiryStatus[] = ['pending', 'approved', 'processing', 'completed', 'cancelled'];

const getStatusLabel = (status: InquiryStatus) => {
  switch (status) {
    case 'pending': return '접수/입금대기';
    case 'approved': return '결제완료';
    case 'processing': return '배송준비';
    case 'completed': return '배송완료';
    case 'cancelled': return '주문취소';
  }
};

const getStatusIcon = (status: InquiryStatus) => {
  switch (status) {
    case 'pending': return <Clock size={14} />;
    case 'approved': return <CheckCircle size={14} />;
    case 'processing': return <Truck size={14} />;
    case 'completed': return <Award size={14} />;
    case 'cancelled': return <X size={14} />;
  }
};

const getPaymentStatusLabel = (status: Inquiry['paymentStatus']) => {
  switch (status) {
    case 'paid': return '결제완료';
    case 'cancelled': return '결제취소';
    default: return '결제대기';
  }
};

const syncStatusFromPayment = (paymentStatus: Inquiry['paymentStatus'], status?: InquiryStatus): InquiryStatus | undefined => {
  if (paymentStatus === 'cancelled') return 'cancelled';
  if (paymentStatus === 'paid' && (!status || status === 'pending' || status === 'cancelled')) return 'approved';
  if (paymentStatus === 'pending') return 'pending';
  return status;
};

const syncPaymentFromStatus = (status: InquiryStatus, paymentStatus?: Inquiry['paymentStatus']): Inquiry['paymentStatus'] => {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'pending') return 'pending';
  return paymentStatus === 'cancelled' || !paymentStatus ? 'paid' : paymentStatus;
};

export const OrderEditorModal: React.FC<OrderEditorModalProps> = ({ order, onClose }) => {
  const { updateInquiry, deleteInquiry } = useApp();
  const [draft, setDraft] = useState<Partial<Inquiry>>({ ...order });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft({ ...order });
  }, [order]);

  const saveOrder = async () => {
    const totalPrice = Number(draft.totalPrice || 0);
    if (!draft.customerName?.trim()) return alert('고객명을 입력해 주세요.');
    if (!draft.phone?.trim()) return alert('연락처를 입력해 주세요.');
    if (!draft.ritualType?.trim()) return alert('주문상품을 입력해 주세요.');
    if (Number.isNaN(totalPrice) || totalPrice < 0) return alert('결제금액을 올바르게 입력해 주세요.');

    setIsSaving(true);
    const saved = await updateInquiry(order.id, {
      ...draft,
      totalPrice,
      pointsEarned: Math.floor(totalPrice * 0.01)
    });
    setIsSaving(false);

    if (!saved) {
      alert('주문 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    onClose();
  };

  const removeOrder = () => {
    if (!window.confirm(`${order.customerName}님의 주문 ${order.id}을 삭제할까요? 삭제된 주문 이력은 복구할 수 없습니다.`)) return;
    deleteInquiry(order.id);
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(44, 38, 33, 0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '760px', width: '100%', maxHeight: '90vh',
          borderRadius: '24px', position: 'relative', border: '2px solid var(--border-color)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div>
            <h2 className="serif-font" style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={22} style={{ color: 'var(--color-primary)' }} />
              주문 상세 편집
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', color: 'var(--color-text-sub)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <span>주문번호: {order.id}</span>
              <span className={`badge badge-${draft.status || order.status}`} style={{ gap: '4px', padding: '4px 8px', fontSize: '0.72rem' }}>
                {getStatusIcon((draft.status || order.status) as InquiryStatus)}
                {getStatusLabel((draft.status || order.status) as InquiryStatus)}
              </span>
              <span>{getPaymentStatusLabel(draft.paymentStatus || order.paymentStatus)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', color: 'var(--color-text-sub)',
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-content" style={{ padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="responsive-form-grid-1-1">
              <input type="text" value={draft.customerName || ''} onChange={(e) => setDraft(prev => ({ ...prev, customerName: e.target.value }))} placeholder="고객명" />
              <input type="tel" value={draft.phone || ''} onChange={(e) => setDraft(prev => ({ ...prev, phone: e.target.value }))} placeholder="연락처" />
            </div>
            <input type="text" value={draft.ritualType || ''} onChange={(e) => setDraft(prev => ({ ...prev, ritualType: e.target.value }))} placeholder="주문상품" />
            <div className="responsive-form-grid-1-1">
              <input type="date" value={draft.date || ''} onChange={(e) => setDraft(prev => ({ ...prev, date: e.target.value }))} />
              <input type="text" value={draft.timeSlot || ''} onChange={(e) => setDraft(prev => ({ ...prev, timeSlot: e.target.value }))} placeholder="배송 시간" />
            </div>
            <div className="responsive-form-grid-1-1">
              <select
                value={draft.status || 'pending'}
                onChange={(e) => {
                  const nextStatus = e.target.value as InquiryStatus;
                  setDraft(prev => ({
                    ...prev,
                    status: nextStatus,
                    paymentStatus: syncPaymentFromStatus(nextStatus, prev.paymentStatus)
                  }));
                }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                ))}
              </select>
              <select
                value={draft.paymentStatus || 'pending'}
                onChange={(e) => {
                  const nextPaymentStatus = e.target.value as Inquiry['paymentStatus'];
                  setDraft(prev => ({
                    ...prev,
                    paymentStatus: nextPaymentStatus,
                    status: syncStatusFromPayment(nextPaymentStatus, prev.status)
                  }));
                }}
              >
                <option value="pending">결제대기</option>
                <option value="paid">결제완료</option>
                <option value="cancelled">결제취소</option>
              </select>
            </div>
            <div className="responsive-form-grid-1-1">
              <input type="number" value={draft.totalPrice ?? 0} onChange={(e) => setDraft(prev => ({ ...prev, totalPrice: Number(e.target.value) }))} placeholder="결제금액" />
              <input type="text" value={draft.paymentMethod || ''} onChange={(e) => setDraft(prev => ({ ...prev, paymentMethod: e.target.value }))} placeholder="결제수단" />
            </div>
            <input type="text" value={draft.address || ''} onChange={(e) => setDraft(prev => ({ ...prev, address: e.target.value }))} placeholder="주소" />
            <input type="text" value={draft.addressDetail || ''} onChange={(e) => setDraft(prev => ({ ...prev, addressDetail: e.target.value }))} placeholder="상세 주소" />
            <textarea value={draft.specialRequests || ''} onChange={(e) => setDraft(prev => ({ ...prev, specialRequests: e.target.value }))} rows={3} placeholder="고객 요청사항" style={{ resize: 'vertical', lineHeight: 1.6 }} />
            <textarea value={draft.adminNotes || ''} onChange={(e) => setDraft(prev => ({ ...prev, adminNotes: e.target.value }))} rows={3} placeholder="관리자 메모" style={{ resize: 'vertical', lineHeight: 1.6 }} />

            <div style={{ padding: '14px 16px', borderRadius: '12px', border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-sub)', fontSize: '0.82rem', fontWeight: 700 }}>
                <MapPin size={14} /> 배송지
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-main)' }}>{draft.address || '-'} {draft.addressDetail || ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-sub)', fontSize: '0.82rem', fontWeight: 700, marginTop: '4px' }}>
                <Calendar size={14} /> 주문/일정
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-main)' }}>{order.createdAt || order.date} 주문 / {draft.date || '-'} {draft.timeSlot || ''}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
          <button onClick={removeOrder} className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', color: 'var(--color-rose)', borderColor: 'var(--color-rose)' }}>
            <Trash2 size={14} /> 삭제
          </button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={onClose} disabled={isSaving} className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem' }}>
              <X size={14} /> 취소
            </button>
            <button onClick={saveOrder} disabled={isSaving} className="btn-primary" style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', boxShadow: 'none' }}>
              <Save size={14} /> {isSaving ? '저장 중' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
