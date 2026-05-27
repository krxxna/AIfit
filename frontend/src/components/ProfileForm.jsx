import { Button } from './Button';

const fields = [
  ['name', 'Name', 'text'],
  ['age', 'Age', 'number'],
  ['height', 'Height (cm)', 'number'],
  ['weight', 'Weight (kg)', 'number']
];

export function ProfileForm({ profile, onChange }) {
  return (
    <section className="glass rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Personal data for smarter recommendations.</p>
        </div>
        <Button variant="accent" className="hidden sm:inline-flex">Save</Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            <input
              type={type}
              value={profile[key]}
              onChange={(event) => onChange({ ...profile, [key]: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        ))}
        {[
          ['gender', 'Gender', ['Male', 'Female', 'Other']],
          ['fitnessGoal', 'Fitness goal', ['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Endurance']],
          ['activityLevel', 'Activity level', ['Low', 'Moderate', 'High']],
          ['foodPreference', 'Food preference', ['Veg', 'Non-Veg', 'Vegan']]
        ].map(([key, label, options]) => (
          <label key={key} className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            <select
              value={profile[key]}
              onChange={(event) => onChange({ ...profile, [key]: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mint dark:border-slate-700 dark:bg-slate-950"
            >
              {options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
