# Deploying AI-Powered Resume Builder to Vercel (Preview / Client Showcase Mode)

This project is configured with a **Client Showcase / Demo Mode** designed specifically for presenting to clients, recruiters, and stakeholders.

---

## ✨ Features of Preview / Showcase Mode

- **Always Logged In**: The visitor is automatically logged in as **Alex Morgan** (Senior Full Stack Engineer) with zero login friction.
- **Preloaded Rich Data**:
  - **Dashboard**: Live metrics, ATS scores, and preloaded resumes ready for preview.
  - **Full WYSIWYG Resume Editor**: Complete resume with work experience (Stripe, Airbnb), UC Berkeley education, skills, and projects.
  - **Interactive Kanban Job Tracker**: Pre-populated jobs at Google, Stripe, Vercel, Linear, and Airbnb.
- **Mock AI Engine (Zero Cost & Zero Failures)**:
  - All AI tools (*"Improve Summary"*, *"Generate Bullet Points"*, *"ATS Scanner"*, *"Tailor Resume"*) generate realistic, high-impact suggestions with smooth loading animations without calling external AI APIs or incurring costs.
- **Full Client-Side State Persistence**:
  - Resumes, jobs, and settings edits are saved to `localStorage`, so edits made during a client walkthrough actually persist.
- **Zero Backend or Database Required**:
  - You do **NOT** need to configure MongoDB, Firebase keys, or OpenRouter/Gemini keys in Vercel to show off the website!

---

## 🚀 Fast 1-Click Deployment to Vercel

### Step 1: Push Your Code to GitHub
```bash
git add .
git commit -m "Configure instant client showcase and preview mode for Vercel"
git push origin main
```

### Step 2: Import into Vercel
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** > **Project**.
3. Select your `AI-Powered-Resume-Builder` repository and click **Import**.
4. In the **Project Configuration** screen:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: `./` (or `FrontEnd`)
   - **Environment Variables**: *None needed!* (You can leave all environment variables empty).
5. Click **Deploy**!

In less than 1 minute, your portfolio site will be live on a custom `.vercel.app` domain ready to send to prospective clients.

---

## 🎯 Navigating the Demo as a Client

When your prospective clients visit your Vercel link:
1. **Home Page (`/`)**: High-end landing page showcasing the product, templates gallery, and animations.
2. **Dashboard (`/Dashboard`)**: Immediately accessible via navbar or hero buttons — displays resume cards, ATS scores, and metrics.
3. **Resume Editor (`/create-resume`)**: Interactive editor with drag-and-drop sections, template switching (Classic, Modern, Executive, Developer, Compact), color schemes, fonts, and instant AI enhancements.
4. **Job Tracker (`/JobTracker`)**: Interactive job tracker board with search, filters, inline editing, and Excel export.
5. **Login / Sign Up (`/login`, `/register`)**: Displays an instant *"Enter Demo Mode (Instant Access)"* button to jump straight into the application.
