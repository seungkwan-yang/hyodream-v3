import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquareReply, RefreshCw, Save, Search, Star, Trash2 } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title?: string;
  content: string;
  packageType: string;
  imageUrl?: string;
  adminReply?: string | null;
}

export const ReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('리뷰 목록을 불러오지 못했습니다.');
      const data: Review[] = await response.json();
      setReviews(data);
      setReplyDrafts(
        data.reduce<Record<number, string>>((acc, review) => {
          acc[review.id] = review.adminReply || '';
          return acc;
        }, {})
      );
    } catch (err) {
      console.error('[HyoDream Admin] Failed to load reviews:', err);
      alert('리뷰 목록을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return reviews;
    return reviews.filter(review =>
      [review.name, review.title, review.content, review.packageType, review.adminReply]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(keyword))
    );
  }, [reviews, searchTerm]);

  const handleSaveReply = async (reviewId: number) => {
    try {
      setSavingId(reviewId);
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyDrafts[reviewId]?.trim() || null })
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || '댓글 저장에 실패했습니다.');
      }
      const updated: Review = await response.json();
      setReviews(prev => prev.map(review => review.id === reviewId ? updated : review));
      setReplyDrafts(prev => ({ ...prev, [reviewId]: updated.adminReply || '' }));
    } catch (err) {
      console.error('[HyoDream Admin] Failed to save review reply:', err);
      alert(err instanceof Error ? err.message : '관리자 댓글 저장 중 문제가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteReview = async (review: Review) => {
    if (!window.confirm(`${review.name}님의 후기를 삭제할까요? 삭제된 후기는 고객 화면에서도 보이지 않습니다.`)) {
      return;
    }

    try {
      setDeletingId(review.id);
      const response = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('후기 삭제에 실패했습니다.');
      setReviews(prev => prev.filter(item => item.id !== review.id));
      setReplyDrafts(prev => {
        const next = { ...prev };
        delete next[review.id];
        return next;
      });
    } catch (err) {
      console.error('[HyoDream Admin] Failed to delete review:', err);
      alert('후기 삭제 중 문제가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '48px', borderRadius: '20px', textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
        <span style={{ color: 'var(--color-text-sub)', fontWeight: 700 }}>고객 후기를 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="작성자, 상품, 후기 내용, 관리자 댓글 검색"
            style={{
              width: '100%',
              height: '46px',
              paddingLeft: '40px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--color-text-main)',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          />
        </div>
        <button
          onClick={fetchReviews}
          className="btn-secondary"
          style={{ padding: '11px 16px', borderRadius: '10px', flexShrink: 0 }}
        >
          <RefreshCw size={16} /> 새로고침
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredReviews.map(review => (
          <article key={review.id} className="premium-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {review.imageUrl && (
                <img src={review.imageUrl} alt="후기 이미지" style={{ width: '76px', height: '76px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)', marginBottom: '6px' }}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={14} style={{ fill: 'var(--color-gold)' }} />
                  ))}
                </div>
                <h3 style={{ fontSize: '1rem', lineHeight: 1.35, marginBottom: '4px' }}>
                  {review.title || '제목 없는 후기'}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                  <span>{review.name}</span>
                  <span>{review.date}</span>
                  <span>{review.packageType}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-sub)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {review.content}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor={`admin-reply-${review.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                <MessageSquareReply size={15} /> 관리자 댓글
              </label>
              <textarea
                id={`admin-reply-${review.id}`}
                value={replyDrafts[review.id] || ''}
                onChange={(event) => setReplyDrafts(prev => ({ ...prev, [review.id]: event.target.value }))}
                placeholder="고객 화면에 표시될 댓글을 입력하세요."
                rows={4}
                style={{ resize: 'vertical', minHeight: '96px', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDeleteReview(review)}
                disabled={deletingId === review.id}
                className="btn-secondary"
                style={{ padding: '10px 14px', borderRadius: '10px', color: 'var(--color-rose)', borderColor: 'var(--color-rose)', boxShadow: 'none' }}
              >
                <Trash2 size={15} /> {deletingId === review.id ? '삭제 중' : '삭제'}
              </button>
              <button
                onClick={() => handleSaveReply(review.id)}
                disabled={savingId === review.id}
                className="btn-primary"
                style={{ padding: '10px 14px', borderRadius: '10px', boxShadow: 'none' }}
              >
                <Save size={15} /> {savingId === review.id ? '저장 중' : '댓글 저장'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="glass-panel" style={{ padding: '40px 20px', borderRadius: '18px', textAlign: 'center', color: 'var(--color-text-sub)', fontWeight: 700 }}>
          검색 조건에 맞는 후기가 없습니다.
        </div>
      )}
    </div>
  );
};
