<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=220&section=header&text=AI%20Resume%20Builder&fontSize=65&fontAlignY=38&desc=Intelligent%20ATS-Optimized%20Resume%20Platform&descAlignY=60&descAlign=50" />
</div>
---
<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

> A modern, full-stack, ATS-optimized resume platform built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js**, **MongoDB**, and **Google Gemini / OpenRouter AI**. Designed to deliver an intuitive WYSIWYG editing experience, a centralized master profile baseline (**CareerOps**), a context-aware AI Co-Pilot with 1-click action proposals, and an automated ATS scoring engine that fixes resume weaknesses with a single click.

---

## 🎥 Visual Overview & Screenshots

| WYSIWYG Resume Canvas & Design Controls | AI Co-Pilot & 1-Click Action Proposals |
|:---:|:---:|
| *<img width="1916" height="877" alt="Screenshot 2026-09-12 172926" src="https://github.com/user-attachments/assets/584e673b-1146-4dbc-9376-30fb6e95cdbd" />* | *<img width="1917" height="872" alt="Screenshot 2026-09-12 172651" src="https://github.com/user-attachments/assets/215520d1-4d9d-4390-9ac7-c1b9581bfdb9" />!
* |

| Real-Time ATS Audit & 1-Click AI Fixes | Master CareerOps Baseline Profile |
|:---:|:---:|
| *<img width="1538" height="742" alt="Screenshot 2026-09-12 173048" src="https://github.com/user-attachments/assets/df1e348d-2c2b-4f88-8fdb-95c90ffd1af4" />* | *<img width="1910" height="862" alt="Screenshot 2026-09-12 173153" src="https://github.com/user-attachments/assets/7425d3f0-5b4b-4a6f-9732-39767fd42d3d" />* |

---

## ✨ Features

- 🎯 **CareerOps Master Profile:** A centralized single source of truth for your entire background. Maintains personal details, target roles, seniority level, executive summary, verified corporate work history, education, and distinct standalone portfolio projects.
- 🤖 **AI Auto-Pilot Extraction:** Paste raw notes, past resumes, or LinkedIn profile text to auto-populate your entire baseline in seconds with strict separation between work experience and portfolio projects.
- 🎨 **Modular WYSIWYG Resume Canvas:** Reorder, duplicate, add, or toggle sections (Header, Summary, Experience, Education, Skills, Projects, Awards, Volunteer, Languages, Interests) using high-performance drag-and-drop.
- 📄 **ATS-Optimized Templates:** Choose from tailored layouts including *ATS Classic Single-Column*, *ATS Modern Accent*, *ATS Executive Serif*, *ATS Tech & Developer*, and *ATS Compact 1-Page*.
- 💬 **Context-Aware AI Co-Pilot:** Real-time conversational drawer grounded strictly in your live resume draft state. Supports **1-turn automatic full-resume generation** and incremental tuning.
- ⚡ **Interactive Proposal Cards & 1-Click "Apply All":** AI suggestions arrive as structured interactive preview cards. Inspect changes before applying, or commit all sections to the canvas at once.
- 🛡️ **Real ATS Audit Engine & 1-Click AI Fixes:** 4-dimension scoring engine (Overall ATS Score, Keyword Density, Impact & Metrics, Syntax/Layout Compliance). Click *"Fix with AI"* next to any identified deficiency to resolve it directly on the canvas.
- 🖨️ **Multi-Engine PDF Export:** Clean, vector-accurate PDF generation via client print engine and Puppeteer with embedded ATS JSON Resume metadata.
- ⚙️ **Copilot Persona & Live Telemetry:** Customize AI tone (Metrics-Driven, Executive, Creative) and keyword density, paired with live resource telemetry tracking active resumes, AI rewrites, and ATS scans.

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    User([Job Seeker]) --> |Builds & Refines| UI[React 19 / Vite Frontend]
    
    subgraph "Client Side (React 19 & Tailwind v4)"
        UI --> Canvas[Modular WYSIWYG Canvas]
        UI --> CopilotUI[AI Co-Pilot Drawer]
        UI --> ATSView[Real-Time ATS Inspector]
        UI --> CareerOps[CareerOps Master Baseline]
    end
    
    UI <==> |REST API /api/* (Vite Proxy)| Backend[Node.js / Express 5 Backend]
    
    subgraph "Server Side"
        Backend <==> DB[(MongoDB 7 / Mongoose 8)]
        Backend <==> AI[OpenRouter / Gemini 2.5 / GPT-4o]
        Backend --> PDFEngine[Puppeteer & PDF Parser Engine]
    end
```

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas)
- **Docker & Docker Compose** (Optional, for containerized deployment)

---

### 1️⃣ Environment Configuration
Create a `.env` file in the `BackEnd/` directory based on `BackEnd/.env.example`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai_resume
JWT_SECRET=your_jwt_secret_here

# OpenRouter / Gemini AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODELS=google/gemini-2.5-flash,openai/gpt-4o-mini,deepseek/deepseek-chat
OPENROUTER_MAX_TOKENS=2500

# Email Notifications (Optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

---

### 2️⃣ Local Development Setup

#### Backend Setup
Open a terminal and start the server:
```bash
cd BackEnd
npm install
npm run dev
```
The backend API will be running at `http://localhost:3000`.

#### Frontend Setup
Open a second terminal window and start the client:
```bash
cd FrontEnd
npm install
npm run dev
```
The application frontend will be running at `http://localhost:5173`.

---

### 3️⃣ Docker Setup (Alternative)
Make sure Docker is running on your machine, then run from the root directory:
```bash
docker compose up --build
```
This spins up:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3000`
- **MongoDB:** `mongodb://localhost:27018`

---

## 🎓 About

Developed by **Mohamad Atamleh** <br/>
[GitHub](https://github.com/MohamadAtamneh404) | [LinkedIn](https://linkedin.com/in/mohamad-atamleh-a43185381)

