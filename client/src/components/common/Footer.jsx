import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Skill<span className="text-blue-600">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Skill-verified freelancer marketplace. Connecting vetted technical talent with real projects through transparent skill benchmarking and trial evaluations.
            </p>
          </div>

          {/* Col 2: For Clients */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Clients
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/freelancers" className="hover:text-blue-600 transition-colors">
                  Find Verified Freelancers
                </Link>
              </li>
              <li>
                <Link to="/client/post-project" className="hover:text-blue-600 transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-blue-600 transition-colors">
                  Smart Skill Matching
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Trial Task System</span>
              </li>
            </ul>
          </div>

          {/* Col 3: For Freelancers */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Freelancers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/projects" className="hover:text-blue-600 transition-colors">
                  Discover Projects
                </Link>
              </li>
              <li>
                <Link to="/freelancer/assessments" className="hover:text-blue-600 transition-colors">
                  Take Skill Verification Test
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600 transition-colors">
                  Create Professional Profile
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Milestone Workspace</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Standards */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Platform Standards
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Objective technical testing with anti-cheat protection</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Escrow-ready milestone collaboration workspaces</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Pre-hire trial task verification mechanism</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillBridge Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for modern high-reliability engineering teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
