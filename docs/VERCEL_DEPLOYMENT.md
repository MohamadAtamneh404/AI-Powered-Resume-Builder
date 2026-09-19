# Deploying AI-Powered Resume Builder to Vercel

This guide walks you through deploying your AI-Powered Resume Builder to Vercel.

---

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:

1. A **[Vercel account](https://vercel.com/signup)** (free).
2. A **[MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)** cloud database (free tier works great):
   - In MongoDB Atlas, go to **Network Access** > **Add IP Address** > Choose **Allow Access from Anywhere (`0.0.0.0/0`)** (required because Vercel serverless IPs are dynamic).
   - Go to **Database** > **Connect** > **Drivers** to copy your `MONGO_URI` connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/ai_resume?retryWrites=true&w=majority`).
3. Your API keys from your `.env`:
   - `OPENROUTER_API_KEY` (or Gemini API key)
   - `JWT_SECRET`
   - Firebase credentials (if using Firebase Auth)
   - SMTP credentials (if using email verification)

---

## 🚀 Option 1: Monorepo All-in-One Deployment on Vercel (Easiest)

This option deploys both your Vite React frontend and Express API backend onto Vercel in a single project.

### Step 1: Push Code to GitHub
Push your latest changes to your GitHub repository:
```bash
git add .
git commit -m "Configure Vercel deployment and serverless compatibility"
git push origin main
```

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Select your `AI-Powered-Resume-Builder` repository and click **Import**.
3. In the **Project Configuration** screen:
   - **Framework Preset**: Other (or Vite)
   - **Root Directory**: Leave as `./` (the root of the project).
   - The root `vercel.json` already defines the build commands:
     - Build: `cd FrontEnd && npm install && npm run build`
     - Output Directory: `FrontEnd/dist`
     - Install: `npm --prefix BackEnd install && npm --prefix FrontEnd install`

### Step 3: Add Environment Variables in Vercel
Expand **Environment Variables** in the Vercel setup screen and add:

| Key | Example Value | Description |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/ai_resume` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your_long_random_jwt_secret_here` | Secret for signing auth tokens |
| `FRONTEND_ORIGIN` | `*` (or your vercel app URL) | Allowed CORS origin |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | OpenRouter / AI key |
| `OPENROUTER_MODELS` | `google/gemini-2.5-flash,openai/gpt-4o-mini` | AI models |
| `OPENROUTER_MAX_TOKENS` | `2500` | Max tokens for AI completions |
| `FIREBASE_PROJECT_ID` | `your-firebase-project-id` | Firebase project ID |
| `EMAIL_HOST` | `smtp.gmail.com` | Email host (optional) |
| `EMAIL_PORT` | `587` | Email port (optional) |
| `EMAIL_USER` | `your-email@gmail.com` | Email user (optional) |
| `EMAIL_PASS` | `your-app-password` | Email app password (optional) |

> **Note on Puppeteer**: Vercel Serverless functions run on AWS Lambda which enforces a 250MB size limit and doesn't bundle the standard Chrome binary. The backend code has been updated to handle this safely. For PDF downloads, users can print/save directly in the browser via client-side printing.

### Step 4: Deploy
Click **Deploy**. Vercel will:
- Install dependencies for both Frontend and Backend
- Compile the Vite production build
- Set up the serverless function under `/api/*`
- Deploy to a custom `https://<your-project>.vercel.app` URL

---

## ⚡ Option 2: Decoupled Deployment (FrontEnd on Vercel + BackEnd on Render/Railway)

This is the recommended architecture for heavy MERN workloads using full **Puppeteer** (server-side PDF generation) or long-running tasks.

### Step 1: Deploy BackEnd to Render or Railway
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `BackEnd`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add all your environment variables (`MONGO_URI`, `JWT_SECRET`, etc.).
6. Copy your deployed backend URL (e.g. `https://my-resume-api.onrender.com`).

### Step 2: Deploy FrontEnd to Vercel
1. Go to [Vercel](https://vercel.com/dashboard) > **Add New...** > **Project**.
2. Select your repository.
3. In **Project Configuration**, set:
   - **Root Directory**: click **Edit** and select `FrontEnd`.
   - **Framework Preset**: `Vite` (auto-detected).
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://my-resume-api.onrender.com/api`
5. Click **Deploy**.

`FrontEnd/vercel.json` is already configured with SPA rewrites so direct navigation to `/dashboard`, `/login`, etc. works seamlessly without 404 errors.

---

## 🩺 Testing and Verification

Once deployed, you can verify your deployment:

1. **API Health Check**:
   Visit `https://<your-vercel-domain>/api/health`
   You should receive:
   ```json
   {
     "status": "ok",
     "dbState": 1,
     "timestamp": "2026-09-19T..."
   }
   ```
   (`dbState: 1` means MongoDB is connected!)

2. **Frontend SPA Routing**:
   Navigate directly to `https://<your-vercel-domain>/login` or refresh the page on `/dashboard`. It should load the page instead of showing a 404.
