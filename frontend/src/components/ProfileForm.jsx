import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from './Button';
import { cmToInches, inchesToCm, profileOptions } from '../utils/profile';

const textFields = [
  ['name', 'Username', 'text', {}],
  ['age', 'Age', 'number', { min: 10, max: 100 }],
  ['weight', 'Weight (kg)', 'number', { min: 25, max: 350, step: 0.1 }],
  ['targetWeight', 'Target weight (kg)', 'number', { min: 25, max: 350, step: 0.1 }],
  ['workoutDaysPerWeek', 'Workout days per week', 'number', { min: 1, max: 7 }]
];

export function ProfileForm({ profile, onChange, onSave }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const heightUnit = profile.heightUnit || 'cm';
  const heightValue = heightUnit === 'in' ? profile.heightInches || cmToInches(profile.height) || '' : profile.height || '';
  const heightLabel = heightUnit === 'in' ? 'Height (inches)' : 'Height (cm)';

  function updateField(key, value) {
    setMessage('');
    setError('');
    onChange({ ...profile, [key]: value });
  }

  function updateHeight(value) {
    setMessage('');
    setError('');
    onChange({
      ...profile,
      height: heightUnit === 'in' ? inchesToCm(value) : value,
      heightInches: heightUnit === 'in' ? value : cmToInches(value)
    });
  }

  function updateHeightUnit(nextUnit) {
    setMessage('');
    setError('');
    onChange({
      ...profile,
      heightUnit: nextUnit,
      height: nextUnit === 'cm' ? inchesToCm(profile.heightInches) || profile.height : profile.height,
      heightInches: nextUnit === 'in' ? cmToInches(profile.height) || profile.heightInches : profile.heightInches
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (!onSave) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await onSave(profile);
      setMessage('Profile saved');
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <form onSubmit={submit}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Personal data for smarter recommendations.</p>
          </div>
          <Button variant="accent" className="hidden sm:inline-flex" type="submit" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving' : 'Save'}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {textFields.map(([key, label, type, inputProps]) => (
            <label key={key} className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
              <input
                type={type}
                value={profile[key] ?? ''}
                onChange={(event) => updateField(key, event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
                {...inputProps}
              />
            </label>
          ))}

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{heightLabel}</span>
            <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                type="number"
                min={heightUnit === 'in' ? 31 : 80}
                max={heightUnit === 'in' ? 102 : 260}
                step="0.1"
                value={heightValue}
                onChange={(event) => updateHeight(event.target.value)}
              />
              <div className="flex border-l border-slate-200 p-1 dark:border-slate-700">
                {['cm', 'in'].map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateHeightUnit(unit)}
                    className={`w-10 rounded-md text-xs font-bold uppercase transition ${heightUnit === unit ? 'bg-mint text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </label>

          {[
            ['gender', 'Gender', profileOptions.gender],
            ['fitnessGoal', 'Fitness goal', profileOptions.fitnessGoal],
            ['activityLevel', 'Activity level', profileOptions.activityLevel],
            ['foodPreference', 'Food preference', profileOptions.foodPreference],
            ['experienceLevel', 'Experience level', profileOptions.experienceLevel]
          ].map(([key, label, options]) => (
            <label key={key} className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
              <select
                value={profile[key] ?? ''}
                onChange={(event) => updateField(key, event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
              >
                {options.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}

          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Health notes</span>
            <textarea
              value={profile.healthNotes ?? ''}
              onChange={(event) => updateField('healthNotes', event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
              maxLength={500}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {message && <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{message}</p>}
            {error && <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>}
          </div>
          <Button variant="accent" className="sm:hidden" type="submit" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  );
}
