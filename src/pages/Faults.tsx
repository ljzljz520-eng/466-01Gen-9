import { useEffect, useState } from 'react';
import { Plus, Check, X, Wrench, AlertTriangle, Building2, User, CalendarDays, ClipboardList, FileEdit } from 'lucide-react';
import { useAppStore } from '@/store';
import type { FaultRecord } from '@shared/types';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'open' | 'processing' | 'resolved';

const statusBadgeClass: Record<string, string> = {
  open: 'bg-red-100 text-red-700 border border-red-200',
  processing: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  resolved: 'bg-green-100 text-green-700 border border-green-200',
};

const statusLabel: Record<string, string> = {
  open: '待处理',
  processing: '处理中',
  resolved: '已解决',
};

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'open', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

export default function Faults() {
  const { faults, elevators, fetchFaults, fetchElevators, createFault, updateFault } = useAppStore();
  const [elevatorFilter, setElevatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFault, setEditingFault] = useState<FaultRecord | null>(null);

  useEffect(() => {
    fetchFaults();
    fetchElevators();
  }, [fetchFaults, fetchElevators]);

  const filteredFaults = faults.filter((f) => {
    if (elevatorFilter && f.elevatorId !== elevatorFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  const getElevator = (id: string) => elevators.find((e) => e.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">故障记录</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {filteredFaults.length} 条故障记录
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} />
          新增故障
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={elevatorFilter}
            onChange={(e) => setElevatorFilter(e.target.value)}
            className="input pl-9"
          >
            <option value="">全部电梯</option>
            {elevators.map((e) => (
              <option key={e.id} value={e.id}>
                {e.building} - {e.floor}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === opt.value
                  ? 'bg-primary-800 text-white shadow-card'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">电梯楼栋</th>
                <th className="table-header">故障日期</th>
                <th className="table-header">描述</th>
                <th className="table-header">处理人</th>
                <th className="table-header">解决方案</th>
                <th className="table-header">状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ClipboardList size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>暂无故障记录</p>
                  </td>
                </tr>
              ) : (
                filteredFaults.map((fault) => (
                  <tr key={fault.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium">
                      {getElevator(fault.elevatorId)?.building || '未知'}
                      <span className="text-slate-400 ml-1">
                        ({getElevator(fault.elevatorId)?.floor || '-'})
                      </span>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      {new Date(fault.faultDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="table-cell max-w-xs">
                      <p className="line-clamp-2" title={fault.description}>
                        {fault.description || '-'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        {fault.handler || '-'}
                      </div>
                    </td>
                    <td className="table-cell max-w-xs">
                      <p className="line-clamp-2 text-slate-500" title={fault.solution}>
                        {fault.solution || '-'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <span className={cn('badge', statusBadgeClass[fault.status])}>
                        {statusLabel[fault.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      {fault.status !== 'resolved' && (
                        <button
                          onClick={() => setEditingFault(fault)}
                          className="btn-accent text-xs px-3 py-1.5"
                        >
                          <FileEdit size={12} />
                          处理
                        </button>
                      )}
                      {fault.status === 'resolved' && (
                        <span className="text-xs text-slate-400">已完成</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddModal
          elevators={elevators}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => {
            createFault(data);
            setShowAddModal(false);
          }}
        />
      )}

      {editingFault && (
        <EditModal
          fault={editingFault}
          building={getElevator(editingFault.elevatorId)?.building}
          floor={getElevator(editingFault.elevatorId)?.floor}
          onClose={() => setEditingFault(null)}
          onSubmit={(id, data) => {
            updateFault(id, data);
            setEditingFault(null);
          }}
        />
      )}
    </div>
  );
}

interface AddModalProps {
  elevators: { id: string; building: string; floor: string }[];
  onClose: () => void;
  onSubmit: (data: { elevatorId: string; faultDate: string; description: string; handler: string; solution: string; status: 'open' | 'processing' | 'resolved' }) => void;
}

function AddModal({ elevators, onClose, onSubmit }: AddModalProps) {
  const [elevatorId, setElevatorId] = useState('');
  const [faultDate, setFaultDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [handler, setHandler] = useState('');

  const handleSubmit = () => {
    if (!elevatorId || !faultDate || !description) return;
    onSubmit({
      elevatorId,
      faultDate,
      description,
      handler,
      solution: '',
      status: 'open',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">新增故障记录</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
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
            <label className="label">故障日期 <span className="text-red-500">*</span></label>
            <input type="date" value={faultDate} onChange={(e) => setFaultDate(e.target.value)} className="input" />
          </div>

          <div>
            <label className="label">故障描述 <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述故障情况..."
              className="input min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="label">处理人</label>
            <input
              type="text"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
              placeholder="请输入处理人姓名"
              className="input"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!elevatorId || !faultDate || !description}
          >
            <Plus size={16} />
            提交
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  fault: FaultRecord;
  building?: string;
  floor?: string;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<FaultRecord>) => void;
}

function EditModal({ fault, building, floor, onClose, onSubmit }: EditModalProps) {
  const [solution, setSolution] = useState(fault.solution || '');
  const [handler, setHandler] = useState(fault.handler || '');
  const [markResolved, setMarkResolved] = useState(false);

  const handleSubmit = () => {
    const data: Partial<FaultRecord> = {
      solution,
      handler,
    };
    if (markResolved) {
      data.status = 'resolved';
    } else if (!fault.status || fault.status === 'open') {
      data.status = 'processing';
    }
    onSubmit(fault.id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">处理故障</h3>
            <p className="text-sm text-slate-500 mt-1">
              {building} · {floor} · {new Date(fault.faultDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label">故障描述</label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap min-h-[80px]">
              {fault.description || '暂无描述'}
            </div>
          </div>

          <div>
            <label className="label">处理人</label>
            <input
              type="text"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
              placeholder="请输入处理人姓名"
              className="input"
            />
          </div>

          <div>
            <label className="label">处理方案 <span className="text-red-500">*</span></label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="请详细描述处理方案..."
              className="input min-h-[120px] resize-y"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={markResolved}
              onChange={(e) => setMarkResolved(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-800 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">同时标记为已解决</span>
          </label>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!solution.trim()}
          >
            {markResolved ? (
              <>
                <Check size={16} />
                保存并标记解决
              </>
            ) : (
              <>
                <Wrench size={16} />
                保存处理方案
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
