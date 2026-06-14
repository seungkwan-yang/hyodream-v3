import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MessageSquareReply, RefreshCw, Save, Search, Star, Trash2, X } from 'lucide-react';

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
  reviewHidden?: boolean;
  userId?: string | null;
}

interface ReviewPage {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const truncate = (value: string | undefined | null, length = 80) => {
  if (!value) return '';
  return value.length > length ? `${value.slice(0, length)}...` : value;
};

export const ReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        admin: '1',
        page: String(page),
        pageSize: String(pageSize),
      });
      if (searchTerm.trim()) params.set('q', searchTerm.trim());

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (!response.ok) throw new Error('리뷰 목록을 불러오지 못했습니다.');
      const data: ReviewPage = await response.json();
      setReviews(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
      if (data.page !== page) setPage(data.page);
    } catch (err) {
      console.error('[HyoDream Admin] Failed to load reviews:', err);
      alert('리뷰 목록을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize, searchTerm]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return '0건';
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    return `${start.toLocaleString()}-${end.toLocaleString()} / ${total.toLocaleString()}건`;
  }, [page, pageSize, total]);

  const openReview = (review: Review) => {
    setSelectedReview(review);
    setReplyDraft(review.adminReply || '');
  };

  const updateReviewInList = (updated: Review) => {
    setReviews(prev => prev.map(review => review.id === updated.id ? updated : review));
    setSelectedReview(updated);
    setReplyDraft(updated.adminReply || '');
  };

  const saveReply = async (nextReply = replyDraft) => {
    if (!selectedReview) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/reviews/${selectedReview.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply: nextReply.trim() || null,
        })
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || '댓글 저장에 실패했습니다.');
      }
      const updated: Review = await response.json();
      updateReviewInList(updated);
    } catch (err) {
      console.error('[HyoDream Admin] Failed to save review reply:', err);
      alert(err instanceof Error ? err.message : '관리자 댓글 저장 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const setReviewVisibility = async (reviewHidden: boolean) => {
    if (!selectedReview) return;
    if (reviewHidden && !window.confirm('이 리뷰를 고객 화면에서 숨길까요? 관리자 화면에는 계속 표시됩니다.')) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/reviews/${selectedReview.id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewHidden })
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || '리뷰 표시 상태 변경에 실패했습니다.');
      }
      const updated: Review = await response.json();
      updateReviewInList(updated);
    } catch (err) {
      console.error('[HyoDream Admin] Failed to update review visibility:', err);
      alert(err instanceof Error ? err.message : '리뷰 표시 상태 변경 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const deleteReply = async () => {
    if (!selectedReview) return;
    if (!window.confirm('관리자 댓글을 삭제할까요? 후기는 그대로 유지됩니다.')) return;
    await saveReply('');
  };

  const deleteReview = async (review: Review) => {
    if (!window.confirm(`${review.name}님의 후기를 삭제할까요? 삭제된 후기는 고객 화면에서도 보이지 않습니다.`)) return;

    try {
      setDeletingId(review.id);
      const response = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('후기 삭제에 실패했습니다.');
      setReviews(prev => prev.filter(item => item.id !== review.id));
      setTotal(prev => Math.max(0, prev - 1));
      if (selectedReview?.id === review.id) setSelectedReview(null);
      if (reviews.length === 1 && page > 1) setPage(prev => prev - 1);
    } catch (err) {
      console.error('[HyoDream Admin] Failed to delete review:', err);
      alert('후기 삭제 중 문제가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="glass-panel admin-review-toolbar" style={{ padding: '16px 18px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="작성자, 상품, 후기 내용, 관리자 댓글 검색"
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '40px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--color-text-main)',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          />
        </div>
        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          style={{ height: '42px', borderRadius: '10px', maxWidth: '120px', fontSize: '0.85rem' }}
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>{size}개씩</option>
          ))}
        </select>
        <button
          onClick={fetchReviews}
          className="btn-secondary"
          style={{ padding: '10px 14px', borderRadius: '10px', flexShrink: 0 }}
        >
          <RefreshCw size={16} /> 새로고침
        </button>
      </div>

      <div className="premium-card" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-main)' }}>후기 목록</strong>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{rangeLabel}</span>
        </div>

        <div className="admin-review-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>ID</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>평점</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>작성자</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>상품</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>후기</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>관리자 댓글</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '46px 20px', textAlign: 'center', color: 'var(--color-text-sub)', fontWeight: 700 }}>
                    고객 후기를 불러오는 중입니다...
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map(review => (
                  <tr
                    key={review.id}
                    onClick={() => openReview(review)}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 800 }}>#{review.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)', fontWeight: 800 }}>
                        <Star size={14} style={{ fill: 'var(--color-gold)' }} /> {review.rating}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.86rem', fontWeight: 700 }}>{review.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.84rem', color: 'var(--color-text-sub)' }}>{truncate(review.packageType, 30)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.86rem' }}>
                      <strong style={{ display: 'block', marginBottom: '3px' }}>{truncate(review.title || '제목 없는 후기', 36)}</strong>
                      <span style={{ color: 'var(--color-text-muted)' }}>{truncate(review.content, 64)}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                      {review.reviewHidden ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-rose)', fontWeight: 800 }}>
                          <EyeOff size={14} />
                          후기 숨김
                        </span>
                      ) : review.adminReply ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)', fontWeight: 800 }}>
                          <MessageSquareReply size={14} />
                          댓글 있음
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>없음</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{review.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '46px 20px', textAlign: 'center', color: 'var(--color-text-sub)', fontWeight: 700 }}>
                    검색 조건에 맞는 후기가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-review-mobile-list">
          {loading ? (
            <div style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--color-text-sub)', fontWeight: 700 }}>
              고객 후기를 불러오는 중입니다...
            </div>
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <article
                key={review.id}
                onClick={() => openReview(review)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--color-primary)', fontSize: '0.76rem', fontWeight: 800, marginBottom: '4px' }}>
                      #{review.id} · {review.date}
                    </div>
                    <h3 style={{ fontSize: '0.98rem', lineHeight: 1.35, marginBottom: '4px' }}>
                      {review.title || '제목 없는 후기'}
                    </h3>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                      {review.name} · {truncate(review.packageType, 28)}
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)', fontWeight: 900, flexShrink: 0 }}>
                    <Star size={14} style={{ fill: 'var(--color-gold)' }} /> {review.rating}
                  </span>
                </div>

                <p style={{ color: 'var(--color-text-sub)', fontSize: '0.84rem', lineHeight: 1.55 }}>
                  {truncate(review.content, 96)}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {review.reviewHidden && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-rose)', fontSize: '0.76rem', fontWeight: 800 }}>
                      <EyeOff size={13} /> 후기 숨김
                    </span>
                  )}
                  {review.adminReply && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.76rem', fontWeight: 800 }}>
                      <MessageSquareReply size={13} /> 댓글 있음
                    </span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--color-text-sub)', fontWeight: 700 }}>
              검색 조건에 맞는 후기가 없습니다.
            </div>
          )}
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            {page.toLocaleString()} / {totalPages.toLocaleString()} 페이지
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem' }}
            >
              <ChevronLeft size={15} /> 이전
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem' }}
            >
              다음 <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {selectedReview && (
        <div
          onClick={() => setSelectedReview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(44, 38, 33, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="glass-panel animate-fade-in-up"
            style={{
              width: '100%',
              maxWidth: '760px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-color)'
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)', marginBottom: '8px' }}>
                  {Array.from({ length: selectedReview.rating }).map((_, index) => (
                    <Star key={index} size={15} style={{ fill: 'var(--color-gold)' }} />
                  ))}
                </div>
                <h2 style={{ fontSize: '1.15rem', lineHeight: 1.35, marginBottom: '6px' }}>{selectedReview.title || '제목 없는 후기'}</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span>#{selectedReview.id}</span>
                  <span>{selectedReview.name}</span>
                  <span>{selectedReview.date}</span>
                  <span>{selectedReview.packageType}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {selectedReview.imageUrl && (
                <img src={selectedReview.imageUrl} alt="후기 이미지" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border-color)' }} />
              )}

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-main)' }}>후기 내용</strong>
                <p style={{ color: 'var(--color-text-sub)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{selectedReview.content}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <label htmlFor="admin-review-reply" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  <MessageSquareReply size={16} /> 관리자 댓글
                  {selectedReview.reviewHidden && (
                    <span style={{ color: 'var(--color-rose)', fontSize: '0.76rem' }}>후기 숨김 상태</span>
                  )}
                </label>
                <textarea
                  id="admin-review-reply"
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="고객 화면에 표시될 댓글을 입력하세요."
                  rows={6}
                  style={{ resize: 'vertical', minHeight: '140px', lineHeight: 1.6 }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedReview.reviewHidden ? (
                  <button
                    onClick={() => setReviewVisibility(false)}
                    disabled={saving}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', borderRadius: '10px', boxShadow: 'none' }}
                  >
                    <Eye size={15} /> 후기 표시
                  </button>
                ) : (
                  <button
                    onClick={() => setReviewVisibility(true)}
                    disabled={saving}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', borderRadius: '10px', boxShadow: 'none' }}
                  >
                    <EyeOff size={15} /> 후기 숨김
                  </button>
                )}
                <button
                  onClick={() => deleteReview(selectedReview)}
                  disabled={deletingId === selectedReview.id || saving}
                  className="btn-secondary"
                  style={{ padding: '10px 14px', borderRadius: '10px', color: 'var(--color-rose)', borderColor: 'var(--color-rose)', boxShadow: 'none' }}
                >
                  <Trash2 size={15} /> {deletingId === selectedReview.id ? '삭제 중' : '후기 삭제'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={deleteReply}
                  disabled={saving || !selectedReview.adminReply}
                  className="btn-secondary"
                  style={{ padding: '10px 14px', borderRadius: '10px', boxShadow: 'none' }}
                >
                  <Trash2 size={15} /> 댓글 삭제
                </button>
                <button
                  onClick={() => saveReply()}
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '10px 14px', borderRadius: '10px', boxShadow: 'none' }}
                >
                  <Save size={15} /> {saving ? '저장 중' : '댓글 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
