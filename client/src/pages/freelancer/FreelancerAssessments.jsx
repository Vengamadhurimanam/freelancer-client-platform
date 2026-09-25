import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import SkillBadge from '../../components/common/SkillBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

const FreelancerAssessments = () => {
  const { user, profile } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentsAndAttempts();
  }, []);

  const fetchAssessmentsAndAttempts = async () => {
    setLoading(true);
    try {
      const [assRes, attRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/assessments/my-attempts'),
      ]);

      if (assRes.data.success) {
        setAssessments(assRes.data.assessments);
      }
      if (attRes.data.success) {
        setAttempts(attRes.data.attempts);
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
        <LoadingSpinner text="Loading skill assessments catalog..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="saas-card p-6 sm:p-8 bg-white border-emerald-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Skill Verification Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Skill Assessments & Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Verify your technical competencies with standardized assessments. Verified badges significantly boost your smart matching score on high-budget projects.
            </p>
          </div>

          {/* Verification Scoring Rules Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 shrink-0">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Scoring Thresholds:
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>90–100%: <strong>Expert Verified</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>80–89%: <strong>Advanced Verified</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>70–79%: <strong>Intermediate Verified</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Assessments Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Available Skill Assessments</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((ass) => {
            const skillName = ass.skill?.name || ass.title;
            const mySkillOnProfile = profile?.skills?.find(
              (s) => s.name.toLowerCase() === skillName.toLowerCase()
            );
            const isVerified = mySkillOnProfile?.isVerified;

            return (
              <div
                key={ass._id}
                className="saas-card p-6 bg-white flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ass.skill?.category || 'Technical'}
                    </span>

                    {isVerified ? (
                      <SkillBadge
                        name="Verified"
                        isVerified={true}
                        score={mySkillOnProfile.score}
                        level={mySkillOnProfile.verificationLevel}
                      />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">Not Verified</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{ass.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{ass.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-3 border-y border-slate-100 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ass.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ass.questions?.length || 5} Questions</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    to={`/freelancer/assessments/${encodeURIComponent(skillName)}`}
                    className={`saas-btn-primary w-full text-xs py-2.5 text-center ${
                      isVerified
                        ? 'bg-slate-800 hover:bg-slate-900'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isVerified ? 'Retake to Improve Score' : 'Start Assessment'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Assessment Attempts Log */}
      {attempts.length > 0 && (
        <div className="saas-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Assessment Attempts History
          </h3>

          <div className="divide-y divide-slate-100">
            {attempts.map((att) => (
              <div key={att._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 mr-2">{att.skill?.name}</span>
                  <span className="text-slate-400">{formatDate(att.completedAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      att.passed ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    Score: {att.score}% ({att.verificationLevel})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      att.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.passed ? 'PASSED' : 'NOT PASSED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerAssessments;
