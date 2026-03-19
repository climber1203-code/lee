/**
 * Format a ratio/rate as percentage string
 * @param {number} value - raw decimal e.g. 0.956
 * @param {number} decimals
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format a number with fixed decimals
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return Number(value).toFixed(decimals);
}

/**
 * Format actual value based on indicator type
 * @param {number} value
 * @param {string} type - '比率' | '数量' | '比值'
 */
export function formatActual(value, type) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (type === '比率') return formatPercent(value);
  if (type === '数量') return formatNumber(value, 2);
  return formatPercent(value);
}

/**
 * Format target value based on indicator type
 */
export function formatTarget(value, type) {
  if (value === null || value === undefined) return '—';
  if (type === '比率') return formatPercent(value);
  if (type === '数量') return formatNumber(value, 2);
  return formatPercent(value);
}

/**
 * Format MoM change
 * @param {number} change - absolute change
 * @param {string} type
 */
export function formatMoM(change, type) {
  if (change === null || change === undefined || isNaN(change)) return '—';
  const sign = change >= 0 ? '+' : '';
  if (type === '比率') return sign + formatPercent(change);
  return sign + formatNumber(change, 2);
}

/**
 * Format month label: '2026-01' -> '2026年1月'
 */
export function formatMonth(month) {
  if (!month) return '';
  const [y, m] = month.split('-');
  return `${y}年${Number(m)}月`;
}

/**
 * Export table data as CSV string and trigger browser download
 * @param {Array} rows - array of plain objects
 * @param {Array} columns - [{ key, label }]
 * @param {string} filename
 */
export function exportCSV(rows, columns, filename = 'export.csv') {
  const header = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const csv = '\uFEFF' + header + '\n' + body; // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
