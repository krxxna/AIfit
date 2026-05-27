import { motion } from 'framer-motion';

export function StatCard({ icon: Icon, label, value, helper, accent = 'bg-mint/15 text-teal-700 dark:text-teal-300' }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</h3>
        </div>
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </motion.article>
  );
}
