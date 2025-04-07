@echo off
echo Installing dependencies for Healthcare Monitoring System...

echo.
echo Installing Backend dependencies...
cd src\backend
call npm install
cd ..\..

echo.
echo Installing Frontend dependencies...
cd src\frontend
call npm install
cd ..\..

echo.
echo Installing AI Microservice dependencies...
cd src\ai-microservices
pip install flask flask-cors
cd ..\..

echo.
echo All dependencies installed!
echo.
echo You can now run the application using start-app.bat
echo.
echo Press any key to exit...
pause > nul
