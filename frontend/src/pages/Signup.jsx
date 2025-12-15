import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 스타일 객체 정의 (라이브러리 제거됨) ---
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 80px)',
    backgroundColor: '#f8f9fa',
  },
  signupBox: {
    width: '480px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#666',
  },
  emailRow: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff', // var(--primary-blue) 대체
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  checkButton: {
    width: '100px',
    padding: '0',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    height: '42px', // 인풋 높이와 맞춤
  },
  message: {
    fontSize: '12px',
    marginTop: '5px',
    display: 'block',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '30px',
    fontSize: '13px',
    color: '#666',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  linkText: {
    color: '#007bff',
    cursor: 'pointer',
    marginLeft: '5px',
    fontWeight: 'bold',
  }
};

function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '' 
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  
  // 이메일 메시지 상태
  const [emailMessage, setEmailMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  // 비밀번호 메시지 상태
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // ⭐ 제출 중인지 확인하는 상태 (중복 클릭 방지)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 상태 체크
  useEffect(() => {
    if (localStorage.getItem('token')) {
      alert("이미 로그인이 되어있습니다.");
      navigate('/');
    }
  }, [navigate]);

  // 비밀번호 정규식 검사 함수
  const validatePasswordRegex = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 1. 이메일 수정 시 중복확인 초기화
    if (name === 'email') {
      setIsEmailChecked(false);
      setEmailMessage(''); 
    }

    // 2. 비밀번호 입력 시 실시간 검사
    if (name === 'password') {
        if (value.length === 0) {
            setPasswordMessage("");
            setIsPasswordValid(false);
        } else if (!validatePasswordRegex(value)) {
            setPasswordMessage("8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.");
            setIsPasswordValid(false);
        } else {
            setPasswordMessage("✅ 안전한 비밀번호입니다.");
            setIsPasswordValid(true);
        }
    }
  };

  const handleCheckEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailMessage("올바른 이메일 형식이 아닙니다.");
      setIsEmailValid(false);
      return;
    }
    
    try {
      const response = await axios.post('/auth/check-email', null, {
        params: { email: formData.email }
      });

      if (response.data === true) {
        setEmailMessage("✅ 사용 가능한 이메일입니다.");
        setIsEmailValid(true);
        setIsEmailChecked(true); 
      } else {
        setEmailMessage("❌ 이미 사용 중인 이메일입니다.");
        setIsEmailValid(false);
        setIsEmailChecked(false);
      }

    } catch (error) {
      console.error("중복 체크 에러:", error);
      setEmailMessage("❌ 오류가 발생했습니다.");
      setIsEmailValid(false);
      setIsEmailChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이미 제출 중이면 함수 실행 중단
    if (isSubmitting) return;

    if (!formData.email || !formData.password || !formData.name) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요!");
      return;
    }

    if (!isPasswordValid) {
      alert("비밀번호 조건을 확인해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    // ⭐ 제출 시작 - 버튼 잠금
    setIsSubmitting(true);

    const name = formData.name.trim();
    const lastName = name.substring(0, 1);
    const firstName = name.substring(1);

    try {
      await axios.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        provider: 'LOCAL'
      });
      
      alert('회원가입이 완료되었습니다!\n가입하신 이메일로 인증 링크가 발송되었습니다.\n메일함에서 인증을 완료한 후 로그인해주세요.');
      navigate('/'); 

    } catch (error) {
      console.error('가입 에러:', error);
      
      // ⭐ 실패 시 다시 버튼 풀기 (재시도 가능하게)
      setIsSubmitting(false);

      if (error.response && error.response.data) {
         alert(error.response.data);
      } else {
         alert('회원가입에 실패했습니다.');
      }
    }
  };

  const isButtonDisabled = !isEmailChecked || isSubmitting;

  return (
    <div style={styles.container}>
      <div style={styles.signupBox}>
        <h2 style={styles.title}>회원가입</h2>
        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>이메일</label>
            <div style={styles.emailRow}>
              <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="example@email.com" 
                  style={styles.input}
              />
              <button type="button" onClick={handleCheckEmail} style={styles.checkButton}>중복 확인</button>
            </div>
            {emailMessage && (
                <span style={{...styles.message, color: isEmailValid ? '#28a745' : '#dc3545'}}>
                    {emailMessage}
                </span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호</label>
            <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="8자 이상, 영문/숫자/특수문자 포함" 
                style={styles.input}
            />
            {/* ⭐ 비밀번호 메시지 표시 */}
            {passwordMessage && (
                <span style={{...styles.message, color: isPasswordValid ? '#28a745' : '#dc3545'}}>
                    {passwordMessage}
                </span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호 확인</label>
            <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="비밀번호 확인" 
                style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>이름</label>
            <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="실명 입력" 
                style={styles.input}
            />
          </div>

          {/* ⭐ isSubmitting 상태일 때도 버튼 비활성화 및 텍스트 변경 */}
          <button 
            type="submit" 
            disabled={isButtonDisabled}
            style={isButtonDisabled ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {isSubmitting ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <div style={styles.footer}>
            <div>
                이미 계정이 있으신가요? 
                <span onClick={() => navigate('/')} style={styles.linkText}>
                  로그인 하러가기
                </span>
            </div>
            <div>
                비밀번호를 잊으셨나요?
                <span onClick={() => navigate('/find-pw')} style={styles.linkText}>
                  비밀번호 찾기
                </span>
            </div>
        </div>

      </div>
    </div>
  );
}
export default Signup;