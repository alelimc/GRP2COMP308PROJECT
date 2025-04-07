@echo off
echo Starting Healthcare Monitoring System...

echo.
echo Starting Backend (GraphQL API)...
start cmd /k "cd src\backend && npm run dev"

echo.
echo Starting Frontend (React)...
start cmd /k "cd src\frontend && npm start"

echo.
echo Starting AI Microservice...
start cmd /k "cd src\ai-microservices && python app.py"

echo.
echo All services started!
echo.
echo Backend: http://localhost:4000/graphql
echo Frontend: http://localhost:3000
echo AI Microservice: http://localhost:5000
echo.
echo Press any key to exit this window (services will continue running)...
pause > nul
