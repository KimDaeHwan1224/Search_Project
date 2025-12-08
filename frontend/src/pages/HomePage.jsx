import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 🌟 차트 컴포넌트 import (경로가 맞는지 확인해주세요)
import KosdaqLineChart from '../components/shared/KosdaqLineChart';
import KospiLineChart from '../components/shared/KospiLineChart';

// --- 임시 컴포넌트 (기존 스타일 유지) ---
const KospiIndexCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & > h3 {
    color: #3f51b5;
    margin-bottom: 15px;
  }
`;

const NewsCard = styled.div`
  background-color: #f7f7f7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 5px solid #3f51b5;
  & > p {
    font-size: 0.9rem;
    color: #555;
  }
`;
// -----------------

// --- Styled Components for Layout ---

const HomePageContainer = styled.div`
  padding: 30px;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const HeaderSection = styled.header`
  margin-bottom: 40px;
  & > h1 {
    color: #1e3a8a;
    font-weight: 800;
    font-size: 2.5rem;
  }
  & > p {
    color: #6b7280;
    margin-top: 5px;
  }
`;

const IndexAndMarketSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
`;

const MarketStatusCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StockList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 15px;
  & > li {
    padding: 8px 0;
    border-bottom: 1px dashed #eee;
    font-size: 0.95rem;
    /* Link가 내부를 꽉 채우도록 설정 */
    display: flex; 
    align-items: center;
  }
`;

// ⭐ 링크 스타일드 컴포넌트 추가 (클릭 영역 확장 및 디자인 유지)
const StyledLink = styled(Link)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  text-decoration: none;
  color: inherit;
  cursor: pointer;

  &:hover {
    background-color: #f9fafb; /* 호버 시 살짝 배경색 변경 */
  }
`;

const NewsSection = styled.section`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const NewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  & > h2 {
    color: #1e3a8a;
    font-size: 1.8rem;
  }
`;

const KeywordTabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
`;

const KeywordTab = styled.button`
  background: none;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  color: ${props => (props.active ? '#3f51b5' : '#6b7280')};
  border-bottom: ${props => (props.active ? '3px solid #3f51b5' : '3px solid transparent')};
  transition: all 0.2s;
  
  /* active prop 경고 회피용 */
  &[active="true"] { 
    font-weight: bold;
    color: #3f51b5;
    border-bottom: 3px solid #3f51b5;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

// ----------------------------------------------------
// 🌟 Marquee (애니메이션) 관련 Styled Components
// ----------------------------------------------------

const marquee = keyframes`
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); } 
`;

const StockMarqueeSection = styled.div`
  margin-bottom: 40px;
  overflow: hidden; 
  white-space: nowrap; 
  background-color: #ffffff;
  padding: 10px 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StockMarqueeContainer = styled.div`
  animation: ${marquee} 60s linear infinite; 
  &:hover {
    animation-play-state: paused; 
  }
  width: 200%; 
  display: flex; 
`;

const MarqueeContent = styled.div`
  flex: 0 0 50%; 
  display: inline-flex; 
  gap: 25px; 
  padding: 0 25px; 
`;

const StockPill = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
  
  ${props => {
    const rateString = props.rate ? props.rate.toString().replace(/%|\+/g, '') : '0';
    const isPositive = parseFloat(rateString) > 0;
    const color = isPositive ? '#10b981' : '#ef4444'; 
    const bgColor = isPositive ? '#ecfdf5' : '#fef2f2'; 
    const borderColor = isPositive ? '#34d399' : '#f87171'; 

    return css`
      color: ${color};
      background-color: ${bgColor};
      border: 1px solid ${borderColor};

      &:hover {
        transform: translateY(-2px); 
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
    `;
  }}
`;

const StockName = styled.span`
  margin-right: 5px;
`;


// ----------------------------------------------------
// 🌟 유틸리티 함수
// ----------------------------------------------------
const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    const numericRate = Number(rate); 
    if (isNaN(numericRate)) return '-';
    
    const sign = numericRate > 0 ? '+' : (numericRate < 0 ? '' : '');
    return `${sign}${numericRate.toFixed(2)}%`; 
};


// --- HomePage Function ---
function HomePage() {

    const [indexData, setIndexData] = useState({
      kospi: null,
      kosdaq: null,
    });

    useEffect(() => {
      const fetchLatestIndex = async () => {
        try {
            const res = await axios.get('http://localhost:8484/api/chart/latest');
            setIndexData({
              kospi: res.data.kospi,
              kosdaq: res.data.kosdaq,
            });
        } catch(e) {
            console.error(e);
        }
      };
      fetchLatestIndex();
    }, []);

    const [activeKeyword, setActiveKeyword] = useState('Today_Hot');

    const [stockData, setStockData] = useState({
        rising: [],
        falling: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopMovers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8484/api/stocks/top-movers');
                setStockData({
                    rising: response.data.rising,
                    falling: response.data.falling,
                });
            } catch (error) {
                console.error("Top Movers 데이터 로드 실패:", error);
                setStockData({ rising: [], falling: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchTopMovers();
    }, []);


    const newsData = {
        Today_Hot: [
            { title: '핵심 뉴스 1', summary: '주요 이슈에 대한 간략한 요약입니다.' },
            { title: '핵심 뉴스 2', summary: '시장에 큰 영향을 미치는 소식입니다.' },
            { title: '핵심 뉴스 3', summary: '업계 동향 관련 새로운 정보입니다.' },
            { title: '핵심 뉴스 4', summary: '경제 전문가들의 심층 분석 내용입니다.' },
        ],
        Technology: [
            { title: '기술 뉴스 1', summary: 'AI, 반도체 관련 산업 소식입니다.' },
            { title: '기술 뉴스 2', summary: '미래 산업 동향 관련 정보입니다.' },
        ],
        Economy: [
            { title: '경제 뉴스 1', summary: '금리, 환율 관련 주요 발표입니다.' },
            { title: '경제 뉴스 2', summary: '세계 경제 지표 관련 분석입니다.' },
        ],
    };
    
    const [marqueeStocks, setMarqueeStocks] = useState([]);

    useEffect(() => {
      const fetchMarqueeStocks = async () => {
          try {
              const response = await axios.get('http://localhost:8484/api/stocks/marketcap');
              const converted = response.data.map(stock => ({
                  name: stock.stockName,
                  rate: formatRate(stock.changeRate),
                  code: stock.stockCode 
              }));

              setMarqueeStocks(converted);
          } catch (error) {
              console.error("마퀴 데이터 로드 실패:", error);
              setMarqueeStocks([]);
          }
      };

      fetchMarqueeStocks();
  }, []);

    const renderMarqueeContent = () => (
        <>
            {marqueeStocks.map((stock, index) => (
                <Link
                    key={index}
                    to={`/stock/${stock.code}`}
                    style={{ textDecoration: 'none' }}
                >
                    <StockPill rate={stock.rate}>
                        <StockName>{stock.name}</StockName>
                        {stock.rate}
                    </StockPill>
                </Link>
            ))}
        </>
    );

    return (
        <HomePageContainer>
            {/* 1. 헤더 */}
            <HeaderSection>
                <h1>메인 경제 대시보드</h1>
                <p>{new Date().toLocaleString('ko-KR', { dateStyle: 'full' })} 현재 시장 상황</p>
            </HeaderSection>

            {/* 2. 지수 및 급등/급락 종목 영역 */}
            <IndexAndMarketSection>
                {/* Kospi */}
                <KospiIndexCard>
                    <h3>🇰🇷 KOSPI 지수</h3>
                    <p>
                      {indexData.kospi
                        ? indexData.kospi.clpr.toLocaleString()
                        : '로딩 중...'}{' '}
                      {indexData.kospi && (
                        <span style={{ color: indexData.kospi.fltRt > 0 ? 'red' : 'blue' }}>
                          ({indexData.kospi.fltRt > 0 ? '+' : ''}
                          {indexData.kospi.fltRt.toFixed(2)}%)
                        </span>
                      )}
                    </p>
                    
                    <div style={{ width: '100%', marginTop: '15px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: '6px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                        <KospiLineChart />
                    </div>
                </KospiIndexCard>

                {/* Kosdaq */}
                <KospiIndexCard>
                    <h3>🌐 KOSDAQ 지수</h3>
                    <p>
                      {indexData.kosdaq
                        ? indexData.kosdaq.clpr.toLocaleString()
                        : '로딩 중...'}{' '}
                      {indexData.kosdaq && (
                        <span style={{ color: indexData.kosdaq.fltRt > 0 ? 'red' : 'blue' }}>
                          ({indexData.kosdaq.fltRt > 0 ? '+' : ''}
                          {indexData.kosdaq.fltRt.toFixed(2)}%)
                        </span>
                      )}
                    </p>
                    
                    <div style={{ width: '100%', marginTop: '15px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: '6px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                        <KosdaqLineChart />
                    </div>
                </KospiIndexCard>

                {/* 🔥 급등/급락 종목 */}
                <MarketStatusCard>
                    <h3 style={{ color: '#1e3a8a' }}>🔥 오늘 시장 주도주</h3>
                    
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '30px' }}>종목 데이터 로드 중...</p>
                    ) : (
                        <>
                            {/* 급등 종목 */}
                            <h4 style={{ color: '#ef4444', marginTop: '20px', borderBottom: '1px solid #fee2e2', paddingBottom: '5px' }}>급등 종목 Top 3</h4>
                            <StockList>
                                {stockData.rising.map((stock, index) => (
                                    <li key={stock.stockCode || index}>
                                        {/* ⭐ 수정된 부분: StyledLink 적용 */}
                                        <StyledLink to={`/stock/${stock.stockCode}`}>
                                            <strong>{stock.stockName || '정보 없음'}</strong>
                                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                        </StyledLink>
                                    </li>
                                ))}
                            </StockList>

                            {/* 급락 종목 */}
                            <h4 style={{ color: '#3b82f6', marginTop: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '5px' }}>급락 종목 Top 3</h4>
                            <StockList>
                                {stockData.falling.map((stock, index) => (
                                    <li key={stock.stockCode || index}>
                                        {/* ⭐ 수정된 부분: StyledLink 적용 */}
                                        <StyledLink to={`/stock/${stock.stockCode}`}>
                                            <strong>{stock.stockName || '정보 없음'}</strong>
                                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatRate(stock.changeRate)}</span>
                                        </StyledLink>
                                    </li>
                                ))}
                            </StockList>
                        </>
                    )}
                </MarketStatusCard>
            </IndexAndMarketSection>

            {/* 마퀴 섹션 */}
            <StockMarqueeSection>
                <StockMarqueeContainer>
                    <MarqueeContent>{renderMarqueeContent()}</MarqueeContent>
                    <MarqueeContent>{renderMarqueeContent()}</MarqueeContent> 
                </StockMarqueeContainer>
            </StockMarqueeSection>

            {/* 3. 뉴스 및 이슈 키워드 영역 */}
            <NewsSection>
                <NewsHeader>
                    <h2>📰 오늘의 주요 이슈 및 뉴스</h2>
                    <Link to="/trend" style={{ color: '#3f51b5', textDecoration: 'none', fontWeight: '600' }}>
                        더보기 &gt;
                    </Link>
                </NewsHeader>

                <KeywordTabs>
                    {Object.keys(newsData).map((keyword) => (
                        <KeywordTab
                            key={keyword}
                            active={(activeKeyword === keyword).toString()} 
                            onClick={() => setActiveKeyword(keyword)}
                        >
                            {keyword.replace('_', ' ')}
                        </KeywordTab>
                    ))}
                </KeywordTabs>

                <NewsGrid>
                    {newsData[activeKeyword].map((news, index) => (
                        <NewsCard key={index}>
                            <h4 style={{ color: '#1e3a8a', marginBottom: '5px' }}>{news.title}</h4>
                            <p>{news.summary}</p>
                            <Link to={`/news/${index}`} style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '10px', display: 'block' }}>
                                뉴스 상세 보기
                            </Link>
                        </NewsCard>
                    ))}
                </NewsGrid>
            </NewsSection>
        </HomePageContainer>
    );
}

export default HomePage;