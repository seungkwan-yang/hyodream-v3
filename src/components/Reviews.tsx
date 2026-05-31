import React, { useState } from 'react';
import { Star, Award, CheckCircle2, Heart } from 'lucide-react';

interface Review {
  name: string;
  rating: number;
  date: string;
  content: string;
  packageType: string;
}

export const Reviews: React.FC = () => {
  // 13 high-quality customer reviews with slightly varied ratings and dates for sorting demonstration
  const reviews: Review[] = [
    {
      name: '이*호 (인천 연수구)',
      rating: 5,
      date: '2026-05-18',
      content: '어머님 기제사로 급히 주문했습니다. 3일 전에 주문했는데 당일에 전용 차량으로 정갈하게 박싱되어 와서 안심했어요. 전 종류가 특히 도톰하고 기름 쩐내 없이 새벽에 부친 게 티가 나더군요. 친척 어르신들도 칭찬 많이 하셔서 뿌듯했습니다.',
      packageType: '표준 맞춤상 (기제사 중)'
    },
    {
      name: '박*정 (인천 부평구)',
      rating: 5,
      date: '2026-05-12',
      content: '핵가족이라 소가족 실속상으로 주문했어요. 과일도 흠집 하나 없이 특등과들만 왔고 밤 깎은 정성도 보였네요. 전복 추가했는데 꼬들하니 아주 인기 좋았습니다. 앞으로 제사때마다 효드림만 애용할 생각입니다.',
      packageType: '소가족 실속상 + 활전복 추가'
    },
    {
      name: '최*환 (경기도 부천시)',
      rating: 4, // 4-star for rating variation
      date: '2026-05-04',
      content: '사무실 새로 이전하면서 개업 고사상 대행으로 예약했는데 완전 마음에 듭니다. 돼지머리 상태도 아주 훌륭했고 시루떡이 진짜 김이 모락모락 나는 채로 와서 놀랐습니다. 번창하겠습니다 대박나세요!',
      packageType: '개업 고사상'
    },
    {
      name: '정*우 (인천 서구)',
      rating: 5,
      date: '2026-05-25',
      content: '기제사 중상을 시켰는데 음식 하나하나가 너무 정성스럽습니다. 나물도 간이 딱 맞고 특히 갈비찜 고기가 입안에서 부드럽게 녹아내리더군요. 제사 모시고 가족들과 정말 맛있게 음복했습니다.',
      packageType: '표준 맞춤상 (기제사 중)'
    },
    {
      name: '김*아 (인천 연수구)',
      rating: 5,
      date: '2026-05-22',
      content: '처음 대행 서비스를 이용해서 걱정이 많았는데 기대 이상입니다. 포장이 개별 용기로 꼼꼼하게 와서 국물이 새거나 흐른 것이 하나도 없었어요. 과일도 백화점 고급 과일 수준이라 어르신들께서 대만족하셨습니다.',
      packageType: '명가 전통상 (기제사 대)'
    },
    {
      name: '윤*원 (경기도 시흥시)',
      rating: 5,
      date: '2026-05-20',
      content: '조기 상태가 어쩜 이렇게 꼿꼿하고 튼튼하게 잘 구워졌는지 감탄했습니다. 비늘이나 지느러미 손질도 아주 깔끔했고 겉바속촉 그 자체네요. 앞으로 번거롭게 장보고 전 부치지 않고 무조건 효드림 예약하겠습니다.',
      packageType: '표준 맞춤상 + 조기 특대 추가'
    },
    {
      name: '최*지 (인천 남동구)',
      rating: 4, // 4-star for rating variation
      date: '2026-05-15',
      content: '할머니 제사라 소가족 실속상으로 차렸는데 나물 색감도 예쁘고 탕국도 양지 육수라 국물이 깊고 맑았습니다. 포장도 정성이 보여서 제사를 아주 경건하게 마쳤네요. 감사합니다.',
      packageType: '소가족 실속상 (기제사 소)'
    },
    {
      name: '강*수 (인천 계양구)',
      rating: 4, // 4-star for rating variation
      date: '2026-05-10',
      content: '식혜가 가마솥에 직접 삭힌 맛이라 시판 식혜랑은 차원이 다르네요. 많이 달지 않으면서도 깊은 풍미가 있어 아이들도 너무 좋아했습니다. 1.8L 순삭했네요. 다음에는 두 병 주문하려 합니다.',
      packageType: '소가족 실속상 + 수제 식혜 추가'
    },
    {
      name: '임*영 (경기도 부천시)',
      rating: 5,
      date: '2026-05-08',
      content: '개업 고사 대행으로 시켰는데 준비해 주신 돼지머리가 엄청 깔끔하고 인물이 좋아서 직원들 모두 웃으며 고사를 지냈습니다. 시루떡도 엄청 쫀득하고 따끈하게 도착했네요. 덕분에 사업 번창할 것 같습니다!',
      packageType: '개업 고사상'
    },
    {
      name: '한*희 (인천 중구)',
      rating: 5,
      date: '2026-05-01',
      content: '갑작스럽게 기일을 챙기게 되어 급히 예약했는데 3일 만에 정확히 정량 배송되었네요. 전통 한과도 명가 제품이라 너무 맛있었고 제구(향/초)도 챙겨주셔서 별도 준비 없이 완벽하게 상을 차렸습니다.',
      packageType: '명가 전통상 + 제구 세트 대여'
    },
    {
      name: '송*혜 (경기도 시흥시)',
      rating: 5,
      date: '2026-04-28',
      content: '수제 동태전 가시가 진짜 단 하나도 없어서 아이와 노모께서 안심하고 맛있게 드셨습니다. 육즙 가득한 동그랑땡도 도톰해서 씹는 맛이 최고였네요. 명절 차례상 예약 미리 신청해 두려 합니다.',
      packageType: '표준 맞춤상 (기제사 중)'
    },
    {
      name: '고*원 (인천 동구)',
      rating: 4, // 4-star for rating variation
      date: '2026-04-22',
      content: '나물의 아린 맛이나 쓴 맛이 완전히 제거되어 고소하고 향긋한 나물 본연의 맛이 너무 훌륭했습니다. 고사리, 도라지, 시금치 전부 흠잡을 데가 없네요. 음식 장만 스트레스에서 벗어나게 해 주셔서 감사해요.',
      packageType: '소가족 실속상 (기제사 소)'
    },
    {
      name: '신*윤 (인천 서구)',
      rating: 5,
      date: '2026-04-18',
      content: '배송 기사님께서 무척 친절하셨고 안전 탑차로 직접 집 앞까지 정성스레 들어다 주셨습니다. 음식의 신선도와 포장 상태가 그 어떤 온라인 반찬 샵보다 프리미엄했습니다. 효드림 적극 강추합니다.',
      packageType: '명가 전통상 (기제사 대)'
    }
  ];

  // Sorting state for PC remaining reviews list
  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'rating' | 'date') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when switching sorting field
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
        {/* MOBILE LAYOUT BLOCK: Show all 13 reviews as card grid */}
        {/* ---------------------------------------------------- */}
        <div className="mobile-only-block">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {reviews.map((rev, idx) => (
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
        </div>

        {/* ---------------------------------------------------- */}
        {/* PC LAYOUT BLOCK: Top 3 Cards + Sorting Controls + Table List */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              {sortedRemaining.map((rev, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderBottom: idx === sortedRemaining.length - 1 ? 'none' : '1px solid var(--border-color)',
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

                  {/* Customer details */}
                  <div style={{ width: '150px', flexShrink: 0 }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--color-text-main)' }}>{rev.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>{rev.packageType}</span>
                  </div>

                  {/* Review Content */}
                  <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
                    "{rev.content}"
                  </div>
                </div>
              ))}
            </div>
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
