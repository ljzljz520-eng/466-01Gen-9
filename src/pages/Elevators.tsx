import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Elevator, CreateElevator, UpdateElevator } from '@shared/types';

type StatusFilter = 'all' | Elevator['status'];

const statusMap: Record<Elevator['status'], { label: string; className: string }> = {
  normal: { label: '正常', className: 'bg-green-100 text-green-700' },
  maintenance: { label: '维保中', className: 'bg-yellow-100 text-yellow-700' },
  fault: { label: '故障', className: 'bg-red-100 text-red-700' },
};

interface FormData {
  building: string;
  floor: string;
  manufacturer: string;
  installDate: string;
  maintenanceCompanyId: string;
  nextInspectionDate: string;
  status: Elevator['status'];
}

const emptyFormData: FormData = {
  building: '',
  floor: '',
  manufacturer: '',
  installDate: '',
  maintenanceCompanyId: '',
  nextInspectionDate: '',
  status: 'normal',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Elevators() {
  const { fetchAll, elevators, companies, createElevator, updateElevator, deleteElevator } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingElevator, setEditingElevator] = useState<Elevator | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<Elevator | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredElevators = useMemo(() => {
    return elevators.filter((e) => {
      const matchSearch =
        !search ||
        e.building.toLowerCase().includes(search.toLowerCase()) ||
        e.floor.toLowerCase().includes(search.toLowerCase()) ||
        e.manufacturer.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [elevators, search, statusFilter]);

  const companyMap = useMemo(() => {
    return new Map(companies.map((c) => [c.id, c]));
  }, [companies]);

  function handleOpenCreate() {
    setEditingElevator(null);
    setFormData({ ...emptyFormData, installDate: todayStr(), nextInspectionDate: todayStr() });
    setShowModal(true);
  }

  function handleOpenEdit(elevator: Elevator) {
    setEditingElevator(elevator);
    setFormData({
      building: elevator.building,
      floor: elevator.floor,
      manufacturer: elevator.manufacturer,
      installDate: formatDate(elevator.installDate),
      maintenanceCompanyId: elevator.maintenanceCompanyId,
      nextInspectionDate: formatDate(elevator.nextInspectionDate),
      status: elevator.status,
    });
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingElevator(null);
    setFormData(emptyFormData);
  }

  function handleView(elevator: Elevator) {
    alert(`电梯详情\n楼栋: ${elevator.building}\n楼层: ${elevator.floor}\n厂家: ${elevator.manufacturer}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.building || !formData.maintenanceCompanyId || !formData.nextInspectionDate) {
      alert('请填写必填项：楼栋、维保单位、下次年检日期');
      return;
    }
    setSubmitting(true);
    try {
      if (editingElevator) {
        const data: UpdateElevator = { ...formData };
        await updateElevator(editingElevator.id, data);
      } else {
        const data: CreateElevator = { ...formData };
        await createElevator(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('submit error:', error);
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await deleteElevator(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('delete error:', error);
      alert('删除失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索楼栋、楼层、厂家..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input sm:max-w-40"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常</option>
              <option value="maintenance">维保中</option>
              <option value="fault">故障</option>
            </select>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary w-full sm:w-auto">
            <Plus size={18} />
            新增电梯
          </button>
        </div>
      </div>

      <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-300">
        {filteredElevators.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p>暂无电梯数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">楼栋</th>
                  <th className="table-header">楼层</th>
                  <th className="table-header">厂家</th>
                  <th className="table-header">维保单位</th>
                  <th className="table-header">下次年检</th>
                  <th className="table-header">状态</th>
                  <th className="table-header text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredElevators.map((elevator, idx) => {
                  const company = companyMap.get(elevator.maintenanceCompanyId);
                  return (
                    <tr
                      key={elevator.id}
                      className="hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="table-cell font-medium text-slate-800">{elevator.building}</td>
                      <td className="table-cell">{elevator.floor}</td>
                      <td className="table-cell">{elevator.manufacturer || '-'}</td>
                      <td className="table-cell">{company?.name || '未分配'}</td>
                      <td className="table-cell">{formatDate(elevator.nextInspectionDate)}</td>
                      <td className="table-cell">
                        <span className={`badge ${statusMap[elevator.status].className}`}>
                          {statusMap[elevator.status].label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(elevator)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            title="查看"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(elevator)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                            title="编辑"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(elevator)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingElevator ? '编辑电梯' : '新增电梯'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">楼栋 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    placeholder="例如：A栋"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">楼层</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="例如：1-20层"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">厂家</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="例如：三菱电梯"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">安装日期</label>
                  <input
                    type="date"
                    value={formData.installDate}
                    onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">下次年检日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.nextInspectionDate}
                    onChange={(e) => setFormData({ ...formData, nextInspectionDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">维保单位 <span className="text-red-500">*</span></label>
                <select
                  value={formData.maintenanceCompanyId}
                  onChange={(e) => setFormData({ ...formData, maintenanceCompanyId: e.target.value })}
                  className="input"
                >
                  <option value="">请选择维保单位</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Elevator['status'] })}
                  className="input"
                >
                  <option value="normal">正常</option>
                  <option value="maintenance">维保中</option>
                  <option value="fault">故障</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  取消
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : editingElevator ? '保存修改' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm p-6 animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">确认删除</h3>
                <p className="text-sm text-slate-600 mt-1">
                  确定要删除电梯「{deleteConfirm.building} {deleteConfirm.floor}」吗？此操作无法撤销。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-danger"
                disabled={submitting}
              >
                {submitting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
