import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, sub, trend, color = 'default', icon: Icon }) {
  const colorMap = {
    default: { bg: 'bg-white', text: 'text-gray-800', accent: 'text-primary-600' },
    green: { bg: 'bg-achieved-bg', text: 'text-achieved', accent: 'text-achieved' },
    red: { bg: 'bg-unachieved-bg', text: 'text-unachieved', accent: 'text-unachieved' },
    amber: { bg: 'bg-warning-bg', text: 'text-warning', accent: 'text-warning' },
    blue: { bg: 'bg-primary-50', text: 'text-primary-700', accent: 'text-primary-600' },
  };
  const c = colorMap[color] || colorMap.default;

  return (
    <div className={`${c.bg} rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${c.accent}`} />}
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{value ?? '—'}</div>
      <div className="flex items-center justify-between">
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
        {trend !== undefined && trend !== null && (
          <div className="flex items-center gap-1 text-xs">
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-achieved" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3 text-unachieved" />
            ) : (
              <Minus className="w-3 h-3 text-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
