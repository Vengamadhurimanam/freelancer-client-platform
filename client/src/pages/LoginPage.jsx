import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.role === 'FREELANCER') {
        navigate('/freelancer/dashboard');
      } else if (result.role === 'CLIENT') {
        navigate('/client/dashboard');
      } else if (result.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  // Demo credentials quick-fill helper
  const fillDemo = (role) => {
    if (role === 'FREELANCER') {
      setEmail('freelancer1@skillbridge.com');
      setPassword('FreelancerPass123!');
    } else if (role === 'CLIENT') {
      setEmail('client1@skillbridge.com');
      setPassword('ClientPass123!');
    } else if (role === 'ADMIN') {
      setEmail('admin@skillbridge.com');
      setPassword('AdminPass123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Skill<span className="text-blue-600">Bridge</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your verified skill profile, client dashboard, or project workspace
          </p>
        </div>

        {/* Demo Login Quick Switcher */}
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo('FREELANCER')}
              className="px-2 py-1.5 text-xs font-semibold rounded bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('CLIENT')}
              className="px-2 py-1.5 text-xs font-semibold rounded bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors"
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => fillDemo('ADMIN')}
              className="px-2 py-1.5 text-xs font-semibold rounded bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="saas-card p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary w-full text-sm py-2.5 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
