import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase, PlusCircle, Users, ArrowRight, Layers, Clock } from 'lucide-react';

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/my-projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your projects..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Posted Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your contracts, evaluate applicants, and access active workspaces.
          </p>
        </div>

        <Link to="/client/post-project" className="saas-btn-primary text-xs py-2 px-4 shadow-sm">
          <PlusCircle className="w-4 h-4" />
          Post New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects posted yet"
          description="Create your first engineering contract to start receiving verified applicant proposals."
          actionText="Post a Project Now"
          onAction={() => window.location.assign('/client/post-project')}
        />
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="saas-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                      proj.status
                    )}`}
                  >
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Created {formatDate(proj.createdAt)}
                  </span>
                </div>

                <Link
                  to={`/client/projects/${proj._id}`}
                  className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                >
                  {proj.title}
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-2xl">
                  {proj.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Budget: <strong>{formatCurrency(proj.budget?.amount)}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong>{formatDate(proj.deadline)}</strong></span>
                  <span>•</span>
                  <span>Proposals: <strong>{proj.proposalCount || 0}</strong></span>
                  {proj.assignedFreelancer && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Assigned to: {proj.assignedFreelancer.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Link
                  to={`/client/projects/${proj._id}`}
                  className="saas-btn-secondary text-xs py-2 px-4 whitespace-nowrap text-center"
                >
                  <Users className="w-3.5 h-3.5" />
                  Review Proposals ({proj.proposalCount || 0})
                </Link>

                {proj.assignedFreelancer && (
                  <Link
                    to={`/project/${proj._id}`}
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap text-center"
                  >
                    Go to Workspace
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjects;
