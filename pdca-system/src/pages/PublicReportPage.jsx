import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useDeptReport } from '../hooks/useReport';
import ReportTable from '../components/report/ReportTable';
import { Printer, Download } from 'lucide-react';
import { exportCSV, formatMonth } from '../utils/formatters';
import { getMonthOptions } from '../data/mockHelpers';

export default function PublicReportPage() {
  const { selectedMonth } = useAppContext();
  const [month, setMonth] = useState(selectedMonth);
  const [campus, setCampus] = useState('all');
  const months = getMonthOptions();

  const deptRows = useDeptReport(month, campus);
  const publicRows = deptRows.filter((r) => r.needPublic === true);

  function handleExport() {
    const columns = [
      { key: 'month', label: '月份' },
      { key: 'campus', label: '院区' },
      { key: 'department', label: '科室' },
      { key: 'indicatorId', label: '编号' },
      { key: 'indicatorName', label: '指标名称' },
      { key: 'category', label: '指标分类' },
      { key: 'direction', label: '达标方向' },
      { key: 'responsible', label: '责任人' },
      { key: 'numerator', label: '分子值' },
      { key: 'denominator', label: '分母值' },
      { key: 'actualPct', label: '实际值' },
      { key: 'targetPct', label: '目标值' },
      { key: 'achievedLabel', label: '是否达标' },
    ];
    const formatted = publicRows.map((r) => ({
      ...r,
      actualPct: r.actual !== null ? (r.type === '数量' ? r.actual.toFixed(2) : (r.actual * 100).toFixed(2) + '%') : '—',
      targetPct: r.target !== null ? (r.type === '数量' ? r.target.toFixed(2) : (r.target * 100).toFixed(2) + '%') : '—',
      achievedLabel: r.achieved === true ? '达标' : r.achieved === false ? '未达标' : '待录入',
    }));
    exportCSV(formatted, columns, `公示月报_${month}.csv`);
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 no-print">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">月份</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">院区</label>
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部</option>
            <option value="府城">府城</option>
            <option value="秀英">秀英</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">共 {publicRows.length} 项需公示指标</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-4 text-xs text-blue-700 no-print">
        <strong>公示说明：</strong>本页仅展示标记为"需公示"的指标数据，
        原因分析和改善措施等内部管理信息不在公示范围内。
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold">医教部指标公示月报</h1>
        <p className="text-sm text-gray-500">{formatMonth(month)} · {campus === 'all' ? '全院区' : campus}</p>
      </div>

      <ReportTable
        rows={publicRows}
        showPdca={false}
        showPublic={false}
      />
    </div>
  );
}
