import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const { setCurrentUser, setCustomerTab, checkoutIntentStep, setCheckoutIntentStep } = useApp();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}>
            로그인
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
      </div>
    </div>
  );
};
