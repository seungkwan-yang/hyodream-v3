import React, { useState, useEffect } from 'react';
import { Star, Award, CheckCircle2, Heart } from 'lucide-react';

interface Review {
  id?: number;
  name: string;
  rating: number;
  date: string;
  title?: string;
  content: string;
  packageType: string;
  imageUrl?: string;
}

interface ReviewsProps {
  limit?: number; // If provided, show only the latest N reviews in preview mode
}

export const Reviews: React.FC<ReviewsProps> = ({ limit }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sorting and Pagination states (for PC)
  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Pagination loading state (for Mobile)
  const [visibleMobileCount, setVisibleMobileCount] = useState<number>(10);

  const isMounted = React.useRef(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Scroll smoothly to PC reviews list top when page number or sort configuration changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const listTop = document.getElementById('pc-reviews-list-top');
    if (listTop) {
      const elementPosition = listTop.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 100; // Offset slightly for sticky header
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentPage, sortBy, sortOrder]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews from database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'rating' | 'date') => {
    setCurrentPage(1);
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 1. Featured Top 3 Reviews for PC (highest rated, then newest)
  const sortedForFeatured = [...reviews].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const featuredReviews = sortedForFeatured.slice(0, 3);

  // 2. Remaining reviews (excluding featured 3 to avoid duplicates on screen)
  const remainingReviews = reviews.filter(
    rev => !featuredReviews.some(feat => feat.name === rev.name && feat.date === rev.date)
  );

  // 3. Dynamic sorting of the remaining reviews list
  const sortedRemaining = [...remainingReviews].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'rating') {
      comparison = a.rating - b.rating;
    } else {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 4. Paginate remaining reviews (10 items per page)
  const totalPages = Math.ceil(sortedRemaining.length / ITEMS_PER_PAGE);
  const paginatedRemaining = sortedRemaining.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 5. Slice mobile reviews based on mobile paging state
  const mobilePaginatedReviews = reviews.slice(0, visibleMobileCount);


  // Latest N reviews sorted by date (for preview/home mode)
  const latestReviews = [...reviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit ?? reviews.length);

  // ── Preview mode: compact 3-card grid, no pagination or sort controls ──
  if (limit !== undefined) {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      );
    }
    return (
      <div className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(197, 155, 39, 0.1)', padding: '6px 14px', borderRadius: '20px', color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
            <Heart size={14} style={{ fill: 'var(--color-gold)' }} />
            최근 고객 후기
          </div>
          <h2 className="serif-font" style={{ fontSize: '1.7rem', fontWeight: 800 }}>효드림을 이용하신 가족들의 후기</h2>
          <div className="korean-divider" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {latestReviews.map((rev, idx) => (
            <div key={idx} className="premium-card korean-border-box" style={{ padding: '28px 24px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '240px', border: '1.5px solid var(--color-gold)' }}>
              <div>
                <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)', marginBottom: '12px' }}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={15} style={{ fill: 'var(--color-gold)' }} />
                  ))}
                </div>
                {rev.imageUrl && (
                  <div style={{ width: '100%', height: '130px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                    <img src={rev.imageUrl} alt="포토 후기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {rev.title && (
                  <h4 style={{ fontSize: '0.93rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', lineHeight: 1.4 }}>{rev.title}</h4>
                )}
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-sub)', lineHeight: 1.6, fontStyle: 'italic' }}>"{rev.content}"</p>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.73rem' }}>주문상품: {rev.packageType}</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', fontWeight: 600 }}>정갈한 후기를 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }} className="animate-fade-in-up">
      {/* Title area (Shared) */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(197, 155, 39, 0.1)',
            padding: '6px 14px',
            borderRadius: '20px',
            color: 'var(--color-gold)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Heart size={14} style={{ fill: 'var(--color-gold)' }} />
            정성 가득 리얼 평점 4.9 만족도
          </div>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800 }}>효드림을 이용하신 가족들의 후기</h2>
          <div className="korean-divider" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* MOBILE LAYOUT BLOCK: Show reviews with "See More" button */}
        {/* ---------------------------------------------------- */}
        <div className="mobile-only-block">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {mobilePaginatedReviews.map((rev, idx) => (
              <div key={idx} className="premium-card korean-border-box" style={{
                padding: '32px 28px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)', marginBottom: '14px' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={16} style={{ fill: 'var(--color-gold)' }} />
                    ))}
                  </div>

                  {/* Photo if exists */}
                  {rev.imageUrl && (
                    <div style={{
                      width: '100%',
                      height: '140px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <img src={rev.imageUrl} alt="포토 후기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {rev.title && (
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {rev.title}
                    </h4>
                  )}

                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-sub)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{rev.content}"
                  </p>
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px dashed var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>주문상품: {rev.packageType}</span>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile "See More" Button controls */}
          {visibleMobileCount < reviews.length && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '32px'
            }}>
              <button
                onClick={() => setVisibleMobileCount(prev => prev + 10)}
                className="btn-secondary pulse-gold"
                style={{
                  padding: '14px 28px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  transition: 'var(--transition-smooth)',
                  width: '100%',
                  maxWidth: '320px',
                  justifyContent: 'center',
                  boxShadow: 'none'
                }}
              >
                후기 더보기 (남은 {reviews.length - visibleMobileCount}개 보기)
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* PC LAYOUT BLOCK: Top 3 Cards + Sorting Controls + Paginated Table List */}
        {/* ---------------------------------------------------- */}
        <div className="pc-only-block">
          {/* Top 3 Featured reviews card grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {featuredReviews.map((rev, idx) => (
              <div key={idx} className="premium-card korean-border-box" style={{
                padding: '32px 28px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px',
                border: '1.5px solid var(--color-gold)' // highlighted border for featured reviews
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '3px', color: 'var(--color-gold)' }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={16} style={{ fill: 'var(--color-gold)' }} />
                      ))}
                    </div>
                    <span style={{
                      backgroundColor: 'var(--color-primary-fade)',
                      color: 'var(--color-primary)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>Best</span>
                  </div>

                  {/* Photo if exists */}
                  {rev.imageUrl && (
                    <div style={{
                      width: '100%',
                      height: '140px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <img src={rev.imageUrl} alt="포토 후기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {rev.title && (
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {rev.title}
                    </h4>
                  )}

                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-sub)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{rev.content}"
                  </p>
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px dashed var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>주문상품: {rev.packageType}</span>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sorting Control Bar & Remaining Reviews list */}
          <div id="pc-reviews-list-top" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--color-primary)',
              paddingBottom: '12px'
            }}>
              <h3 className="serif-font" style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0 }}>
                더 많은 가족들의 이야기
              </h3>
              
              {/* Sorting Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleSort('rating')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: sortBy === 'rating' ? 'var(--color-primary)' : '#FFFFFF',
                    color: sortBy === 'rating' ? '#FFFFFF' : 'var(--color-text-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)',
                    outline: 'none'
                  }}
                >
                  <span>평점순</span>
                  {sortBy === 'rating' && (
                    <span style={{ fontSize: '0.65rem' }}>
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSort('date')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: sortBy === 'date' ? 'var(--color-primary)' : '#FFFFFF',
                    color: sortBy === 'date' ? '#FFFFFF' : 'var(--color-text-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)',
                    outline: 'none'
                  }}
                >
                  <span>최신순</span>
                  {sortBy === 'date' && (
                    <span style={{ fontSize: '0.65rem' }}>
                      {sortOrder === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* List block */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)'
            }}>
              {paginatedRemaining.map((rev, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderBottom: idx === paginatedRemaining.length - 1 ? 'none' : '1px solid var(--border-color)',
                  gap: '24px'
                }} className="table-row-hover">
                  {/* Rating stars & Date */}
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', marginBottom: '4px' }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={13} style={{ fill: 'var(--color-gold)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{rev.date}</span>
                  </div>

                  {/* Photo if exists (PC list preview) */}
                  {rev.imageUrl && (
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--border-color)'
                    }}>
                      <img src={rev.imageUrl} alt="미니 포토" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Customer details */}
                  <div style={{ width: '150px', flexShrink: 0 }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>{rev.packageType}</span>
                  </div>

                  {/* Review Content */}
                  <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
                    {rev.title && (
                      <strong style={{ display: 'block', color: 'var(--color-text-main)', marginBottom: '4px', fontSize: '0.88rem' }}>
                        {rev.title}
                      </strong>
                    )}
                    "{rev.content}"
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-sub)',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    transition: 'var(--transition-smooth)',
                    outline: 'none'
                  }}
                >
                  이전
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: currentPage === pageNumber ? 'var(--color-primary)' : 'var(--border-color)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: currentPage === pageNumber ? 'var(--color-primary)' : '#FFFFFF',
                        color: currentPage === pageNumber ? '#FFFFFF' : 'var(--color-text-sub)',
                        transition: 'var(--transition-smooth)',
                        outline: 'none'
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-sub)',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    transition: 'var(--transition-smooth)',
                    outline: 'none'
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Trust Footnote (Shared) */}
      <section className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', color: 'var(--color-primary)' }}>
          <Award size={20} />
          <CheckCircle2 size={20} />
        </div>
        <h4 className="serif-font" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
          부모님을 모시는 효(孝)의 마음, 약속을 지키겠습니다
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', maxWidth: '500px', lineHeight: 1.5 }}>
          효드림은 모든 위생 조리 시설 및 배송 차량에 대해 매일 위생 검수를 시행하고 있습니다. 어르신들의 칭찬 및 성원에 보답하겠습니다.
        </p>
      </section>
    </div>
  );
};
