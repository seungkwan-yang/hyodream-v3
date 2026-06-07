import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Receipt, Coins, LogOut, MessageSquareText, Pencil, Save, Star, X, Camera, Trash2, RefreshCw } from 'lucide-react';
import { RegisterForm } from './RegisterForm';

interface MyReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  title?: string;
  content: string;
  packageType: string;
  imageUrl?: string | null;
  adminReply?: string | null;
  userId?: string | null;
}

export const MyPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCustomerTab } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState({
    title: '',
    content: '',
    packageType: '',
    rating: 5,
    imageUrl: ''
  });
  const [reviewSaveError, setReviewSaveError] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setCustomerTab('login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/users/${currentUser.username}/orders`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, setCustomerTab]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerTab('home');
  };

  const handleUpdateSuccess = (updatedData: any) => {
    setCurrentUser(updatedData);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(`/api/users/${currentUser.username}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to fetch user reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

  const startEditReview = (review: MyReview) => {
    setEditingReviewId(review.id);
    setReviewDraft({
      title: review.title || '',
      content: review.content,
      packageType: review.packageType,
      rating: review.rating,
      imageUrl: review.imageUrl || ''
    });
    setReviewSaveError(null);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setReviewSaveError(null);
  };

  const handleSaveReview = async (reviewId: number) => {
    if (!currentUser) return;
    if (!reviewDraft.title.trim()) {
      setReviewSaveError('후기 제목을 입력해 주세요.');
      return;
    }
    if (reviewDraft.content.trim().length < 10) {
      setReviewSaveError('후기 내용을 10자 이상 입력해 주세요.');
      return;
    }

    try {
      setIsSavingReview(true);
      setReviewSaveError(null);
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.username,
          rating: reviewDraft.rating,
          title: reviewDraft.title.trim(),
          content: reviewDraft.content.trim(),
          packageType: reviewDraft.packageType,
          imageUrl: reviewDraft.imageUrl || null
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || '후기 수정에 실패했습니다.');
      }

      const updated = await response.json();
      setReviews(prev => prev.map(review => review.id === reviewId ? updated : review));
      setEditingReviewId(null);
    } catch (err) {
      setReviewSaveError(err instanceof Error ? err.message : '후기 수정 중 문제가 발생했습니다.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleReviewImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.test(ext) || !allowedTypes.test(file.type)) {
      setReviewSaveError('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp, avif)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReviewSaveError('파일 용량은 최대 10MB까지 가능합니다.');
      return;
    }

    try {
      setIsUploadingReviewImage(true);
      setReviewSaveError(null);
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || '이미지 업로드에 실패했습니다.');
      setReviewDraft(prev => ({ ...prev, imageUrl: payload.url }));
    } catch (err) {
      setReviewSaveError(err instanceof Error ? err.message : '이미지 업로드 중 문제가 발생했습니다.');
    } finally {
      setIsUploadingReviewImage(false);
    }
  };

  const renderReviewImageEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text-main)' }}>후기 이미지</span>
      {reviewDraft.imageUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <img src={reviewDraft.imageUrl} alt="후기 이미지 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={() => setReviewDraft(prev => ({ ...prev, imageUrl: '' }))}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 10px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'rgba(227, 176, 152, 0.95)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Trash2 size={13} /> 제거
          </button>
        </div>
      ) : (
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          borderRadius: '12px',
          border: '2px dashed var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          cursor: isUploadingReviewImage ? 'not-allowed' : 'pointer',
          padding: '18px',
          textAlign: 'center'
        }}>
          <input type="file" accept="image/*" onChange={handleReviewImageUpload} disabled={isUploadingReviewImage} style={{ display: 'none' }} />
          {isUploadingReviewImage ? (
            <>
              <RefreshCw size={24} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', fontWeight: 700 }}>이미지 업로드 중...</span>
            </>
          ) : (
            <>
              <Camera size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--color-text-sub)', fontWeight: 800 }}>이미지 추가하기</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>jpg, png, gif, webp, avif / 최대 10MB</span>
            </>
          )}
        </label>
      )}
      {reviewDraft.imageUrl && (
        <label className="btn-secondary" style={{ justifyContent: 'center', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', cursor: isUploadingReviewImage ? 'not-allowed' : 'pointer' }}>
          <input type="file" accept="image/*" onChange={handleReviewImageUpload} disabled={isUploadingReviewImage} style={{ display: 'none' }} />
          <Camera size={14} /> {isUploadingReviewImage ? '변경 중' : '이미지 변경'}
        </label>
      )}
    </div>
  );

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto' }} className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <h2 className="serif-font" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          <User size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
          마이페이지
        </h2>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
          <LogOut size={16} style={{ marginRight: '6px' }} /> 로그아웃
        </button>
      </div>

      {/* Points Card (Top) */}
      <div className="premium-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '50%' }}>
            <Coins size={40} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#666', marginBottom: '4px' }}>나의 보유 포인트</h3>
            <p style={{ fontSize: '0.9rem', color: '#999', margin: 0 }}>결제 금액의 1%가 적립됩니다.</p>
          </div>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', textAlign: 'right' }}>
          {currentUser.points.toLocaleString()} <span style={{ fontSize: '1.2rem', color: '#888' }}>P</span>
        </div>
      </div>

      {/* User Info Card (Bottom) */}
      <div className="premium-card wizard-card" style={{ marginBottom: '40px', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>회원 정보</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>정보 수정</button>
          )}
        </div>
        
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '1.05rem' }}>
            <strong style={{ color: '#555' }}>이름</strong> <span style={{ color: '#222' }}>{currentUser.name}</span>
            <strong style={{ color: '#555' }}>아이디</strong> <span style={{ color: '#222' }}>{currentUser.username}</span>
            <strong style={{ color: '#555' }}>이메일</strong> <span style={{ color: '#222' }}>{currentUser.email || '등록 안 됨'}</span>
            <strong style={{ color: '#555' }}>연락처</strong> <span style={{ color: '#222' }}>{currentUser.hp}</span>
            <strong style={{ color: '#555' }}>주소</strong> 
            <span style={{ color: '#222', lineHeight: '1.5' }}>
              {currentUser.address1 ? `(${currentUser.zip}) ${currentUser.address1} ${currentUser.address2 || ''}` : '등록 안 됨'}
            </span>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <RegisterForm 
              isEditMode={true} 
              initialData={currentUser} 
              onSuccess={handleUpdateSuccess} 
              onCancel={() => setIsEditing(false)} 
            />
          </div>
        )}
      </div>

      {/* My Reviews */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareText size={22} style={{ color: 'var(--color-primary)' }} />
          내가 작성한 후기
        </h3>

        {reviewsLoading ? (
          <p>작성한 후기를 불러오는 중입니다...</p>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
            아직 작성한 후기가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {reviews.map(review => {
              const isReviewEditing = editingReviewId === review.id;
              return (
                <article key={review.id} className="premium-card" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {isReviewEditing ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <select
                          value={reviewDraft.rating}
                          onChange={(event) => setReviewDraft(prev => ({ ...prev, rating: Number(event.target.value) }))}
                          style={{ maxWidth: '140px' }}
                        >
                          {[5, 4, 3, 2, 1].map(value => (
                            <option key={value} value={value}>{value}점</option>
                          ))}
                        </select>
                        <button onClick={cancelEditReview} className="btn-text" style={{ fontSize: '0.85rem' }}>
                          <X size={15} /> 취소
                        </button>
                      </div>
                      <input
                        type="text"
                        value={reviewDraft.title}
                        onChange={(event) => setReviewDraft(prev => ({ ...prev, title: event.target.value }))}
                        placeholder="후기 제목"
                      />
                      <input
                        type="text"
                        value={reviewDraft.packageType}
                        onChange={(event) => setReviewDraft(prev => ({ ...prev, packageType: event.target.value }))}
                        placeholder="이용 상품"
                      />
                      <textarea
                        value={reviewDraft.content}
                        onChange={(event) => setReviewDraft(prev => ({ ...prev, content: event.target.value }))}
                        rows={5}
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                        placeholder="후기 내용"
                      />
                      {renderReviewImageEditor()}
                      {reviewSaveError && (
                        <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(227, 176, 152, 0.15)', border: '1px solid var(--color-rose)', color: '#A04E3A', fontSize: '0.82rem', fontWeight: 700 }}>
                          {reviewSaveError}
                        </div>
                      )}
                      <button
                        onClick={() => handleSaveReview(review.id)}
                        disabled={isSavingReview || isUploadingReviewImage}
                        className="btn-primary"
                        style={{ justifyContent: 'center', padding: '12px 16px', borderRadius: '10px', boxShadow: 'none' }}
                      >
                        <Save size={16} /> {isSavingReview ? '저장 중' : '수정 저장'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', marginBottom: '6px' }}>
                            {Array.from({ length: review.rating }).map((_, index) => (
                              <Star key={index} size={14} style={{ fill: 'var(--color-gold)' }} />
                            ))}
                          </div>
                          <h4 style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: '4px' }}>{review.title || '제목 없는 후기'}</h4>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{review.date} · {review.packageType}</span>
                        </div>
                        <button onClick={() => startEditReview(review)} className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', flexShrink: 0 }}>
                          <Pencil size={14} /> 수정
                        </button>
                      </div>
                      {review.imageUrl && (
                        <img src={review.imageUrl} alt="내 후기 이미지" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                      )}
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{review.content}</p>
                      {review.adminReply && (
                        <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--color-primary-fade)', border: '1px solid var(--border-color)' }}>
                          <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: '0.78rem', marginBottom: '4px' }}>효드림 답변</strong>
                          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.84rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{review.adminReply}</p>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={22} style={{ color: 'var(--color-primary)' }} />
          나의 주문 내역
        </h3>
        
        {loading ? (
          <p>주문 내역을 불러오는 중입니다...</p>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
            주문 내역이 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', fontWeight: 600 }}>주문일시</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>주문상품</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>결제금액</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>적립포인트</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: '#666', fontSize: '0.9rem' }}>{order.createdAt}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{order.ritualType}</td>
                    <td style={{ padding: '16px' }}>{order.totalPrice.toLocaleString()}원</td>
                    <td style={{ padding: '16px', color: 'var(--color-primary)', fontWeight: 600 }}>+{order.pointsEarned?.toLocaleString() || 0} P</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: order.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                        color: order.status === 'completed' ? '#166534' : '#92400E'
                      }}>
                        {order.status === 'pending' ? '접수대기' :
                         order.status === 'approved' ? '예약확정' :
                         order.status === 'processing' ? '준비중' : '완료'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
