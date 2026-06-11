import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  BellRing,
  FileCheck2,
  Wrench,
  AlertTriangle,
} from "lucide-react";

const menuItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard, end: true },
  { to: "/elevators", label: "电梯管理", icon: Building2 },
  { to: "/maintenance", label: "维保单位", icon: Briefcase },
  { to: "/reminders", label: "年检提醒", icon: BellRing },
  { to: "/reports", label: "报告审核", icon: FileCheck2 },
  { to: "/rectifications", label: "整改管理", icon: Wrench },
  { to: "/faults", label: "故障记录", icon: AlertTriangle },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-primary-800 text-white flex flex-col">
      <div className="h-[60px] flex items-center px-5 border-b border-primary-700">
        <span className="text-xl font-bold">🛗 电梯年检管理系统</span>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-primary-700 text-white border-l-4 border-accent-400"
                    : "text-primary-100 hover:bg-primary-700/60 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
