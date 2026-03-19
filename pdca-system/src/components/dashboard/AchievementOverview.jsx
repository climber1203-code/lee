import StatCard from '../common/StatCard';
import { CheckCircle, AlertCircle, Activity, AlertTriangle } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

export default function AchievementOverview({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="总体达标率"
        value={formatPercent(stats.rate)}
        sub={`${stats.achievedCount}/${stats.total} 项达标`}
        color="blue"
        icon={Activity}
      />
      <StatCard
        label="达标指标数"
        value={stats.achievedCount}
        sub="本月"
        color="green"
        icon={CheckCircle}
      />
      <StatCard
        label="未达标指标数"
        value={stats.unachievedCount}
        sub="需要跟进"
        color={stats.unachievedCount > 0 ? 'red' : 'default'}
        icon={AlertCircle}
      />
      <StatCard
        label="连续≥3月未达标"
        value={stats.criticalCount}
        sub="需重点关注"
        color={stats.criticalCount > 0 ? 'amber' : 'default'}
        icon={AlertTriangle}
      />
    </div>
  );
}
