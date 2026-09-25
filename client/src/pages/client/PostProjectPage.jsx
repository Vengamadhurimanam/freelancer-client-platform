import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PostProjectPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetType, setBudgetType] = useState('Fixed');
  const [deadline, setDeadline] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('Intermediate');
  const [projectType, setProjectType] = useState('One-Time Project');

  // Skills requirements
  const [skillsList, setSkillsList] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([
    { name: 'React.js', importance: 'Required' },
    { name: 'Node.js', importance: 'Required' },
  ]);
  const [selectedNewSkill, setSelectedNewSkill] = useState('');
  const [newSkillImportance, setNewSkillImportance] = useState('Required');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkillsCatalog();
  }, []);

  const fetchSkillsCatalog = async () => {
    try {
      const res = await api.get('/skills');
      if (res.data.success) {
        setSkillsList(res.data.skills);
      }
    } catch {
      // ignore
    }
  };

  const handleAddSkill = () => {
    if (!selectedNewSkill) return;
    if (requiredSkills.some((s) => s.name === selectedNewSkill)) {
      toast.error('Skill already added to requirements');
      return;
    }

    setRequiredSkills((prev) => [
      ...prev,
      { name: selectedNewSkill, importance: newSkillImportance },
    ]);
    setSelectedNewSkill('');
  };

  const handleRemoveSkill = (name) => {
    setRequiredSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !budgetAmount || !deadline) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (requiredSkills.length === 0) {
      toast.error('Please specify at least one required technical skill');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        title,
        description,
        category,
        budget: {
          amount: Number(budgetAmount),
          type: budgetType,
        },
        deadline: new Date(deadline),
        experienceRequired,
        projectType,
        requiredSkills,
      });

      if (res.data.success) {
        toast.success('Project posted successfully! Candidate matching active.');
        navigate(`/client/projects/${res.data.project._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>New Project Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a New Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify your exact requirements to automatically match with verified software engineers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Overview Card */}
        <div className="saas-card p-6 sm:p-8 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Project Overview
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HIPAA-Compliant Telehealth Consultation Dashboard"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Web Development">Web Development</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Database">Database</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Backend">Backend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Scope *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="One-Time Project">One-Time Project</option>
                <option value="Ongoing Work">Ongoing Work</option>
                <option value="Complex System">Complex System</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Scope & Deliverables *
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architectural requirements, database schemas, deliverables, API integrations, and milestone timelines..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Required Technical Skills (Matching Engine Anchor) */}
        <div className="saas-card p-6 sm:p-8 bg-white space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Required Technical Skills (Smart Matching Anchor)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Our rule-based engine verifies applicants' test scores against these required skills.
            </p>
          </div>

          {/* Skill Adder Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedNewSkill}
              onChange={(e) => setSelectedNewSkill(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select skill from catalog...</option>
              {skillsList.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>

            <select
              value={newSkillImportance}
              onChange={(e) => setNewSkillImportance(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Required">Required (High Weight)</option>
              <option value="Preferred">Preferred (Medium Weight)</option>
              <option value="Bonus">Bonus (Light Weight)</option>
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Selected Skills List */}
          <div className="space-y-2 pt-2">
            {requiredSkills.map((sk, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{sk.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sk.importance === 'Required'
                        ? 'bg-rose-100 text-rose-800'
                        : sk.importance === 'Preferred'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sk.importance}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk.name)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Budget, Experience & Deadline Card */}
        <div className="saas-card p-6 sm:p-8 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Budget & Delivery Timeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget Amount ($) *</label>
              <input
                type="number"
                required
                min={50}
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="2500"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Seniority</label>
              <select
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Entry">Entry (1-2 yrs)</option>
                <option value="Intermediate">Intermediate (3-5 yrs)</option>
                <option value="Expert">Expert (5+ yrs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="saas-btn-primary text-sm py-3 px-8 shadow-sm"
          >
            {submitting ? 'Publishing Project...' : 'Post Project & Match Talent'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostProjectPage;
