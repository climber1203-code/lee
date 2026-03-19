import { formatPercent } from '../../utils/formatters';
import Badge from '../common/Badge';
import { Medal } from 'lucide-react';

export default function DepartmentRankingTable({ deptRankings }) {
  if (!deptRankings || deptRankings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">科室达标率排名</h3>
        <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>
      </div>
    );
  }

  const medalColor = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">科室达标率排名</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
              <th className="text-left pb-2 pr-3 w-8">排名</th>
              <th className="text-left pb-2 pr-3">院区</th>
              <th className="text-left pb-2 pr-3">科室</th>
              <th className="text-right pb-2 pr-3">达标数</th>
              <th className="text-right pb-2 pr-3">总数</th>
              <th className="text-right pb-2">达标率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deptRankings.map((row, idx) => (
              <tr key={`${row.campus}-${row.department}`} className="hover:bg-gray-50">
                <td className="py-2 pr-3">
                  {idx < 3 ? (
                    <Medal className={`w-4 h-4 ${medalColor[idx]}`} />
                  ) : (
                    <span className="text-gray-400 text-xs">{idx + 1}</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    row.campus === '府城' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'
                  }`}>
                    {row.campus}
                  </span>
                </td>
                <td className="py-2 pr-3 text-gray-700">{row.department}</td>
                <td className="py-2 pr-3 text-right text-gray-600">{row.achieved}</td>
                <td className="py-2 pr-3 text-right text-gray-600">{row.total}</td>
                <td className="py-2 text-right">
                  <span className={`font-medium ${
                    row.rate >= 0.9 ? 'text-achieved' : row.rate >= 0.7 ? 'text-warning' : 'text-unachieved'
                  }`}>
                    {formatPercent(row.rate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
