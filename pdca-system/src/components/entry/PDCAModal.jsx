import { useState } from 'react';
import Modal from '../common/Modal';
import { formatActual, formatTarget } from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';

export default function PDCAModal({ open, onClose, indicator, entry, onSave }) {
  const [reason, setReason] = useState(entry?.pdcaReason || '');
  const [action, setAction] = useState(entry?.pdcaAction || '');
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!reason.trim() || reason.trim().length < 5) {
      errs.reason = '原因分析不能为空，且至少5个字';
    }
    if (!action.trim() || action.trim().length < 5) {
      errs.action = '改善措施不能为空，且至少5个字';
    }
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ pdcaReason: reason.trim(), pdcaAction: action.trim() });
    onClose();
  }

  if (!indicator || !entry) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`PDCA改善记录 — ${indicator.name}`}
      maxWidth="max-w-xl"
    >
      {/* Indicator info */}
      <div className="bg-unachieved-bg border border-unachieved-border rounded-lg p-3 mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-unachieved flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-medium text-unachieved">指标未达标，请填写PDCA改善记录</div>
          <div className="text-gray-600 flex flex-wrap gap-3">
            <span>指标：{indicator.id} {indicator.name}</span>
            <span>院区：{entry.campus} {entry.department}</span>
          </div>
          <div className="text-gray-600 flex gap-4">
            <span>实际值：<strong className="text-unachieved">
              {entry.actual !== null ? (indicator.type === '比率' ? (entry.actual * 100).toFixed(2) + '%' : entry.actual.toFixed(2)) : '—'}
            </strong></span>
            <span>目标值：<strong>
              {indicator.type === '比率' ? (indicator.target * 100).toFixed(2) + '%' : indicator.target}
            </strong></span>
            <span>方向：{indicator.direction}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            原因分析 <span className="text-unachieved">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: undefined })); }}
            rows={3}
            placeholder="请详细分析指标未达标的原因..."
            className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              errors.reason ? 'border-unachieved' : 'border-gray-200'
            }`}
          />
          {errors.reason && <p className="text-xs text-unachieved mt-1">{errors.reason}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            改善措施 <span className="text-unachieved">*</span>
          </label>
          <textarea
            value={action}
            onChange={(e) => { setAction(e.target.value); setErrors((p) => ({ ...p, action: undefined })); }}
            rows={3}
            placeholder="请填写具体的改善措施和计划..."
            className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              errors.action ? 'border-unachieved' : 'border-gray-200'
            }`}
          />
          {errors.action && <p className="text-xs text-unachieved mt-1">{errors.action}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          确认保存
        </button>
      </div>
    </Modal>
  );
}
