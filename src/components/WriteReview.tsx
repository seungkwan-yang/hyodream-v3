import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Star, Camera, CheckCircle2, Sparkles, Trash2, Heart, RefreshCw } from 'lucide-react';

export const WriteReview: React.FC = () => {
  const { currentUser, setCustomerTab } = useApp();

  // Step state: 'form' | 'success'
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form Phase States
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [packageType, setPackageType] = useState<string>('표준 제사 상차림');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          if (data && data.length > 0) {
            setPackageType(data[0].ritualType);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recent orders:', err);
      }
    };
    fetchOrders();

  }, [currentUser, setCustomerTab]);



  // Helper: Mask name (e.g. 공유 -> 공*유, 김철 -> 김*, 남궁철수 -> 남*철수)
  const maskName = (fullName: string) => {
    if (!fullName) return '';
    const name = fullName.trim();
    if (name.length <= 1) return name;
    if (name.length === 2) {
      return name[0] + '*';
    }
    return name[0] + '*' + name.substring(2);
  };

  const computedMaskedName = currentUser ? maskName(currentUser.name) : '';

  // Handle Photo uploading immediately to server.js /api/upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.test(ext) || !allowedTypes.test(file.type)) {
      setUploadError('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp, avif)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('파일 용량은 최대 10MB까지 가능합니다.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        const errData = await response.json();
        setUploadError(errData.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (err) {
      console.error('Photo upload connection failed:', err);
      setUploadError('서버와의 통신에 실패했습니다. 네트워크 상태를 확인하세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded image from state
  const handleRemovePhoto = () => {
    setImageUrl(null);
    setUploadError(null);
  };

  // Submit Final Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('후기 제목을 입력해 주세요.');
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setSubmitError('후기 내용을 최소 10자 이상 정성껏 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0];
    const payload = {
      name: computedMaskedName,
      rating,
      date: today,
      title: title.trim(),
      content: content.trim(),
      packageType: packageType,
      imageUrl: imageUrl || null
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStep('success');
      } else {
        const errData = await response.json();
        setSubmitError(errData.error || '후기 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Review submit failed:', err);
      setSubmitError('서버 전송 실패. 네트워크를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '720px', margin: '0 auto' }} className="animate-fade-in-up">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-primary-fade)',
          padding: '6px 14px',
          borderRadius: '20px',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Heart size={14} style={{ fill: 'var(--color-primary)' }} />
          효드림 가족 안심 보증
        </div>
        <h2 className="serif-font" style={{ fontSize: '2.2rem', fontWeight: 800 }}>정직한 이용 후기 작성</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', marginTop: '8px' }}>
          효드림은 정성과 신뢰를 위해 실제 예약/결제를 완료하신 어르신 및 가족분들의 실제 후기만 등록 받습니다.
        </p>
        <div className="korean-divider" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* STEP 2: REVIEW SUBMISSION FORM SCREEN */}
      {/* ---------------------------------------------------- */}
      {step === 'form' && currentUser && (
        <div className="premium-card korean-border-box" style={{
          padding: '40px 32px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Welcome User Info Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '32px'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>작성자 (자동 마스킹)</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>{computedMaskedName}</strong>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>이용 상품</span>
              <select 
                value={packageType} 
                onChange={(e) => setPackageType(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <option value="표준 제사 상차림">표준 제사 상차림</option>
                <option value="프리미엄 제사 상차림">프리미엄 제사 상차림</option>
                <option value="명품 제사 상차림">명품 제사 상차림</option>
                <option value="기일/기제사 상차림">기일/기제사 상차림</option>
                <option value="차례상 (명절용)">차례상 (명절용)</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Rating Selector */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                가족들의 만족도 평점
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isActive = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isActive ? 'var(--color-gold)' : 'var(--border-color)',
                        transition: 'var(--transition-spring)',
                        transform: isActive ? 'scale(1.15)' : 'scale(1)'
                      }}
                    >
                      <Star
                        size={36}
                        style={{
                          fill: isActive ? 'var(--color-gold)' : 'none',
                          strokeWidth: 2
                        }}
                      />
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', fontWeight: 600 }}>
                {rating === 5 && '🌟 최고예요! 아주 만족스럽습니다.'}
                {rating === 4 && '👍 만족합니다. 정성 가득하네요.'}
                {rating === 3 && '🙂 평범합니다. 무난했습니다.'}
                {rating === 2 && '😕 아쉽습니다. 보완이 필요해 보여요.'}
                {rating === 1 && '👎 불만족합니다. 실망스럽습니다.'}
              </span>
            </div>

            {/* 2. Title Input */}
            <div>
              <label htmlFor="reviewTitle" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                후기 한 줄 제목
              </label>
              <input
                id="reviewTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 정성 가득하고 정갈한 음식 배송 최고였습니다!"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                required
              />
            </div>

            {/* 3. Image Upload Module */}
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                포토 첨부 (선택)
              </span>

              {imageUrl ? (
                // Image preview with Delete button
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1.5px solid var(--color-primary)'
                }}>
                  <img
                    src={imageUrl}
                    alt="업로드 프리뷰"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(227, 176, 152, 0.95)',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-rose)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(227, 176, 152, 0.95)'}
                  >
                    <Trash2 size={13} /> 사진 제거
                  </button>
                </div>
              ) : (
                // Camera upload button card
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-smooth)',
                  padding: '20px',
                  userSelect: 'none'
                }}
                  className="image-upload-trigger"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  {isUploading ? (
                    <>
                      <RefreshCw size={28} className="spin" style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', fontWeight: 600 }}>정갈한 포토 업로드 진행 중...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', fontWeight: 700 }}>음식 및 상차림 사진 첨부하기</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>jpg, png, gif, webp 포맷 지원 (최대 10MB)</span>
                    </>
                  )}
                </label>
              )}

              {uploadError && (
                <div style={{ color: 'var(--color-rose)', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px' }}>
                  ⚠ {uploadError}
                </div>
              )}
            </div>

            {/* 4. Content Textarea */}
            <div>
              <label htmlFor="reviewContent" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                상세 이용 후기 내용
              </label>
              <textarea
                id="reviewContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="어머님/아버님 제사를 지내며 느끼셨던 정성이나 위생, 맛, 배송 서비스 등 솔직한 경험담을 10자 이상 정성껏 공유해 주십시오. (남겨주신 한 말씀이 큰 응원이 됩니다.)"
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: 1.6,
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                {content.length}자 입력됨 (최소 10자)
              </span>
            </div>

            {submitError && (
              <div style={{
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(227, 176, 152, 0.15)',
                border: '1px solid var(--color-rose)',
                color: '#A04E3A',
                fontSize: '0.8rem'
              }}>
                ⚠ {submitError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="spin" /> 저장하는 중...
                  </>
                ) : (
                  <>
                    작성 완료 및 등록 <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: SUCCESS FEEDBACK SCREEN */}
      {/* ---------------------------------------------------- */}
      {step === 'success' && (
        <div className="premium-card korean-border-box animate-scale-up" style={{
          padding: '56px 40px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}>
          {/* Floating animated sparkles and hearts */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <Sparkles size={24} style={{ color: 'var(--color-gold)', animation: 'pulse 1.5s infinite' }} />
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-fade)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <CheckCircle2 size={44} />
            </div>
            <Heart size={24} style={{ color: 'var(--color-rose)', fill: 'var(--color-rose)', animation: 'bounce 2s infinite' }} />
          </div>

          <h3 className="serif-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
            소중한 후기가 정갈하게 등록되었습니다
          </h3>
          
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-sub)',
            lineHeight: 1.8,
            maxWidth: '480px',
            margin: '0 auto 36px auto'
          }}>
            효드림을 정성을 믿고 이용해 주셔서 진심으로 머리 숙여 감사드립니다.<br />
            가족분들께서 보태주신 귀한 응원의 경험담은 저희가 앞으로도 더 엄격한 위생과 지극한 온기로 정성껏 제사음식을 장만하는 데에 가장 큰 보람이자 나침반이 될 것입니다.
          </p>

          <button
            onClick={() => setCustomerTab('reviews')}
            className="btn-primary pulse-gold"
            style={{
              padding: '16px 40px',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(82, 110, 84, 0.25)'
            }}
          >
            효드림 이용 후기 목록 보기
          </button>
        </div>
      )}
    </div>
  );
};
