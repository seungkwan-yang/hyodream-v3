import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, LogIn, Search, UserPlus } from 'lucide-react';

type LoginMode = 'login' | 'find-id' | 'reset-password';

export const Login: React.FC = () => {
  const { setCurrentUser, setCustomerTab, checkoutIntentStep, setCheckoutIntentStep } = useApp();
  
  const [mode, setMode] = useState<LoginMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [findName, setFindName] = useState('');
  const [findHp, setFindHp] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetName, setResetName] = useState('');
  const [resetHp, setResetHp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordRe, setResetPasswordRe] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('서버와 연결할 수 없습니다. (백엔드 서버가 실행 중인지 확인해 주세요.)');
      }
      
      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      setCurrentUser(data);
      if (checkoutIntentStep) {
        setCustomerTab('estimator');
        setCheckoutIntentStep(null); // 리셋
      } else {
        setCustomerTab('home');
      }
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: findName, hp: findHp })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || '아이디 찾기에 실패했습니다.');

      const foundIds = Array.isArray(data.users) ? data.users.map((user: any) => user.username).join(', ') : '';
      setNotice(foundIds ? `회원님의 아이디는 ${foundIds} 입니다.` : '일치하는 아이디를 찾았습니다.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (resetPassword.length < 3) {
      setError('새 비밀번호는 3자 이상이어야 합니다.');
      return;
    }
    if (resetPassword !== resetPasswordRe) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resetUsername,
          name: resetName,
          hp: resetHp,
          password: resetPassword
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || '비밀번호 재설정에 실패했습니다.');

      setNotice('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
      setUsername(resetUsername);
      setPassword('');
      setResetPassword('');
      setResetPasswordRe('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }} className="animate-fade-in-up">
      <div className="premium-card wizard-card">
        <h2 className="serif-font" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', textAlign: 'center' }}>
          <LogIn size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
          로그인
        </h2>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {notice && (
          <div style={{ padding: '12px', backgroundColor: '#EAF6EA', color: 'var(--color-primary-dark)', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.5 }}>
            {notice}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>아이디</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="아이디를 입력하세요" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>비밀번호</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="비밀번호를 입력하세요" 
                required 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '0.84rem' }}>
              <button type="button" onClick={() => switchMode('find-id')} className="btn-text" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                아이디 찾기
              </button>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <button type="button" onClick={() => switchMode('reset-password')} className="btn-text" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                비밀번호 찾기
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}>
              {isSubmitting ? '로그인 중' : '로그인'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <p style={{ color: '#666', marginBottom: '16px' }}>아직 회원이 아니신가요?</p>
              <button 
                type="button" 
                onClick={() => setCustomerTab('register-agreement')} 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <UserPlus size={18} style={{ marginRight: '8px' }} /> 회원가입
              </button>
            </div>
          </form>
        )}

        {mode === 'find-id' && (
          <form onSubmit={handleFindId} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-sub)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              가입 시 입력한 이름과 핸드폰번호로 아이디를 찾습니다.
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>이름</label>
              <input type="text" value={findName} onChange={(e) => setFindName(e.target.value)} placeholder="홍길동" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>핸드폰번호</label>
              <input type="tel" value={findHp} onChange={(e) => setFindHp(formatPhoneNumber(e.target.value))} placeholder="010-1234-5678" required />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '16px', justifyContent: 'center' }}>
              <Search size={18} /> {isSubmitting ? '찾는 중' : '아이디 찾기'}
            </button>
            <button type="button" onClick={() => switchMode('login')} className="btn-secondary" style={{ justifyContent: 'center' }}>
              로그인으로 돌아가기
            </button>
          </form>
        )}

        {mode === 'reset-password' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-sub)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              회원 정보를 확인한 뒤 새 비밀번호를 설정합니다.
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>아이디</label>
              <input type="text" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} placeholder="아이디를 입력하세요" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>이름</label>
              <input type="text" value={resetName} onChange={(e) => setResetName(e.target.value)} placeholder="홍길동" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>핸드폰번호</label>
              <input type="tel" value={resetHp} onChange={(e) => setResetHp(formatPhoneNumber(e.target.value))} placeholder="010-1234-5678" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>새 비밀번호</label>
              <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="새 비밀번호" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>새 비밀번호 확인</label>
              <input type="password" value={resetPasswordRe} onChange={(e) => setResetPasswordRe(e.target.value)} placeholder="새 비밀번호 확인" required />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '16px', justifyContent: 'center' }}>
              <KeyRound size={18} /> {isSubmitting ? '변경 중' : '비밀번호 변경'}
            </button>
            <button type="button" onClick={() => switchMode('login')} className="btn-secondary" style={{ justifyContent: 'center' }}>
              로그인으로 돌아가기
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
