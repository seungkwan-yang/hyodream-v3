import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export const RegisterAgreement: React.FC = () => {
  const { setCustomerTab } = useApp();
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const handleNext = () => {
    if (!agree1) {
      alert("회원가입약관의 내용에 동의하셔야 회원가입 하실 수 있습니다.");
      return;
    }
    if (!agree2) {
      alert("개인정보취급방침의 내용에 동의하셔야 회원가입 하실 수 있습니다.");
      return;
    }
    setCustomerTab('register-form');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }} className="animate-fade-in-up">
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
        <h2 className="serif-font" style={{ fontSize: '1.8rem', fontWeight: 800 }}>회원가입약관 및 개인정보취급방침</h2>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--color-primary)' }}>•</span> 회원가입약관
        </h3>
        <div style={{ 
          border: '1px solid #bebebe', 
          padding: '16px', 
          height: '200px', 
          overflowY: 'auto', 
          backgroundColor: '#fff',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: '#666',
          marginBottom: '12px'
        }}>
          제1조(목적)<br/><br/>
          이 약관은 드림힐 회사(전자거래 사업자)가 운영하는 효드림 사이버 몰(이하 "몰"이라 한다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 한다)를 이용함에 있어 사이버몰과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.<br/><br/>
          제2조(정의)<br/><br/>
          ① "몰"이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.<br/>
          ② "이용자"란 "몰"에 접속하여 이 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br/>
          (본 약관은 테스트용 더미입니다.)
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="radio" name="agree1" checked={agree1} onChange={() => setAgree1(true)} />
            동의합니다.
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="radio" name="agree1" checked={!agree1} onChange={() => setAgree1(false)} />
            동의하지 않습니다.
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--color-primary)' }}>•</span> 개인정보취급방침
        </h3>
        <div style={{ 
          border: '1px solid #bebebe', 
          padding: '16px', 
          height: '200px', 
          overflowY: 'auto', 
          backgroundColor: '#fff',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: '#666',
          marginBottom: '12px'
        }}>
          개인정보의 수집목적 및 이용목적<br/><br/>
          ① 효드림 회원님께 최대한으로 최적화되고 맞춤화된 서비스를 제공하기 위하여 다음과 같은 목적으로 개인정보를 수집하고 있습니다.<br/>
          - 성명, 아이디, 비밀번호 : 회원제 서비스 이용에 따른 본인 식별 절차에 이용<br/>
          - 이메일주소, 이메일 수신여부, 전화번호 : 고지사항 전달, 본인 의사 확인, 불만 처리 등 원활한 의사소통 경로의 확보<br/>
          - 주소, 전화번호 : 경품과 쇼핑 물품 배송에 대한 정확한 배송지의 확보<br/>
          (본 방침은 테스트용 더미입니다.)
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="radio" name="agree2" checked={agree2} onChange={() => setAgree2(true)} />
            동의합니다.
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="radio" name="agree2" checked={!agree2} onChange={() => setAgree2(false)} />
            동의하지 않습니다.
          </label>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={handleNext} className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
          <Check size={20} style={{ marginRight: '8px' }} />
          확인 및 다음 단계로
        </button>
      </div>
    </div>
  );
};
