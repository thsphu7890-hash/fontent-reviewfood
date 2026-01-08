@echo off
echo Dang thuc hien day code len Github...
git add .
set /p msg="Nhap ghi chu commit (Enter de bo qua): "
if "%msg%"=="" set msg="Cap nhat tu dong"
git commit -m "%msg%"
git push
echo.
echo === DA XONG! Code da len Github ===
pause