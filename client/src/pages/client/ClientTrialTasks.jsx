import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate, getStatusBadgeColor } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  FileCheck2,
  Clock,
  Code2,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';

const ClientTrialTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Evaluation modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [decision, setDecision] = useState('Approved'); // 'Approved' | 'Rejected'
  const [score, setScore] = useState(90);
  const [comment, setComment] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  useEffect(() => {
    fetchClientTrialTasks();
  }, []);

  const fetchClientTrialTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trial-tasks/client/my-tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmittingEval(true);
    try {
      const res = await api.post(`/trial-tasks/${selectedTask._id}/review`, {
        decision,
        score: Number(score),
        comment,
      });

      if (res.data.success) {
        toast.success(`Trial task evaluated (${decision})!`);
        setEvalModalOpen(false);
        fetchClientTrialTasks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error evaluating trial task');
    } finally {
      setSubmittingEval(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading assigned trial tasks..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Trial Task Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review candidate trial submissions, assign scores, and hire the top performers.
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No trial tasks assigned"
          description="When evaluating applicant proposals, you can assign short pre-hire trial tasks to test code quality."
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="saas-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Candidate: <strong>{task.freelancer?.name}</strong> • Project: {task.project?.title}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{task.description}</p>

                {/* Candidate Submission Details */}
                {task.submission && task.submission.submittedAt && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mt-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      Candidate Submission ({formatDate(task.submission.submittedAt)}):
                    </div>
                    {task.submission.explanation && (
                      <p className="text-slate-600 leading-relaxed">{task.submission.explanation}</p>
                    )}
                    <div className="flex items-center gap-4 text-blue-600 font-semibold pt-1">
                      {task.submission.githubUrl && (
                        <a
                          href={task.submission.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          <Code2 className="w-3.5 h-3.5" /> View Code
                        </a>
                      )}
                      {task.submission.demoUrl && (
                        <a
                          href={task.submission.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {task.status === 'Submitted' && (
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setEvalModalOpen(true);
                    }}
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                  >
                    Evaluate & Score
                  </button>
                )}

                <Link
                  to={`/client/projects/${task.project?._id}`}
                  className="saas-btn-secondary text-xs py-2 px-4 whitespace-nowrap text-center"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EVALUATE TRIAL TASK */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title={`Evaluate Submission from ${selectedTask?.freelancer?.name}`}
      >
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Decision *</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Approved">Approve (Proceed to Hire)</option>
                <option value="Rejected">Reject</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quality Score (0–100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Evaluation Notes
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide constructive feedback regarding clean architecture, styling, and test coverage..."
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEvalModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEval}
              className="saas-btn-primary text-xs py-2 px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              {submittingEval ? 'Saving...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientTrialTasks;
