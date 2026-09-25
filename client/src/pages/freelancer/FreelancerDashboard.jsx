import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import SkillBadge from '../../components/common/SkillBadge';
import RatingStars from '../../components/common/RatingStars';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Briefcase,
  Award,
  Layers,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Bell,
} from 'lucide-react';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/freelancers/dashboard');
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
        <LoadingSpinner text="Loading your freelancer dashboard..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recommendedProjects = data?.recommendedProjects || [];
  const recentApplications = data?.recentApplications || [];
  const activeProjects = data?.activeProjects || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="saas-card p-6 sm:p-8 bg-white border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Freelancer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You have <strong>{stats.verifiedSkillsCount || 0}</strong> verified skills boosting your project proposal visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/freelancer/assessments" className="saas-btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700">
              <Award className="w-4 h-4" />
              Take Skill Assessment
            </Link>
            <Link to="/projects" className="saas-btn-secondary text-xs py-2 px-4">
              Browse Projects
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Proposals</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalApplications || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Submitted across platform</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.activeProjects || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Workspaces in progress</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.completedProjects || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% verified deliveries</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Client Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.averageRating || 5.0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.totalReviews || 0} client reviews</div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Smart Recommended Projects + Active Workspaces */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Skill Matched Projects */}
          <div className="saas-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Recommended Projects For You
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by verified compatibility with your skill assessments
                </p>
              </div>
              <Link to="/projects" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {recommendedProjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Take skill assessments to unlock personalized project matching!
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {proj.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {proj.matchScore}% Skill Match
                        </span>
                      </div>

                      <Link
                        to={`/projects/${proj._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                      >
                        {proj.title}
                      </Link>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Budget: <strong>{formatCurrency(proj.budget?.amount)}</strong></span>
                        <span>•</span>
                        <span>Due {formatDate(proj.deadline)}</span>
                      </div>
                    </div>

                    <Link
                      to={`/projects/${proj._id}`}
                      className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Workspaces */}
          <div className="saas-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Active Project Workspaces ({activeProjects.length})
              </h2>
            </div>

            {activeProjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active projects right now. Submit proposals to get hired!
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeColor(p.status)}`}>
                        {p.status}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Client: {p.client?.name}</p>
                    </div>

                    <Link to={`/project/${p._id}`} className="saas-btn-primary text-xs py-2 px-4">
                      Open Workspace
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Recent Applications & Notifications */}
        <div className="space-y-6">
          {/* Recent Applications */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Proposals
            </h3>

            {recentApplications.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">No recent proposals</div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app._id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">
                        {app.project?.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-slate-500">Bid: {formatCurrency(app.proposedBudget)}</div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/freelancer/proposals"
              className="block text-center text-xs text-blue-600 font-semibold pt-2 hover:underline"
            >
              View All Proposals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
