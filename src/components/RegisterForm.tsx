import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, MapPin, Check } from 'lucide-react';

interface RegisterFormProps {
  isEditMode?: boolean;
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ isEditMode, initialData, onSuccess, onCancel }) => {
  const { setCustomerTab, setCurrentUser, currentUser } = useApp();
  
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

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="영문자, 숫자 입력 (최소 3자)" required />
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
