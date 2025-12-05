# update_stock_codes.py - 기존 뉴스의 STOCK_CODE 업데이트 (더 느슨한 버전 - 빠른 처리)
import oracledb
import re

# ===============================
# DB 연결 정보
# ===============================
DB_USER = "opendata_user"
DB_PASSWORD = "opendata123"
DB_DSN = "192.168.10.34:1521/XE"

# ===============================
# 종목명 매칭 함수 (더 느슨한 버전 - 빠른 처리)
# ===============================
def find_stock_code(conn, title, content):
    """
    제목과 본문에서 종목명을 찾아 STOCK_CODE 반환 (더 느슨한 버전)
    - 매우 공격적인 매칭 (1글자도 허용, 최소 점수 10점)
    - 빠른 처리를 위해 간단한 로직 사용
    """
    if not title and not content:
        return None
    
    # 제목과 본문을 합친 텍스트
    search_text = ""
    if title:
        search_text += title + " "
    if content:
        search_text += content
    
    if not search_text:
        return None
    
    # 은행/금융기관 약어 매핑 (확장)
    bank_aliases = {
        "농협": ["NH농협", "농협은행", "농협銀", "농협금융", "농협금융지주", "농협중앙회", "농협경제지주"],
        "KB금융": ["KB", "KB금융지주", "KB금융"],
        "신한지주": ["신한", "신한금융", "신한금융지주", "신한은행", "신한銀"],
        "하나금융": ["하나", "하나금융지주", "하나금융", "하나은행"],
        "우리금융": ["우리", "우리금융지주", "우리금융", "우리은행", "우리銀"],
        "새마을금고": ["새마을금고중앙회"],
        "BNK금융": ["BNK", "BNK금융지주"],
    }
    
    # 회사명 약어 매핑 (확장)
    company_aliases = {
        "삼성": ["삼성전자", "삼성SDI", "삼성물산", "삼성화재", "삼성생명"],
        "SK": ["SK하이닉스", "SK이노베이션", "SK텔레콤", "SK증권"],
        "LG": ["LG전자", "LG화학", "LG에너지솔루션", "LG유플러스"],
        "현대": ["현대차", "현대모비스", "현대중공업"],
        "포스코": ["포스코홀딩스", "포스코퓨처엠"],
        "한전": ["한국전력", "한전"],
        "코레일": ["한국철도공사", "코레일"],
        "쿠팡": ["쿠팡"],
        "원텍": ["원텍"],
    }
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT STOCK_NAME, STOCK_CODE FROM STOCK_INFO WHERE STOCK_NAME IS NOT NULL ORDER BY LENGTH(STOCK_NAME) DESC")
        stocks = cursor.fetchall()
        cursor.close()
        
        if not stocks:
            return None
        
        # 매칭된 종목들 (우선순위 점수, 종목명 길이, 종목명, 코드)
        matched_stocks = []
        
        for stock_name, stock_code in stocks:
            if not stock_name or not stock_code:
                continue
            
            stock_name_clean = stock_name.strip()
            if not stock_name_clean:
                continue
            
            # ETF/ETN도 허용 (더 느슨하게)
            is_etf_etn = "ETF" in stock_name_clean or "ETN" in stock_name_clean or "HANARO" in stock_name_clean
            
            # 1. 정확한 종목명 매칭 (최고 우선순위: 100점)
            if stock_name_clean in search_text:
                if title and stock_name_clean in title:
                    score = 100
                    matched_stocks.append((score, len(stock_name_clean), stock_name_clean, stock_code))
                else:
                    score = 90
                    matched_stocks.append((score, len(stock_name_clean), stock_name_clean, stock_code))
                continue
            
            # 2. 은행/금융기관 약어 매칭
            for main_name, aliases in bank_aliases.items():
                if stock_name_clean == main_name or stock_name_clean in aliases:
                    for alias in [main_name] + aliases:
                        if alias in search_text:
                            if title and alias in title:
                                matched_stocks.append((95, len(stock_name_clean), stock_name_clean, stock_code))
                            else:
                                matched_stocks.append((85, len(stock_name_clean), stock_name_clean, stock_code))
                            break
            
            # 3. 회사명 약어 매칭
            for main_name, aliases in company_aliases.items():
                if any(alias in stock_name_clean for alias in aliases) or stock_name_clean == main_name:
                    for alias in [main_name] + aliases:
                        if alias in search_text:
                            if title and alias in title:
                                matched_stocks.append((95, len(stock_name_clean), stock_name_clean, stock_code))
                            else:
                                matched_stocks.append((85, len(stock_name_clean), stock_name_clean, stock_code))
                            break
            
            # 4. 종목명의 주요 부분 매칭 (매우 공격적)
            if len(stock_name_clean) >= 2:
                # 앞부분 2글자
                prefix_2 = stock_name_clean[:2]
                if prefix_2 in search_text:
                    if title and prefix_2 in title:
                        matched_stocks.append((70, len(stock_name_clean), stock_name_clean, stock_code))
                    else:
                        matched_stocks.append((60, len(stock_name_clean), stock_name_clean, stock_code))
                
                # 앞부분 3글자
                if len(stock_name_clean) >= 3:
                    prefix_3 = stock_name_clean[:3]
                    if prefix_3 in search_text:
                        if title and prefix_3 in title:
                            matched_stocks.append((80, len(stock_name_clean), stock_name_clean, stock_code))
                        else:
                            matched_stocks.append((75, len(stock_name_clean), stock_name_clean, stock_code))
                
                # 뒷부분 2글자
                if len(stock_name_clean) >= 3:
                    suffix_2 = stock_name_clean[-2:]
                    if suffix_2 in search_text:
                        if title and suffix_2 in title:
                            matched_stocks.append((65, len(stock_name_clean), stock_name_clean, stock_code))
                        else:
                            matched_stocks.append((55, len(stock_name_clean), stock_name_clean, stock_code))
                
                # 중간 부분 매칭 (단어 단위) - 간단하게
                if len(stock_name_clean) >= 3:
                    parts = re.findall(r'[가-힣]+|[A-Z]+', stock_name_clean)
                    for part in parts:
                        if len(part) >= 2 and part in search_text:
                            if title and part in title:
                                matched_stocks.append((50, len(stock_name_clean), stock_name_clean, stock_code))
                            else:
                                matched_stocks.append((40, len(stock_name_clean), stock_name_clean, stock_code))
                            break
                
                # ★ 매우 공격적: 1글자 매칭도 허용 (더 높은 점수)
                if len(stock_name_clean) >= 2:
                    first_char = stock_name_clean[0]
                    if first_char in search_text and ord(first_char) >= 0xAC00 and ord(first_char) <= 0xD7A3:
                        # 1글자 매칭 점수 높임 (40-50점)
                        if title and first_char in title:
                            matched_stocks.append((50, len(stock_name_clean), stock_name_clean, stock_code))
                        else:
                            matched_stocks.append((40, len(stock_name_clean), stock_name_clean, stock_code))
        
        if not matched_stocks:
            return None
        
        # 우선순위 점수와 종목명 길이로 정렬
        matched_stocks.sort(key=lambda x: (x[0], x[1]), reverse=True)
        
        # 중복 제거
        seen_codes = set()
        for score, length, name, code in matched_stocks:
            if code not in seen_codes:
                seen_codes.add(code)
                # 제목에서 매칭된 것이 우선
                if title and name in title:
                    return code
        
        # 제목에서 매칭되지 않았으면 본문에서 매칭된 것 중 최고 점수
        # ★ 매우 느슨하게: 10점 이상이면 모두 허용
        for score, length, name, code in matched_stocks:
            if code not in seen_codes:
                if score >= 10:  # 최소 점수를 10점으로 매우 낮춤
                    return code
        
        return None
        
    except Exception as e:
        print(f"종목명 매칭 오류: {e}")
        return None

# ===============================
# 메인 함수
# ===============================
def main():
    conn = None
    try:
        try:
            oracledb.init_oracle_client()
        except:
            pass
        
        conn = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=DB_DSN
        )
        
        conn.autocommit = False
        
        print("Oracle DB 연결 성공!\n")
        
        # STOCK_CODE가 NULL인 뉴스 조회 (100개만)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT NEWS_ID, TITLE, CONTENT
            FROM (
                SELECT NEWS_ID, TITLE, CONTENT
                FROM STOCK_NEWS
                WHERE STOCK_CODE IS NULL
                ORDER BY CREATED_AT ASC
            )
            WHERE ROWNUM <= 100
        """)
        
        news_list = cursor.fetchall()
        cursor.close()
        
        total_count = len(news_list)
        print(f"STOCK_CODE가 NULL인 뉴스: {total_count}개 (최대 100개만 처리)\n")
        
        if total_count == 0:
            print("업데이트할 뉴스가 없습니다.")
            return
        
        print("=" * 60)
        print("STOCK_CODE 업데이트 시작 (더 느슨한 버전 - 빠른 처리)")
        print("=" * 60)
        print("※ 매우 공격적인 매칭 로직 사용 (최소 점수 10점)")
        print()
        
        updated_count = 0
        not_found_count = 0
        
        for idx, (news_id, title, content) in enumerate(news_list, 1):
            # CLOB 처리
            if content:
                if hasattr(content, 'read'):
                    content = content.read()
                if not isinstance(content, str):
                    content = str(content)
            else:
                content = ""
            
            title = title if title else ""
            
            # 종목명 매칭
            stock_code = find_stock_code(conn, title, content)
            
            if stock_code:
                # STOCK_CODE 업데이트
                update_cursor = conn.cursor()
                try:
                    update_cursor.execute("""
                        UPDATE STOCK_NEWS
                        SET STOCK_CODE = :stock_code
                        WHERE NEWS_ID = :news_id
                    """, {
                        'stock_code': stock_code,
                        'news_id': news_id
                    })
                    conn.commit()
                    updated_count += 1
                    
                    # 종목명 조회
                    name_cursor = conn.cursor()
                    name_cursor.execute("SELECT STOCK_NAME FROM STOCK_INFO WHERE STOCK_CODE = :code", {'code': stock_code})
                    stock_name_result = name_cursor.fetchone()
                    stock_name = stock_name_result[0] if stock_name_result else stock_code
                    name_cursor.close()
                    
                    if idx % 10 == 0 or idx == total_count:
                        print(f"[{idx}/{total_count}] ✓ 업데이트: {title[:50]}... → {stock_code} ({stock_name})")
                    
                except Exception as e:
                    conn.rollback()
                    print(f"✗ 업데이트 실패 (NEWS_ID: {news_id}): {e}")
                finally:
                    update_cursor.close()
            else:
                not_found_count += 1
                if idx % 10 == 0 or idx == total_count:
                    print(f"[{idx}/{total_count}] ✗ 종목명 없음: {title[:50]}...")
        
        print("\n" + "=" * 60)
        print("업데이트 완료!")
        print("=" * 60)
        print(f"전체 뉴스: {total_count}개")
        print(f"업데이트 성공: {updated_count}개")
        print(f"종목명 없음: {not_found_count}개")
        print("=" * 60)
        
        # 최종 확인: 여전히 NULL인 뉴스가 있는지 확인
        final_cursor = conn.cursor()
        final_cursor.execute("SELECT COUNT(*) FROM STOCK_NEWS WHERE STOCK_CODE IS NULL")
        remaining_null = final_cursor.fetchone()[0]
        final_cursor.close()
        
        if remaining_null > 0:
            print(f"\n⚠ 경고: 여전히 STOCK_CODE가 NULL인 뉴스가 {remaining_null}개 남아있습니다.")
            print("다음 실행 시 나머지 뉴스도 처리됩니다.")
        else:
            print(f"\n✓ 성공: 모든 뉴스의 STOCK_CODE가 업데이트되었습니다!")
        
    except Exception as e:
        print(f"에러 발생: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()
            print("\nDB 연결 종료")

if __name__ == "__main__":
    main()