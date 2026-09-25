import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSent(true);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
        toast.success('Reset instructions generated');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error requesting reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Skill<span className="text-blue-600">Bridge</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Reset your password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email address</p>
        </div>

        <div className="saas-card p-6 sm:p-8 bg-white">
          {!sent ? (
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="saas-btn-primary w-full text-sm py-2.5 mt-2"
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset instructions generated</h3>
              <p className="text-xs text-slate-500">
                A password reset token has been issued for <strong>{email}</strong>.
              </p>
              {resetToken && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs">
                  <div className="font-semibold text-slate-700 mb-1">Development Reset Token:</div>
                  <div className="font-mono text-[11px] text-blue-600 break-all">{resetToken}</div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
