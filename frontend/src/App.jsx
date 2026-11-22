import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import {
  AdminDashboard,
  UsersPage,
  DepartmentsPage,
  FacultiesPage,
  StudentsPage,
} from './pages/admin/AdminPages';
import {
  OfficerDashboard,
  InvigilatorsPage,
  RoomsPage,
  ModulesPage,
  MakeTimetablePage,
  AssignInvigilatorsPage,
  TimetableAndReportsPage,
} from './pages/officer/OfficerPages';
import InvigilatorPage from './pages/invigilator/InvigilatorPage';
import MobileScannerPage from './pages/invigilator/MobileScannerPage';
import { DasDashboard, DasSchoolsAndProgramsPage } from './pages/das/DasPages';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.user_type || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'examination_officer') return <Navigate to="/officer" replace />;
  if (role === 'invigilator') return <Navigate to="/invigilator" replace />;
  if (role === 'das') return <Navigate to="/das" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Shared Profile Route */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
          <Route path="/admin/faculties" element={<ProtectedRoute><FacultiesPage /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />

          {/* Examination Officer Routes */}
          <Route path="/officer" element={<ProtectedRoute><OfficerDashboard /></ProtectedRoute>} />
          <Route path="/officer/invigilators" element={<ProtectedRoute><InvigilatorsPage /></ProtectedRoute>} />
          <Route path="/officer/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
          <Route path="/officer/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
          <Route path="/officer/make-timetable" element={<ProtectedRoute><MakeTimetablePage /></ProtectedRoute>} />
          <Route path="/officer/assign-invigilators" element={<ProtectedRoute><AssignInvigilatorsPage /></ProtectedRoute>} />
          <Route path="/officer/view-timetable" element={<ProtectedRoute><TimetableAndReportsPage mode="booklets" /></ProtectedRoute>} />
          <Route path="/officer/reports" element={<ProtectedRoute><TimetableAndReportsPage mode="reports" /></ProtectedRoute>} />

          {/* Invigilator Routes */}
          <Route path="/invigilator" element={<ProtectedRoute><InvigilatorPage /></ProtectedRoute>} />
          <Route path="/mobile-scanner" element={<MobileScannerPage />} />

          {/* DAS (Director of Academic Services) Routes */}
          <Route path="/das" element={<ProtectedRoute><DasDashboard /></ProtectedRoute>} />
          <Route path="/das/reports" element={<ProtectedRoute><TimetableAndReportsPage mode="reports" /></ProtectedRoute>} />
          <Route path="/das/invigilators" element={<ProtectedRoute><InvigilatorsPage readOnly /></ProtectedRoute>} />
          <Route path="/das/students" element={<ProtectedRoute><StudentsPage readOnly /></ProtectedRoute>} />
          <Route path="/das/schools" element={<ProtectedRoute><DasSchoolsAndProgramsPage /></ProtectedRoute>} />

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
