import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import {
  ShieldCheck,
  Briefcase,
  Users,
  Bell,
  MessageSquare,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  Award,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications.slice(0, 5));
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'FREELANCER') return '/freelancer/dashboard';
    if (user.role === 'CLIENT') return '/client/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Skill<span className="text-blue-600">Bridge</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/freelancers"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/freelancers' || location.pathname.startsWith('/freelancer')
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Freelancer
              </Link>
              <Link
                to="/projects"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/projects' || location.pathname.startsWith('/client')
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Client
              </Link>
              <Link
                to="/admin/dashboard"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Client Quick Post Project */}
                {user.role === 'CLIENT' && (
                  <Link
                    to="/client/post-project"
                    className="saas-btn-primary text-xs py-2 px-3.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Project
                  </Link>
                )}

                {/* Freelancer Verify Skills Quick CTA */}
                {user.role === 'FREELANCER' && (
                  <Link
                    to="/freelancer/assessments"
                    className="saas-btn-secondary text-xs py-2 px-3.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Award className="w-4 h-4" />
                    Verify a Skill
                  </Link>
                )}

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardLink()}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Messages Shortcut */}
                <Link
                  to={user.role === 'FREELANCER' ? '/freelancer/messages' : '/client/messages'}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Notifications ({unreadCount} unread)
                        </span>
                        <Link
                          to={user.role === 'FREELANCER' ? '/freelancer/notifications' : '/client/notifications'}
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              to={n.link || '#'}
                              onClick={() => setNotifDropdownOpen(false)}
                              className={`block px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors ${
                                !n.isRead ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="font-semibold text-slate-900">{n.title}</div>
                              <div className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>

                      {user.role === 'FREELANCER' && (
                        <>
                          <Link
                            to="/freelancer/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            to="/freelancer/proposals"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase className="w-4 h-4" />
                            My Proposals
                          </Link>
                          <Link
                            to="/freelancer/trial-tasks"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Award className="w-4 h-4" />
                            Trial Tasks
                          </Link>
                        </>
                      )}

                      {user.role === 'CLIENT' && (
                        <>
                          <Link
                            to="/client/projects"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase className="w-4 h-4" />
                            My Projects
                          </Link>
                          <Link
                            to="/client/trial-tasks"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Award className="w-4 h-4" />
                            Trial Tasks
                          </Link>
                        </>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Users className="w-4 h-4" />
                          Manage Users
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="saas-btn-primary text-sm py-2 px-4"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to={user.role === 'FREELANCER' ? '/freelancer/notifications' : '/client/notifications'}
                className="p-2 text-slate-600 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/freelancers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Freelancer
          </Link>
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Client
          </Link>
          <Link
            to="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Admin
          </Link>

          {user ? (
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex items-center gap-3 py-2">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.role}</div>
                </div>
              </div>

              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-700 font-medium"
              >
                Dashboard
              </Link>
              {user.role === 'FREELANCER' && (
                <>
                  <Link
                    to="/freelancer/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    My Profile & Verified Badges
                  </Link>
                  <Link
                    to="/freelancer/proposals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    My Proposals
                  </Link>
                  <Link
                    to="/freelancer/trial-tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    Trial Tasks
                  </Link>
                  <Link
                    to="/freelancer/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    Messages
                  </Link>
                </>
              )}
              {user.role === 'CLIENT' && (
                <>
                  <Link
                    to="/client/post-project"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-blue-600 font-semibold"
                  >
                    + Post New Project
                  </Link>
                  <Link
                    to="/client/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    My Projects & Applicants
                  </Link>
                  <Link
                    to="/client/trial-tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    Trial Tasks
                  </Link>
                  <Link
                    to="/client/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-slate-700"
                  >
                    Messages
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm font-semibold text-rose-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="saas-btn-secondary w-full text-center"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="saas-btn-primary w-full text-center"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
