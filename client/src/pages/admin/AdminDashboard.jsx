import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Briefcase,
  Award,
  ShieldAlert,
  TrendingUp,
  FileCheck2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
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
        <LoadingSpinner text="Aggregating platform metrics & telemetry..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="saas-card p-6 sm:p-8 bg-white border-purple-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Admin Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Analytics & Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Global platform health, skill verification metrics, and trust & safety monitoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/admin/users" className="saas-btn-secondary text-xs py-2 px-3.5">
              <Users className="w-4 h-4" /> Users
            </Link>
            <Link to="/admin/projects" className="saas-btn-secondary text-xs py-2 px-3.5">
              <Briefcase className="w-4 h-4" /> Projects
            </Link>
            <Link to="/admin/skills" className="saas-btn-secondary text-xs py-2 px-3.5">
              <Award className="w-4 h-4" /> Skills & MCQs
            </Link>
            <Link to="/admin/reports" className="saas-btn-secondary text-xs py-2 px-3.5 text-rose-600 border-rose-200">
              <ShieldAlert className="w-4 h-4" /> Reports
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.totalFreelancers || 0} Freelancers • {stats.totalClients || 0} Clients
          </div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Badges</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.totalVerifiedSkills || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 10 core competencies</div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{stats.totalProjects || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.activeProjects || 0} Active • {stats.completedProjects || 0} Completed
          </div>
        </div>

        <div className="saas-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Reports</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.pendingReports || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pending moderation</div>
        </div>
      </div>

      {/* RECHARTS SECTION: User Growth & Skill Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Line Chart */}
        <div className="saas-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Platform Activity & Growth Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Freelancers" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="Clients" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Projects" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Popularity Bar Chart */}
        <div className="saas-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Skill Distribution Among Talent
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.skillPopularity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Verification Tiers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Breakdown Pie */}
        <div className="saas-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verification Tiers Breakdown
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.verificationStats || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.verificationStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="saas-card p-6 bg-white space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent User Registrations
            </h3>
            <Link to="/admin/users" className="text-xs text-blue-600 hover:underline">
              Manage All Users →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recent.users?.map((u) => (
              <div key={u._id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      u.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-slate-400 ml-1.5">({u.email})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {u.role}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
