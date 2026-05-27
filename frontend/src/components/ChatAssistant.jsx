import { useState } from 'react';
import { Bot, SendHorizonal } from 'lucide-react';
import { Button } from './Button';
import { api } from '../api/client';

const starterMessages = [
  { role: 'assistant', text: 'Hi, I am your FitAI coach. Ask about workouts, meals, BMI, hydration, or form cues.' }
];

export function ChatAssistant() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const userMessage = { role: 'user', text: question };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/coach/message', {
        message: question,
        history: messages.slice(-8)
      });

      setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
    } catch (apiError) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: apiError.response?.data?.message || apiError.message || 'AI Coach is unavailable right now.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-plum/15 p-2 text-violet-700 dark:text-violet-300">
          <Bot />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Chat Coach</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gemini-powered guidance based on your profile.</p>
        </div>
      </div>
      <div className="scrollbar-soft mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg p-3 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'ml-8 bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'mr-8 bg-white/70 text-slate-700 dark:bg-slate-950/50 dark:text-slate-200'
            }`}
          >
            {message.text}
          </div>
        ))}
        {loading && (
          <div className="mr-8 rounded-lg bg-white/70 p-3 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-300">
            Thinking...
          </div>
        )}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your coach..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
          disabled={loading}
        />
        <Button className="w-11 px-0" type="submit" variant="accent" aria-label="Send message" disabled={loading || !input.trim()}>
          <SendHorizonal size={18} />
        </Button>
      </form>
    </section>
  );
}
