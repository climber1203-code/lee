import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useDeptReport, useCampusReport, useHospitalReport } from '../hooks/useReport';
import LevelToggle from '../components/report/LevelToggle';
import ReportTable from '../components/report/ReportTable';
import FilterBar from '../components/common/FilterBar';
import { Printer } from 'lucide-react';
import { formatMonth } from '../utils/formatters';
import { getDepartmentsByCampus } from '../data/mockHelpers';

export default function MonthlyReportPage() {
  const { selectedMonth, selectedCampus, setSelectedCampus } = useAppContext();
  const [month, setMonth] = useState(selectedMonth);
  const [campus, setCampus] = useState(selectedCampus);
  const [dept, setDept] = useState('all');
  const [level, setLevel] = useState('科室');

  const deptRows = useDeptReport(month, campus);
  const campusRows = useCampusReport(month, campus);
  const hospRows = useHospitalReport(month);

  const filteredDeptRows = dept === 'all' ? deptRows : deptRows.filter((r) => r.department === dept);

  const rows = level === '全院' ? hospRows : level === '院区' ? campusRows : filteredDeptRows;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 no-print">
        <FilterBar
          month={month}
          onMonthChange={setMonth}
          campus={campus}
          onCampusChange={setCampus}
          department={dept}
          onDeptChange={setDept}
          showDept={level === '科室'}
        />
        <div className="flex items-center gap-3 ml-auto">
          <LevelToggle level={level} onChange={setLevel} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold">综合月报表</h1>
        <p className="text-sm text-gray-500">{formatMonth(month)} · {campus === 'all' ? '全院区' : campus} · {level}层级</p>
      </div>

      <ReportTable rows={rows} showPdca={true} showPublic={true} />
    </div>
  );
}
