import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 스타일 객체
const styles = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  title: {
    color: '#333',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px',
    marginBottom: '30px',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '1px solid #eee',
  },
  avatar: {
    width: '80px',
    height: '80px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  infoH2: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#333',
  },
  infoP: {
    margin: '0',
    color: '#666',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    background: '#eee',
    fontSize: '12px',
    marginTop: '8px',
    fontWeight: 'bold',
    color: '#555',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
  },
  section: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  emptyBox: {
    color: '#888',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center',
  }
};

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert("로그인이 필요한 페이지입니다.");
      navigate('/');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>마이페이지</h1>

      <div style={styles.card}>
        <div style={styles.avatar}>
          {user.fullName ? user.fullName.charAt(0) : 'U'}
        </div>
        
        <div style={styles.info}>
          <h2 style={styles.infoH2}>{user.fullName || '회원'}님</h2>
          <p style={styles.infoP}>{user.email}</p>
          {user.provider && (
            <span style={styles.badge}>{user.provider} 로그인</span>
          )}
        </div>

        <div style={styles.buttonGroup}>
           <button 
             style={styles.button}
             onClick={() => alert('준비 중인 기능입니다.')}
           >
             내 정보 수정
           </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⭐ 관심 종목</h3>
        <div style={styles.emptyBox}>
            아직 관심 종목이 없습니다.
        </div>
      </div>
    </div>
  );
}

export default MyPage;