import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import SkillBadge from '../components/common/SkillBadge';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  ShieldCheck,
  Award,
  ChevronRight,
  Briefcase,
  Star,
  User,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const PublicFreelancersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsList, setSkillsList] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experience') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [selectedSkill, experienceLevel, minRating, verifiedOnly, sort]);

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

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const params = {
        ...(search && { search }),
        ...(selectedSkill && { skill: selectedSkill }),
        ...(experienceLevel && { experienceLevel }),
        ...(minRating && { minRating }),
        ...(verifiedOnly && { verifiedOnly: 'true' }),
        ...(sort && { sort }),
      };

      const res = await api.get('/freelancers', { params });
      if (res.data.success) {
        setFreelancers(res.data.freelancers);
      }
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFreelancers();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSkill('');
    setExperienceLevel('');
    setMinRating('');
    setVerifiedOnly(false);
    setSort('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Skill-Verified Freelancers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hire vetted developers and designers with verified technical assessment scores.
        </p>
      </div>

      {/* Search Bar & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, engineering role, bio, or skill (e.g., React, Next.js, Docker)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg text-xs font-semibold py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="rating">Highest Rating</option>
            <option value="projects">Most Completed Projects</option>
            <option value="rate-low">Hourly Rate: Low to High</option>
            <option value="rate-high">Hourly Rate: High to Low</option>
            <option value="newest">Newest Members</option>
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

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block saas-card p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Filter Talent
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Reset
            </button>
          </div>

          {/* Verified Only Toggle */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Badges Only</span>
            </label>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Specific Skill</label>
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

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Experience Tier</label>
            <div className="space-y-1.5 text-xs text-slate-600">
              {['Entry', 'Intermediate', 'Expert'].map((lvl) => (
                <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="expTier"
                    checked={experienceLevel === lvl}
                    onChange={() => setExperienceLevel(lvl === experienceLevel ? '' : lvl)}
                    className="text-blue-600"
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Minimum Rating</label>
            <div className="space-y-1 text-xs text-slate-600">
              {[4.5, 4.0, 3.5].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={minRating === String(r)}
                    onChange={() => setMinRating(minRating === String(r) ? '' : String(r))}
                    className="text-blue-600"
                  />
                  <span>{r} Stars & Up</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Freelancers Directory Grid */}
        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="saas-card">
              <LoadingSpinner text="Searching verified freelancers..." />
            </div>
          ) : freelancers.length === 0 ? (
            <EmptyState
              title="No freelancers found"
              description="No candidates matched your search criteria. Try removing some filters."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancers.map((fp) => (
                <div
                  key={fp._id}
                  className="saas-card p-5 bg-white flex flex-col justify-between hover:border-blue-300 transition-all"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Hourly Rate */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            fp.user?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={fp.user?.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <Link
                            to={`/freelancers/${fp.user?._id || fp._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                          >
                            {fp.user?.name}
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-1">{fp.title}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(fp.hourlyRate)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ hour</span>
                      </div>
                    </div>

                    {/* Rating & Completed Projects */}
                    <div className="flex items-center gap-4 text-xs text-slate-600 py-2 border-y border-slate-100 mb-3">
                      <RatingStars rating={fp.averageRating} totalReviews={fp.totalReviews} size="sm" />
                      <div>
                        <strong>{fp.completedProjects}</strong> projects done
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {fp.bio}
                    </p>

                    {/* Skills & Verified Badges */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Verified Skills & Benchmark
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fp.skills
                          ?.filter((s) => s.isVerified)
                          .map((s, idx) => (
                            <SkillBadge
                              key={idx}
                              name={s.name}
                              isVerified={s.isVerified}
                              score={s.score}
                              level={s.verificationLevel}
                            />
                          ))}
                        {fp.skills?.filter((s) => s.isVerified).length === 0 && (
                          <span className="text-xs text-slate-400 italic">Self-claimed skills</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: View Profile */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      {fp.experienceLevel} Tier
                    </span>
                    <Link
                      to={`/freelancers/${fp.user?._id || fp._id}`}
                      className="saas-btn-primary text-xs py-1.5 px-3.5"
                    >
                      View Profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 md:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full p-5 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">Filter Freelancers</span>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span>Verified Badges Only</span>
              </label>
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

export default PublicFreelancersPage;
