import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, MapPin, Check, Search } from 'lucide-react';

declare global {
  interface Window {
    PortOne?: {
      requestIdentityVerification: (params: Record<string, unknown>) => Promise<{
        code?: string;
        message?: string;
        identityVerificationId?: string;
      } | undefined>;
    };
  }
}

interface RegisterFormProps {
  isEditMode?: boolean;
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ isEditMode, initialData, onSuccess, onCancel }) => {
  const { setCustomerTab, setCurrentUser } = useApp();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordRe: '',
    name: '',
    email: '',
    hp: '',
    tel: '',
    zip: '',
    address1: '',
    address2: '',
    mailing: true,
    sms: true,
  });

  const [error, setError] = useState('');
  const [usernameCheck, setUsernameCheck] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
    value: string;
  }>({ checked: false, available: false, message: '', value: '' });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [identityConfig, setIdentityConfig] = useState<{ enabled: boolean; storeId: string; channelKey: string; provider?: string } | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [identityMessage, setIdentityMessage] = useState('');
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        username: initialData.username || '',
        password: '',
        passwordRe: '',
        name: initialData.name || '',
        email: initialData.email || '',
        hp: initialData.hp || '',
        tel: initialData.tel || '',
        zip: initialData.zip || '',
        address1: initialData.address1 || '',
        address2: initialData.address2 || '',
        mailing: initialData.mailing ?? true,
        sms: initialData.sms ?? true,
      });
    }
  }, [isEditMode, initialData]);

  React.useEffect(() => {
    if (isEditMode) return;
    let ignore = false;

    fetch('/api/identity/config')
      .then(res => res.json())
      .then(data => {
        if (!ignore) setIdentityConfig(data);
      })
      .catch(() => {
        if (!ignore) setIdentityConfig({ enabled: false, storeId: '', channelKey: '' });
      });

    return () => {
      ignore = true;
    };
  }, [isEditMode]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'hp') {
      value = formatPhoneNumber(value);
    }

    if (name === 'username') {
      value = value.trim();
      setUsernameCheck({ checked: false, available: false, message: '', value: '' });
    }

    if (name === 'name' || name === 'hp') {
      setIdentityVerified(false);
      setIdentityMessage('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUsernameCheck = async () => {
    const username = formData.username.trim();
    setError('');
    setUsernameCheck({ checked: false, available: false, message: '', value: '' });

    if (username.length < 3) {
      setUsernameCheck({
        checked: true,
        available: false,
        message: '아이디는 최소 3자 이상이어야 합니다.',
        value: username
      });
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || '아이디 중복 확인에 실패했습니다.');
      }

      setUsernameCheck({
        checked: true,
        available: Boolean(data.available),
        message: data.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.',
        value: username
      });
    } catch (err: any) {
      const rawMessage = err.message || '아이디 중복 확인에 실패했습니다.';
      setUsernameCheck({
        checked: true,
        available: false,
        message: rawMessage.includes('DATABASE_URL') || rawMessage.includes('HYPERDRIVE') || rawMessage.includes('데이터베이스 연결')
          ? '현재 배포 환경의 DB 연결 설정을 확인해 주세요.'
          : rawMessage,
        value: username
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const loadPortOneSdk = () =>
    new Promise<void>((resolve, reject) => {
      if (window.PortOne) {
        resolve();
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>('script[data-portone-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('본인인증 SDK를 로드할 수 없습니다.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
      script.async = true;
      script.dataset.portoneSdk = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('본인인증 SDK를 로드할 수 없습니다.'));
      document.head.appendChild(script);
    });

  const handleIdentityVerification = async () => {
    setError('');
    setIdentityMessage('');

    if (!identityConfig?.enabled || !identityConfig.storeId || !identityConfig.channelKey) {
      setIdentityMessage('본인인증 설정이 필요합니다. PORTONE_STORE_ID, PORTONE_CHANNEL_KEY, PORTONE_API_SECRET을 등록해 주세요.');
      return;
    }

    setIsVerifyingIdentity(true);
    try {
      await loadPortOneSdk();
      if (!window.PortOne) throw new Error('본인인증 SDK 초기화에 실패했습니다.');

      const identityVerificationId = `identity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const certification = await window.PortOne.requestIdentityVerification({
        storeId: identityConfig.storeId,
        channelKey: identityConfig.channelKey,
        identityVerificationId,
        popup: true,
      });

      if (certification?.code) {
        throw new Error(certification.message || '본인인증이 취소되었거나 실패했습니다.');
      }

      const res = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityVerificationId: certification?.identityVerificationId || identityVerificationId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.verified) {
        throw new Error(data?.error || '본인인증 결과 확인에 실패했습니다.');
      }

      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        hp: data.phone || prev.hp,
      }));
      setIdentityVerified(true);
      setIdentityMessage('본인인증이 완료되었습니다.');
    } catch (err: any) {
      setIdentityVerified(false);
      setIdentityMessage(err.message || '본인인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsVerifyingIdentity(false);
    }
  };

  const handleAddressSearch = () => {
    const daum = (window as any).daum;
    if (daum && daum.Postcode) {
      new daum.Postcode({
        oncomplete: (data: any) => {
          let fullAddress = data.roadAddress || data.address;
          if (data.buildingName) {
            fullAddress += ` (${data.buildingName})`;
          }
          setFormData(prev => ({
            ...prev,
            zip: data.zonecode,
            address1: fullAddress
          }));
          setTimeout(() => {
            const detailInput = document.getElementById('address-detail-input');
            if (detailInput) detailInput.focus();
          }, 100);
        }
      }).open();
    } else {
      alert('우편번호 서비스를 로드할 수 없습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isEditMode) {
      if (formData.password && formData.password.length < 3) {
        setError('패스워드는 3자 이상이어야 합니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (formData.password && formData.password !== formData.passwordRe) {
        setError('패스워드가 일치하지 않습니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else {
      if (formData.username.length < 3) {
        setError('아이디는 최소 3자 이상이어야 합니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!usernameCheck.checked || !usernameCheck.available || usernameCheck.value !== formData.username.trim()) {
        setError('아이디 중복체크를 완료해 주세요.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (formData.password.length < 3) {
        setError('패스워드는 3자 이상이어야 합니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (formData.password !== formData.passwordRe) {
        setError('패스워드가 일치하지 않습니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (identityConfig?.enabled && !identityVerified) {
        setError('휴대폰 본인인증을 완료해 주세요.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (!formData.name.trim()) {
      setError('이름을 입력해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.hp.trim()) {
      setError('핸드폰번호를 입력해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.zip || !formData.address1 || !formData.address2) {
      setError('주소를 상세히 입력해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditMode ? `/api/users/${initialData?.username}` : '/api/auth/register';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('서버와 연결할 수 없습니다. (백엔드 서버가 실행 중인지 확인해 주세요.)');
      }

      if (res.ok) {
        if (isEditMode) {
          alert('정보가 성공적으로 수정되었습니다.');
          if (onSuccess) onSuccess(data);
        } else {
          alert(`축하합니다! ${data.name}님 회원가입이 완료되었습니다. (포인트 ${data.points || 0}P 증정)`);
          setCurrentUser(data);
          setCustomerTab('home');
        }
      } else {
        setError(data.error || '오류가 발생했습니다.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={isEditMode ? {} : { maxWidth: '800px', margin: '40px auto' }} className={isEditMode ? '' : 'animate-fade-in-up'}>
      {!isEditMode && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="serif-font" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            <UserPlus size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            회원가입
          </h2>
          <p style={{ color: '#666', marginTop: '10px' }}>효드림의 회원이 되어 특별한 혜택을 누려보세요!</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>⚠️</span> {error}
        </div>
      )}

      <div className={isEditMode ? '' : 'premium-card wizard-card'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User ID */}
          {!isEditMode && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>아이디 (필수)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="영문자, 숫자 입력 (최소 3자)"
                  required
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button
                  type="button"
                  onClick={handleUsernameCheck}
                  disabled={isCheckingUsername || formData.username.trim().length < 3}
                  className="btn-secondary"
                  style={{
                    padding: '0 14px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    minWidth: '104px',
                    justifyContent: 'center',
                    opacity: isCheckingUsername || formData.username.trim().length < 3 ? 0.55 : 1
                  }}
                >
                  <Search size={15} />
                  {isCheckingUsername ? '확인중' : '중복체크'}
                </button>
              </div>
              {usernameCheck.message && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: usernameCheck.available ? 'var(--color-primary)' : 'var(--color-rose)'
                }}>
                  {usernameCheck.message}
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>비밀번호 {isEditMode ? '(변경시에만 입력)' : '(필수)'}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditMode} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>비밀번호 확인 {isEditMode ? '' : '(필수)'}</label>
            <input type="password" name="passwordRe" value={formData.passwordRe} onChange={handleChange} required={!isEditMode} />
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>이름 (필수)</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" required />
          </div>

          {!isEditMode && (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>휴대폰 본인인증</div>
                  <div style={{ color: 'var(--color-text-sub)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                    인증 완료 시 이름과 핸드폰번호가 자동으로 입력됩니다.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleIdentityVerification}
                  disabled={isVerifyingIdentity}
                  className={identityVerified ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    justifyContent: 'center',
                    minWidth: '128px',
                    boxShadow: 'none'
                  }}
                >
                  <Check size={16} />
                  {isVerifyingIdentity ? '인증 중' : identityVerified ? '인증 완료' : '본인인증'}
                </button>
              </div>
              {identityMessage && (
                <div style={{
                  marginTop: '10px',
                  color: identityVerified ? 'var(--color-primary)' : 'var(--color-rose)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  lineHeight: 1.5
                }}>
                  {identityMessage}
                </div>
              )}
              {identityConfig && !identityConfig.enabled && !identityMessage && (
                <div style={{ marginTop: '10px', color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  본인인증을 사용하려면 PortOne 환경변수를 등록해 주세요.
                </div>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>이메일 (선택)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" />
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>핸드폰번호 (필수)</label>
              <input type="tel" name="hp" value={formData.hp} onChange={handleChange} placeholder="010-1234-5678" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>전화번호 (선택)</label>
              <input type="tel" name="tel" value={formData.tel} onChange={handleChange} placeholder="02-123-4567" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>주소 (필수)</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" name="zip" value={formData.zip} readOnly placeholder="우편번호" style={{ width: '120px', backgroundColor: '#f9f9f9' }} required />
              <button type="button" onClick={handleAddressSearch} className="btn-secondary" style={{ padding: '0 16px', borderRadius: '8px' }}>
                <MapPin size={16} style={{ marginRight: '6px' }} /> 주소 검색
              </button>
            </div>
            <input type="text" name="address1" value={formData.address1} readOnly placeholder="기본 주소" style={{ marginBottom: '10px', backgroundColor: '#f9f9f9' }} required />
            <input type="text" name="address2" id="address-detail-input" value={formData.address2} onChange={handleChange} placeholder="상세 주소 입력" required />
          </div>

          {/* Preferences */}
          <div style={{ display: 'flex', gap: '24px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" name="mailing" checked={formData.mailing} onChange={handleChange} />
              메일 수신 동의
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" name="sms" checked={formData.sms} onChange={handleChange} />
              SMS 수신 동의
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {isEditMode && onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem', flex: 1 }}>
                취소
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '16px 32px', fontSize: '1.1rem', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isLoading ? '처리 중...' : (
                <>
                  <Check size={20} style={{ marginRight: '8px' }} /> {isEditMode ? '수정 완료' : '회원가입 완료'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
