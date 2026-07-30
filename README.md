<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=AI%20Resume%20Builder&fontSize=70&fontAlignY=35&desc=Generative%20AI%20Full-Stack%20Application&descAlignY=55&descAlign=50" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer" />
</p>

> A modern, full-stack web application that leverages Google's Generative AI to intelligently construct, format, and render professional resumes dynamically into PDF format.

---

## ✨ Features

- 🧠 **AI Content Generation:** Integrates directly with the `google/generative-ai` API (Gemini) to rewrite bullet points, generate professional summaries, and tailor content to specific job descriptions.
- 📄 **Dynamic PDF Rendering:** Utilizes a custom headless browser pipeline powered by **Puppeteer** to perfectly render HTML templates into ATS-friendly, 1-page PDF resumes.
- ⚛️ **Modern Frontend:** Built with React and Vite for a lightning-fast, highly responsive user interface that updates document previews in real-time.
- 🗄️ **Persistent Storage:** A secure Node.js/Express backend connected to a MongoDB database stores user profiles, previous resume versions, and customized templates.

---

## 🏗️ System Architecture

The application follows a standard MERN stack architecture, supercharged with server-side browser rendering and LLM integration.

```mermaid
graph TD
    User([User Interface]) <==> |React / Vite| Client(Frontend Web App)
    
    Client <==> |REST API| Server(Node.js / Express Backend)
    
    subgraph "Backend Services"
        Server <==> |Data| DB[(MongoDB)]
        Server ==> |Prompt / Context| AI[Google Gemini API]
        AI ==> |Generated Content| Server
        Server ==> |HTML Payload| Render[Puppeteer Engine]
        Render ==> |Binary Output| PDF[PDF Buffer]
    end
    
    PDF -.-> |Download| User
```

---

## 📸 Screenshots

*(Drag and drop your screenshots here!)*

| Resume Editor | PDF Output Preview |
|:---:|:---:|
| *(Replace with Editor Image)* | *(Replace with PDF Image)* |

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Google Gemini API Key**

### 1️⃣ Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```
Start the server:
```bash
npm run dev
```

### 2️⃣ Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

---

## 🎓 About

Developed by **Mohamad Atamleh** <br/>
[GitHub](https://github.com/MohamadAtamneh404) | [LinkedIn](https://linkedin.com/in/mohamad-atamleh-a43185381)
