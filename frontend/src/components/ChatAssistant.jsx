import { useState } from 'react';
import { Bot, SendHorizonal } from 'lucide-react';
import { Button } from './Button';

const starterMessages = [
  { role: 'assistant', text: 'Hi, I am your FitAI coach. Ask about workouts, meals, BMI, hydration, or form cues.' }
];

function answerQuestion(question, recommendation) {
  const lower = question.toLowerCase();
  if (lower.includes('diet') || lower.includes('meal') || lower.includes('protein')) {
    return `Aim for about ${recommendation.dailyCalories} kcal today. Your current plan includes ${recommendation.diet[0].item} for breakfast and keeps protein spread across meals.`;
  }
  if (lower.includes('water') || lower.includes('hydration')) {
    return `Your hydration target is ${recommendation.waterLiters} L. A simple rhythm is one glass after waking, one before each meal, and small refills between sessions.`;
  }
  if (lower.includes('bmi') || lower.includes('weight')) {
    return `Your BMI is ${recommendation.bmi}, currently marked ${recommendation.category.label}. ${recommendation.category.suggestion}`;
  }
  if (lower.includes('push') || lower.includes('squat') || lower.includes('curl') || lower.includes('jack')) {
    return 'For form tracking, pick the exercise in AI Exercise Tracking, start the camera, and keep your full body visible. Move slowly enough for clean joint-angle detection.';
  }
  return `For ${recommendation.focus.toLowerCase()}, start with today’s plan: strength work, cardio intervals, mobility, and ${recommendation.waterLiters} L water. Keep the first session easy enough that form stays sharp.`;
}

export function ChatAssistant({ recommendation }) {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');

  function sendMessage(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input.trim() };
    const assistantMessage = { role: 'assistant', text: answerQuestion(input, recommendation) };
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');
  }

  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-plum/15 p-2 text-violet-700 dark:text-violet-300">
          <Bot />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Chat Coach</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quick guidance based on your profile.</p>
        </div>
      </div>
      <div className="scrollbar-soft mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg p-3 text-sm ${
              message.role === 'user'
                ? 'ml-8 bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'mr-8 bg-white/70 text-slate-700 dark:bg-slate-950/50 dark:text-slate-200'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your coach..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
        />
        <Button className="w-11 px-0" type="submit" variant="accent" aria-label="Send message">
          <SendHorizonal size={18} />
        </Button>
      </form>
    </section>
  );
}
