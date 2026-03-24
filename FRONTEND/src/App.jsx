import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Pages/Navbar';
import StudentRegister from './Components/Student/StudentRegister';
import StudentLogin from './Components/Student/StudentLogin';
import StudentForgetPassword from './Components/Student/StudentForgetPassword';
import StudentDashboard from './Components/Student/StudentDashboard';
import ComplaintForm from './Components/Student/ComplaintForm';
import StudentExams from './Components/Student/StudentExams';
import StudentNoc from './Components/Student/StudentNoc';

import FacultyRegister from './Components/Faculty/FacultyRegister';
import FacultyLogin from './Components/Faculty/FacultyLogin';
import FacultyForgetPassword from './Components/Faculty/FacultyForgetPassword';
import FacultyDashboard from './Components/Faculty/FacultyDashboard';
import HodDashboard from './Components/Faculty/HodDashboard';
import FacultyExams from './Components/Faculty/FacultyExams';
import FacultyNoc from './Components/Faculty/FacultyNoc';

import HeadRegister from './Components/Head/HeadRegister';
import HeadLogin from './Components/Head/HeadLogin';
import HeadDashboard from './Components/Head/HeadDashboard';

import Home from './Pages/Home';
import Footer from './Components/Footer';
import Contact from './Pages/Contact';
import Terms from './Pages/Terms';
import Privacy from './Pages/Privacy';
import About from './Pages/About';
import Complaints from './Pages/Complaints';
import AdminLogin from './Components/Admin/AdminLogin';
import AdminDashboard from './Components/Admin/AdminDashboard';
import SuperAdminDashboard from './Components/Admin/SuperAdminDashboard';

// Container for pages needing max-width padding
const PageContainer = ({ children }) => (
  <div className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    {children}
  </div>
);

// Protected route guard
const ProtectedRoute = ({ children, roleType }) => {
  const token = localStorage.getItem('token');
  const isStudent = localStorage.getItem('student') !== null;
  const isFaculty = localStorage.getItem('faculty') !== null;
  const isHead = localStorage.getItem('head') !== null;
  const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
  const isAdmin = localStorage.getItem('admin') !== null;
  const isSuperAdmin = adminData.role === 'SuperAdmin';

  if (!token) return <Navigate to={`/${roleType === 'superadmin' ? 'admin' : roleType}/login`} replace />;
  if (roleType === 'superadmin' && !isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (roleType === 'admin' && !isAdmin) return <Navigate to="/admin/login" replace />;
  if (roleType === 'faculty' && !isFaculty) return <Navigate to="/faculty/login" replace />;
  if (roleType === 'head' && !isHead) return <Navigate to="/head/login" replace />;
  if (roleType === 'student' && !isStudent) return <Navigate to="/student/login" replace />;

  return children;
};

// Layout wrapper: Admin routes get NO navbar/footer — they render full-screen
const AppLayout = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  return (
    <div className={isAdminRoute ? '' : 'min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200'}>
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? '' : 'pt-16 pb-0 max-w-none mx-auto'}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/complaints" element={<Complaints />} />

          {/* Student Routes */}
          <Route path="/student/register" element={<PageContainer><StudentRegister /></PageContainer>} />
          <Route path="/student/login" element={<PageContainer><StudentLogin /></PageContainer>} />
          <Route path="/student/forgot-password" element={<PageContainer><StudentForgetPassword /></PageContainer>} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roleType="student">
                <PageContainer><StudentDashboard /></PageContainer>
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route path="/faculty/register" element={<PageContainer><FacultyRegister /></PageContainer>} />
          <Route path="/faculty/login" element={<PageContainer><FacultyLogin /></PageContainer>} />
          <Route path="/faculty/forgot-password" element={<PageContainer><FacultyForgetPassword /></PageContainer>} />
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute roleType="faculty">
                <PageContainer><FacultyDashboard /></PageContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/dashboard"
            element={
              <Navigate to="/head/dashboard" replace />
            }
          />

          {/* Head Routes */}
          <Route path="/head/register" element={<PageContainer><HeadRegister /></PageContainer>} />
          <Route path="/head/login" element={<PageContainer><HeadLogin /></PageContainer>} />
          <Route
            path="/head/dashboard"
            element={
              <ProtectedRoute roleType="head">
                <PageContainer><HeadDashboard /></PageContainer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/complaint/new"
            element={
              <ProtectedRoute roleType="student">
                <PageContainer><ComplaintForm /></PageContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute roleType="student">
                <PageContainer><StudentExams /></PageContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/noc"
            element={
              <ProtectedRoute roleType="student">
                <PageContainer><StudentNoc /></PageContainer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty/exams"
            element={
              <ProtectedRoute roleType="faculty">
                <PageContainer><FacultyExams /></PageContainer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/noc"
            element={
              <ProtectedRoute roleType="faculty">
                <PageContainer><FacultyNoc /></PageContainer>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes — NO Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roleType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute roleType="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <Toaster position="top-right" />
    <AppLayout />
  </Router>
);

export default App;