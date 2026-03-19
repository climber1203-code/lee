import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatPercent, formatMonth } from '../../utils/formatters';

export default function TrendLineChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const data = trend.map((t) => ({
    month: formatMonth(t.month).replace(/\d+年/, '').replace('月', '月'),
    全院: t.allRate !== null ? +(t.allRate * 100).toFixed(1) : null,
    府城: t.fcRate !== null ? +(t.fcRate * 100).toFixed(1) : null,
    秀英: t.xyRate !== null ? +(t.xyRate * 100).toFixed(1) : null,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">近6个月达标率趋势</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip formatter={(v) => [`${v}%`]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="全院" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="府城" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} connectNulls />
          <Line type="monotone" dataKey="秀英" stroke="#0891b2" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
