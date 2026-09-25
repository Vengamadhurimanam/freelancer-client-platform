import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const FreelancerProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/proposals/my-proposals');
      if (res.data.success) {
        setProposals(res.data.proposals);
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
        <LoadingSpinner text="Loading submitted proposals..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your bids, client shortlists, and trial task invitations.
          </p>
        </div>

        <Link to="/projects" className="saas-btn-primary text-xs py-2 px-4">
          Find More Projects
        </Link>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals submitted yet"
          description="You haven't submitted any bids. Discover open projects and apply with your verified skills!"
          actionText="Browse Open Projects"
          onAction={() => window.location.assign('/projects')}
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div
              key={prop._id}
              className="saas-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                      prop.status
                    )}`}
                  >
                    {prop.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Applied on {formatDate(prop.createdAt)}
                  </span>
                </div>

                <Link
                  to={`/projects/${prop.project?._id}`}
                  className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                >
                  {prop.project?.title}
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-2xl">
                  {prop.coverLetter}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Client: <strong>{prop.project?.client?.name}</strong></span>
                  <span>•</span>
                  <span>Bid: <strong>{formatCurrency(prop.proposedBudget)}</strong> in <strong>{prop.estimatedDays} days</strong></span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {prop.skillMatchPercentage}% Skill Match
                  </span>
                </div>

                {prop.clientNotes && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-700">
                    <strong>Client Feedback:</strong> {prop.clientNotes}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {prop.status === 'Accepted' && (
                  <Link
                    to={`/project/${prop.project?._id}`}
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                  >
                    Go to Workspace
                  </Link>
                )}
                {prop.status === 'Trial Task' && (
                  <Link
                    to="/freelancer/trial-tasks"
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap bg-purple-600 hover:bg-purple-700"
                  >
                    View Trial Task
                  </Link>
                )}
                <Link
                  to={`/projects/${prop.project?._id}`}
                  className="saas-btn-secondary text-xs py-2 px-4 whitespace-nowrap text-center"
                >
                  View Brief
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerProposals;
