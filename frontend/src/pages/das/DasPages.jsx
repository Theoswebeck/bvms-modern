import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  FileBarChart,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';
import { DepartmentsPage, FacultiesPage } from '../admin/AdminPages';

export function DasDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const submissionRate = stats?.totalAllocatedBooklets
    ? Math.round((stats.submittedBooklets / stats.totalAllocatedBooklets) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Director of Academic Services (DAS) Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time oversight of examination attendance, booklet submission rates, invigilator deployments, and academic schools
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: Audit Live</span>
          </div>
          <Link
            to="/das/reports"
            className="px-4 py-2 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-xs shadow transition"
          >
            Full Audit Reports &rarr;
          </Link>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/das/invigilators" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#0c2340] text-[#d4af37] flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0c2340]">{stats?.invigilators ?? '...'}</div>
          <div className="text-sm font-bold text-slate-700">Examination Invigilators</div>
          <div className="text-xs text-slate-400">Active Supervisors</div>
        </Link>

        <Link to="/das/students" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-[#007a3d] text-white flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0c2340]">{stats?.students ?? '...'}</div>
          <div className="text-sm font-bold text-slate-700">Registered Students</div>
          <div className="text-xs text-slate-400">Across {stats?.faculties ?? 0} Degree Programs</div>
        </Link>

        <Link to="/das/schools" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0c2340]">{stats?.departments ?? '...'}</div>
          <div className="text-sm font-bold text-slate-700">UoK Schools &amp; Faculties</div>
          <div className="text-xs text-slate-400">{stats?.modules ?? 0} Active Modules</div>
        </Link>

        <Link to="/das/reports" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="w-11 h-11 rounded-xl bg-indigo-800 text-white flex items-center justify-center">
            <FileBarChart size={20} />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#007a3d]">{submissionRate}%</div>
          <div className="text-sm font-bold text-slate-700">Booklet Submission Rate</div>
          <div className="text-xs text-slate-400">
            {stats?.submittedBooklets ?? 0} of {stats?.totalAllocatedBooklets ?? 0} Verified
          </div>
        </Link>
      </div>
    </div>
  );
}

export function DasSchoolsAndProgramsPage() {
  return (
    <div className="space-y-8">
      <DepartmentsPage readOnly />
      <FacultiesPage readOnly />
    </div>
  );
}
