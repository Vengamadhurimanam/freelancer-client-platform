import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import SkillBadge from '../components/common/SkillBadge';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Star,
  Award,
  Globe,
  Code2,
  Briefcase,
  GraduationCap,
  FileCode,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndReviews();
  }, [id]);

  const fetchProfileAndReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/freelancers/${id}`);
      if (res.data.success) {
        setProfile(res.data.profile);

        // Fetch client reviews for this freelancer
        const reviewRes = await api.get(`/reviews/user/${res.data.profile.user?._id || id}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews);
        }
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading freelancer profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Freelancer Profile Not Found</h2>
        <Link to="/freelancers" className="saas-btn-primary text-xs mt-4 inline-flex">
          Back to Freelancer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Header Card */}
      <div className="saas-card p-6 sm:p-8 bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={
                profile.user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt=""
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {profile.user?.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-blue-600" title="SkillBridge Verified Member" />
              </div>
              <p className="text-sm font-semibold text-blue-600 mt-0.5">{profile.title}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                <RatingStars rating={profile.averageRating} totalReviews={profile.totalReviews} size="sm" />
                <span>•</span>
                <span><strong>{profile.completedProjects}</strong> projects completed</span>
                <span>•</span>
                <span><strong>{profile.yearsOfExperience}</strong> years exp</span>
                <span>•</span>
                <span>Member since {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-end gap-3 w-full md:w-auto">
            <div className="text-left md:text-right">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(profile.hourlyRate)}
              </span>
              <span className="text-xs text-slate-400 block">/ hour</span>
            </div>

            {user?.role === 'CLIENT' && (
              <Link
                to={`/client/messages?recipient=${profile.user?._id}`}
                className="saas-btn-primary text-xs py-2.5 px-4"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Freelancer
              </Link>
            )}
          </div>
        </div>

        {/* Social / External Links */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-700" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Portfolio Website</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols: Bio, Verified Skills, Portfolio, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="saas-card p-6 bg-white space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About Me</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>

          {/* VERIFIED SKILLS & BENCHMARK TABLE */}
          <div className="saas-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Skill Credentials & Benchmark
              </h3>
              <span className="text-xs text-slate-400">Tested by SkillBridge</span>
            </div>

            <div className="space-y-3">
              {profile.skills?.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 gap-2"
                >
                  <div className="flex items-center gap-3">
                    <SkillBadge
                      name={skill.name}
                      isVerified={skill.isVerified}
                      score={skill.score}
                      level={skill.verificationLevel}
                    />
                    <span className="text-xs text-slate-500 font-medium">{skill.category}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    {skill.isVerified ? (
                      <>
                        <div className="text-slate-600">
                          Assessment Score: <strong className="text-emerald-700">{skill.score}%</strong>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          Verified {formatDate(skill.verifiedAt)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Unverified Claim</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PORTFOLIO PROJECTS */}
          {profile.portfolio && profile.portfolio.length > 0 && (
            <div className="saas-card p-6 bg-white space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                Featured Portfolio Projects
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.technologies?.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-blue-600 pt-2 border-t border-slate-200">
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Demo
                        </a>
                      )}
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline text-slate-700"
                        >
                          <Code2 className="w-3.5 h-3.5" /> Source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENT REVIEWS & TESTIMONIALS */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Client Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                No reviews recorded yet for completed contracts.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={rev.rating} size="sm" />
                        <span className="text-xs font-bold text-slate-800">
                          {rev.project?.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">"{rev.comment}"</p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Client: <strong>{rev.reviewer?.name}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Rating Breakdown, Education & Certifications */}
        <div className="space-y-6">
          {/* Quality Breakdown Card */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluation Performance
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Communication</span>
                  <span className="font-bold text-slate-900">
                    {profile.ratingBreakdown?.communication || 5.0}/5.0
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Code Quality</span>
                  <span className="font-bold text-slate-900">
                    {profile.ratingBreakdown?.quality || 5.0}/5.0
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Timeliness</span>
                  <span className="font-bold text-slate-900">
                    {profile.ratingBreakdown?.timeliness || 5.0}/5.0
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Professionalism</span>
                  <span className="font-bold text-slate-900">
                    {profile.ratingBreakdown?.professionalism || 5.0}/5.0
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Education & Certifications
            </h3>

            {profile.education?.map((edu, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-500">{edu.institution} ({edu.year})</div>
                </div>
              </div>
            ))}

            {profile.certifications?.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs pt-3 border-t border-slate-100">
                <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{cert.name}</div>
                  <div className="text-slate-500">{cert.issuer} ({cert.year})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
