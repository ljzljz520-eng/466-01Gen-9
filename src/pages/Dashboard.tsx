import { useEffect, useMemo } from 'react';
import { Building2, BellRing, FileCheck2, Wrench, AlertTriangle, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import type { FaultRecord, InspectionReport } from '@shared/types';

interface ActivityItem {
  id: string;
  type: 'fault' | 'report';
  elevatorId: string;
  elevatorBuilding: string;
  date: string;
  description: string;
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Dashboard() {
  const { fetchAll, elevators, companies, faults, reports, rectifications } = useAppStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => {
    const upcomingInspections = elevators.filter((e) => {
      const days = getDaysUntil(e.nextInspectionDate);
      return days >= 0 && days <= 30;
    });

    const pendingReports = reports.filter((r) => r.status === 'pending');
    const inProgressRectifications = rectifications.filter(
      (r) => r.status === 'pending' || r.status === 'in_progress'
    );

    return {
      totalElevators: elevators.length,
      upcomingInspections: upcomingInspections.length,
      pendingReports: pendingReports.length,
      inProgressRectifications: inProgressRectifications.length,
    };
  }, [elevators, reports, rectifications]);

  const inspectionTimeline = useMemo(() => {
    return elevators
      .filter((e) => {
        const days = getDaysUntil(e.nextInspectionDate);
        return days >= 0 && days <= 30;
      })
      .sort((a, b) => getDaysUntil(a.nextInspectionDate) - getDaysUntil(b.nextInspectionDate))
      .map((e) => ({
        ...e,
        daysLeft: getDaysUntil(e.nextInspectionDate),
      }));
  }, [elevators]);

  const recentActivities = useMemo<ActivityItem[]>(() => {
    const elevatorMap = new Map(elevators.map((e) => [e.id, e]));

    const faultActivities: ActivityItem[] = faults.map((f: FaultRecord) => ({
      id: `fault-${f.id}`,
      type: 'fault' as const,
      elevatorId: f.elevatorId,
      elevatorBuilding: elevatorMap.get(f.elevatorId)?.building || '未知楼栋',
      date: f.faultDate,
      description: f.description,
    }));

    const reportActivities: ActivityItem[] = reports.map((r: InspectionReport) => ({
      id: `report-${r.id}`,
      type: 'report' as const,
      elevatorId: r.elevatorId,
      elevatorBuilding: elevatorMap.get(r.elevatorId)?.building || '未知楼栋',
      date: r.reportDate,
      description: r.content || '年检报告已提交',
    }));

    return [...faultActivities, ...reportActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [faults, reports, elevators]);

  function getInspectionBadgeClass(days: number): string {
    if (days <= 7) return 'bg-red-100 text-red-700';
    if (days <= 15) return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">电梯总数</p>
              <p className="text-3xl font-bold mt-2">{stats.totalElevators}</p>
            </div>
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-orange-400 to-orange-600 text-white hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">即将年检</p>
              <p className="text-3xl font-bold mt-2">{stats.upcomingInspections}</p>
            </div>
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <BellRing size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">待审核报告</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingReports}</p>
            </div>
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileCheck2 size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-green-500 to-green-700 text-white hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">整改中任务</p>
              <p className="text-3xl font-bold mt-2">{stats.inProgressRectifications}</p>
            </div>
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Wrench size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 hover:shadow-card-hover transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            年检倒计时
          </h3>
          {inspectionTimeline.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BellRing size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无即将到期的年检</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {inspectionTimeline.map((item, index) => {
                const company = companies.find((c) => c.id === item.maintenanceCompanyId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Building2 size={18} className="text-primary-700" />
                      </div>
                      {index < inspectionTimeline.length - 1 && (
                        <div className="absolute left-1/2 top-10 w-0.5 h-6 bg-slate-200 -translate-x-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-800 truncate">
                          {item.building} {item.floor}
                        </p>
                        <span className={`badge flex-shrink-0 ${getInspectionBadgeClass(item.daysLeft)}`}>
                          {item.daysLeft === 0 ? '今天到期' : `剩余 ${item.daysLeft} 天`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {company?.name || '未分配维保单位'} · {formatDate(item.nextInspectionDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5 hover:shadow-card-hover transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary-600" />
            最近活动
          </h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无活动记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'fault'
                        ? 'bg-red-100'
                        : 'bg-purple-100'
                    }`}
                  >
                    {activity.type === 'fault' ? (
                      <AlertTriangle size={18} className="text-red-600" />
                    ) : (
                      <FileText size={18} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          activity.type === 'fault'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {activity.type === 'fault' ? '故障记录' : '年检报告'}
                      </span>
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {activity.elevatorBuilding}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
