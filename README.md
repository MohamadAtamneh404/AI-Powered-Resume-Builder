# AI-Powered Resume Builder

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenRouter AI](https://img.shields.io/badge/AI-OpenRouter%20%7C%20Gemini%202.5%20%7C%20GPT--4o-7C3AED?logo=google&logoColor=white)](https://openrouter.ai/)
[![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

An intelligent, full-stack, ATS-optimized resume platform. Build, tailor, audit, and export high-impact resumes with a real-time WYSIWYG canvas, centralized CareerOps profile baseline, contextual AI Co-Pilot with 1-click interactive action proposals, and an automated ATS scoring engine that fixes resume weaknesses with a single click.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Option 1: Local Development](#option-1-local-development)
  - [Option 2: Docker Compose](#option-2-docker-compose)
- [Scripts Reference](#scripts-reference)
- [License](#license)

---

## Overview

Modern applicant tracking systems (ATS) and hiring teams demand clear formatting, verifiable impact metrics, and role-tailored technical competencies. The **AI-Powered Resume Builder** bridges the gap between raw candidate history and recruiter-ready resumes:

1. **CareerOps Master Profile:** Maintain a single source of truth for your entire professional background, separating verified employment from standalone portfolio projects.
2. **WYSIWYG Modular Canvas:** Add, remove, reorder, and visually style resume sections (Classic Single-Column, Modern Accent, Executive Serif, Developer Monospace, Compact 1-Page).
3. **Conversational AI Co-Pilot:** Chat naturally with an assistant grounded in your resume data. Use **1-turn automatic full-resume generation** or incremental tuning with interactive preview cards.
4. **Real ATS Scoring & 1-Click Fixes:** Measure syntax, keyword density, and metrics impact, then automatically repair flagged deficiencies with dedicated AI endpoints.

---

## Key Features

### 🎯 1. Master Career Baseline Profile (CareerOps)
- **Centralized Baseline:** Store your complete candidate history—personal contact details, target role title, seniority level, executive summary, verified work history, educational credentials, and standalone portfolio projects.
- **Strict Separation of Experience & Projects:** Portfolio applications, open-source tools, and academic capstones are organized into dedicated project records with tech stack tags and demo links, avoiding confusion with full-time employment.
- **AI Auto-Pilot Extraction:** Paste raw notes, past resumes, or LinkedIn profile text to auto-populate your entire baseline in seconds.
- **Executive Bio & Bullet Polishing:** 1-click AI tools polish your career summary, suggest in-demand technical competencies, and enrich bullet points with action verbs and quantifiable metrics.

### 🎨 2. WYSIWYG Modular Resume Canvas
- **Section Block Architecture:** Dynamically reorder, add, or toggle sections (Header, Summary, Experience, Education, Skills, Projects, Awards, Volunteer, Languages, Interests).
- **Tailored ATS Templates:**
  - `ATS Classic`: Clean single-column layout prioritizing maximum parser readability.
  - `ATS Modern Accent`: Left accent borders and modern typography.
  - `ATS Executive Serif`: Centered aristocratic headers with serif font hierarchy.
  - `ATS Tech & Developer`: Skill-first layout with monospace accents.
  - `ATS Compact 1-Page`: High-density layout engineered to fit complete careers on a single page.
- **Visual Styling & Autosave:** Real-time font family switching, customizable theme accents, canvas zoom controls, continuous backend autosaving, and offline `localStorage` fallback.
- **Smart Onboarding:** Start new resumes from your CareerOps master profile, import and parse an existing PDF/TXT document, or build from scratch.

### 🤖 3. AI Co-Pilot with Interactive Action Envelopes
- **Context-Aware Sidebar Assistant:** Grounded strictly in your live resume draft state to eliminate hallucinations.
- **Automatic Full-Resume Fill:** Provide your raw background or draft and the copilot generates all sections (Contact, Summary, Work, Skills, Projects, Education) in a single turn without repetitive interrogation.
- **Interactive Proposal Cards:** AI suggestions arrive as interactive preview cards showing the formatted changes before they touch your resume.
- **⚡ 1-Click "Apply All":** Commit all extracted sections directly into the canvas with one button, or apply individual sections selectively.
- **Section-Level AI Assist:** In-place buttons on work experience and skills blocks to instantly enhance bullet metrics or suggest missing keywords.

### 🛡️ 4. Real ATS Audit Engine & 1-Click AI Fixes
- **Comprehensive Score Breakdown:** Evaluates your resume across 4 dimensions:
  - **Overall ATS Score** (0–100%)
  - **Keyword Match**
  - **Impact & Action Verbs** (quantifiable metrics, strong verbs)
  - **Syntax & Layout Compliance**
- **Actionable Deficiency Detection:** Identifies placeholders (e.g. `[Company Name]`, dummy phone numbers), missing contact links, passive language, and thin descriptions.
- **1-Click AI Fix:** Click "Fix with AI" next to any deficiency to invoke a specialized AI prompt that resolves the issue directly on your canvas.

### 📄 5. Multi-Engine PDF Export & Machine Readability
- **High-Fidelity PDF Output:** Clean, print-ready document rendering via client print engine and Puppeteer export options.
- **Embedded ATS Metadata:** Option to embed machine-readable JSON Resume metadata into exported documents for optimal parsing.

### ⚙️ 6. Copilot Tuning & Telemetry
- **Custom AI Persona:** Configure copilot tone (Metrics-Driven, Executive, Creative) and target keyword density in Settings.
- **Resource Telemetry:** Live tracking of active resumes, AI rewrites, and ATS scans connected to MongoDB user profiles.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 7 | High-performance SPA with fast HMR |
| **Styling** | Tailwind CSS v4 | Modern utility-first styling with dark/light themes |
| **Icons & UI Utilities** | Lucide React, Framer Motion | Clean iconography and smooth transitions |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Modular canvas section reordering |
| **Print / PDF Engine** | `react-to-print`, Puppeteer | Clean, multi-page vector resume printing |
| **Backend Framework** | Node.js + Express 5 | RESTful API with centralized error handling |
| **Database & ODM** | MongoDB 7 + Mongoose 8 | Persistent document storage for users and resumes |
| **AI Orchestration** | OpenRouter (`@google/generative-ai`) | Multi-model failover (Gemini 2.5 Flash, GPT-4o-mini, DeepSeek) |
| **Document Parsing** | `pdf-parse`, `multer` | Extracts text from uploaded resume documents |
| **Authentication** | JWT + bcrypt | Secure password hashing and token-based auth |
| **Containerization** | Docker & Docker Compose | Multi-container orchestration (Mongo, Backend, Frontend) |

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│                                                        │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │   CareerOps   │  │ WYSIWYG Canvas │  │ AI Drawer │  │
│  │ MasterProfile │  │ (Blocks & ATS) │  │ (Copilot) │  │
│  └───────┬───────┘  └───────┬────────┘  └─────┬─────┘  │
└──────────┼──────────────────┼─────────────────┼────────┘
           │                  │                 │
           ▼                  ▼                 ▼
      Vite Proxy: /api/*  ───► Node.js / Express 5 API
                                     │
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
           MongoDB 7 (Mongoose)  OpenRouter AI       PDF Parser
           - Users & CareerOps   - Gemini 2.5 Flash  (pdf-parse /
           - Resume Documents    - GPT-4o-mini        Puppeteer)
           - Telemetry & Usage   - DeepSeek Chat
```

---

## Project Structure

```
AI-Powered-Resume-Builder/
├── BackEnd/
│   ├── index.js                     # Express server entry point
│   ├── models/
│   │   ├── User.js                  # User schema & CareerOps baseline profile
│   │   ├── Resume.js                # Resume canvas documents & blocks
│   │   ├── Template.js              # ATS template configurations
│   │   └── openrouter.js            # OpenRouter multi-model AI client
│   ├── routes/
│   │   ├── AI-Route.js              # Gemini/OpenRouter AI endpoints (CareerOps, Copilot, ATS Fix)
│   │   ├── auth.js                  # Authentication & password management
│   │   ├── resume.js                # Resume CRUD, auto-save, and PDF upload
│   │   └── settings.js              # Profile updates, CareerOps baseline API, and telemetry
│   ├── Dockerfile
│   └── package.json
├── FrontEnd/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── CreateResume/
│   │   │   │   ├── wysiwyg/         # Canvas, blocks, template selection, and ATS preview
│   │   │   │   └── EditorUI.jsx     # AI Assistant Drawer & Interactive Action Proposals
│   │   │   ├── Settings/
│   │   │   │   └── Settings.jsx     # CareerOps manager, AI tuning, and account telemetry
│   │   │   ├── Home/                # Landing page & navigation
│   │   │   └── Layout/              # Protected routes & top bars
│   │   ├── Context/                 # UserContext & auth state
│   │   └── utils/                   # Shared API client & client-side ATS scoring engine
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml               # Multi-service container orchestration
└── README.md
```

---

## Environment Variables

Create a `.env` file in the `BackEnd/` directory based on `BackEnd/.env.example`:

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/ai_resume

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Engine (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODELS=google/gemini-2.5-flash,openai/gpt-4o-mini,deepseek/deepseek-chat
OPENROUTER_MAX_TOKENS=2500

# Email Notifications (Optional for password reset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

---

## Getting Started

### Option 1: Local Development

#### 1. Backend Setup
```bash
cd BackEnd
npm install
npm run dev
```
The backend server runs at `http://localhost:3000`.

#### 2. Frontend Setup
Open a separate terminal window:
```bash
cd FrontEnd
npm install
npm run dev
```
The Vite development server runs at `http://localhost:5173` with automatic API proxying to port 3000.

---

### Option 2: Docker Compose

Ensure Docker and Docker Compose are installed and running. Create `BackEnd/.env`, then run from the repository root:

```bash
docker compose up --build
```

This starts:
- **MongoDB:** `mongodb://localhost:27018`
- **Backend API:** `http://localhost:3000`
- **Frontend SPA:** `http://localhost:5173`

---

## Scripts Reference

### Backend (`BackEnd/`)
- `npm run dev`: Starts the server with `nodemon` for auto-reloading during development.
- `npm run start`: Runs the server with standard `node`.
- `npm run seed`: Seeds default ATS resume templates into MongoDB.
- `npm run lint`: Runs ESLint checks.
- `npm run format`: Formats code using Prettier.

### Frontend (`FrontEnd/`)
- `npm run dev`: Starts the Vite local development server with HMR.
- `npm run build`: Bundles the production frontend into `FrontEnd/dist`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint checks across React components.
- `npm run format`: Formats code using Prettier.

---

## License

This project is licensed under the [ISC License](LICENSE).
