import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import fs from 'fs';


// Load .env deterministically whether the API is started from the repo root
// or from the backend workspace.
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), 'server', '.env')
];
const envPath = envPaths.find((candidate) => fs.existsSync(candidate));

dotenv.config({
  path: envPath || envPaths[0]
});


// If .env is stored as a raw mongodb connection string (no MONGO_URI= prefix),
// dotenv will not populate process.env.MONGO_URI. Detect that case and map it.
if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
  try {
    // Read the first non-empty line and if it looks like a mongodb URI, map it.
    const content = fs.readFileSync(envPath, 'utf8');
    const firstLine = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean);

    if (firstLine && firstLine.startsWith('mongodb')) {
      process.env.MONGO_URI = firstLine;
      console.warn('Detected raw mongodb URI in .env; mapped to MONGO_URI');
    }
  } catch {
    // ignore
  }
}

// Debug startup env (prevents silent misconfiguration)
if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
  console.warn('Mongo URI still not set after loading .env (check .env format / key name).');
}

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import recommendationRoutes from './routes/recommendations.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import coachRoutes from './routes/coach.js';

const app = express();
const port = process.env.PORT || 5001;
const configuredClientOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.CLIENT_URLS
]
  .flatMap((value) => value?.split(',') || [])
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedClientOrigins = new Set(configuredClientOrigins);

function isAllowedClientOrigin(origin) {
  if (!origin) return true;
  if (allowedClientOrigins.has(origin)) return true;

  if (process.env.NODE_ENV === 'production') return false;

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedClientOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 250 }));

app.get('/api/health', (_req, res) => {
  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    service: 'fitai-api',
    database: databaseStates[mongoose.connection.readyState] || 'unknown'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({ message: error.message || 'Unexpected server error' });
});

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`FitAI API running on http://localhost:${port}/api`);
  });
});
