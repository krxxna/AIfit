import { useState } from 'react';
import { Activity, Ruler, Save, Scale, UserRound } from 'lucide-react';
import { Button } from './Button';
import { api } from '../api/client';
import { buildProfilePayload, cmToInches, inchesToCm, profileOptions } from '../utils/profile';

function hydrateForm(profile) {
  return {
    name: profile.name || '',
    age: profile.age || '',
    gender: profile.gender || '',
    height: profile.height || '',
    heightUnit: profile.heightUnit || 'cm',
    heightInches: profile.heightInches || cmToInches(profile.height) || '',
    weight: profile.weight || '',
    targetWeight: profile.targetWeight || '',
    fitnessGoal: profile.fitnessGoal || '',
    activityLevel: profile.activityLevel || '',
    foodPreference: profile.foodPreference || '',
    experienceLevel: profile.experienceLevel || '',
    workoutDaysPerWeek: profile.workoutDaysPerWeek || '',
    healthNotes: profile.healthNotes || ''
  };
}

export function OnboardingProfile({ profile, onComplete, onLogout }) {
  const [form, setForm] = useState(() => hydrateForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const heightValue = form.heightUnit === 'in' ? form.heightInches : form.height;
  const heightLabel = form.heightUnit === 'in' ? 'Height (inches)' : 'Height (cm)';

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateHeightUnit(nextUnit) {
    setForm((current) => {
      if (nextUnit === current.heightUnit) return current;
      return {
        ...current,
        heightUnit: nextUnit,
        height: nextUnit === 'cm' ? inchesToCm(current.heightInches) || current.height : current.height,
        heightInches: nextUnit === 'in' ? cmToInches(current.height) || current.heightInches : current.heightInches
      };
    });
  }

  function updateHeight(value) {
    setForm((current) => ({
      ...current,
      height: current.heightUnit === 'in' ? inchesToCm(value) : value,
      heightInches: current.heightUnit === 'in' ? value : cmToInches(value)
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { data } = await api.put('/profile', buildProfilePayload(form));
      onComplete(data.user);
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Could not save profile details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid min-h-screen place-items-center px-4 py-8 text-slate-800 dark:text-slate-100">
      <form onSubmit={submit} className="glass w-full max-w-5xl rounded-lg p-5 shadow-2xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-mint dark:bg-white dark:text-slate-950">
              <UserRound />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Complete Your Profile</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These details power your BMI, diet plan, and workout targets.</p>
            </div>
          </div>
          <Button variant="ghost" type="button" onClick={onLogout}>Logout</Button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Age</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                type="number"
                min="10"
                max="100"
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                value={form.gender}
                onChange={(event) => updateField('gender', event.target.value)}
                required
              >
                <option value="" disabled>Select gender</option>
                {profileOptions.gender.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{heightLabel}</span>
              <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                  type="number"
                  min={form.heightUnit === 'in' ? 31 : 80}
                  max={form.heightUnit === 'in' ? 102 : 260}
                  step="0.1"
                  value={heightValue}
                  onChange={(event) => updateHeight(event.target.value)}
                  required
                />
                <div className="flex border-l border-slate-200 p-1 dark:border-slate-700">
                  {['cm', 'in'].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => updateHeightUnit(unit)}
                      className={`w-10 rounded-md text-xs font-bold uppercase transition ${form.heightUnit === unit ? 'bg-mint text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weight (kg)</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                type="number"
                min="25"
                max="350"
                step="0.1"
                value={form.weight}
                onChange={(event) => updateField('weight', event.target.value)}
                required
              />
            </label>

            {[
              ['fitnessGoal', 'Fitness goal', profileOptions.fitnessGoal],
              ['activityLevel', 'Activity level', profileOptions.activityLevel],
              ['foodPreference', 'Food preference', profileOptions.foodPreference],
              ['experienceLevel', 'Experience level', profileOptions.experienceLevel]
            ].map(([key, label, options]) => (
              <label key={key} className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  required
                >
                  <option value="" disabled>Select {label.toLowerCase()}</option>
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/70 p-4 dark:bg-slate-950/50">
                <Ruler className="mb-3 text-mint" />
                <p className="text-xs text-slate-500">Height</p>
                <p className="mt-1 text-lg font-black">{heightValue || '--'} {form.heightUnit}</p>
              </div>
              <div className="rounded-lg bg-white/70 p-4 dark:bg-slate-950/50">
                <Scale className="mb-3 text-coral" />
                <p className="text-xs text-slate-500">Weight</p>
                <p className="mt-1 text-lg font-black">{form.weight || '--'} kg</p>
              </div>
              <div className="rounded-lg bg-white/70 p-4 dark:bg-slate-950/50">
                <Activity className="mb-3 text-ocean" />
                <p className="text-xs text-slate-500">Days</p>
                <p className="mt-1 text-lg font-black">{form.workoutDaysPerWeek || '--'}{form.workoutDaysPerWeek ? '/week' : ''}</p>
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workout days per week</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                type="number"
                min="1"
                max="7"
                value={form.workoutDaysPerWeek}
                onChange={(event) => updateField('workoutDaysPerWeek', event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target weight (kg)</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                type="number"
                min="25"
                max="350"
                step="0.1"
                value={form.targetWeight}
                onChange={(event) => updateField('targetWeight', event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Health notes</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                value={form.healthNotes}
                onChange={(event) => updateField('healthNotes', event.target.value)}
                maxLength={500}
                placeholder="Injuries, limitations, allergies, or anything your plan should respect."
              />
            </label>

            {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>}

            <Button className="w-full" variant="accent" type="submit" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving profile...' : 'Save and Open Dashboard'}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
