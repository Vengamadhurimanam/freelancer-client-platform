import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

const PublicProjectsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsList, setSkillsList] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minBudget, setMinBudget] = useState(searchParams.get('minBudget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxBudget') || '');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedSkill, selectedCategory, experience, sort, minBudget, maxBudget]);

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      if (res.data.success) {
        setSkillsList(res.data.skills);
      }
    } catch {
      // ignore
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        ...(search && { search }),
        ...(selectedSkill && { skill: selectedSkill }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(experience && { experience }),
        ...(sort && { sort }),
        ...(minBudget && { minBudget }),
        ...(maxBudget && { maxBudget }),
      };

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSkill('');
    setSelectedCategory('');
    setExperience('');
    setMinBudget('');
    setMaxBudget('');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Projects
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover verified engineering and design contracts matched to your skillset.
        </p>
      </div>

      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title, keyword, or required tech stack..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg text-xs font-semibold py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="newest">Sort by: Newest</option>
            {user?.role === 'FREELANCER' && <option value="match">Sort by: Best Skill Match</option>}
            <option value="budget-high">Budget: High to Low</option>
            <option value="budget-low">Budget: Low to High</option>
            <option value="deadline">Approaching Deadline</option>
          </select>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden saas-btn-secondary py-2.5 px-3 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Project List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block saas-card p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Filter Projects
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Reset
            </button>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Required Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Skills</option>
              {skillsList.map((sk) => (
                <option key={sk._id} value={sk.name}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Fintech">Fintech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Database">Database</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="Backend">Backend</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Experience Level</label>
            <div className="space-y-1.5 text-xs text-slate-600">
              {['Entry', 'Intermediate', 'Expert'].map((lvl) => (
                <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    checked={experience === lvl}
                    onChange={() => setExperience(lvl === experience ? '' : lvl)}
                    className="text-blue-600"
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Budget Range ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Projects List View */}
        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="saas-card">
              <LoadingSpinner text="Loading projects catalog..." />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="No open projects match your chosen filters. Try resetting your search filters."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          ) : (
            projects.map((proj) => (
              <div
                key={proj._id}
                className="saas-card p-6 bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Category, Status, Match Score */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {proj.category || 'General'}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                          proj.status
                        )}`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    {/* Smart Skill Match Badge if user is freelancer */}
                    {typeof proj.matchPercentage === 'number' && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                          proj.matchPercentage >= 80
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : proj.matchPercentage >= 60
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {proj.matchPercentage}% Skill Match
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    to={`/projects/${proj._id}`}
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors block mb-2"
                  >
                    {proj.title}
                  </Link>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {proj.description}
                  </p>

                  {/* Required Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.requiredSkills?.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Budget, Deadline, Proposals, Action CTA */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {formatCurrency(proj.budget?.amount)}
                      <span className="text-[11px] text-slate-400 font-normal ml-1">
                        ({proj.budget?.type || 'Fixed'})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {formatDate(proj.deadline)}</span>
                    </div>
                    <div>
                      <span>{proj.proposalCount || 0} proposals</span>
                    </div>
                  </div>

                  <Link
                    to={`/projects/${proj._id}`}
                    className="saas-btn-primary text-xs py-1.5 px-3.5"
                  >
                    View Project
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 md:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full p-5 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full border border-slate-200 rounded p-2 text-xs"
              >
                <option value="">All Skills</option>
                {skillsList.map((sk) => (
                  <option key={sk._id} value={sk.name}>
                    {sk.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-slate-200 rounded p-2 text-xs"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="saas-btn-primary w-full text-xs py-2.5"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProjectsPage;
