import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import SkillBadge from '../../components/common/SkillBadge';
import RatingStars from '../../components/common/RatingStars';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  Users,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  Star,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients/dashboard');
      if (res.data.success) {
        setData(res.data);
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
        <LoadingSpinner text="Loading client management dashboard..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const activeProjects = data?.activeProjects || [];
  const recentProposals = data?.recentProposals || [];
  const recommendedFreelancers = data?.recommendedFreelancers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="saas-card p-6 sm:p-8 bg-white border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Client Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your engineering projects, review skill-matched proposals, and evaluate trial tasks.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/client/post-project" className="saas-btn-primary text-xs py-2 px-4 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Post New Project
            </Link>
            <Link to="/freelancers" className="saas-btn-secondary text-xs py-2 px-4">
              Search Talent Directory
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Stats Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="saas-card p-5 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Projects
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalProjects || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lifetime posted</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Projects
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{stats.activeProjects || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">In workspace progress</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Proposals Received
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{stats.receivedProposals || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Candidate submissions</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Pending Selection
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.pendingSelection || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting your review</div>
        </div>

        <div className="saas-card p-5 bg-white col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Completed Projects
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.completedProjects || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% delivered</div>
        </div>
      </div>

      {/* Main Content: Active Projects & Recommended Talent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols: Active Projects & Recent Proposals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Projects Table */}
          <div className="saas-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Active Projects & Contracts
              </h2>
              <Link to="/client/projects" className="text-xs text-blue-600 font-semibold hover:underline">
                View All ({activeProjects.length})
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active projects. Post a project to start hiring!
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeColor(p.status)}`}>
                          {p.status}
                        </span>
                        <span className="text-xs text-slate-400">{p.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Budget: {formatCurrency(p.budget?.amount)} • {p.proposalCount || 0} proposals received
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/client/projects/${p._id}`}
                        className="saas-btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
                      >
                        Review Applicants
                      </Link>
                      {p.assignedFreelancer && (
                        <Link
                          to={`/project/${p._id}`}
                          className="saas-btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                        >
                          Open Workspace
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Proposals Received */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Recent Proposals Received
            </h3>

            {recentProposals.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">No proposals received yet</div>
            ) : (
              <div className="space-y-3">
                {recentProposals.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          prop.freelancer?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{prop.freelancer?.name}</h4>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            {prop.skillMatchPercentage}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Project: {prop.project?.title}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          "{prop.coverLetter}"
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/client/projects/${prop.project?._id}`}
                      className="saas-btn-primary text-xs py-1.5 px-3.5 whitespace-nowrap"
                    >
                      Evaluate Proposal
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Recommended Freelancers matching latest project */}
        <div className="space-y-6">
          <div className="saas-card p-6 bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Recommended Talent
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pre-screened candidates matching your open requirements
              </p>
            </div>

            {recommendedFreelancers.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                Post an open project to see smart skill recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedFreelancers.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            item.freelancer.user?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {item.freelancer.user?.name}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {formatCurrency(item.freelancer.hourlyRate)}/hr
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.matchPercentage}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.matchedSkills?.map((ms, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 font-semibold border border-slate-200"
                        >
                          {ms.name} ({ms.score}%)
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/freelancers/${item.freelancer.user?._id}`}
                      className="block text-center text-xs font-semibold text-blue-600 hover:underline pt-1"
                    >
                      View Profile & Invite →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
