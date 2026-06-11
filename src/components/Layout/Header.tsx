import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-10">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium text-sm">
            W
          </div>
          <span className="text-sm text-gray-700">物业经理</span>
        </div>
      </div>
    </header>
  );
}
