import { useState, useMemo } from 'react';
import Badge from '../common/Badge';
import PDCAModal from './PDCAModal';
import { computeActual, isAchieved } from '../../utils/calculations';
import { ClipboardCheck, Save } from 'lucide-react';

export default function EntryRow({ indicator, existingEntry, month, onSave }) {
  const initial = existingEntry || {};
  const [numerator, setNumerator] = useState(
    initial.numerator !== undefined ? String(initial.numerator) : ''
  );
  const [denominator, setDenominator] = useState(
    initial.denominator !== undefined ? String(initial.denominator) : ''
  );
  const [pdcaReason, setPdcaReason] = useState(initial.pdcaReason || '');
  const [pdcaAction, setPdcaAction] = useState(initial.pdcaAction || '');
  const [pdcaOpen, setPdcaOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const numVal = numerator === '' ? null : Number(numerator);
  const denVal = denominator === '' ? null : Number(denominator);

  const actual = useMemo(
    () => computeActual(numVal, denVal, indicator.type),
    [numVal, denVal, indicator.type]
  );
  const achieved = useMemo(
    () => isAchieved(actual, indicator.target, indicator.direction),
    [actual, indicator.target, indicator.direction]
  );

  const hasPdca = pdcaReason.trim().length >= 5 && pdcaAction.trim().length >= 5;

  function formatVal(val) {
    if (val === null || val === undefined) return '—';
    if (indicator.type === '比率') return (val * 100).toFixed(2) + '%';
    return val.toFixed(2);
  }

  function handleSave() {
    if (achieved === false && !hasPdca) {
      setPdcaOpen(true);
      return;
    }
    saveEntry();
  }

  function saveEntry(extraPdca = {}) {
    const entry = {
      id: `ENTRY-${month}-${indicator.id}`,
      month,
      indicatorId: indicator.id,
      campus: indicator.campus,
      department: indicator.department,
      responsible: indicator.responsible,
      numerator: numVal ?? 0,
      denominator: denVal ?? 0,
      actual,
      target: indicator.target,
      achieved,
      pdcaReason: extraPdca.pdcaReason ?? pdcaReason,
      pdcaAction: extraPdca.pdcaAction ?? pdcaAction,
      monthSeq: Number(month.split('-')[1]),
    };
    onSave(entry);
    setPdcaReason(entry.pdcaReason);
    setPdcaAction(entry.pdcaAction);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const denomZero = indicator.type === '比率' && denVal !== null && denVal === 0;

  return (
    <>
      <tr className={`hover:bg-gray-50 text-sm ${saved ? 'bg-achieved-bg' : ''}`}>
        <td className="py-2.5 px-3 text-xs text-gray-400 whitespace-nowrap">{indicator.id}</td>
        <td className="py-2.5 px-3 text-gray-700 max-w-[160px]">
          <div className="truncate" title={indicator.name}>{indicator.name}</div>
          <div className="text-xs text-gray-400">{indicator.category}</div>
        </td>
        <td className="py-2.5 px-3 text-xs text-gray-500">{indicator.direction}</td>
        <td className="py-2.5 px-3 text-right text-gray-600 whitespace-nowrap">
          {formatVal(indicator.target)}
        </td>

        {/* Numerator */}
        <td className="py-2 px-3">
          <input
            type="number"
            min="0"
            value={numerator}
            onChange={(e) => setNumerator(e.target.value)}
            placeholder={indicator.numeratorDef?.slice(0, 8) || '分子'}
            className="w-20 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </td>

        {/* Denominator */}
        {indicator.type !== '数量' ? (
          <td className="py-2 px-3">
            <input
              type="number"
              min="0"
              value={denominator}
              onChange={(e) => setDenominator(e.target.value)}
              placeholder={indicator.denominatorDef?.slice(0, 8) || '分母'}
              className={`w-20 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                denomZero ? 'border-unachieved' : 'border-gray-200'
              }`}
            />
            {denomZero && <div className="text-xs text-unachieved mt-0.5">分母不能为0</div>}
          </td>
        ) : (
          <td className="py-2 px-3 text-xs text-gray-400">—</td>
        )}

        {/* Actual */}
        <td className={`py-2.5 px-3 text-right font-medium whitespace-nowrap ${
          achieved === false ? 'text-unachieved' : achieved === true ? 'text-achieved' : 'text-gray-400'
        }`}>
          {formatVal(actual)}
        </td>

        {/* Status */}
        <td className="py-2.5 px-3">
          <Badge achieved={achieved} />
        </td>

        {/* PDCA status */}
        <td className="py-2.5 px-3">
          {achieved === false && hasPdca && (
            <button
              onClick={() => setPdcaOpen(true)}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
              title="查看/编辑PDCA"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              已填
            </button>
          )}
          {achieved === false && !hasPdca && (
            <button
              onClick={() => setPdcaOpen(true)}
              className="flex items-center gap-1 text-xs text-warning hover:text-amber-700 font-medium animate-pulse"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              待填
            </button>
          )}
        </td>

        {/* Save */}
        <td className="py-2 px-3">
          <button
            onClick={handleSave}
            disabled={actual === null || denomZero}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors ${
              saved
                ? 'bg-achieved-bg text-achieved'
                : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Save className="w-3 h-3" />
            {saved ? '已保存' : '保存'}
          </button>
        </td>
      </tr>

      <PDCAModal
        open={pdcaOpen}
        onClose={() => setPdcaOpen(false)}
        indicator={indicator}
        entry={{ ...existingEntry, actual, campus: indicator.campus }}
        onSave={(pdca) => {
          setPdcaReason(pdca.pdcaReason);
          setPdcaAction(pdca.pdcaAction);
          saveEntry(pdca);
        }}
      />
    </>
  );
}
