import Badge from '../common/Badge';
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff, AlertTriangle } from 'lucide-react';

function TrendCell({ change, direction }) {
  if (change === null || change === undefined) return <span className="text-gray-300">—</span>;
  const isGood = direction === '越高越好' ? change >= 0 : change <= 0;
  const abs = Math.abs(change * 100).toFixed(2);
  const sign = change >= 0 ? '+' : '-';

  return (
    <span className={`flex items-center gap-0.5 text-xs ${isGood ? 'text-achieved' : 'text-unachieved'}`}>
      {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {sign}{abs}%
    </span>
  );
}

function formatActualDisplay(row) {
  if (row.actual === null || row.actual === undefined) return '—';
  if (row.type === '数量') return row.actual.toFixed(2);
  return (row.actual * 100).toFixed(2) + '%';
}

function formatTargetDisplay(row) {
  if (row.target === null || row.target === undefined) return '—';
  if (row.type === '数量') return row.target.toFixed(2);
  return (row.target * 100).toFixed(2) + '%';
}

export default function ReportTable({ rows, showPdca = true, showPublic = true }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-sm text-gray-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[1100px]">
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
            <tr className="text-gray-500 uppercase tracking-wide">
              <th className="text-left px-3 py-3 whitespace-nowrap">月份</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">层级</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">科室</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">编号</th>
              <th className="text-left px-3 py-3">指标名称</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">分类</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">达标方向</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">责任人</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">分子</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">分母</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">实际值</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">目标值</th>
              <th className="text-left px-3 py-3 whitespace-nowrap">达标</th>
              {showPublic && <th className="text-left px-3 py-3 whitespace-nowrap">公示</th>}
              <th className="text-left px-3 py-3 whitespace-nowrap">环比</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">排名</th>
              <th className="text-right px-3 py-3 whitespace-nowrap">连续不达标</th>
              {showPdca && (
                <>
                  <th className="text-left px-3 py-3 whitespace-nowrap min-w-[140px]">原因分析</th>
                  <th className="text-left px-3 py-3 whitespace-nowrap min-w-[140px]">改善措施</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, idx) => {
              const isConsecCritical = row.consecutiveFailMonths >= 3;
              return (
                <tr
                  key={row.id || idx}
                  className={`hover:bg-gray-50 ${isConsecCritical ? 'bg-warning-bg' : ''}`}
                >
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.month}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      row.level === '全院' ? 'bg-purple-50 text-purple-600' :
                      row.level === '院区' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>{row.level}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                    {row.campus && row.level === '科室' && (
                      <span className={`text-xs mr-1 px-1 py-0.5 rounded ${
                        row.campus === '府城' ? 'bg-indigo-50 text-indigo-500' : 'bg-cyan-50 text-cyan-500'
                      }`}>{row.campus}</span>
                    )}
                    {row.department}
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{row.indicatorId}</td>
                  <td className="px-3 py-2.5 text-gray-700 max-w-[180px]">
                    <div className="truncate" title={row.indicatorName}>{row.indicatorName}</div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.category}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.direction}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.responsible}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.numerator ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.denominator || '—'}</td>
                  <td className={`px-3 py-2.5 text-right font-medium whitespace-nowrap ${
                    row.achieved === false ? 'text-unachieved' : row.achieved === true ? 'text-achieved' : 'text-gray-400'
                  }`}>
                    {formatActualDisplay(row)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-500 whitespace-nowrap">
                    {formatTargetDisplay(row)}
                  </td>
                  <td className="px-3 py-2.5"><Badge achieved={row.achieved} /></td>
                  {showPublic && (
                    <td className="px-3 py-2.5">
                      {row.needPublic ? (
                        <Eye className="w-3.5 h-3.5 text-primary-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2.5">
                    <TrendCell change={row.momChange} direction={row.direction} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-500">
                    {row.rank ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {row.consecutiveFailMonths != null ? (
                      <span className={`flex items-center justify-end gap-1 ${
                        isConsecCritical ? 'text-warning font-bold' : 'text-gray-500'
                      }`}>
                        {isConsecCritical && <AlertTriangle className="w-3 h-3" />}
                        {row.consecutiveFailMonths}月
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  {showPdca && (
                    <>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[200px]">
                        <div className="truncate" title={row.pdcaReason}>
                          {row.pdcaReason || <span className="text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[200px]">
                        <div className="truncate" title={row.pdcaAction}>
                          {row.pdcaAction || <span className="text-gray-300">—</span>}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        共 {rows.length} 条记录
        {rows.filter((r) => r.consecutiveFailMonths >= 3).length > 0 && (
          <span className="ml-2 text-warning font-medium">
            · {rows.filter((r) => r.consecutiveFailMonths >= 3).length} 项连续≥3月未达标 ⚠
          </span>
        )}
      </div>
    </div>
  );
}
