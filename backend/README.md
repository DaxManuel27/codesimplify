# AI Research Backend Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend/
   npm install
   ```

2. **Create environment file:**
   Create a file named `.env` in this directory with:
   ```
   API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```

3. **Get your Google Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy it to your .env file

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Test it works:**
   - Open browser: http://localhost:3000/api/explain
   - Should see error message (this is expected!)

## Environment Variables

- `API_KEY` - Your Google Gemini AI API key (required)
- `PORT` - Server port (optional, defaults to 3000)

## API Endpoints

- `POST /api/explain` - Explain code with AI
- All other routes return 404

## For Production

Deploy to Vercel:
```bash
vercel login
vercel
``` 