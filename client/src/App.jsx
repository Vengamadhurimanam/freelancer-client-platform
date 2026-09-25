import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PublicProjectsPage from './pages/PublicProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import PublicFreelancersPage from './pages/PublicFreelancersPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import ProjectWorkspacePage from './pages/ProjectWorkspacePage';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerMyProfile from './pages/freelancer/FreelancerMyProfile';
import FreelancerAssessments from './pages/freelancer/FreelancerAssessments';
import AssessmentTakePage from './pages/freelancer/AssessmentTakePage';
import FreelancerProposals from './pages/freelancer/FreelancerProposals';
import FreelancerTrialTasks from './pages/freelancer/FreelancerTrialTasks';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerNotifications from './pages/freelancer/FreelancerNotifications';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import PostProjectPage from './pages/client/PostProjectPage';
import ClientProjects from './pages/client/ClientProjects';
import ClientProjectProposals from './pages/client/ClientProjectProposals';
import ClientTrialTasks from './pages/client/ClientTrialTasks';
import ClientMessages from './pages/client/ClientMessages';
import ClientNotifications from './pages/client/ClientNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSkillsAssessments from './pages/admin/AdminSkillsAssessments';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/projects" element={<PublicProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/freelancers" element={<PublicFreelancersPage />} />
                <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />

                {/* Collaborative Shared Workspace */}
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER', 'CLIENT', 'ADMIN']}>
                      <ProjectWorkspacePage />
                    </ProtectedRoute>
                  }
                />

                {/* Freelancer Protected Routes */}
                <Route
                  path="/freelancer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/profile"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerMyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/projects"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <PublicProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/assessments"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerAssessments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/assessments/:skillName"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <AssessmentTakePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/proposals"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerProposals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/trial-tasks"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerTrialTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/messages"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['FREELANCER']}>
                      <FreelancerNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* Client Protected Routes */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/post-project"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <PostProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/projects"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/projects/:id"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientProjectProposals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/trial-tasks"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientTrialTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/messages"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <ClientNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/projects"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/skills"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminSkillsAssessments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/assessments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminSkillsAssessments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '13px',
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
