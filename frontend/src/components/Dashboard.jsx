import { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  Camera,
  ClipboardList,
  Droplets,
  Flame,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Moon,
  Ruler,
  Scale,
  Sun,
  Target,
  Trophy,
  UserRound,
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
import { reminders, workoutHistory } from '../data/dummyData';
import { ChatAssistant } from './ChatAssistant';
import { displayHeight } from '../utils/profile';

const sections = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'user', label: 'User', icon: UserRound },
  { id: 'progress', label: 'Progress', icon: Activity },
  { id: 'plan', label: 'AI Plan', icon: ClipboardList },
  { id: 'tracker', label: 'Tracker', icon: Camera },
  { id: 'diet', label: 'Diet', icon: Utensils },
  { id: 'coach', label: 'AI Coach', icon: MessageSquareText },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

const sectionCopy = {
  overview: ['Dashboard', 'Your key health, workout, and nutrition signals.'],
  user: ['User Profile', 'Review and update your personal fitness details.'],
  progress: ['Progress Analytics', 'Workout volume, calorie burn, and weight trend.'],
  plan: ['AI Fitness Plan', 'Workout guidance generated from your saved profile.'],
  tracker: ['AI Exercise Tracker', 'Webcam posture detection and rep counting.'],
  diet: ['AI Diet Plan', 'Meal targets and nutrition split for your preference.'],
  coach: ['AI Chat Coach', 'Ask quick questions based on your current plan.'],
  notifications: ['Notifications', 'Reminders and health nudges.']
};

function userName(profile) {
  return profile.name || 'FitAI User';
}

function UserSnapshot({ profile }) {
  return (
    <section className="rounded-lg bg-slate-950 p-4 text-white shadow-sm dark:bg-white dark:text-slate-950">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mint text-lg font-black text-slate-950">
          {userName(profile).slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">User Profile</p>
          <h1 className="truncate text-lg font-black">{userName(profile)}</h1>
          <p className="truncate text-sm opacity-75">{profile.fitnessGoal || 'Fitness goal'}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-lg bg-white/10 px-3 py-2 dark:bg-slate-950/10">{profile.age || '--'} yrs</span>
        <span className="rounded-lg bg-white/10 px-3 py-2 dark:bg-slate-950/10">{profile.weight || '--'} kg</span>
      </div>
    </section>
  );
}

function Sidebar({ profile, activeSection, onSectionChange, darkMode, setDarkMode, onLogout }) {
  return (
    <aside className="border-b border-white/50 bg-white/75 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-slate-950">
            <Activity />
          </div>
          <div>
            <p className="text-lg font-black text-slate-950 dark:text-white">FitAI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fitness command center</p>
          </div>
        </div>

        <UserSnapshot profile={profile} />

        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {sections.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition ${
                  active
                    ? 'bg-mint text-slate-950 shadow-sm'
                    : 'bg-white/65 text-slate-600 hover:bg-white hover:text-slate-950 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto grid grid-cols-2 gap-2 lg:grid-cols-1">
          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

function SectionHeader({ activeSection }) {
  const [title, subtitle] = sectionCopy[activeSection] || sectionCopy.overview;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function OverviewSection({ recommendation, weeklyCalories, profile }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Target} label="BMI Score" value={recommendation.bmi} helper={recommendation.category.label} accent={recommendation.category.tone} />
        <StatCard icon={Flame} label="Calories Burned" value={weeklyCalories.toLocaleString()} helper="This week" accent="bg-coral/15 text-rose-700 dark:text-rose-300" />
        <StatCard icon={Droplets} label="Water Intake" value={`${recommendation.waterLiters} L`} helper="Daily target" accent="bg-ocean/15 text-sky-700 dark:text-sky-300" />
        <StatCard icon={Trophy} label="Streak" value="12 days" helper="Daily goals completed" accent="bg-citrus/20 text-amber-700 dark:text-amber-300" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="glass rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-mint/15 p-2 text-teal-700 dark:text-teal-300">
              <Target />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Today Focus</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{recommendation.focus}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recommendation.workoutPlan.slice(0, 2).map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white/70 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/50">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">User Snapshot</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/50">Goal: {profile.fitnessGoal}</span>
            <span className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/50">Activity: {profile.activityLevel}</span>
            <span className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/50">Height: {displayHeight(profile)}</span>
            <span className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/50">Weight: {profile.weight} kg</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserSection({ profile, setProfile, onSaveProfile }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="glass rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-950 p-2 text-mint dark:bg-white dark:text-slate-950">
              <UserRound />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">{userName(profile)}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile.experienceLevel || 'Experience level'}</p>
            </div>
          </div>
          <span className="rounded-lg bg-mint/15 px-3 py-2 text-xs font-bold text-teal-700 dark:text-teal-300">
            {profile.foodPreference}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MetricTile icon={Target} label="Goal" value={profile.fitnessGoal} accent="text-coral" />
          <MetricTile icon={Activity} label="Activity" value={profile.activityLevel} accent="text-ocean" />
          <MetricTile icon={Ruler} label="Height" value={displayHeight(profile)} accent="text-mint" />
          <MetricTile icon={Scale} label="Weight" value={`${profile.weight} kg`} accent="text-citrus" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <span className="rounded-lg bg-white/70 py-2 font-semibold dark:bg-slate-950/50">{profile.age} yrs</span>
          <span className="rounded-lg bg-white/70 py-2 font-semibold dark:bg-slate-950/50">{profile.gender}</span>
          <span className="rounded-lg bg-white/70 py-2 font-semibold dark:bg-slate-950/50">{profile.workoutDaysPerWeek || '--'} days</span>
        </div>
        <div className="mt-3 rounded-lg bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
          <p className="text-xs font-semibold opacity-75">Target weight</p>
          <p className="mt-1 text-lg font-black">{profile.targetWeight ? `${profile.targetWeight} kg` : 'Not set'}</p>
        </div>
      </section>

      <ProfileForm profile={profile} onChange={setProfile} onSave={onSaveProfile} />
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-950/50">
      <Icon className={`mb-2 ${accent}`} size={18} />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-bold">{value || '--'}</p>
    </div>
  );
}

function ProgressSection({ recommendation }) {
  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Progress Analytics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Workout volume, calorie burn, and weight trend.</p>
        </div>
        <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${recommendation.category.tone}`}>
          {recommendation.category.suggestion}
        </span>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="h-80 rounded-lg bg-white/60 p-3 dark:bg-slate-950/40">
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
        <div className="h-80 rounded-lg bg-white/60 p-3 dark:bg-slate-950/40">
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
  );
}

function PlanSection({ recommendation }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="glass rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-plum/15 p-2 text-violet-700 dark:text-violet-300">
            <Bot />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">AI Fitness Plan</h3>
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

      <section className="glass rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">Exercise Targets</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {recommendation.exercises.map((exercise) => (
            <article key={exercise.name} className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white">{exercise.name}</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{exercise.cue}</p>
                </div>
                <span className="rounded-lg bg-mint/15 px-2 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                  {exercise.sets} x {exercise.reps}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DietSection({ recommendation, profile, macroTotals }) {
  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">AI Diet Plan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.foodPreference} nutrition split</p>
        </div>
        <div className="rounded-lg bg-mint/15 p-2 text-teal-700 dark:text-teal-300">
          <Utensils />
        </div>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {recommendation.diet.map((meal) => (
          <article key={meal.meal} className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-950 dark:text-white">{meal.meal}</h4>
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
  );
}

function NotificationsSection() {
  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Bell className="text-coral" />
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">Notifications</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
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
  );
}

export function Dashboard({ profile, setProfile, recommendation, darkMode, setDarkMode, onLogout, onSaveProfile }) {
  const [activeSection, setActiveSection] = useState('overview');
  const weeklyCalories = workoutHistory.reduce((sum, day) => sum + day.calories, 0);
  const macroTotals = useMemo(
    () =>
      recommendation.diet.reduce(
        (totals, item) => ({
          calories: totals.calories + item.calories,
          protein: totals.protein + item.protein,
          carbs: totals.carbs + item.carbs,
          fats: totals.fats + item.fats
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      ),
    [recommendation.diet]
  );

  function renderSection() {
    if (activeSection === 'user') return <UserSection profile={profile} setProfile={setProfile} onSaveProfile={onSaveProfile} />;
    if (activeSection === 'progress') return <ProgressSection recommendation={recommendation} />;
    if (activeSection === 'plan') return <PlanSection recommendation={recommendation} />;
    if (activeSection === 'tracker') return <ExerciseTracker />;
    if (activeSection === 'diet') return <DietSection recommendation={recommendation} profile={profile} macroTotals={macroTotals} />;
    if (activeSection === 'coach') return <ChatAssistant recommendation={recommendation} />;
    if (activeSection === 'notifications') return <NotificationsSection />;
    return <OverviewSection recommendation={recommendation} weeklyCalories={weeklyCalories} profile={profile} />;
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Sidebar
        profile={profile}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={onLogout}
      />

      <main className="min-w-0 px-4 py-5 lg:px-6 lg:py-6">
        <SectionHeader activeSection={activeSection} />
        {renderSection()}
      </main>
    </div>
  );
}
