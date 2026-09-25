import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Briefcase, Search, Trash2 } from 'lucide-react';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchAdminProjects();
  }, [status]);

  const fetchAdminProjects = async () => {
    setLoading(true);
    try {
      const params = {
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      };

      const res = await api.get('/admin/projects', { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;

    try {
      const res = await api.delete(`/projects/${id}`);
      if (res.data.success) {
        toast.success('Project deleted');
        fetchAdminProjects();
      }
    } catch (error) {
      toast.error('Error deleting project');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Project Moderation & Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review all platform projects, monitor deliverables, and moderate contracts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchAdminProjects(); }} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title or client..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Trial Task">Trial Task</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="saas-card bg-white overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading platform projects..." />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects found" description="No contracts match current filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <Link to={`/projects/${p._id}`} className="font-bold text-slate-900 hover:text-blue-600 block max-w-xs truncate">
                        {p.title}
                      </Link>
                      <span className="text-slate-400 text-[11px]">{p.category}</span>
                    </td>

                    <td className="p-4 font-medium text-slate-700">{p.client?.name || 'Client'}</td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-900">{formatCurrency(p.budget?.amount)}</td>

                    <td className="p-4 text-slate-500">{formatDate(p.createdAt)}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
