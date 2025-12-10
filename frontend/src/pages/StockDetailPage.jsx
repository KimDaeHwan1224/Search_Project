import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// ==========================================
// 1. 스타일 객체 정의
// ==========================================
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    borderBottom: '2px solid #333',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  stockTitle: {
    margin: '0',
    color: '#333',
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  stockCode: {
    fontSize: '18px',
    color: '#666',
    marginLeft: '10px',
    fontWeight: 'normal',
  },
  priceContainer: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '15px',
  },
  price: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  changeInfo: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  metaData: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
    display: 'flex',
    gap: '20px',
  },
  metaSpan: {
    display: 'inline-block',
  },
  section: {
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
  },
  sectionTitle: {
    marginBottom: '15px',
    borderLeft: '4px solid #007bff',
    paddingLeft: '10px',
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#333',
  },
  sentimentBarContainer: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    height: '20px',
    backgroundColor: '#eee',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
  },
  sentimentStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  // 기존 newsItem 스타일은 놔두거나, 아래 newsItemWrapper로 대체 사용
  newsItem: {
    borderBottom: '1px solid #eee',
    padding: '15px 0',
  },
  // ⭐ [추가됨] 뉴스 텍스트와 별표 버튼을 양옆으로 배치하기 위한 Flex 컨테이너
  newsItemWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    padding: '15px 0',
  },
  // ⭐ [추가됨] 뉴스 텍스트가 버튼을 밀어내지 않도록 영역 설정
  newsContent: {
    flex: 1,
    paddingRight: '15px',
  },
  newsLink: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '17px',
    display: 'block',
    marginBottom: '8px',
  },
  newsSummary: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  newsInfo: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    gap: '10px',
  },
  sentimentBadge: {
    fontWeight: 'bold',
    marginRight: '5px',
  },
  noNews: {
    textAlign: 'center',
    color: '#888',
  },
  starButton: {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    color: '#FFD700',
    transition: 'transform 0.2s',
    padding: '0 10px',
  },
  starButtonEmpty: {
    color: '#ccc',
  },
  // ⭐ [추가됨] 뉴스 리스트 옆에 붙을 작은 별표 버튼
  newsStarButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#ccc',
    padding: '5px',
    transition: 'color 0.2s',
    marginTop: '5px',
  },
  // ⭐ [추가됨] 뉴스 찜 활성화 시 색상 (노란색)
  newsStarActive: {
    color: '#FFD700',
  },
};

// ==========================================
// 2. 컴포넌트 로직
// ==========================================

function StockDetailPage() {
  const { stockCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 종목 찜 상태
  const [isFavorite, setIsFavorite] = useState(false);
  // ⭐ [추가됨] 내가 찜한 뉴스 ID들을 담아둘 상태 (DB 연동)
  const [savedNewsIds, setSavedNewsIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 주식 상세 정보 불러오기
        const stockRes = await axios.get(`/api/stocks/${stockCode}`);
        console.log("상세 정보 수신:", stockRes.data);
        setData(stockRes.data);

        // 2. 로그인 상태라면 찜 목록(종목, 뉴스) 불러오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // (1) 관심 종목인지 확인
                const myRes = await axios.get('/api/mypage/info', authHeader);
                const myStocks = myRes.data.stocks || [];
                const isFav = myStocks.some(s => s.stockCode === stockCode);
                setIsFavorite(isFav);
            } catch (e) {
                console.error("찜 상태 확인 실패:", e);
            }

            // ⭐ (2) [추가됨] 관심 뉴스 목록 확인 (DB에서 가져오기)
            try {
                // 백엔드의 getFavoriteNews 메서드를 호출 (UserDAO 재사용)
                const myNewsRes = await axios.get('/api/mypage/favorites/news', authHeader);
                console.log("서버에서 가져온 찜한 뉴스 목록:", myNewsRes.data);

                let rawList = myNewsRes.data;
                // 응답 구조가 배열이 아니라면 배열을 찾음
                if (!Array.isArray(rawList) && rawList.data) rawList = rawList.data;
                if (!Array.isArray(rawList) && rawList.list) rawList = rawList.list;

                if (Array.isArray(rawList)) {
                    // 서버가 객체({newsId:1})로 주든 숫자(1)로 주든 ID만 추출하여 문자열로 저장
                    const ids = rawList.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return item.newsId || item.id; 
                        }
                        return item; // 숫자나 문자면 그대로
                    }).filter(id => id); // null/undefined 제거
                    
                    // 비교를 확실하게 하기 위해 문자열로 변환하여 저장
                    setSavedNewsIds(ids.map(id => String(id)));
                }
            } catch (e) {
                console.error("뉴스 찜 목록 로드 실패:", e);
            }
        }
      } catch (error) {
        console.error("상세 정보 조회 실패", error);
        alert("정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stockCode]);

  // 종목 찜하기 핸들러
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("로그인이 필요한 기능입니다.");
        return;
    }

    try {
        if (isFavorite) {
            await axios.delete(`/api/mypage/favorites/stock/${stockCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(false);
            alert("관심 종목에서 삭제되었습니다.");
        } else {
            await axios.post('/api/mypage/favorites/stock', { stockCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(true);
            alert("관심 종목에 추가되었습니다.");
        }
    } catch (error) {
        console.error("찜하기 실패", error);
        alert("처리에 실패했습니다.");
    }
  };

  // ⭐ [추가됨] 뉴스 찜하기 핸들러 (DB 연동)
  const handleToggleNewsBookmark = async (news) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요한 기능입니다.");

    const newsId = news.newsId || news.id;
    if (!newsId) return alert("뉴스 ID가 없습니다.");

    // 타입 불일치 방지를 위해 문자열로 변환 후 비교
    const strNewsId = String(newsId);
    const isBookmarked = savedNewsIds.includes(strNewsId);

    try {
        if (isBookmarked) {
            // 이미 찜 상태면 -> 삭제 요청 (DELETE)
            await axios.delete(`/api/mypage/favorites/news/${newsId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 화면 상태 업데이트 (제거)
            setSavedNewsIds(prev => prev.filter(id => id !== strNewsId));
            alert("스크랩을 취소했습니다.");
        } else {
            // 찜 상태가 아니면 -> 추가 요청 (POST)
            await axios.post('/api/mypage/favorites/news', 
                { newsId: newsId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // 화면 상태 업데이트 (추가)
            setSavedNewsIds(prev => [...prev, strNewsId]);
            alert("뉴스를 스크랩했습니다.");
        }
    } catch (error) {
        console.error("뉴스 찜 오류:", error);
        alert("처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div style={styles.container}>로딩중...</div>;
  if (!data) return <div style={styles.container}>데이터가 없습니다.</div>;

  const { stockInfo, newsList, sentiment } = data;

  const changeRate = stockInfo.changeRate || 0;
  const priceChange = stockInfo.priceChange || 0;

  const isRising = changeRate > 0 || priceChange > 0;
  const isFalling = changeRate < 0 || priceChange < 0;

  const priceColor = isRising ? '#d60000' : isFalling ? '#0051c7' : '#333';
  const priceSign = isRising ? '▲' : isFalling ? '▼' : '-';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* 상단: 이름/가격 + 찜버튼 */}
        <div style={styles.headerTop}>
            <div style={styles.stockTitleGroup}>
                <h1 style={styles.stockTitle}>
                {stockInfo.stockName} <span style={styles.stockCode}>{stockInfo.stockCode}</span>
                </h1>
                
                <div style={styles.priceContainer}>
                    <div style={{ ...styles.price, color: priceColor }}>
                        {stockInfo.price ? stockInfo.price.toLocaleString() : 0}원
                    </div>
                    <div style={{ ...styles.changeInfo, color: priceColor }}>
                        {priceSign} {Math.abs(priceChange).toLocaleString()} 
                        <span style={{ marginLeft: '5px' }}>({changeRate}%)</span>
                    </div>
                </div>
            </div>

            <button 
                style={{ ...styles.starButton, ...(isFavorite ? {} : styles.starButtonEmpty) }} 
                onClick={handleToggleFavorite}
                title={isFavorite ? "관심종목 해제" : "관심종목 추가"}
            >
                {isFavorite ? '★' : '☆'}
            </button>
        </div>

        {/* 하단: 시장/업종/시총/기준일 */}
        <div style={styles.metaData}>
            <span style={styles.metaSpan}><strong>시장:</strong> {stockInfo.marketType || '-'}</span>
            <span style={styles.metaSpan}><strong>업종:</strong> {stockInfo.industry || '-'}</span>
            <span style={styles.metaSpan}><strong>시가총액:</strong> {stockInfo.marketCap || '-'}</span>
            <span style={styles.metaSpan}><strong>기준일:</strong> {stockInfo.updatedAt || '-'}</span>
        </div>
      </div>

      {/* 감성 분석 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🤖 AI 뉴스 감성 분석</h3>
        <div style={styles.sentimentBarContainer}>
            <div style={styles.barWrapper}>
                <div style={{ width: `${sentiment?.positiveRate}%`, backgroundColor: '#d60000' }} />
                <div style={{ width: `${sentiment?.neutralRate}%`, backgroundColor: '#999' }} />
                <div style={{ width: `${sentiment?.negativeRate}%`, backgroundColor: '#0051c7' }} />
            </div>
            
            <div style={styles.sentimentStats}>
                <div style={{ color: '#d60000' }}>긍정 {sentiment?.positiveCount}건</div>
                <div style={{ color: '#0051c7' }}>부정 {sentiment?.negativeCount}건</div>
            </div>
        </div>
      </div>

      {/* 뉴스 리스트 (수정됨: 별표 기능 추가) */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📰 관련 주요 뉴스</h3>
        {newsList && newsList.length > 0 ? (
            newsList.map((news) => {
                // ⭐ ID 확인 및 찜 여부 체크 (문자열 비교)
                const newsId = news.newsId || news.id;
                const isBookmarked = savedNewsIds.includes(String(newsId));

                return (
                    // ⭐ 기존 단순 div 대신 newsItemWrapper(Flex) 사용
                    <div key={newsId} style={styles.newsItemWrapper}>
                        {/* 왼쪽 텍스트 영역 */}
                        <div style={styles.newsContent}>
                            <a href={news.url} target="_blank" rel="noopener noreferrer" style={styles.newsLink}>
                                {news.title}
                            </a>
                            <div style={styles.newsSummary}>{news.content}</div>
                            <div style={styles.newsInfo}>
                                <span style={{ 
                                    ...styles.sentimentBadge, 
                                    color: news.sentiment === '긍정' ? '#d60000' : news.sentiment === '부정' ? '#0051c7' : '#666' 
                                }}>
                                    [{news.sentiment}]
                                </span>
                                <span>{news.newsDate}</span>
                                <span>키워드: {news.keywords}</span>
                            </div>
                        </div>

                        {/* ⭐ 오른쪽 별표 버튼 추가 */}
                        <button
                            onClick={() => handleToggleNewsBookmark(news)}
                            style={{ 
                                ...styles.newsStarButton, 
                                ...(isBookmarked ? styles.newsStarActive : {}) 
                            }}
                            title={isBookmarked ? "스크랩 취소" : "뉴스 스크랩"}
                        >
                            {isBookmarked ? '★' : '☆'}
                        </button>
                    </div>
                );
            })
        ) : (
            <p style={styles.noNews}>관련 뉴스가 없습니다.</p>
        )}
      </div>

    </div>
  );
}

export default StockDetailPage;