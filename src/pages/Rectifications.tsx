import { useEffect, useState } from 'react';
import { Plus, Check, X, CalendarDays, User, Building2, AlertCircle, ClipboardList, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Rectification } from '@shared/types';
import { cn } from '@/lib/utils';

type StatusFilter = 'pending' | 'in_progress' | 'completed';

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-700 border border-blue-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
};

const statusLabel: Record<string, string> = {
  pending: '待整改',
  in_progress: '整改中',
  completed: '已完成',
};

const tabs: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: '待整改' },
  { value: 'in_progress', label: '整改中' },
  { value: 'completed', label: '已完成' },
];

export default function Rectifications() {
  const { rectifications, elevators, reports, fetchRectifications, fetchElevators, fetchReports, createRectification, completeRectification } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchRectifications();
    fetchElevators();
    fetchReports();
  }, [fetchRectifications, fetchElevators, fetchReports]);

  const filteredRectifications = rectifications.filter((r) => r.status === statusFilter);

  const getElevator = (id: string) => elevators.find((e) => e.id === id);
  const getReport = (id: string) => reports.find((r) => r.id === id);

  const handleComplete = async (id: string) => {
    await completeRectification(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">整改管理</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {filteredRectifications.length} 条整改任务
          </p>
        </div>
        <button onClick={() => setShowAssignModal(true)} className="btn-primary">
          <Plus size={16} />
          派发整改
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              statusFilter === tab.value
                ? 'bg-white text-primary-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs',
              statusFilter === tab.value ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'
            )}>
              {rectifications.filter((r) => r.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {filteredRectifications.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无{statusLabel[statusFilter]}的整改任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRectifications.map((rectification) => (
            <RectificationCard
              key={rectification.id}
              rectification={rectification}
              building={getElevator(rectification.elevatorId)?.building}
              floor={getElevator(rectification.elevatorId)?.floor}
              reportDate={getReport(rectification.reportId)?.reportDate}
              onComplete={() => handleComplete(rectification.id)}
            />
          ))}
        </div>
      )}

      {showAssignModal && (
        <AssignModal
          elevators={elevators}
          reports={reports}
          onClose={() => setShowAssignModal(false)}
          onSubmit={(data) => {
            createRectification(data);
            setShowAssignModal(false);
          }}
        />
      )}
    </div>
  );
}

interface RectificationCardProps {
  rectification: Rectification;
  building?: string;
  floor?: string;
  reportDate?: string;
  onComplete: () => void;
}

function RectificationCard({ rectification, building, floor, reportDate, onComplete }: RectificationCardProps) {
  const isOverdue = new Date(rectification.deadline) < new Date() && rectification.status !== 'completed';
  const canComplete = rectification.status === 'pending' || rectification.status === 'in_progress';

  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <span className={cn('badge', statusBadgeClass[rectification.status])}>
          {statusLabel[rectification.status]}
        </span>
        {isOverdue && (
          <span className="badge bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
            <AlertCircle size={12} />
            已逾期
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-800">
            {building || '未知楼栋'} · {floor || '未知楼层'}
          </span>
        </div>

        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[60px]">
          {rectification.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <User size={14} className="flex-shrink-0" />
          <span>责任人：{rectification.responsible}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CalendarDays size={14} className={cn('flex-shrink-0', isOverdue ? 'text-red-500' : 'text-slate-400')} />
          <span className={cn(isOverdue && 'text-red-600 font-medium')}>
            截止日期：{new Date(rectification.deadline).toLocaleDateString('zh-CN')}
          </span>
        </div>

        {reportDate && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText size={14} className="flex-shrink-0" />
            <span>关联报告：{new Date(reportDate).toLocaleDateString('zh-CN')}</span>
          </div>
        )}

        {rectification.status === 'completed' && rectification.completionDate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check size={14} className="flex-shrink-0" />
            <span>完成日期：{new Date(rectification.completionDate).toLocaleDateString('zh-CN')}</span>
          </div>
        )}
      </div>

      {canComplete && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button onClick={onComplete} className="btn-primary w-full">
            <Check size={16} />
            标记完成
          </button>
        </div>
      )}
    </div>
  );
}

interface AssignModalProps {
  elevators: { id: string; building: string; floor: string }[];
  reports: { id: string; reportDate: string; elevatorId: string }[];
  onClose: () => void;
  onSubmit: (data: { reportId: string; elevatorId: string; description: string; responsible: string; deadline: string }) => void;
}

function AssignModal({ elevators, reports, onClose, onSubmit }: AssignModalProps) {
  const [reportId, setReportId] = useState('');
  const [elevatorId, setElevatorId] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleReportChange = (id: string) => {
    setReportId(id);
    const report = reports.find((r) => r.id === id);
    if (report) {
      setElevatorId(report.elevatorId);
    }
  };

  const handleSubmit = () => {
    if (!reportId || !elevatorId || !description || !responsible || !deadline) return;
    onSubmit({ reportId, elevatorId, description, responsible, deadline });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">派发整改任务</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label">关联报告 <span className="text-red-500">*</span></label>
            <select value={reportId} onChange={(e) => handleReportChange(e.target.value)} className="input">
              <option value="">请选择关联报告</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  报告 - {new Date(r.reportDate).toLocaleDateString('zh-CN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">选择电梯 <span className="text-red-500">*</span></label>
            <select value={elevatorId} onChange={(e) => setElevatorId(e.target.value)} className="input">
              <option value="">请选择电梯</option>
              {elevators.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.building} - {e.floor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">整改描述 <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述需要整改的问题..."
              className="input min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="label">责任人 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="请输入责任人姓名"
              className="input"
            />
          </div>

          <div>
            <label className="label">截止日期 <span className="text-red-500">*</span></label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!reportId || !elevatorId || !description || !responsible || !deadline}
          >
            <Plus size={16} />
            派发
          </button>
        </div>
      </div>
    </div>
  );
}
