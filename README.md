# AI-Powered Resume Builder

## Description
The AI-Powered Resume Builder is a modern, full-stack web application designed to help job seekers effortlessly create professional, ATS-friendly resumes. Leveraging the power of Google's Generative AI (Gemini), the tool intelligently generates resume content, refines bullet points, and tailors summaries to match specific job descriptions. It is built for professionals across all industries who want to streamline their job application process and stand out with dynamically generated, beautifully formatted PDF resumes.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Containerization:** Docker & Docker Compose

## Screenshots
*(Placeholder: Add screenshots of your application here!)*

| Resume Editor | PDF Output Preview |
|:---:|:---:|
| *(Replace with Editor Image)* | *(Replace with PDF Image)* |

## Architecture
The application follows a modern client-server architecture containerized with Docker. The **React (Vite)** frontend serves as the user interface where users input their details and interact with the AI editor. It communicates with the **Node.js/Express** backend via REST API calls (proxied via `/api/*`). The backend handles authentication, business logic, and interactions with the Gemini API to generate tailored content. User profiles, resume data, and custom templates are persistently stored in the **MongoDB** database. 

## Environment Variables
The following environment variables are required for the backend to function. (See `BackEnd/.env.example` for reference):
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

## Setup Instructions

### Option 1: Local Development

**1. Backend Setup**
Navigate to the backend directory, install dependencies, and run the server:
```bash
cd BackEnd
npm install
```
Create a `.env` file in the `BackEnd` directory based on `.env.example` and add your configuration details.
Then, start the server:
```bash
npm run dev
```

**2. Frontend Setup**
Open a new terminal window, navigate to the frontend directory, install dependencies, and run the client:
```bash
cd FrontEnd
npm install
npm run dev
```
The application frontend will be running at `http://localhost:5173`.

### Option 2: Docker Setup
Make sure you have Docker and Docker Compose installed on your system.
Create your `.env` file in the `BackEnd` directory with the required variables.
Run the following command from the root of the project to build and start the containers:
```bash
docker compose up --build
```
This will automatically spin up the frontend, backend, and MongoDB services.
