@echo off
REM SheCare Development Environment Setup Script
REM Run this script before starting Ballerina services
REM IMPORTANT: API keys are set for BACKEND ONLY (secure!)

echo Setting up environment variables for SheCare...
echo SECURITY: API keys are backend-only, never exposed to frontend!
echo.

REM Set NEWS API Key - Replace with your actual API key
set NEWS_API_KEY=your_news_api_key_here
set NEWS_API_BASE_URL=https://newsapi.org/v2

echo Environment variables set for BACKEND services!
echo Frontend will connect to backend APIs only (secure architecture)
echo.
echo.
echo To get your News API key:
echo 1. Visit https://newsapi.org/
echo 2. Sign up for a free account
echo 3. Get your API key from the dashboard
echo 4. Update this script with your actual API key
echo.
echo Now you can start the Ballerina services:
echo cd back-end/news_service
echo bal run --offline
echo.
pause
