import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const titleMap: Record<string, string> = {
  "/": "仪表盘",
  "/elevators": "电梯管理",
  "/elevators/new": "新增电梯",
  "/maintenance": "维保单位",
  "/reminders": "年检提醒",
  "/reports": "报告审核",
  "/rectifications": "整改管理",
  "/faults": "故障记录",
};

function getTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith("/elevators/")) return "电梯详情";
  if (pathname.startsWith("/reports/")) return "报告详情";
  return "电梯年检管理系统";
}

export default function Layout() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title={title} />
      <main className="ml-60 pt-[60px] min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
