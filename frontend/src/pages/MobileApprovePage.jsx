import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#f0f2f5', padding: '20px', textAlign: 'center'
  },
  card: {
    backgroundColor: 'white', padding: '30px', borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
  },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#333' },
  desc: { fontSize: '15px', color: '#666', marginBottom: '30px', lineHeight: '1.5' },
  button: {
    width: '100%', padding: '15px', borderRadius: '8px', border: 'none',
    backgroundColor: '#007bff', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
  }
};

function MobileApprovePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. 모바일 기기에서 로그인되어 있는지 확인
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!storedUser || !token) {
      alert("로그인이 필요합니다. 먼저 로그인해주세요.");
      // 로그인 후 다시 이 페이지로 돌아오게 하려면 navigate('/login', { state: ... }) 활용 가능
      // 여기서는 일단 메인으로 보냄
      navigate('/'); 
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleApprove = async () => {
    if (!sessionId) return alert("잘못된 접근입니다.");

    try {
      // 2. 백엔드에 승인 요청 (POST /auth/qr/approve)
      await axios.post('/auth/qr/approve', { sessionId });
      
      alert("승인 완료! PC 화면을 확인하세요.");
      // 창 닫기 시도 (모바일 브라우저 정책상 안 닫힐 수도 있음)
      window.close(); 
    } catch (error) {
      console.error("승인 실패:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (!user) return <div style={styles.container}>로그인 확인 중...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{fontSize: '50px', marginBottom: '20px'}}>🖥️</div>
        <h2 style={styles.title}>PC 로그인 요청</h2>
        <p style={styles.desc}>
          <strong>{user.fullName || user.email}</strong> 계정으로<br/>
          PC에서 로그인을 시도합니다.
        </p>
        <button style={styles.button} onClick={handleApprove}>
          로그인 승인하기
        </button>
      </div>
    </div>
  );
}

export default MobileApprovePage;