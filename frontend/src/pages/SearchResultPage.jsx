import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

// ==========================================
// 1. 스타일 객체 정의 (라이브러리 의존성 제거)
// ==========================================
const styles = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    borderBottom: '2px solid #333',
    paddingBottom: '15px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#555',
    margin: '30px 0 15px 0',
    borderLeft: '4px solid #007bff',
    paddingLeft: '10px',
    fontWeight: 'bold',
  },
  stockItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  code: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    textAlign: 'right',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#d60000',
  },
  newsListContainer: {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  newsItem: {
    display: 'block',
    textDecoration: 'none',
    padding: '15px',
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
  },
  newsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
    lineHeight: '1.4',
  },
  newsMeta: {
    fontSize: '12px',
    color: '#999',
    display: 'flex',
    justifyContent: 'space-between',
  },
  emptyMsg: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  }
};

function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [stocks, setStocks] = useState([]);
  const [newsList, setNewsList] = useState([]); // 뉴스 데이터 state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        // 백엔드 요청 (Map<String, Object> 반환)
        const response = await axios.get(`/api/stocks/search?keyword=${keyword}`);
        
        // 응답 구조: { stocks: [...], news: [...] }
        setStocks(response.data.stocks || []);
        setNewsList(response.data.news || []);

      } catch (error) {
        console.error("검색 실패", error);
        // alert("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>'{keyword}' 검색 결과</h2>

      {loading ? (
        <p style={{textAlign:'center', marginTop:'50px'}}>검색 중...</p>
      ) : (
        <>
            {/* 1. 종목 검색 결과 섹션 */}
            <h3 style={styles.sectionTitle}>📈 종목 ({stocks.length})</h3>
            {stocks.length === 0 ? (
                <p style={styles.emptyMsg}>검색된 종목이 없습니다.</p>
            ) : (
                stocks.map((stock) => (
                <Link 
                    to={`/stock/${stock.stockCode}`} 
                    key={stock.stockCode} 
                    style={styles.link}
                >
                    <div style={styles.stockItem}>
                        <div style={styles.stockInfo}>
                            <span style={styles.name}>{stock.stockName}</span>
                            <span style={styles.code}>{stock.marketType} | {stock.stockCode}</span>
                        </div>
                        <div style={styles.price}>
                            {stock.price ? stock.price.toLocaleString() : '-'}원 
                            <span style={{fontSize: '12px', marginLeft: '5px', color: '#333'}}>
                            {/* 등락률이 있으면 표시 */}
                            {stock.changeRate !== undefined ? `(${stock.changeRate}%)` : ''}
                            </span>
                        </div>
                    </div>
                </Link>
                ))
            )}

            {/* 2. 뉴스 검색 결과 섹션 */}
            <h3 style={styles.sectionTitle}>📰 관련 뉴스 ({newsList.length})</h3>
            {newsList.length === 0 ? (
                <p style={styles.emptyMsg}>관련 뉴스가 없습니다.</p>
            ) : (
                <div style={styles.newsListContainer}>
                    {newsList.map((news, idx) => (
                        <a 
                            key={news.newsId || idx} 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.newsItem}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <div style={styles.newsTitle}>{news.title}</div>
                            <div style={styles.newsMeta}>
                                <span>{news.newsDate ? new Date(news.newsDate).toLocaleDateString() : ''}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </>
      )}
    </div>
  );
}

export default SearchResultPage;