import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Award, Plus, Trash2, ShieldCheck, FileQuestion } from 'lucide-react';

const AdminSkillsAssessments = () => {
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Skill Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  useEffect(() => {
    fetchSkillsAndAssessments();
  }, []);

  const fetchSkillsAndAssessments = async () => {
    setLoading(true);
    try {
      const [skRes, assRes] = await Promise.all([
        api.get('/skills'),
        api.get('/assessments'),
      ]);

      if (skRes.data.success) setSkills(skRes.data.skills);
      if (assRes.data.success) setAssessments(assRes.data.assessments);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/skills', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc,
      });

      if (res.data.success) {
        toast.success('Skill added to catalog');
        setSkillModalOpen(false);
        setNewSkillName('');
        setNewSkillDesc('');
        fetchSkillsAndAssessments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill from catalog?')) return;
    try {
      await api.delete(`/skills/${id}`);
      toast.success('Skill deleted');
      fetchSkillsAndAssessments();
    } catch {
      toast.error('Error deleting skill');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading skill catalog & assessments..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill & Assessment Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage standardized skill competencies, assessment question banks, and difficulty levels.
          </p>
        </div>

        <button
          onClick={() => setSkillModalOpen(true)}
          className="saas-btn-primary text-xs py-2 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill._id} className="saas-card p-5 bg-white flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {skill.category}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {skill.verifiedFreelancersCount || 0} Verified
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{skill.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                {skill.description || 'Standard technical evaluation topic'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {skill.hasAssessment ? '✓ Assessment Active' : 'No Assessment'}
              </span>
              <button
                onClick={() => handleDeleteSkill(skill._id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD SKILL */}
      <Modal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        title="Add Skill to Master Catalog"
      >
        <form onSubmit={handleCreateSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name *</label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. GraphQL, Flutter, Kubernetes"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="Mobile">Mobile</option>
              <option value="Full Stack">Full Stack</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Design & UI/UX">Design & UI/UX</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="Key technical concepts, tools and frameworks tested..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSkillModalOpen(false)}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button type="submit" className="saas-btn-primary text-xs py-2 px-6">
              Create Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSkillsAssessments;
