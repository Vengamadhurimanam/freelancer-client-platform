import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Zap,
  Code2,
  FileCheck2,
  Briefcase,
  Users,
  ChevronRight,
  TrendingUp,
  Star,
  Layers,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Skill-Verified Freelancer Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Connect <span className="text-blue-600">Verified Skills</span> With Real Projects
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Find trusted freelancers based on verified skills, project compatibility and real performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/freelancers"
                className="saas-btn-primary w-full sm:w-auto text-base py-3.5 px-7 shadow-sm"
              >
                Find Freelancers
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/projects"
                className="saas-btn-secondary w-full sm:w-auto text-base py-3.5 px-7"
              >
                Find Projects
              </Link>
            </div>

            {/* Quick Hero Proof Points */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-100 max-w-2xl mx-auto text-slate-600 text-xs">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Anti-Cheat Technical Testing</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Transparent Skill Matching</span>
              </div>
              <div className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Pre-Hire Trial Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mb-1">94%</div>
              <div className="text-xs sm:text-sm text-slate-300">Project Success Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">10,000+</div>
              <div className="text-xs sm:text-sm text-slate-300">Verified Skill Badges</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">0%</div>
              <div className="text-xs sm:text-sm text-slate-300">Fake Skill Claims</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 mb-1">&lt; 48 hrs</div>
              <div className="text-xs sm:text-sm text-slate-300">Average Match-to-Hire Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW SKILLBRIDGE WORKS */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">How SkillBridge Works</p>
            <p className="text-sm text-slate-600 mt-3">A deterministic 4-stage pipeline eliminating guesswork from technical hiring.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="saas-card p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Skill Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Freelancers complete timed technical assessments. Passing scores generate verified badges (Intermediate, Advanced, Expert).
              </p>
            </div>

            <div className="saas-card p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Smart Skill Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a client posts requirements, our rule-based algorithm ranks applicants by verified skill match percentage.
              </p>
            </div>

            <div className="saas-card p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Trial Task Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clients assign short practical trial tasks to shortlisted candidates before making a final commitment.
              </p>
            </div>

            <div className="saas-card p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Milestone Workspace</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work collaboratively inside dedicated workspaces with deliverables tracking, Socket chat, and escrow milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SKILL VERIFICATION & 5. SMART MATCHING SPOTLIGHT */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4 border border-emerald-200">
                <Award className="w-4 h-4" />
                Unique Core Feature
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Objective Skill Benchmarking Instead of Unverified Claims
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                On generic platforms, anyone can add 50 skills to their bio. SkillBridge enforces technical verification tests created by senior software engineers.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="badge-verified-expert">Expert (90-100%)</div>
                  <span className="text-xs text-slate-700">Top 5% mastery in architecture, optimization & edge cases</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="badge-verified-advanced">Advanced (80-89%)</div>
                  <span className="text-xs text-slate-700">Production-ready engineering with deep framework fluency</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="badge-verified-intermediate">Intermediate (70-79%)</div>
                  <span className="text-xs text-slate-700">Solid fundamental grasp with practical building capability</span>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/freelancers" className="saas-btn-primary text-sm">
                  View Verified Freelancer Profiles
                </Link>
              </div>
            </div>

            {/* Visual Matching Card Mockup */}
            <div className="saas-card p-6 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Telehealth Consultation Dashboard</h4>
                  <p className="text-xs text-slate-500">Project Requirements Match Score</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  96% Match
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">React.js Requirement</span>
                    <span className="text-emerald-600 font-bold">Verified (96%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Node.js Requirement</span>
                    <span className="text-blue-600 font-bold">Verified (92%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">MongoDB Requirement</span>
                    <span className="text-amber-600 font-bold">Verified (88%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Algorithm: Verified Weights + Rating + History</span>
                <span className="font-semibold text-blue-600">Deterministic Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRIAL TASK EVALUATION SYSTEM */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Zero-Risk Hiring</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Pre-Hire Trial Tasks</p>
            <p className="text-sm text-slate-600 mt-3">
              Test candidate coding style, communication, and responsiveness on a small 1–2 day trial task before committing full project funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">1. Client Assigns Task</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Define task deliverables, deadline, and acceptance criteria (e.g., "Build a responsive login form with client validation").
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">2. Freelancer Submits Work</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Freelancer provides GitHub repository links, live demo URL, and architecture notes for evaluation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">3. Review & Hire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client evaluates code quality, assigns an approval score, and transitions directly into the full project workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 & 8. FREELANCER & CLIENT CALL TO ACTION CARDS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="saas-card p-8 bg-white border-blue-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">For Freelancers</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Tired of competing with unverified low-ball profiles? Take technical assessments, prove your mastery, and get ranked at the top of client proposal lists.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Earn permanent Verified Skill Badges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Direct matching with high-budget SaaS projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Milestone-protected workspace and deliverables
                  </li>
                </ul>
              </div>
              <Link to="/register" className="saas-btn-primary text-sm w-full text-center">
                Join as Freelancer & Verify Skills
              </Link>
            </div>

            <div className="saas-card p-8 bg-white border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">For Clients</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Stop sifting through 100 unqualified proposals. Get matched with pre-assessed software engineers whose capabilities are verified by test metrics.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Smart rule-based skill match scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Optional trial tasks before signing agreements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Built-in real-time chat & milestone approvals
                  </li>
                </ul>
              </div>
              <Link to="/client/post-project" className="saas-btn-primary text-sm w-full text-center bg-slate-900 hover:bg-slate-800">
                Post Project & Find Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Reviews</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Trusted by High-Growth Teams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="saas-card p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                "The verified React badge gave us 100% confidence. Alex delivered our HIPAA consultation portal on time with zero architectural flaws."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Sarah Jenkins</div>
                  <div className="text-[11px] text-slate-500">VP Eng, Apex Health Technologies</div>
                </div>
              </div>
            </div>

            <div className="saas-card p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                "Trial task evaluation saved us hundreds of wasted hours. We evaluated 2 candidates on a practical micro-component and hired the top performer immediately."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80"
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Marcus Vance</div>
                  <div className="text-[11px] text-slate-500">Founder, NexGen Fintech Labs</div>
                </div>
              </div>
            </div>

            <div className="saas-card p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                "As a senior developer, SkillBridge gave me the credibility I deserved. Clients immediately trust my 96% score and I win higher-value contracts."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Alex Rivera</div>
                  <div className="text-[11px] text-slate-500">Expert Verified Freelancer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Got Questions?</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the Skill Verification assessment work?',
                a: 'Freelancers take timed technical multiple-choice assessments covering real engineering scenarios, architecture decisions, and code snippets. Scores are categorized into Expert (90-100%), Advanced (80-89%), and Intermediate (70-79%). Passing awards an official badge on your profile.',
              },
              {
                q: 'How is the Smart Skill Match percentage calculated?',
                a: 'Our rule-based engine compares the specific required and preferred skills on a project against a freelancer’s verified test scores, experience level, and past rating history. It is completely transparent and deterministic.',
              },
              {
                q: 'What is the Trial Task system?',
                a: 'Before signing a large project contract, clients can create a small trial task (such as building a component or diagnosing a query) for shortlisted candidates. This lets clients verify real-world code quality with zero hiring risk.',
              },
              {
                q: 'How does the Milestone Workspace protect both parties?',
                a: 'Projects are structured into sequential milestones. Clients fund milestones, freelancers submit deliverables with code repository and demo links, and clients approve or request revisions before funds are released.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="saas-card overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transform transition-transform ${
                      openFaq === idx ? 'rotate-90 text-blue-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to Experience Verified Freelancing?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Create an account today to verify your skills or find top-rated software engineers for your next project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-blue-600 font-bold px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Get Started Now
            </Link>
            <Link
              to="/projects"
              className="w-full sm:w-auto bg-blue-700 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-blue-800 transition-colors border border-blue-500"
            >
              Browse Open Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
