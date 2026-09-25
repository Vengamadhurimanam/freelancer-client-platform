import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import SkillBadge from '../../components/common/SkillBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  ArrowLeft,
  Send,
} from 'lucide-react';

const AssessmentTakePage = () => {
  const { skillName } = useParams();
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(15 * 60); // seconds
  const [testCompleted, setTestCompleted] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [skillName]);

  // Timer countdown
  useEffect(() => {
    if (!assessment || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, testCompleted]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assessments/skill/${encodeURIComponent(skillName)}`);
      if (res.data.success) {
        setAssessment(res.data.assessment);
        setTimeLeft((res.data.assessment.durationMinutes || 15) * 60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assessment not available');
      navigate('/freelancer/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = async () => {
    if (!assessment || submitting) return;

    setSubmitting(true);
    try {
      // Build answers payload
      const formattedAnswers = assessment.questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      }));

      const timeSpent = (assessment.durationMinutes || 15) * 60 - timeLeft;

      const res = await api.post(`/assessments/${assessment._id}/submit`, {
        answers: formattedAnswers,
        timeSpentSeconds: Math.max(timeSpent, 10),
      });

      if (res.data.success) {
        setResultData(res.data.result);
        setTestCompleted(true);
        await checkAuth(); // refresh user profile verified badges
        toast.success(`Assessment submitted! Score: ${res.data.result.score}%`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text={`Preparing technical assessment for ${skillName}...`} />
      </div>
    );
  }

  if (!assessment) return null;

  // TEST RESULTS SCREEN
  if (testCompleted && resultData) {
    const isPassed = resultData.passed;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="saas-card p-8 bg-white text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isPassed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isPassed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isPassed ? 'Skill Verification Successful' : 'Assessment Threshold Not Met'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">
              You Scored {resultData.score}% in {resultData.skillName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isPassed
                ? `You have earned the "${resultData.verificationLevel} Verified" Badge on your freelancer profile.`
                : `A score of ${assessment.passingScore}% or higher is required for verified status. You can retake this assessment anytime.`}
            </p>
          </div>

          {/* Unlocked Badge Showcase */}
          {isPassed && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-4">
              <SkillBadge
                name={resultData.skillName}
                isVerified={true}
                score={resultData.score}
                level={resultData.verificationLevel}
                showScore={true}
              />
              <span className="text-xs font-bold text-slate-700">Official Platform Badge</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/freelancer/profile" className="saas-btn-primary text-xs py-2.5 px-6">
              View Profile & Badges
            </Link>
            <Link to="/projects" className="saas-btn-secondary text-xs py-2.5 px-6">
              Browse Matching Projects
            </Link>
          </div>
        </div>

        {/* Detailed Question Review & Explanations */}
        <div className="saas-card p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Assessment Answer Analysis & Explanations
          </h3>

          <div className="space-y-6">
            {resultData.gradedQuestions?.map((q, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  q.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                } space-y-3 text-xs`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {q.questionText}
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      q.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {q.isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
                  </span>
                </div>

                <div className="space-y-1.5 pl-7">
                  {q.options?.map((opt, optIdx) => {
                    const isUserChoice = q.selectedOption === optIdx;
                    const isCorrectAnswer = q.correctOptionIndex === optIdx;

                    let optClass = 'text-slate-600 border-slate-200 bg-white';
                    if (isCorrectAnswer) {
                      optClass = 'border-emerald-400 bg-emerald-100/50 text-emerald-900 font-bold';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optClass = 'border-rose-400 bg-rose-100/50 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded border text-xs flex items-center justify-between ${optClass}`}
                      >
                        <span>{opt}</span>
                        {isCorrectAnswer && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="text-[10px] uppercase font-bold text-rose-700">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="ml-7 p-2.5 bg-slate-100 rounded text-slate-700 text-[11px] leading-relaxed">
                    <strong>Technical Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE TEST TAKING INTERFACE
  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isTimeCritical = timeLeft < 180; // under 3 minutes

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Test Top Bar: Title, Progress, Timer */}
      <div className="saas-card p-4 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
              {assessment.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Question {currentIndex + 1} of {assessment.questions.length} • {answeredCount} answered
          </p>
        </div>

        {/* Live Timer Box */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-colors ${
            isTimeCritical
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Current Question Card */}
      <div className="saas-card p-6 sm:p-8 bg-white space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Question {currentIndex + 1}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              {currentQuestion.difficulty || 'Intermediate'} • {currentQuestion.points || 10} pts
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>

          {/* Code Snippet Box if available */}
          {currentQuestion.codeSnippet && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              <pre>{currentQuestion.codeSnippet}</pre>
            </div>
          )}
        </div>

        {/* Radio Options */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion._id] === idx;
            return (
              <label
                key={idx}
                onClick={() => handleSelectOption(currentQuestion._id, idx)}
                className={`flex items-center gap-3.5 p-4 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-relaxed">{option}</span>
              </label>
            );
          })}
        </div>

        {/* Navigation & Submit Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="saas-btn-secondary text-xs py-2 px-4 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentIndex < assessment.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="saas-btn-primary text-xs py-2 px-5"
              >
                Next Question
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitTest}
                className="saas-btn-primary text-xs py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? 'Grading Answers...' : 'Submit Assessment'}
                <Send className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTakePage;
