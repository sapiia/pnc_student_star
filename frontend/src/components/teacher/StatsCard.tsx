import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  total?: string;
  trend?: string;
  icon: any;
  color: string;
  bg: string;
  actionLabel?: string;
  onAction?: () => void;
  index?: number;
  loading?: boolean;
  key?: string;
}

export default function StatsCard({
  label,
  value,
  total,
  trend,
  icon: Icon,
  color,
  bg,
  actionLabel,
  onAction,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.25 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover-lift"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-xl", bg, color)}>
          <Icon className="w-6 h-6" />
        </div>
{actionLabel && onAction ? (
  <button
    onClick={onAction}
    className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:border-rose-500 hover:bg-rose-500 transition-all shadow-sm"
  >
    {actionLabel}
  </button>
) : (
  <span className={cn("text-xs font-bold", color)}>{trend}</span>
)} 
      </div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900">
        {value}
        {total && <span className="text-sm font-medium text-slate-400 ml-1">{total}</span>}
      </h3>
    </motion.div>
  );
}

