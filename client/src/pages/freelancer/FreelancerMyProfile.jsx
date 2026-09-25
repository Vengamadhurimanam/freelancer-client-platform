import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import SkillBadge from '../../components/common/SkillBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  User,
  Award,
  Briefcase,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Code2,
  Globe,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

const FreelancerMyProfile = () => {
  const { user, profile: authProfile, checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(50);
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/freelancers/me');
      if (res.data.success) {
        const p = res.data.profile;
        setProfile(p);
        setName(p.user?.name || user?.name || '');
        setTitle(p.title || '');
        setBio(p.bio || '');
        setHourlyRate(p.hourlyRate || 50);
        setExperienceLevel(p.experienceLevel || 'Intermediate');
        setYearsOfExperience(p.yearsOfExperience || 3);
        setGithub(p.github || '');
        setLinkedin(p.linkedin || '');
        setWebsite(p.website || '');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/freelancers/me', {
        name,
        title,
        bio,
        hourlyRate: Number(hourlyRate),
        experienceLevel,
        yearsOfExperience: Number(yearsOfExperience),
        github,
        linkedin,
        website,
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        setProfile(res.data.profile);
        await checkAuth();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/freelancers/me/skills', {
        skillName: newSkillName.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setNewSkillName('');
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      const res = await api.delete(`/freelancers/me/skills/${encodeURIComponent(skillName)}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading profile settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Freelancer Profile & Skill Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your public credentials, rate, verified skills, and external links.
        </p>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Core Profile Card */}
        <div className="saas-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Full Stack React & Node Engineer"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your engineering philosophy, tech stack mastery, and project accomplishments..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                min={5}
                max={500}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Entry">Entry</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                max={40}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Links Card */}
        <div className="saas-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Social & Portfolio Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="saas-btn-primary text-xs py-2.5 px-6"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>

      {/* SKILLS & VERIFIED BADGES MANAGEMENT */}
      <div className="saas-card p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Your Skills & Verified Badges
            </h2>
            <p className="text-xs text-slate-500">
              Unverified skills can be verified by passing the automated technical assessment.
            </p>
          </div>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
          <input
            type="text"
            required
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add new skill (e.g. Next.js, Docker)..."
            className="flex-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button type="submit" className="saas-btn-secondary text-xs py-2 px-4">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Skills List Table */}
        <div className="space-y-3">
          {profile?.skills?.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <SkillBadge
                  name={s.name}
                  isVerified={s.isVerified}
                  score={s.score}
                  level={s.verificationLevel}
                />
                <span className="text-xs text-slate-500">{s.category}</span>
              </div>

              <div className="flex items-center gap-3">
                {!s.isVerified && (
                  <Link
                    to={`/freelancer/assessments`}
                    className="saas-btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Take Assessment
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove Skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerMyProfile;
