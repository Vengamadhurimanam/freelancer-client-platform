import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/helpers';
import SkillBadge from '../../components/common/SkillBadge';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
  Briefcase,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

const ClientProjectProposals = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'recommendations'

  // Trial Task Creator Modal State
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialTitle, setTrialTitle] = useState('');
  const [trialDesc, setTrialDesc] = useState('');
  const [trialDeadline, setTrialDeadline] = useState('');
  const [submittingTrial, setSubmittingTrial] = useState(false);

  useEffect(() => {
    fetchProjectAndProposals();
  }, [id]);

  const fetchProjectAndProposals = async () => {
    setLoading(true);
    try {
      const [projRes, propRes, recRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/proposals/project/${id}`),
        api.get(`/projects/${id}/recommended-freelancers`),
      ]);

      if (projRes.data.success) setProject(projRes.data.project);
      if (propRes.data.success) setProposals(propRes.data.proposals);
      if (recRes.data.success) setRecommended(recRes.data.recommendations);
    } catch {
      toast.error('Error loading project applicants');
      navigate('/client/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (proposalId, status) => {
    try {
      const res = await api.patch(`/proposals/${proposalId}/status`, { status });
      if (res.data.success) {
        toast.success(`Proposal marked as ${status}`);
        fetchProjectAndProposals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating proposal');
    }
  };

  const handleHireFreelancer = async (proposal) => {
    if (
      !window.confirm(
        `Are you sure you want to hire ${proposal.freelancer?.name} for this project?`
      )
    ) {
      return;
    }

    try {
      const res = await api.post(`/projects/${project._id}/assign`, {
        freelancerId: proposal.freelancer?._id,
        proposalId: proposal._id,
      });

      if (res.data.success) {
        toast.success('Freelancer hired successfully! Project workspace is now active.');
        navigate(`/project/${project._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error hiring freelancer');
    }
  };

  const handleCreateTrialTask = async (e) => {
    e.preventDefault();
    if (!trialTitle || !trialDesc || !trialDeadline || !selectedProposal) return;

    setSubmittingTrial(true);
    try {
      const res = await api.post('/trial-tasks', {
        projectId: project._id,
        proposalId: selectedProposal._id,
        freelancerId: selectedProposal.freelancer?._id,
        title: trialTitle,
        description: trialDesc,
        deadline: new Date(trialDeadline),
      });

      if (res.data.success) {
        toast.success('Trial task assigned successfully! Freelancer notified.');
        setTrialModalOpen(false);
        fetchProjectAndProposals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning trial task');
    } finally {
      setSubmittingTrial(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Evaluating applicant skills & compatibility..." />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Project Overview Header */}
      <div className="saas-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                project.status
              )}`}
            >
              {project.status}
            </span>
            <span className="text-xs text-slate-500">Budget: {formatCurrency(project.budget?.amount)}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {project.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {project.assignedFreelancer && (
            <Link to={`/project/${project._id}`} className="saas-btn-primary text-xs py-2 px-4">
              Open Workspace
            </Link>
          )}
          <Link to={`/projects/${project._id}`} className="saas-btn-secondary text-xs py-2 px-4">
            Public View
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`py-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'proposals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Submitted Proposals ({proposals.length})
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`py-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Smart Recommended Talent ({recommended.length})
        </button>
      </div>

      {/* TAB 1: SUBMITTED PROPOSALS WITH SKILL MATCH */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No proposals received yet"
              description="Your project is live in the discovery catalog. Verified engineers will submit bids shortly."
            />
          ) : (
            proposals.map((prop) => (
              <div
                key={prop._id}
                className="saas-card p-6 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Applicant Info & Cover Letter */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          prop.freelancer?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <Link
                          to={`/freelancers/${prop.freelancer?._id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {prop.freelancer?.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {prop.freelancerProfile?.title || 'Verified Developer'}
                        </p>
                      </div>
                    </div>

                    {/* Skill Match Highlight Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          prop.skillMatchPercentage >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {prop.skillMatchPercentage}% Skill Match
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                          prop.status
                        )}`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  {/* Verified Skills list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prop.freelancerProfile?.skills
                      ?.filter((s) => s.isVerified)
                      .map((sk, sIdx) => (
                        <SkillBadge
                          key={sIdx}
                          name={sk.name}
                          isVerified={true}
                          score={sk.score}
                          level={sk.verificationLevel}
                        />
                      ))}
                  </div>

                  {/* Cover Letter */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <p className="font-semibold text-slate-900 mb-1">Cover Letter & Approach:</p>
                    <p className="whitespace-pre-line">{prop.coverLetter}</p>
                  </div>

                  {/* Bid & Delivery timeline */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Proposed Bid: <strong>{formatCurrency(prop.proposedBudget)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Estimated Timeline: <strong>{prop.estimatedDays} days</strong>
                    </span>
                    {prop.relevantExperience && (
                      <>
                        <span>•</span>
                        <span>Exp: {prop.relevantExperience}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Client Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {prop.status !== 'Accepted' && (
                    <button
                      onClick={() => handleHireFreelancer(prop)}
                      className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hire Freelancer
                    </button>
                  )}

                  {prop.status !== 'Trial Task' && prop.status !== 'Accepted' && (
                    <button
                      onClick={() => {
                        setSelectedProposal(prop);
                        setTrialTitle(`Trial Task for ${project.title}`);
                        setTrialDesc('Build a functional micro-component demonstrating clean code architecture and responsive layout.');
                        setTrialModalOpen(true);
                      }}
                      className="saas-btn-secondary text-xs py-2 px-4 whitespace-nowrap border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Assign Trial Task
                    </button>
                  )}

                  {prop.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(prop._id, 'Shortlisted')}
                        className="saas-btn-secondary text-xs py-1.5 px-3 flex-1 text-center"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(prop._id, 'Rejected')}
                        className="saas-btn-secondary text-xs py-1.5 px-3 flex-1 text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <Link
                    to={`/client/messages?recipient=${prop.freelancer?._id}`}
                    className="saas-btn-secondary text-xs py-1.5 px-3 text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                    Message
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SMART RECOMMENDED TALENT */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommended.map((item, idx) => (
            <div
              key={idx}
              className="saas-card p-6 bg-white flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.freelancer.user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.freelancer.user?.name}
                      </h3>
                      <p className="text-xs text-slate-500">{item.freelancer.title}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {item.matchPercentage}% Match
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 py-2 border-y border-slate-100 mb-3">
                  <RatingStars rating={item.freelancer.averageRating} size="sm" />
                  <span>Rate: <strong>{formatCurrency(item.freelancer.hourlyRate)}/hr</strong></span>
                  <span><strong>{item.freelancer.completedProjects}</strong> projects</span>
                </div>

                {/* Matched & Missing breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Verified Match Breakdown:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.matchedSkills?.map((ms, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                      >
                        ✓ {ms.name} ({ms.score}%)
                      </span>
                    ))}
                    {item.missingSkills?.map((mis, misIdx) => (
                      <span
                        key={misIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px]"
                      >
                        ✗ {mis.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/freelancers/${item.freelancer.user?._id}`}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  View Profile & Portfolio
                </Link>
                <Link
                  to={`/client/messages?recipient=${item.freelancer.user?._id}`}
                  className="saas-btn-primary text-xs py-1.5 px-3"
                >
                  Invite to Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ASSIGN TRIAL TASK */}
      <Modal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        title={`Assign Pre-Hire Trial Task to ${selectedProposal?.freelancer?.name}`}
      >
        <form onSubmit={handleCreateTrialTask} className="space-y-4">
          <p className="text-xs text-slate-600">
            Create a small 1-2 day technical challenge to evaluate code cleanliness, responsiveness, and architecture before making a final hire.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trial Task Title *
            </label>
            <input
              type="text"
              required
              value={trialTitle}
              onChange={(e) => setTrialTitle(e.target.value)}
              placeholder="e.g. Build a Responsive React Login Form with Form Validation"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Task Brief & Acceptance Criteria *
            </label>
            <textarea
              required
              rows={4}
              value={trialDesc}
              onChange={(e) => setTrialDesc(e.target.value)}
              placeholder="Detail required components, props, validation rules, and testing expectations..."
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Deadline *
            </label>
            <input
              type="date"
              required
              value={trialDeadline}
              onChange={(e) => setTrialDeadline(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTrialModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingTrial}
              className="saas-btn-primary text-xs py-2 px-6 bg-purple-600 hover:bg-purple-700"
            >
              {submittingTrial ? 'Assigning...' : 'Assign Trial Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientProjectProposals;
