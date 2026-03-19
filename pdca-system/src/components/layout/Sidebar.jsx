import { NavLink } from 'react-router-dom';
import { BarChart2, PencilLine, FileText, Megaphone, Activity } from 'lucide-react';

const navItems = [
  { to: '/', label: '看板总览', icon: BarChart2 },
  { to: '/entry', label: '数据录入', icon: PencilLine },
  { to: '/report', label: '综合月报', icon: FileText },
  { to: '/public', label: '公示管理', icon: Megaphone },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full no-print">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold text-gray-800">医教部指标</div>
          <div className="text-xs text-gray-400">PDCA管理系统</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600 rounded-l-none'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2026 医教部质管科</p>
      </div>
    </aside>
  );
}
