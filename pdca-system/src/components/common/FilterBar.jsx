import { getCampuses, getDepartmentsByCampus, getMonthOptions } from '../../data/mockHelpers';
import { formatMonth } from '../../utils/formatters';

export default function FilterBar({
  month, onMonthChange,
  campus, onCampusChange,
  department, onDeptChange,
  showDept = true,
  requireCampus = false,
}) {
  const campuses = getCampuses();
  const departments = getDepartmentsByCampus(campus === 'all' ? null : campus);
  const months = getMonthOptions();

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4">
      {/* Month */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 whitespace-nowrap">月份</label>
        <select
          value={month}
          onChange={(e) => onMonthChange?.(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {months.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>

      {/* Campus */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 whitespace-nowrap">院区</label>
        <select
          value={campus}
          onChange={(e) => {
            onCampusChange?.(e.target.value);
            onDeptChange?.('all');
          }}
          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {!requireCampus && <option value="all">全部</option>}
          {campuses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Department */}
      {showDept && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">科室</label>
          <select
            value={department}
            onChange={(e) => onDeptChange?.(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
