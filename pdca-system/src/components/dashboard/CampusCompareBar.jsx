import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function CampusCompareBar({ categoryStats, stats }) {
  const data = categoryStats?.map((c) => ({
    name: c.category,
    达标率: c.rate !== null ? +(c.rate * 100).toFixed(1) : 0,
  })) || [];

  // Also show campus comparison
  const campusData = [
    { name: '府城', 达标率: stats?.fcRate !== null ? +(stats.fcRate * 100).toFixed(1) : 0 },
    { name: '秀英', 达标率: stats?.xyRate !== null ? +(stats.xyRate * 100).toFixed(1) : 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Campus compare */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">院区达标率对比</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={campusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip formatter={(v) => [`${v}%`, '达标率']} />
            <Bar dataKey="达标率" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">分类达标率</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip formatter={(v) => [`${v}%`, '达标率']} />
            <Bar dataKey="达标率" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
