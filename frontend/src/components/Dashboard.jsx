import {
  Activity,
  Bell,
  Bot,
  Droplets,
  Flame,
  Moon,
  ShieldCheck,
  Sun,
  Target,
  Trophy,
  UsersRound,
  Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { StatCard } from './StatCard';
import { ProfileForm } from './ProfileForm';
import { ExerciseTracker } from './ExerciseTracker';
import { Button } from './Button';
import { adminUsers, reminders, workoutHistory } from '../data/dummyData';
import { ChatAssistant } from './ChatAssistant';

export function Dashboard({ profile, setProfile, recommendation, darkMode, setDarkMode, onLogout }) {
  const weeklyCalories = workoutHistory.reduce((sum, day) => sum + day.calories, 0);
  const macroTotals = recommendation.diet.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fats: totals.fats + item.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-mint dark:bg-white dark:text-slate-950">
              <Activity />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950 dark:text-white">FitAI</h1>
              <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">AI fitness command center</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 rounded-lg bg-white/60 p-1 text-sm font-semibold dark:bg-slate-900/80 lg:flex">
            {['Dashboard', 'Tracker', 'Diet', 'Admin'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="w-11 px-0" aria-label="Toggle theme" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="ghost" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.45fr_0.8fr]">
        <section id="dashboard" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Target} label="BMI Score" value={recommendation.bmi} helper={recommendation.category.label} accent={recommendation.category.tone} />
            <StatCard icon={Flame} label="Calories Burned" value={weeklyCalories.toLocaleString()} helper="This week" accent="bg-coral/15 text-rose-700 dark:text-rose-300" />
            <StatCard icon={Droplets} label="Water Intake" value={`${recommendation.waterLiters} L`} helper="Daily target" accent="bg-ocean/15 text-sky-700 dark:text-sky-300" />
            <StatCard icon={Trophy} label="Streak" value="12 days" helper="Daily goals completed" accent="bg-citrus/20 text-amber-700 dark:text-amber-300" />
          </div>

          <section className="glass rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Progress Analytics</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Workout volume, calorie burn, and weight trend.</p>
              </div>
              <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${recommendation.category.tone}`}>
                {recommendation.category.suggestion}
              </span>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="h-72 rounded-lg bg-white/60 p-3 dark:bg-slate-950/40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 rounded-lg bg-white/60 p-3 dark:bg-slate-950/40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workoutHistory}>
                    <defs>
                      <linearGradient id="weight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                    <XAxis dataKey="day" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="weight" stroke="#fb7185" fill="url(#weight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ProfileForm profile={profile} onChange={setProfile} />
            <section className="glass rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-plum/15 p-2 text-violet-700 dark:text-violet-300">
                  <Bot />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Fitness Plan</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Adaptive goals for {recommendation.focus.toLowerCase()}.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {recommendation.workoutPlan.map((item) => (
                  <motion.div key={item} whileHover={{ x: 4 }} className="rounded-lg border border-slate-200 bg-white/70 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/50">
                    {item}
                  </motion.div>
                ))}
              </div>
            </section>
          </section>

          <ExerciseTracker />
        </section>

        <aside className="space-y-6">
          <ChatAssistant recommendation={recommendation} />

          <section id="diet" className="glass rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Diet Plan</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.foodPreference} nutrition split</p>
              </div>
              <div className="rounded-lg bg-mint/15 p-2 text-teal-700 dark:text-teal-300">
                <Utensils />
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {recommendation.diet.map((meal) => (
                <article key={meal.meal} className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white">{meal.meal}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{meal.item}</p>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {meal.calories} kcal
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <span className="rounded-lg bg-mint/10 py-2">P {meal.protein}g</span>
                    <span className="rounded-lg bg-ocean/10 py-2">C {meal.carbs}g</span>
                    <span className="rounded-lg bg-coral/10 py-2">F {meal.fats}g</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
              <p className="text-sm font-semibold">Daily target</p>
              <p className="mt-2 text-2xl font-bold">{recommendation.dailyCalories} kcal</p>
              <p className="text-sm opacity-75">Planned: {macroTotals.calories} kcal, {macroTotals.protein}g protein</p>
            </div>
          </section>

          <section className="glass rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Bell className="text-coral" />
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Notifications</h2>
            </div>
            <div className="mt-4 space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.title} className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{reminder.title}</p>
                    <span className="text-xs text-slate-500">{reminder.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{reminder.message}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="admin" className="glass rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-mint" />
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Admin Panel</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Users, reports, and analytics.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/70 p-3 text-center dark:bg-slate-950/50">
                <UsersRound className="mx-auto mb-1" size={18} />
                <p className="text-xl font-bold">1.2k</p>
                <p className="text-xs text-slate-500">Users</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3 text-center dark:bg-slate-950/50">
                <Flame className="mx-auto mb-1" size={18} />
                <p className="text-xl font-bold">48k</p>
                <p className="text-xs text-slate-500">Calories</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3 text-center dark:bg-slate-950/50">
                <Activity className="mx-auto mb-1" size={18} />
                <p className="text-xl font-bold">7.8k</p>
                <p className="text-xs text-slate-500">Sessions</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost">Exercise DB</Button>
              <Button variant="ghost">Diet DB</Button>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              {adminUsers.map((user) => (
                <div key={user.name} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 bg-white/60 p-3 text-sm last:border-b-0 dark:border-slate-700 dark:bg-slate-950/40">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-slate-500">{user.goal} · BMI {user.bmi}</p>
                  </div>
                  <span className="self-center rounded-lg bg-mint/15 px-2 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">{user.status}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
