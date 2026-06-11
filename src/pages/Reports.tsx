import { useEffect, useState } from 'react';
import { Plus, Search, Check, X, FileText, Upload, Eye, ClipboardCheck } from 'lucide-react';
import { useAppStore } from '@/store';
import type { InspectionReport } from '@shared/types';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabel: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

export default function Reports() {
  const { reports, elevators, companies, fetchReports, fetchElevators, fetchCompanies, createReport, approveReport, rejectReport } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reviewingReport, setReviewingReport] = useState<InspectionReport | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchElevators();
    fetchCompanies();
  }, [fetchReports, fetchElevators, fetchCompanies]);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getElevator = (id: string) => elevators.find((e) => e.id === id);
  const getCompany = (id: string) => companies.find((c) => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">报告审核</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {filteredReports.length} 份报告
          </p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Upload size={16} />
          上传报告
        </button>
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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">电梯楼栋</th>
                <th className="table-header">维保单位</th>
                <th className="table-header">报告日期</th>
                <th className="table-header">状态</th>
                <th className="table-header">审核人</th>
                <th className="table-header">审核日期</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ClipboardCheck size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>暂无报告数据</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium">
                      {getElevator(report.elevatorId)?.building || '未知'}
                      <span className="text-slate-400 ml-1">
                        ({getElevator(report.elevatorId)?.floor || '-'})
                      </span>
                    </td>
                    <td className="table-cell">{getCompany(report.companyId)?.name || '未知'}</td>
                    <td className="table-cell">{new Date(report.reportDate).toLocaleDateString('zh-CN')}</td>
                    <td className="table-cell">
                      <span className={cn('badge', statusBadgeClass[report.status])}>
                        {statusLabel[report.status]}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500">{report.reviewerId || '-'}</td>
                    <td className="table-cell text-slate-500">
                      {report.reviewDate ? new Date(report.reviewDate).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td className="table-cell">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => setReviewingReport(report)}
                          className="btn-accent text-xs px-3 py-1.5"
                        >
                          <Eye size={12} />
                          审核
                        </button>
                      )}
                      {report.status !== 'pending' && (
                        <span className="text-xs text-slate-400">已处理</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewingReport && (
        <ReviewModal
          report={reviewingReport}
          elevatorBuilding={getElevator(reviewingReport.elevatorId)?.building}
          companyName={getCompany(reviewingReport.companyId)?.name}
          onClose={() => setReviewingReport(null)}
          onApprove={(comment) => approveReport(reviewingReport.id, 'manager_001', comment)}
          onReject={(comment) => rejectReport(reviewingReport.id, 'manager_001', comment)}
        />
      )}

      {showUploadModal && (
        <UploadModal
          elevators={elevators}
          companies={companies}
          onClose={() => setShowUploadModal(false)}
          onSubmit={(data) => {
            createReport(data);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

interface ReviewModalProps {
  report: InspectionReport;
  elevatorBuilding?: string;
  companyName?: string;
  onClose: () => void;
  onApprove: (comment: string) => Promise<unknown>;
  onReject: (comment: string) => Promise<unknown>;
}

function ReviewModal({ report, elevatorBuilding, companyName, onClose, onApprove, onReject }: ReviewModalProps) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await onApprove(comment.trim());
    setSubmitting(false);
    onClose();
  };

  const handleReject = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await onReject(comment.trim());
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">审核报告</h3>
            <p className="text-sm text-slate-500 mt-1">
              {elevatorBuilding} · {companyName} · {new Date(report.reportDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="label">报告内容</label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap min-h-[120px]">
              {report.content || '暂无内容'}
            </div>
          </div>

          {report.reportUrl && (
            <div>
              <label className="label">报告附件</label>
              <a
                href={report.reportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
              >
                <FileText size={14} />
                查看报告原件
              </a>
            </div>
          )}

          <div>
            <label className="label">审核意见 <span className="text-red-500">*</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请输入审核意见..."
              className={cn('input min-h-[100px] resize-y')}
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={submitting}>
            取消
          </button>
          <button
            onClick={handleReject}
            className="btn-danger"
            disabled={submitting || !comment.trim()}
          >
            <X size={16} />
            驳回
          </button>
          <button
            onClick={handleApprove}
            className="btn-primary"
            disabled={submitting || !comment.trim()}
          >
            <Check size={16} />
            通过
          </button>
        </div>
      </div>
    </div>
  );
}

interface UploadModalProps {
  elevators: { id: string; building: string; floor: string }[];
  companies: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (data: { elevatorId: string; companyId: string; reportDate: string; content: string; reportUrl: string }) => void;
}

function UploadModal({ elevators, companies, onClose, onSubmit }: UploadModalProps) {
  const [elevatorId, setElevatorId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  const handleSubmit = () => {
    if (!elevatorId || !companyId || !reportDate) return;
    onSubmit({
      elevatorId,
      companyId,
      reportDate,
      content,
      reportUrl: reportUrl || `https://example.com/reports/${Date.now()}.pdf`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">上传年检报告</h3>
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
            <label className="label">维保单位 <span className="text-red-500">*</span></label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="input">
              <option value="">请选择维保单位</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">报告日期 <span className="text-red-500">*</span></label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="input" />
          </div>

          <div>
            <label className="label">报告内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入报告内容摘要..."
              className="input min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="label">报告URL（可选）</label>
            <input
              type="text"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
              placeholder="https://..."
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
            disabled={!elevatorId || !companyId || !reportDate}
          >
            <Plus size={16} />
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
