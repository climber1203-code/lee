import EntryRow from './EntryRow';
import { useDataContext } from '../../context/DataContext';

export default function EntryTable({ indicators, month }) {
  const { getEntry, updateEntry } = useDataContext();

  if (!indicators || indicators.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">请先选择院区和科室以加载指标列表</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-3 py-3">编号</th>
              <th className="text-left px-3 py-3">指标名称</th>
              <th className="text-left px-3 py-3">达标方向</th>
              <th className="text-right px-3 py-3">目标值</th>
              <th className="text-left px-3 py-3">
                <div>分子值</div>
                <div className="text-gray-400 normal-case font-normal">（手动录入）</div>
              </th>
              <th className="text-left px-3 py-3">
                <div>分母值</div>
                <div className="text-gray-400 normal-case font-normal">（手动录入）</div>
              </th>
              <th className="text-right px-3 py-3">
                <div>实际值</div>
                <div className="text-gray-400 normal-case font-normal">（自动计算）</div>
              </th>
              <th className="text-left px-3 py-3">是否达标</th>
              <th className="text-left px-3 py-3">PDCA</th>
              <th className="text-left px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {indicators.map((ind) => (
              <EntryRow
                key={ind.id}
                indicator={ind}
                existingEntry={getEntry(month, ind.id)}
                month={month}
                onSave={updateEntry}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        共 {indicators.length} 项指标 · 黄色标注的行需填写PDCA改善记录
      </div>
    </div>
  );
}
