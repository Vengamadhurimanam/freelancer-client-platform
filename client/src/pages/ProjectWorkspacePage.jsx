import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime, getStatusBadgeColor } from '../utils/helpers';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RatingStars from '../components/common/RatingStars';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Code2,
  Award,
  AlertCircle,
  Star,
  Layers,
  ChevronRight,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

const ProjectWorkspacePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('milestones'); // 'milestones' | 'chat' | 'files'

  // Deliverable modal state
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Review modal state (client approving or requesting revision)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Revision Required'
  const [reviewNotes, setReviewNotes] = useState('');

  // Final review modal state (after project completion)
  const [finalReviewModalOpen, setFinalReviewModalOpen] = useState(false);
  const [ratingCategories, setRatingCategories] = useState({
    communication: 5,
    quality: 5,
    timeliness: 5,
    professionalism: 5,
  });
  const [finalComment, setFinalComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Real-time chat state
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Socket room listeners
  useEffect(() => {
    if (!socket || !conversation) return;

    socket.emit('join_conversation', { conversationId: conversation._id });

    socket.on('new_message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('user_typing', (data) => {
      if (data.isTyping && data.userId !== user._id) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.emit('leave_conversation', { conversationId: conversation._id });
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, conversation?._id, user?._id]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Project Details
      const projRes = await api.get(`/projects/${id}`);
      if (!projRes.data.success) throw new Error('Project not found');
      const projData = projRes.data.project;
      setProject(projData);

      // Verify access: user must be assigned client or freelancer or admin
      const isClient = projData.client?._id === user._id;
      const isFreelancer = projData.assignedFreelancer?._id === user._id;
      const isAdmin = user.role === 'ADMIN';

      if (!isClient && !isFreelancer && !isAdmin) {
        toast.error('You do not have authorization to enter this workspace');
        navigate('/');
        return;
      }

      // 2. Fetch Milestones
      const mileRes = await api.get(`/milestones/project/${id}`);
      if (mileRes.data.success) {
        setMilestones(mileRes.data.milestones);
      }

      // 3. Fetch or Create Chat Conversation
      const recipientId = isClient ? projData.assignedFreelancer?._id : projData.client?._id;
      if (recipientId) {
        const convRes = await api.post('/messages/conversations', {
          recipientId,
          projectId: id,
        });
        if (convRes.data.success) {
          setConversation(convRes.data.conversation);
          // Fetch historical messages
          const msgRes = await api.get(`/messages/conversations/${convRes.data.conversation._id}`);
          if (msgRes.data.success) {
            setMessages(msgRes.data.messages);
          }
        }
      }
    } catch (error) {
      toast.error(error.message || 'Error loading workspace');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation) return;

    const recipientId =
      project.client?._id === user._id
        ? project.assignedFreelancer?._id
        : project.client?._id;

    if (socket) {
      socket.emit('send_message', {
        conversationId: conversation._id,
        senderId: user._id,
        recipientId,
        text: messageText.trim(),
      });
      setMessageText('');
    } else {
      // Fallback REST
      try {
        const res = await api.post('/messages', {
          conversationId: conversation._id,
          recipientId,
          text: messageText.trim(),
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
          setMessageText('');
        }
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
  };

  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    setSubmittingDeliverable(true);
    try {
      const res = await api.patch(`/milestones/${selectedMilestone._id}/status`, {
        status: 'Submitted',
        deliverable: {
          githubUrl,
          demoUrl,
          notes,
        },
      });

      if (res.data.success) {
        toast.success('Milestone deliverable submitted for client review!');
        setDeliverableModalOpen(false);
        fetchWorkspaceData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting deliverable');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleMilestoneReview = async () => {
    if (!selectedMilestone) return;

    try {
      const res = await api.patch(`/milestones/${selectedMilestone._id}/status`, {
        status: reviewAction,
        feedbackNotes: reviewNotes,
      });

      if (res.data.success) {
        toast.success(`Milestone marked as ${reviewAction}!`);
        setReviewModalOpen(false);
        fetchWorkspaceData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reviewing milestone');
    }
  };

  const handleFinalReviewSubmit = async (e) => {
    e.preventDefault();
    if (!finalComment) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        projectId: project._id,
        categories: ratingCategories,
        comment: finalComment,
      });

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setFinalReviewModalOpen(false);
        setHasReviewed(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Initializing project workspace..." />
      </div>
    );
  }

  if (!project) return null;

  const isClient = project.client?._id === user._id;
  const isFreelancer = project.assignedFreelancer?._id === user._id;

  const completedMilestonesCount = milestones.filter(
    (m) => m.status === 'Approved' || m.status === 'Completed'
  ).length;
  const progressPercentage =
    milestones.length > 0 ? Math.round((completedMilestonesCount / milestones.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Banner */}
      <div className="saas-card p-6 bg-white border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                🔒 Private Project Workspace
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Collaborators: <strong>{project.client?.name} (Client)</strong> &{' '}
              <strong>{project.assignedFreelancer?.name || 'Unassigned'} (Freelancer)</strong>
            </p>
          </div>

          {/* Project Completion Action / Review CTA */}
          <div className="flex items-center gap-3">
            {project.status === 'Completed' && !hasReviewed && (
              <button
                onClick={() => setFinalReviewModalOpen(true)}
                className="saas-btn-primary text-xs py-2 px-4 bg-amber-600 hover:bg-amber-700"
              >
                <Star className="w-4 h-4 fill-white" />
                Leave Final Review
              </button>
            )}
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Contract</span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(project.budget?.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Milestones Progress ({completedMilestonesCount}/{milestones.length} Completed)</span>
            <span className="text-blue-600 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Milestones, Real-Time Chat, Files */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'milestones'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Milestones & Deliverables ({milestones.length})
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Live Project Chat
        </button>
      </div>

      {/* TAB 1: MILESTONES & DELIVERABLES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Project Milestones</h2>
            <span className="text-xs text-slate-500">
              Funds released sequentially upon deliverable verification
            </span>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={m._id}
                className="saas-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeColor(
                        m.status
                      )}`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {m.description || 'Deliver core module specifications.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-900">
                      Amount: {formatCurrency(m.amount)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due {formatDate(m.dueDate)}
                    </span>
                  </div>

                  {/* Submission details if present */}
                  {m.deliverable && m.deliverable.submittedAt && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Submitted on {formatDate(m.deliverable.submittedAt)}:
                      </div>
                      {m.deliverable.notes && (
                        <p className="text-slate-600 italic">"{m.deliverable.notes}"</p>
                      )}
                      <div className="flex items-center gap-3 text-blue-600 font-semibold pt-1">
                        {m.deliverable.githubUrl && (
                          <a
                            href={m.deliverable.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            <Code2 className="w-3.5 h-3.5" /> GitHub Code
                          </a>
                        )}
                        {m.deliverable.demoUrl && (
                          <a
                            href={m.deliverable.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Preview
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Client Feedback notes if any */}
                  {m.clientFeedback && m.clientFeedback.notes && (
                    <div className="mt-2 p-2.5 bg-blue-50/50 rounded-lg text-xs text-slate-700">
                      <strong>Client Feedback:</strong> {m.clientFeedback.notes}
                    </div>
                  )}
                </div>

                {/* Actions per role */}
                <div className="flex flex-col gap-2 shrink-0">
                  {/* Freelancer actions */}
                  {isFreelancer && (m.status === 'Not Started' || m.status === 'In Progress' || m.status === 'Revision Required') && (
                    <button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setDeliverableModalOpen(true);
                      }}
                      className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Deliverables
                    </button>
                  )}

                  {/* Client actions */}
                  {isClient && m.status === 'Submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setReviewAction('Approved');
                          setReviewModalOpen(true);
                        }}
                        className="saas-btn-primary text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setReviewAction('Revision Required');
                          setReviewModalOpen(true);
                        }}
                        className="saas-btn-secondary text-xs py-2 px-3.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Request Revision
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME PROJECT CHAT */}
      {activeTab === 'chat' && (
        <div className="saas-card bg-white h-[600px] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Direct Project Discussion
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time encrypted communication powered by Socket.IO
                </p>
              </div>
            </div>
            {typingUser && (
              <span className="text-xs text-blue-600 italic">{typingUser} is typing...</span>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
                <span>No messages yet. Send a message to start real-time sync.</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {msg.sender?.name || (isMine ? 'You' : 'Collaborator')} •{' '}
                      {formatDateTime(msg.createdAt)}
                    </div>
                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message to project collaborator..."
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="saas-btn-primary text-xs py-2 px-5"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* MODAL: SUBMIT DELIVERABLE */}
      <Modal
        isOpen={deliverableModalOpen}
        onClose={() => setDeliverableModalOpen(false)}
        title={`Submit Deliverable: ${selectedMilestone?.title}`}
      >
        <form onSubmit={handleDeliverableSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GitHub Repository / Pull Request Link *
            </label>
            <input
              type="url"
              required
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/org/repo/pull/12"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Live Demo URL / Preview Environment
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://preview.deployment.app"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Notes & Changelog *
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain completed requirements, architecture changes, and how to test..."
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeliverableModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingDeliverable}
              className="saas-btn-primary text-xs py-2 px-6"
            >
              {submittingDeliverable ? 'Submitting...' : 'Submit Deliverable'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CLIENT MILESTONE REVIEW (APPROVE / REVISION) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction === 'Approved' ? 'Approve Milestone' : 'Request Milestone Revision'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            {reviewAction === 'Approved'
              ? `Approving milestone "${selectedMilestone?.title}" releases ${formatCurrency(
                  selectedMilestone?.amount
                )} to the freelancer.`
              : `Specify required revisions for milestone "${selectedMilestone?.title}".`}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Comments
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                reviewAction === 'Approved'
                  ? 'Great work, everything looks clean and tested!'
                  : 'Please fix the responsiveness on mobile screens and update unit tests...'
              }
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMilestoneReview}
              className={`saas-btn-primary text-xs py-2 px-6 ${
                reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {reviewAction}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: FINAL PROJECT REVIEW & RATINGS */}
      <Modal
        isOpen={finalReviewModalOpen}
        onClose={() => setFinalReviewModalOpen(false)}
        title="Project Review & Rating"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFinalReviewSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Rate your collaboration experience across the 4 standard categories.
          </p>

          {['communication', 'quality', 'timeliness', 'professionalism'].map((cat) => (
            <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-bold text-slate-800 capitalize">{cat}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRatingCategories((prev) => ({
                        ...prev,
                        [cat]: star,
                      }))
                    }
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= ratingCategories[cat]
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 fill-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Written Review & Testimonial *
            </label>
            <textarea
              required
              rows={4}
              value={finalComment}
              onChange={(e) => setFinalComment(e.target.value)}
              placeholder="Detail your experience working together, code quality, and responsiveness..."
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFinalReviewModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="saas-btn-primary text-xs py-2 px-6"
            >
              {submittingReview ? 'Publishing...' : 'Publish Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectWorkspacePage;
