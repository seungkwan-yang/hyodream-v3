import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Receipt, Coins, LogOut } from 'lucide-react';
import { RegisterForm } from './RegisterForm';

export const MyPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCustomerTab } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, setCustomerTab]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerTab('home');
  };

  if (!currentUser) return null;

  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateSuccess = (updatedData: any) => {
    setCurrentUser(updatedData);
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto' }} className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <h2 className="serif-font" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          <User size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
          마이페이지
        </h2>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
          <LogOut size={16} style={{ marginRight: '6px' }} /> 로그아웃
        </button>
      </div>

      {/* Points Card (Top) */}
      <div className="premium-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '50%' }}>
            <Coins size={40} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#666', marginBottom: '4px' }}>나의 보유 포인트</h3>
            <p style={{ fontSize: '0.9rem', color: '#999', margin: 0 }}>결제 금액의 1%가 적립됩니다.</p>
          </div>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', textAlign: 'right' }}>
          {currentUser.points.toLocaleString()} <span style={{ fontSize: '1.2rem', color: '#888' }}>P</span>
        </div>
      </div>

      {/* User Info Card (Bottom) */}
      <div className="premium-card wizard-card" style={{ marginBottom: '40px', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>회원 정보</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>정보 수정</button>
          )}
        </div>
        
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '1.05rem' }}>
            <strong style={{ color: '#555' }}>이름</strong> <span style={{ color: '#222' }}>{currentUser.name}</span>
            <strong style={{ color: '#555' }}>아이디</strong> <span style={{ color: '#222' }}>{currentUser.username}</span>
            <strong style={{ color: '#555' }}>이메일</strong> <span style={{ color: '#222' }}>{currentUser.email || '등록 안 됨'}</span>
            <strong style={{ color: '#555' }}>연락처</strong> <span style={{ color: '#222' }}>{currentUser.hp}</span>
            <strong style={{ color: '#555' }}>주소</strong> 
            <span style={{ color: '#222', lineHeight: '1.5' }}>
              {currentUser.address1 ? `(${currentUser.zip}) ${currentUser.address1} ${currentUser.address2 || ''}` : '등록 안 됨'}
            </span>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <RegisterForm 
              isEditMode={true} 
              initialData={currentUser} 
              onSuccess={handleUpdateSuccess} 
              onCancel={() => setIsEditing(false)} 
            />
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={22} style={{ color: 'var(--color-primary)' }} />
          나의 주문 내역
        </h3>
        
        {loading ? (
          <p>주문 내역을 불러오는 중입니다...</p>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
            주문 내역이 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', fontWeight: 600 }}>주문일시</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>주문상품</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>결제금액</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>적립포인트</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: '#666', fontSize: '0.9rem' }}>{order.createdAt}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{order.ritualType}</td>
                    <td style={{ padding: '16px' }}>{order.totalPrice.toLocaleString()}원</td>
                    <td style={{ padding: '16px', color: 'var(--color-primary)', fontWeight: 600 }}>+{order.pointsEarned?.toLocaleString() || 0} P</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: order.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                        color: order.status === 'completed' ? '#166534' : '#92400E'
                      }}>
                        {order.status === 'pending' ? '접수대기' :
                         order.status === 'approved' ? '예약확정' :
                         order.status === 'processing' ? '준비중' : '완료'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
