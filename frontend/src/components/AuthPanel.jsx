import { Dumbbell, Mail, Lock, UserRound } from 'lucide-react';
import { Button } from './Button';
import { api } from '../api/client';
import { useState } from 'react';

export function AuthPanel({ onAuthenticate }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'signup') {
        await api.post('/auth/signup', form);
        setMode('login');
        setSuccess('Account created. Please log in with your registered email and password.');
        return;
      }

      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      if (!data.token) {
        throw new Error('Login token was not returned.');
      }
      onAuthenticate(data);
    } catch (apiError) {
      if (apiError.message === 'Network Error') {
        setError(`Cannot reach the FitAI API at ${api.defaults.baseURL}. Check that the backend is running and allowed by CORS.`);
      } else {
        setError(apiError.response?.data?.message || apiError.message || 'Authentication failed. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-screen place-items-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative bg-slate-950 p-8 text-white md:p-12">
          <div className="absolute inset-0 opacity-80 [background:linear-gradient(135deg,rgba(45,212,191,.38),transparent_38%),linear-gradient(315deg,rgba(251,113,133,.28),transparent_45%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-12">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-slate-950">
                <Dumbbell />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FitAI</h1>
                <p className="text-sm text-slate-300">Personalized fitness intelligence</p>
              </div>
            </div>
            <div>
              <p className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
                Train smarter with your AI fitness coach.
              </p>
              <p className="mt-5 max-w-lg text-base text-slate-300">
                BMI analysis, adaptive diet planning, progress intelligence, and webcam-based form feedback in one polished dashboard.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {['Pose AI', 'Diet Plans', 'Progress'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-center">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-6 md:p-10">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in with a registered account to access your dashboard.</p>
          <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-900">
            {['signup', 'login'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-lg px-3 py-2 capitalize transition ${mode === item ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500'}`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <form
            className="mt-8 space-y-4"
            onSubmit={submit}
          >
            {mode === 'signup' && (
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Name</span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </label>
            )}
            <label className="block">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                <Mail size={18} className="text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@fitai.app"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                <Lock size={18} className="text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </label>
            {success && <p className="rounded-lg bg-mint/10 px-3 py-2 text-sm text-teal-700 dark:text-teal-300">{success}</p>}
            {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : mode === 'signup' ? 'Create account' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
