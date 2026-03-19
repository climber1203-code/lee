import { useAppContext } from '../context/AppContext';
import { useDashboardStats } from '../hooks/useReport';
import AchievementOverview from '../components/dashboard/AchievementOverview';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import CampusCompareBar from '../components/dashboard/CampusCompareBar';
import DepartmentRankingTable from '../components/dashboard/DepartmentRankingTable';
import Badge from '../components/common/Badge';
import { formatActual, formatTarget, formatMonth } from '../utils/formatters';
import { useDataContext } from '../context/DataContext';
import { consecutiveFailMonths } from '../utils/calculations';

export default function DashboardPage() {
  const { selectedMonth, selectedCampus } = useAppContext();
  const { entries } = useDataContext();
  const stats = useDashboardStats(selectedMonth, selectedCampus);

  // Non-achieved list
  const nonAchieved = entries.filter(
    (e) =>
      e.month === selectedMonth &&
      e.achieved === false &&
      (selectedCampus === 'all' || e.campus === selectedCampus)
  );

  return (
    <div>
      {/* Overview cards */}
      <AchievementOverview stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <TrendLineChart trend={stats.trend} />
        </div>
        <div>
          {/* Campus rate cards */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">院区达标率</h3>
            <div className="space-y-4">
              {[
                { label: '府城院区', rate: stats.fcRate, color: 'bg-indigo-500' },
                { label: '秀英院区', rate: stats.xyRate, color: 'bg-cyan-500' },
              ].map(({ label, rate, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-800">
                      {rate !== null ? `${(rate * 100).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${rate !== null ? rate * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Category stats */}
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">分类达标率</h4>
              <div className="space-y-2">
                {stats.categoryStats?.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate mr-2">{cat.category}</span>
                    <span className={`font-medium ${
                      cat.rate >= 0.9 ? 'text-achieved' : cat.rate >= 0.7 ? 'text-warning' : 'text-unachieved'
                    }`}>
                      {cat.rate !== null ? `${(cat.rate * 100).toFixed(0)}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: rankings + non-achieved */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DepartmentRankingTable deptRankings={stats.deptRankings} />

        {/* Non-achieved list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            未达标指标
            {nonAchieved.length > 0 && (
              <span className="ml-2 bg-unachieved-bg text-unachieved text-xs px-1.5 py-0.5 rounded-full">
                {nonAchieved.length}
              </span>
            )}
          </h3>
          {nonAchieved.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-achieved font-medium">🎉 本月全部达标！</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 uppercase border-b border-gray-100">
                    <th className="text-left pb-2 pr-2">指标</th>
                    <th className="text-left pb-2 pr-2">科室</th>
                    <th className="text-right pb-2 pr-2">实际值</th>
                    <th className="text-right pb-2 pr-2">目标值</th>
                    <th className="text-right pb-2">连续月</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {nonAchieved.map((entry) => {
                    const consec = consecutiveFailMonths(entries, entry.indicatorId, selectedMonth);
                    return (
                      <tr key={entry.id} className={consec >= 3 ? 'bg-warning-bg' : 'hover:bg-gray-50'}>
                        <td className="py-2 pr-2 text-gray-700 truncate max-w-[120px]">
                          <span className="text-gray-400 mr-1">{entry.indicatorId}</span>
                        </td>
                        <td className="py-2 pr-2">
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            entry.campus === '府城' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'
                          }`}>
                            {entry.department}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-right text-unachieved font-medium">
                          {entry.actual !== null ? (entry.actual * 100).toFixed(2) + '%' : '—'}
                        </td>
                        <td className="py-2 pr-2 text-right text-gray-500">
                          {entry.target !== null ? (entry.target * 100).toFixed(2) + '%' : '—'}
                        </td>
                        <td className="py-2 text-right">
                          {consec >= 3 ? (
                            <span className="text-warning font-bold">{consec}月 ⚠</span>
                          ) : (
                            <span className="text-gray-500">{consec}月</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
