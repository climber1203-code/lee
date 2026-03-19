import { useAppContext } from '../../context/AppContext';
import { getMonthOptions } from '../../data/mockHelpers';
import { formatMonth } from '../../utils/formatters';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': '看板总览',
  '/entry': '数据录入',
  '/report': '综合月报表',
  '/public': '公示管理',
};

export default function TopBar() {
  const { selectedMonth, setSelectedMonth, selectedCampus, setSelectedCampus } = useAppContext();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || '医教部指标PDCA系统';
  const months = getMonthOptions();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 no-print">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Month selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 whitespace-nowrap">月份</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Campus selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 whitespace-nowrap">院区</label>
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部</option>
            <option value="府城">府城</option>
            <option value="秀英">秀英</option>
          </select>
        </div>
      </div>
    </header>
  );
}
