# FitAI

FitAI is a modern AI-powered fitness tracking web application with authentication, BMI analysis, personalized workout and diet recommendations, dashboard analytics, reminders, admin tools, and real-time webcam exercise tracking with MediaPipe pose detection.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts, MediaPipe Tasks Vision
- Backend: Node.js, Express, MongoDB, JWT auth, Google token verification hook
- AI/ML service: Python, FastAPI, MediaPipe, OpenCV

## Project Structure

```text
FitAI/
  client/       React dashboard and webcam pose tracking UI
  server/       Express API, MongoDB models, JWT auth
  ai-service/   Python MediaPipe/OpenCV service scaffold
```

## Quick Start

1. Install Node dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp .env.example server/.env
cp .env.example client/.env
```

3. Start MongoDB locally or update `MONGO_URI` in `server/.env`.

4. Run the web app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:5001/api`

## Python AI Service

The frontend performs real-time pose tracking in the browser for low latency. The Python service is included for server-side posture analysis, video processing, or future model experiments.

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

Health check: `http://localhost:8001/health`

## Core API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/recommendations`
- `GET /api/admin/analytics`
- `GET /api/notifications`

## Notes

- The app ships with sample dashboard and admin data so it feels complete before a database is connected.
- Google auth route is wired for token verification when `GOOGLE_CLIENT_ID` is configured.
- Webcam tracking uses MediaPipe Pose Landmarker and includes a graceful demo fallback if the model cannot load.
