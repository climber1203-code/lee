import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getIndicatorsByFilter, getCampuses, getDepartmentsByCampus } from '../data/mockHelpers';
import EntryTable from '../components/entry/EntryTable';
import { formatMonth } from '../utils/formatters';
import { getMonthOptions } from '../data/mockHelpers';

export default function DataEntryPage() {
  const { selectedMonth } = useAppContext();
  const [month, setMonth] = useState(selectedMonth);
  const [campus, setCampus] = useState('府城');
  const [department, setDepartment] = useState('all');

  const campuses = getCampuses();
  const departments = getDepartmentsByCampus(campus);
  const months = getMonthOptions();

  const indicators = getIndicatorsByFilter({
    campus,
    department: department === 'all' ? undefined : department,
  });

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 no-print">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">月份</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">院区 <span className="text-unachieved">*</span></label>
          <select
            value={campus}
            onChange={(e) => { setCampus(e.target.value); setDepartment('all'); }}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {campuses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">科室</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-gray-400">
          {indicators.length} 项指标
        </div>
      </div>

      {/* Info box */}
      <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-2.5 mb-4 text-xs text-primary-700">
        <strong>录入说明：</strong>请在"分子值"和"分母值"列中填写数据，系统将自动计算实际值并判定是否达标。
        若指标未达标，必须填写原因分析和改善措施（PDCA闭环）后方可保存。
      </div>

      <EntryTable indicators={indicators} month={month} />
    </div>
  );
}
