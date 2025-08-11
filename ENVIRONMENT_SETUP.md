# Environment Variables Setup for SheCare

## 🔒 Security Architecture

```
React Frontend ──→ Ballerina Backend ──→ External APIs
                    (API keys here)       (NewsAPI, etc.)
```

**✅ CORRECT:** API keys stored in Ballerina backend only  
**❌ WRONG:** API keys exposed to frontend (security risk!)

## News API Configuration

SheCare uses the NewsAPI.org service to fetch real health and wellness news articles. The API key is **securely stored in the Ballerina backend** and never exposed to the frontend.

### Getting Your News API Key

1. Visit [https://newsapi.org/](https://newsapi.org/)
2. Sign up for a free account
3. Go to your account dashboard
4. Copy your API key

### Setting Up Environment Variables

#### Option 1: Using Environment Files

1. **Backend Configuration:**
   - Navigate to `back-end/news_service/`
   - Edit the `.env` file
   - Replace `your_news_api_key_here` with your actual API key

2. **Frontend Configuration:**
   - Navigate to `front-end/`
   - The `.env.local` file is already configured with API URLs
   - No API key needed in frontend (security best practice)

#### Option 2: Using Setup Scripts

**Windows:**
```bash
# Edit setup-env.bat with your API key, then run:
setup-env.bat
```

**Linux/Mac:**
```bash
# Edit setup-env.sh with your API key, then run:
chmod +x setup-env.sh
source setup-env.sh
```

#### Option 3: Manual Environment Variables

**Windows PowerShell:**
```powershell
$env:NEWS_API_KEY="your_actual_api_key"
$env:NEWS_API_BASE_URL="https://newsapi.org/v2"
```

**Linux/Mac:**
```bash
export NEWS_API_KEY="your_actual_api_key"
export NEWS_API_BASE_URL="https://newsapi.org/v2"
```

### Starting the Services

After setting up environment variables:

1. **Start Ballerina Services:**
   ```bash
   # Terminal 1: Wellness Service
   cd back-end/wellness-api
   bal run --offline

   # Terminal 2: News Service  
   cd back-end/news_service
   bal run --offline

   # Terminal 3: Period Service
   cd back-end/period_service
   bal run --offline
   ```

2. **Start Frontend:**
   ```bash
   # Terminal 4: Frontend
   cd front-end
   npm run dev
   ```

### API Limits

- **Free Tier:** 1,000 requests per day
- **Development:** Use provided fallback key for testing
- **Production:** Always use your own API key

### Security Notes

- ✅ **API keys are ONLY in Ballerina backend** (server-side secure)
- ✅ **Frontend never touches external APIs** directly  
- ✅ **No secrets in browser** - inspecting frontend reveals nothing
- ✅ **.env files are gitignored** to prevent accidental commits
- ✅ **Proper separation of concerns** - backend handles integrations
- ✅ **Rate limiting controlled** by your backend, not exposed

**Data Flow:**
```
Frontend → Ballerina Backend → NewsAPI
   ↑              ↑                ↑
No secrets    API keys here    External service
```

### Troubleshooting

If you see `"af48587254ee42488769cafb91891908"` in the logs, it means the environment variable isn't set and the fallback key is being used.

To verify your environment variables:
```bash
echo $NEWS_API_KEY    # Linux/Mac
echo $env:NEWS_API_KEY  # Windows PowerShell
```
