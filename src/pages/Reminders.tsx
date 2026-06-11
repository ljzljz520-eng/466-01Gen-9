import { useEffect, useState } from 'react';
import { RefreshCw, Eye, EyeOff, Check, FileText, Wrench, AlertTriangle, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Reminder, ReminderType } from '@shared/types';
import { cn } from '@/lib/utils';

const typePriority: Record<ReminderType, number> = {
  '1day': 1,
  '7days': 2,
  '15days': 3,
  '30days': 4,
};

const typeBadgeClass: Record<ReminderType, string> = {
  '1day': 'bg-red-100 text-red-700 border border-red-200',
  '7days': 'bg-orange-100 text-orange-700 border border-orange-200',
  '15days': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  '30days': 'bg-blue-100 text-blue-700 border border-blue-200',
};

const typeLabel: Record<ReminderType, string> = {
  '1day': '1天内',
  '7days': '7天内',
  '15days': '15天内',
  '30days': '30天内',
};

const typeDays: Record<ReminderType, number> = {
  '1day': 1,
  '7days': 7,
  '15days': 15,
  '30days': 30,
};

const documents = [
  '电梯注册证',
  '维保记录',
  '上次年检报告',
  '故障记录',
  '维护保养合同',
  '操作人员资格证',
];

export default function Reminders() {
  const { reminders, elevators, fetchReminders, fetchElevators, checkReminders, markReminderRead } = useAppStore();
  const [filterUnread, setFilterUnread] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReminders();
    fetchElevators();
  }, [fetchReminders, fetchElevators]);

  const getElevator = (id: string) => elevators.find((e) => e.id === id);

  const sortedReminders = [...reminders]
    .filter((r) => (filterUnread ? !r.isRead : true))
    .sort((a, b) => typePriority[a.type] - typePriority[b.type]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkReminders();
    await fetchReminders();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: string) => {
    await markReminderRead(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">年检提醒</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {sortedReminders.length} 条提醒
            {filterUnread && ` · ${sortedReminders.filter((r) => !r.isRead).length} 条未读`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={cn(
              'btn-secondary',
              filterUnread && 'bg-primary-50 text-primary-700 border-primary-200'
            )}
          >
            {filterUnread ? <EyeOff size={16} /> : <Eye size={16} />}
            {filterUnread ? '显示全部' : '仅未读'}
          </button>
          <button onClick={handleRefresh} className="btn-primary" disabled={refreshing}>
            <RefreshCw size={16} className={cn(refreshing && 'animate-spin')} />
            检查提醒
          </button>
        </div>
      </div>

      {sortedReminders.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无提醒</p>
          <p className="text-sm text-slate-400 mt-1">点击"检查提醒"按钮生成新的提醒</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              building={getElevator(reminder.elevatorId)?.building}
              floor={getElevator(reminder.elevatorId)?.floor}
              nextInspectionDate={getElevator(reminder.elevatorId)?.nextInspectionDate}
              onMarkRead={() => handleMarkRead(reminder.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  building?: string;
  floor?: string;
  nextInspectionDate?: string;
  onMarkRead: () => void;
}

function ReminderCard({ reminder, building, floor, nextInspectionDate, onMarkRead }: ReminderCardProps) {
  const isUnread = !reminder.isRead;

  return (
    <div
      className={cn(
        'card p-5 transition-all duration-200 hover:shadow-card-hover',
        isUnread && 'border-l-4 border-l-primary-500 pl-4'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('badge', typeBadgeClass[reminder.type])}>
              <AlertTriangle size={12} className="mr-1" />
              距年检 {typeLabel[reminder.type]}
            </span>
            <h3 className="font-semibold text-slate-800">
              {building || '未知楼栋'} · {floor || '未知楼层'}
            </h3>
            {nextInspectionDate && (
              <span className="text-sm text-slate-500">
                年检日期：{new Date(nextInspectionDate).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText size={14} />
              需要准备的资料清单
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {documents.map((doc, idx) => (
                <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 lg:min-w-[140px]">
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-700">
              {typeDays[reminder.type]}
            </div>
            <div className="text-xs text-slate-500">天后到期</div>
          </div>
          {isUnread && (
            <button onClick={onMarkRead} className="btn-secondary gap-1.5">
              <Check size={14} />
              标记已读
            </button>
          )}
          {!isUnread && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Check size={12} />
              已读
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
