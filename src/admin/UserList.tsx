import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import type { User, InquiryStatus } from '../context/AppContext';
import { Search, User as UserIcon, Phone, MapPin, Award, X, Calendar, ShoppingBag, Clock, CheckCircle, Truck, Download, Upload } from 'lucide-react';

export const UserList: React.FC = () => {
  const { users, inquiries } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter users by name or phone
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.hp.includes(term) ||
      (user.tel && user.tel.includes(term))
    );
  });

  const handleExportCSV = () => {
    const headers = ['아이디(username)', '이름(name)', '이메일(email)', '연락처(hp)', '보조연락처(tel)', '우편번호(zip)', '기본주소(address1)', '상세주소(address2)', '포인트(points)'];
    const rows = filteredUsers.map(u => [
      u.username,
      u.name,
      u.email || '',
      u.hp,
      u.tel || '',
      u.zip || '',
      u.address1 || '',
      u.address2 || '',
      u.points || 0
    ]);
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n' 
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hyodream_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return alert('유효한 CSV 데이터가 없습니다.');
        
        const parsedUsers = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          const cols = row.map(col => col.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          
          if (cols.length >= 4 && cols[0]) {
            parsedUsers.push({
              username: cols[0],
              name: cols[1],
              email: cols[2] || '',
              hp: cols[3],
              tel: cols[4] || '',
              zip: cols[5] || '',
              address1: cols[6] || '',
              address2: cols[7] || '',
              points: cols[8] ? parseInt(cols[8].replace(/,/g, '')) : 0
            });
          }
        }
        
        if (parsedUsers.length === 0) return alert('업로드할 회원 데이터가 없습니다.');
        if (!window.confirm(`총 ${parsedUsers.length}명의 회원 정보를 DB에 업로드(덮어쓰기) 하시겠습니까?`)) return;
        
        const res = await fetch('/api/users/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: parsedUsers })
        });
        
        const result = await res.json();
        if (res.ok) {
          alert(`성공적으로 ${result.count}명의 정보를 업데이트했습니다. (새로고침 됩니다)`);
          window.location.reload();
        } else {
          alert(`업로드 실패: ${result.error}`);
        }
      } catch (err) {
        console.error(err);
        alert('CSV 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Get status label
  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return '접수/입금대기';
      case 'approved': return '결제완료';
      case 'processing': return '배송준비';
      case 'completed': return '배송완료';
    }
  };

  // Get status icon
  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'approved': return <CheckCircle size={14} />;
      case 'processing': return <Truck size={14} />;
      case 'completed': return <Award size={14} />;
    }
  };

  // Get user's orders
  const getUserOrders = (username: string) => {
    return inquiries.filter(i => i.userId === username).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in-up">
      {/* Control Bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            placeholder="회원 이름 또는 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '42px', borderRadius: '12px', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)', fontWeight: 600 }}>
            총 <span style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>{filteredUsers.length}</span>명의 회원
          </div>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> CSV 내보내기
          </button>
          <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={14} /> CSV 대량 등록
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="premium-card" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>가입일</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>회원명 (ID)</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>연락처</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>보유 포인트</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>누적 주문 건수</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)', textAlign: 'center' }}>상세 보기</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const userOrders = getUserOrders(user.username);
                  return (
                    <tr key={user.username} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--color-text-sub)' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserIcon size={14} style={{ color: 'var(--color-primary)' }} />
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          @{user.username}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                          <Phone size={12} style={{ color: 'var(--color-text-muted)' }} /> {user.hp}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--color-gold)' }}>
                        {user.points.toLocaleString()} P
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {userOrders.length}건
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                            cursor: 'pointer', color: 'var(--color-text-main)', transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#FFF'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-main)'; }}
                        >
                          주문 이력 보기
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    일치하는 회원이 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && createPortal(
        <div 
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(44, 38, 33, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="glass-panel animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '700px', width: '100%', maxHeight: '90vh',
              borderRadius: '24px', position: 'relative', border: '2px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              backgroundColor: '#FFFFFF'
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <h2 className="serif-font" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserIcon size={24} style={{ color: 'var(--color-primary)' }} />
                  {selectedUser.name} 회원님의 정보
                </h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-sub)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {selectedUser.hp}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedUser.address1 || '주소 미등록'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)', fontWeight: 700 }}><Award size={14} /> {selectedUser.points.toLocaleString()} P</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', color: 'var(--color-text-sub)',
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; e.currentTarget.style.color = 'var(--color-rose)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.color = 'var(--color-text-sub)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content: Order History */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h3 className="serif-font" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
                누적 구매(주문) 이력
              </h3>

              {getUserOrders(selectedUser.username).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {getUserOrders(selectedUser.username).map(order => (
                    <div key={order.id} style={{
                      padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                      {/* Top Row: Order ID & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          주문번호: {order.id}
                        </div>
                        <div className={`badge badge-${order.status}`} style={{ gap: '4px', padding: '4px 8px', fontSize: '0.7rem' }}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      {/* Middle Row: Product Info & Date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {order.ritualType}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Calendar size={12} /> {order.createdAt || order.date} 주문
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {order.totalPrice.toLocaleString()}원
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {order.paymentMethod || '무통장 입금'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: '#F8F9FA', borderRadius: '12px' }}>
                  <ShoppingBag size={32} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
                  이 회원의 구매 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
