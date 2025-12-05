@echo off
chcp 65001 >nul
REM ============================================================
REM 코스피 종목 크롤링 자동 실행 스케줄러 등록
REM 10분마다 실행
REM ============================================================

set PYTHON_PATH=C:\Users\KH\AppData\Local\Programs\Python\Python313\python.exe
set WORK_DIR=C:\temp6
set CRAWLER_SCRIPT=crawler_stock_info.py

echo ============================================================
echo 코스피 크롤링 스케줄러 등록 시작 (10분마다 실행)
echo ============================================================

REM 기존 스케줄러 삭제
schtasks /Delete /TN "KStockInfoCrawler" /F 2>nul

REM 코스피 크롤링 스케줄러 생성
echo.
echo [1] 코스피 크롤러 스케줄러 등록 중...
schtasks /Create /TN "KStockInfoCrawler" ^
    /TR "\"%PYTHON_PATH%\" \"%WORK_DIR%\%CRAWLER_SCRIPT%\"" ^
    /SC MINUTE ^
    /MO 10 ^
    /ST 00:00 ^
    /RU SYSTEM ^
    /RL HIGHEST ^
    /F

if %ERRORLEVEL% EQU 0 (
    echo ✓ 코스피 크롤링 스케줄러 등록 완료!
) else (
    echo ✗ 코스피 크롤링 스케줄러 등록 실패
)

echo.
echo ============================================================
echo 스케줄러 등록 완료!
echo ============================================================

echo.
echo 등록된 작업 확인:
schtasks /Query /TN "KStockInfoCrawler" /FO LIST /V
echo.

pause
