import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate, getStatusBadgeColor } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  FileCheck2,
  Clock,
  Send,
  Code2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

const FreelancerTrialTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit deliverable modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrialTasks();
  }, []);

  const fetchTrialTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trial-tasks/freelancer/my-tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const res = await api.patch(`/trial-tasks/${taskId}/accept`);
      if (res.data.success) {
        toast.success('Trial task accepted! You can now prepare your submission.');
        fetchTrialTasks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting task');
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/trial-tasks/${selectedTask._id}/submit`, {
        githubUrl,
        demoUrl,
        explanation,
      });

      if (res.data.success) {
        toast.success('Trial task submitted successfully! Client has been notified.');
        setSubmitModalOpen(false);
        fetchTrialTasks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your trial tasks..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Assigned Trial Tasks
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete practical trial challenges assigned by clients to demonstrate your engineering caliber.
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No trial tasks assigned"
          description="When clients shortlist your proposals, they may invite you to complete a brief trial task before finalizing hire agreements."
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
                    Client: <strong>{task.client?.name}</strong> • Project: {task.project?.title}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{task.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Deadline: {formatDate(task.deadline)}
                  </span>
                </div>

                {/* Review feedback if completed */}
                {task.reviewFeedback && task.reviewFeedback.decision && task.reviewFeedback.decision !== 'Pending' && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      Client Evaluation Score: {task.reviewFeedback.score}/100 ({task.reviewFeedback.decision})
                    </div>
                    {task.reviewFeedback.comment && (
                      <p className="text-slate-600 italic">"{task.reviewFeedback.comment}"</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {task.status === 'Assigned' && (
                  <button
                    onClick={() => handleAcceptTask(task._id)}
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap bg-purple-600 hover:bg-purple-700"
                  >
                    Accept Trial Task
                  </button>
                )}
                {task.status === 'Accepted' && (
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setSubmitModalOpen(true);
                    }}
                    className="saas-btn-primary text-xs py-2 px-4 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Solution
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT SOLUTION MODAL */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit Trial Task Solution: ${selectedTask?.title}`}
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GitHub Repository / Pull Request Link *
            </label>
            <input
              type="url"
              required
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/trial-task-solution"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Live Demo / Preview URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://trial-task-demo.vercel.app"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technical Architecture & Explanation *
            </label>
            <textarea
              required
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain how you built the trial task, design decisions, and edge case handling..."
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="saas-btn-primary text-xs py-2 px-6"
            >
              {submitting ? 'Submitting...' : 'Submit Trial Solution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FreelancerTrialTasks;
