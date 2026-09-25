import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers';
import SkillBadge from '../components/common/SkillBadge';
import RatingStars from '../components/common/RatingStars';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Building,
} from 'lucide-react';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // Proposal form state
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
        setProposedBudget(res.data.project.budget?.amount || '');
      }
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter || !proposedBudget || !estimatedDays) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/proposals', {
        projectId: project._id,
        coverLetter,
        proposedBudget: Number(proposedBudget),
        estimatedDays: Number(estimatedDays),
        relevantExperience,
        portfolioLinks: portfolioLink ? [portfolioLink] : [],
      });

      if (res.data.success) {
        toast.success('Proposal submitted successfully!');
        setProposalModalOpen(false);
        fetchProjectDetails(); // Refresh project proposal state
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading project brief..." />
      </div>
    );
  }

  if (!project) return null;

  const isClientOwner = user && project.client && project.client._id === user._id;
  const isAssignedFreelancer =
    user && project.assignedFreelancer && project.assignedFreelancer._id === user._id;
  const alreadyApplied = !!project.userProposal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/projects" className="hover:text-blue-600">
          Projects
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{project.category}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Brief Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="saas-card p-6 sm:p-8 bg-white">
            {/* Header: Status, Title, Category */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              <span className="text-xs text-slate-400">
                Posted {formatDate(project.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              {project.title}
            </h1>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-6 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Budget</span>
                <span className="font-bold text-slate-900 text-base">
                  {formatCurrency(project.budget?.amount)}
                </span>
                <span className="text-slate-500 block text-[11px]">{project.budget?.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Deadline</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDate(project.deadline)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Experience</span>
                <span className="font-bold text-slate-900 text-sm">
                  {project.experienceRequired}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Project Type</span>
                <span className="font-bold text-slate-900 text-sm">{project.projectType}</span>
              </div>
            </div>

            {/* Smart Skill Match Box (if logged in as freelancer) */}
            {project.skillMatch && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">
                      Your Skill Match Score: {project.skillMatch.matchPercentage}%
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                    {project.skillMatch.matchPercentage >= 80 ? 'High Compatibility' : 'Standard'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Match calculated based on your verified assessment credentials and requirements.
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  {project.skillMatch.matchedSkills?.map((ms, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                        ms.isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {ms.name} {ms.isVerified ? `(${ms.score}%)` : '(Unverified)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Project Overview & Requirements
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
            </div>

            {/* Required Skills Section */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills?.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2"
                  >
                    <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 bg-white rounded border border-slate-200">
                      {skill.importance || 'Required'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Client Profile + Action Box */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Application Status</h3>

            {isClientOwner ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">You are the author of this project.</p>
                <Link
                  to={`/client/projects/${project._id}`}
                  className="saas-btn-primary w-full text-xs py-2.5 text-center"
                >
                  View Submitted Proposals ({project.proposalCount || 0})
                </Link>
                {project.assignedFreelancer && (
                  <Link
                    to={`/project/${project._id}`}
                    className="saas-btn-secondary w-full text-xs py-2.5 text-center"
                  >
                    Go to Project Workspace
                  </Link>
                )}
              </div>
            ) : isAssignedFreelancer ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  You are hired for this project!
                </div>
                <Link
                  to={`/project/${project._id}`}
                  className="saas-btn-primary w-full text-xs py-2.5 text-center"
                >
                  Open Project Workspace
                </Link>
              </div>
            ) : alreadyApplied ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Proposal Submitted
                </div>
                <p className="text-slate-500">
                  Status:{' '}
                  <span className="font-bold text-slate-800">
                    {project.userProposal?.status}
                  </span>
                </p>
                <p className="text-slate-500">
                  Bid: <strong>{formatCurrency(project.userProposal?.proposedBudget)}</strong> in{' '}
                  <strong>{project.userProposal?.estimatedDays} days</strong>
                </p>
              </div>
            ) : user?.role === 'FREELANCER' ? (
              <button
                onClick={() => setProposalModalOpen(true)}
                disabled={project.status !== 'Open' && project.status !== 'Proposal Review'}
                className="saas-btn-primary w-full text-sm py-3"
              >
                Apply for Project
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !user ? (
              <div className="space-y-2">
                <Link to="/login" className="saas-btn-primary w-full text-xs py-2.5 text-center">
                  Sign in to Apply
                </Link>
                <p className="text-[11px] text-slate-500 text-center">
                  Skill-verified accounts receive priority matching.
                </p>
              </div>
            ) : null}
          </div>

          {/* Client Profile Card */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              About the Client
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={
                  project.client?.avatar ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="text-sm font-bold text-slate-900">{project.client?.name}</div>
                <div className="text-xs text-slate-500">
                  {project.clientProfile?.companyName || 'Verified Enterprise'}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Industry:</span>
                <span className="font-medium text-slate-800">
                  {project.clientProfile?.industry || 'Technology'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800">
                  {project.clientProfile?.location || 'Remote'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projects Posted:</span>
                <span className="font-medium text-slate-800">
                  {project.clientProfile?.totalProjectsPosted || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rating:</span>
                <RatingStars rating={project.clientProfile?.averageRating || 5.0} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROPOSAL SUBMISSION MODAL */}
      <Modal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title="Submit Proposal for Project"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleProposalSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
            <span>Project Target Budget: {formatCurrency(project.budget?.amount)}</span>
            <span className="font-bold">{project.skillMatch?.matchPercentage || 85}% Skill Match</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proposed Bid Price ($) *
              </label>
              <input
                type="number"
                required
                min={10}
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Delivery (Days) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cover Letter & Technical Approach *
            </label>
            <textarea
              required
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Detail your architectural plan, how you will tackle the key requirements, and your relevant experience..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Relevant Experience Summary
            </label>
            <input
              type="text"
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
              placeholder="e.g. Built a similar telemetry dashboard handling 50k events/sec"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Relevant GitHub or Live Portfolio Link
            </label>
            <input
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://github.com/username/example-repo"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setProposalModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="saas-btn-primary text-xs py-2 px-6"
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
