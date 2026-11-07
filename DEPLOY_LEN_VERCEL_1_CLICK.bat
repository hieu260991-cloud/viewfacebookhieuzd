@echo off
chcp 65001 >nul
title Deploy len https://viewfacebookhieuzd.vercel.app/
echo ============================================================================
echo      TU DONG DEPLOY WEB APP LEN: https://viewfacebookhieuzd.vercel.app/
echo ============================================================================
echo.

where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo [THONG BAO] May tinh chua cai Node.js. Dang mo trang keo-tha trực tiep len Vercel...
    start "" "https://vercel.com/new"
    echo Hay keo thu muc nay tha vao trang Vercel vua mo va dat Project Name la: viewfacebookhieuzd
    pause
    exit /b 0
)

echo Dang ket noi Vercel CLI va deploy project voi ten: viewfacebookhieuzd ...
call npx vercel --prod --name viewfacebookhieuzd --yes
echo.
echo ============================================================================
echo [HOAN TAT] Truy cap ngay tai: https://viewfacebookhieuzd.vercel.app/
echo ============================================================================
start "" "https://viewfacebookhieuzd.vercel.app/"
pause
