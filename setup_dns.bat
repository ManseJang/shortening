@echo off
chcp 65001 > nul
echo.
echo [약수.울산] 도메인 설정을 시작합니다...
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo 관리자 권한이 확인되었습니다.
) else (
    echo 관리자 권한이 필요합니다.
    echo 이 파일을 마우스 오른쪽 버튼으로 클릭하고 '관리자 권한으로 실행'을 선택해주세요.
    pause
    exit
)

echo.
echo hosts 파일에 도메인을 추가합니다...
echo. >> C:\Windows\System32\drivers\etc\hosts
echo 127.0.0.1 약수.울산 >> C:\Windows\System32\drivers\etc\hosts

echo 설정이 완료되었습니다!
echo 이제 브라우저에서 http://약수.울산:3000 주소로 접속할 수 있습니다.
echo (참고: Next.js 서버가 3000번 포트에서 실행 중이어야 합니다)
echo.
pause
