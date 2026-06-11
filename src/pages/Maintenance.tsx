import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Building, AlertTriangle, Phone, MapPin, User } from 'lucide-react';
import { useAppStore } from '@/store';
import type { MaintenanceCompany, CreateMaintenanceCompany, UpdateMaintenanceCompany } from '@shared/types';

interface FormData {
  name: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
}

const emptyFormData: FormData = {
  name: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
};

export default function Maintenance() {
  const { fetchAll, companies, elevators, createCompany, updateCompany, deleteCompany } = useAppStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<MaintenanceCompany | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceCompany | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredCompanies = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.contactPhone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const elevatorCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of elevators) {
      map.set(e.maintenanceCompanyId, (map.get(e.maintenanceCompanyId) || 0) + 1);
    }
    return map;
  }, [elevators]);

  function handleOpenCreate() {
    setEditingCompany(null);
    setFormData(emptyFormData);
    setShowModal(true);
  }

  function handleOpenEdit(company: MaintenanceCompany) {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      contactPerson: company.contactPerson,
      contactPhone: company.contactPhone,
      address: company.address,
    });
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingCompany(null);
    setFormData(emptyFormData);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.contactPhone) {
      alert('请填写必填项：单位名称、联系人、联系电话');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCompany) {
        const data: UpdateMaintenanceCompany = { ...formData };
        await updateCompany(editingCompany.id, data);
      } else {
        const data: CreateMaintenanceCompany = { ...formData };
        await createCompany(data);
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
    const count = elevatorCountMap.get(deleteConfirm.id) || 0;
    if (count > 0) {
      alert(`该维保单位下还有 ${count} 部电梯，请先重新分配电梯的维保单位后再删除。`);
      return;
    }
    setSubmitting(true);
    try {
      await deleteCompany(deleteConfirm.id);
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
          <div className="relative flex-1 sm:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索单位名称、联系人、电话、地址..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button onClick={handleOpenCreate} className="btn-primary w-full sm:w-auto">
            <Plus size={18} />
            新增维保单位
          </button>
        </div>
      </div>

      <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-300">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building size={48} className="mx-auto mb-3 opacity-30" />
            <p>暂无维保单位数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">单位名称</th>
                  <th className="table-header">联系人</th>
                  <th className="table-header">联系电话</th>
                  <th className="table-header">地址</th>
                  <th className="table-header text-center">电梯数量</th>
                  <th className="table-header text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company, idx) => {
                  const count = elevatorCountMap.get(company.id) || 0;
                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="table-cell font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Building size={16} className="text-primary-700" />
                          </div>
                          <span>{company.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          <span>{company.contactPerson}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-slate-400" />
                          <span>{company.contactPhone}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-start gap-1.5 max-w-xs">
                          <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{company.address || '-'}</span>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <span className={`badge ${count > 0 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                          {count} 部
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(company)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                            title="编辑"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(company)}
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
                {editingCompany ? '编辑维保单位' : '新增维保单位'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">单位名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：XX电梯维保有限公司"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">联系人 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="例如：张三"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">联系电话 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="例如：13800138000"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="例如：XX市XX区XX路XX号"
                  className="input"
                />
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
                  {submitting ? '提交中...' : editingCompany ? '保存修改' : '创建'}
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
                  确定要删除维保单位「{deleteConfirm.name}」吗？此操作无法撤销。
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
