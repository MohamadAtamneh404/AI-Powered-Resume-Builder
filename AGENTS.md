# AI Resume Builder — Agent Instructions

## Stack

- Frontend: React + Vite, Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (via Mongoose)
- Containerized with Docker Compose (mongodb, backend, frontend services)

## Conventions

- Never commit .env files or secrets — always use environment variables
- Use ESLint/Prettier formatting already configured in the project
- Keep API calls in a shared service/utility file, not scattered across components
- Add loading and error states for any new async UI
- Backend routes must validate input and use the centralized error-handling middleware
- Vite frontend proxies /api/\* to the backend — keep this prefix consistent for new endpoints
