import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      const res = await api.patch(`/admin/reports/${reportId}`, {
        status,
        adminNotes: `Resolved by administrator on ${new Date().toLocaleDateString()}`,
      });

      if (res.data.success) {
        toast.success(`Report marked as ${status}`);
        fetchReports();
      }
    } catch (error) {
      toast.error('Error resolving report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Trust & Safety Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Investigate reported users, projects, proposals, and messages.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reports</option>
          <option value="Pending">Pending Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      <div className="saas-card bg-white divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading moderation reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No reports in queue"
            description="The moderation queue is clean. Platform trust & safety standards are met."
          />
        ) : (
          reports.map((rep) => (
            <div key={rep._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    {rep.reason}
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: <strong>{rep.targetType}</strong> • Reported on {formatDate(rep.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">{rep.description}</p>

                <div className="text-[11px] text-slate-500">
                  Reporter: <strong>{rep.reporter?.name || 'Anonymous User'}</strong> ({rep.reporter?.email})
                </div>

                {rep.adminNotes && (
                  <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600">
                    <strong>Admin Resolution Note:</strong> {rep.adminNotes}
                  </div>
                )}
              </div>

              {rep.status === 'Pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateReport(rep._id, 'Resolved')}
                    className="saas-btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Take Action & Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateReport(rep._id, 'Dismissed')}
                    className="saas-btn-secondary text-xs py-1.5 px-3.5 text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReports;
