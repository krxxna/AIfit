import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { buildRecommendations } from '../utils/recommendations.js';

const router = express.Router();

const messageSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().max(1200)
      })
    )
    .max(10)
    .optional()
    .default([])
});

function buildCoachPrompt(user, message, history) {
  const profile = user.profile?.toObject?.() || user.profile || {};
  const recommendations = buildRecommendations(profile);
  const recentChat = history
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Coach' : 'User'}: ${item.text}`)
    .join('\n');

  return [
    'You are FitAI Coach, a practical fitness and nutrition assistant inside a fitness tracking app.',
    'Give clear, supportive, concise answers. Prefer safe general guidance over medical claims.',
    'If the user asks about injuries, illness, pain, medication, eating disorders, pregnancy, or serious symptoms, recommend consulting a qualified professional.',
    'Use the saved user profile and plan context when useful.',
    '',
    `User profile: name=${user.name}, age=${profile.age || 'unknown'}, gender=${profile.gender || 'unknown'}, heightCm=${profile.height || 'unknown'}, weightKg=${profile.weight || 'unknown'}, goal=${profile.fitnessGoal || 'unknown'}, activity=${profile.activityLevel || 'unknown'}, foodPreference=${profile.foodPreference || 'unknown'}, experience=${profile.experienceLevel || 'unknown'}, workoutDaysPerWeek=${profile.workoutDaysPerWeek || 'unknown'}, healthNotes=${profile.healthNotes || 'none'}.`,
    `Current plan context: BMI=${recommendations.bmi}, category=${recommendations.category}, dailyCalories=${recommendations.dailyCalories}, waterLiters=${recommendations.waterLiters}.`,
    recentChat ? `Recent chat:\n${recentChat}` : '',
    '',
    `User question: ${message}`,
    '',
    'Answer in 2-6 short paragraphs or bullets. Be specific and actionable.'
  ]
    .filter(Boolean)
    .join('\n');
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim() || ''
  );
}

router.post('/message', requireAuth, async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const { message, history } = messageSchema.parse(req.body);
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildCoachPrompt(req.user, message, history) }]
          }
        ],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 700
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.message || 'Gemini coach request failed.'
      });
    }

    const answer = extractGeminiText(data);
    if (!answer) return res.status(502).json({ message: 'Gemini returned an empty answer.' });

    res.json({ answer });
  } catch (error) {
    next(error);
  }
});

export default router;
