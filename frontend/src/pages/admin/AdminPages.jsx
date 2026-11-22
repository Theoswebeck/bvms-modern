import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PasswordStrengthChecklist from '../../components/PasswordStrengthChecklist';
import {
  validateUserForm,
  validateDepartmentForm,
  validateFacultyForm,
  validateStudentForm,
} from '../../utils/validation';

// ==================== 1. ADMIN DASHBOARD ====================
export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const totalBooklets = stats?.totalAllocatedBooklets || 0;
  const submitted = stats?.submittedBooklets || 0;
  const present = stats?.presentBooklets || 0;
  const pending = Math.max(0, totalBooklets - submitted - present);

  const pctSubmitted = totalBooklets ? Math.round((submitted / totalBooklets) * 100) : 0;
  const pctPresent = totalBooklets ? Math.round((present / totalBooklets) * 100) : 0;
  const pctPending = totalBooklets ? Math.round((pending / totalBooklets) * 100) : 0;

  const kpiCards = [
    {
      label: 'TOTAL USERS',
      value: stats?.users ?? '...',
      sub: 'Registered staff users',
      icon: Users,
      link: '/admin/users',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'STUDENTS',
      value: stats?.students ?? '...',
      sub: 'Total enrolled',
      icon: GraduationCap,
      link: '/admin/students',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'UOK SCHOOLS',
      value: stats?.departments ?? '...',
      sub: 'Academic departments',
      icon: Building2,
      link: '/admin/departments',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'PROGRAMS',
      value: stats?.faculties ?? '...',
      sub: 'Degree options',
      icon: BookOpen,
      link: '/admin/faculties',
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'ALLOCATED BOOKLETS',
      value: stats?.totalAllocatedBooklets ?? '...',
      sub: 'Scheduled exam sittings',
      icon: CheckCircle2,
      link: '/admin/students',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'SUBMITTED SCRIPTS',
      value: stats?.submittedBooklets ?? '...',
      sub: 'Verified by invigilators',
      icon: CheckCircle2,
      link: '/admin/students',
      iconBg: 'bg-rose-50 text-[#6d1323]',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top White Header Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            System Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage users, monitor examination booklet verification, and oversee University of Kigali academic registries
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status: System Operational</span>
        </div>
      </div>

      {/* 6 Compact KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.link}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-[#6d1323]/30 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 leading-tight">
                  {c.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{c.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3 Secondary Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Active Examination Modules</span>
            <BookOpen size={15} className="text-slate-400" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">{stats?.modules ?? 6}</div>
          <div className="mt-1.5 text-[11px] font-semibold text-emerald-600">
            &#8599; +100% ready for current semester
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Active Invigilators &amp; Rooms</span>
            <Users size={15} className="text-slate-400" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {stats?.invigilators ?? 3} <span className="text-sm font-normal text-slate-400">in {stats?.rooms ?? 4} Rooms</span>
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-emerald-600">
            &#8599; Kacyiru &amp; Musanze Campuses
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Avg Barcode Verification Time</span>
            <CheckCircle2 size={15} className="text-slate-400" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">&lt; 1 sec</div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            Instant Code128 &amp; Reg. Number lookup
          </div>
        </div>
      </div>

      {/* Booklet Verification Status Distribution Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            Booklet Verification Status Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Current breakdown of all allocated examination booklets by verification status
          </p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6d1323]" />
                Submitted &amp; Verified Booklets
              </span>
              <span>{submitted} ({pctSubmitted}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#6d1323] rounded-full transition-all" style={{ width: `${pctSubmitted}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e39600]" />
                Present in Exam Room (Checked-In)
              </span>
              <span>{present} ({pctPresent}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#e39600] rounded-full transition-all" style={{ width: `${pctPresent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                Scheduled / Pending Submission
              </span>
              <span>{pending} ({pctPending}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pctPending}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 2. USERS MANAGEMENT (DATATABLE) ====================
export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', telephone: '', user_type: 'examination_officer', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadUsers = () => {
    api.get('/admin/users').then((res) => setUsers(res.data.users)).catch(console.error);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormErrors({});
    setForm({ firstname: '', lastname: '', email: '', telephone: '', user_type: 'examination_officer', password: '' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setFormErrors({});
    setForm({
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      telephone: u.telephone,
      user_type: u.user_type,
      password: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(form, !editing);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/admin/users/${editing.id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/admin/users', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Action failed' });
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user ${u.firstname} ${u.lastname}?`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      setAlert({ type: 'success', text: 'User deleted successfully' });
      loadUsers();
    } catch (err) {
      setAlert({ type: 'error', text: 'Could not delete user' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'id',
      render: (_row, idx) => <span className="font-semibold text-slate-500">{idx + 1}</span>,
    },
    {
      header: 'First Name',
      accessor: 'firstname',
      render: (u) => <span className="font-bold text-slate-900">{u.firstname}</span>,
    },
    {
      header: 'Last Name',
      accessor: 'lastname',
      render: (u) => <span className="font-bold text-slate-900">{u.lastname}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
      cellClassName: 'text-slate-600',
    },
    {
      header: 'Phone',
      accessor: 'telephone',
      cellClassName: 'text-slate-600',
    },
    {
      header: 'Role',
      accessor: 'user_type',
      render: (u) => (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#6d1323]/10 text-[#6d1323] uppercase">
          {u.user_type}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (u) => (
        <>
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(u)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">System Staff Users</h2>
          <p className="text-xs text-slate-500">Manage University of Kigali Examination Officers, DAS, Invigilators, and Admins.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white text-xs font-bold shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Staff User</span>
        </button>
      </div>

      {alert && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{alert.text}</span>
          </div>
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        keyField="id"
        searchPlaceholder="Search staff users..."
        exportFileName="UoK_Staff_Users"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Staff User' : 'Register New Staff User'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.firstname}
                  onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.firstname ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.firstname && <p className="text-[11px] text-red-600 mt-1">{formErrors.firstname}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.lastname}
                  onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.lastname ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.lastname && <p className="text-[11px] text-red-600 mt-1">{formErrors.lastname}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.email && <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Phone Number (10 digits, e.g. 0788123456) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.telephone && <p className="text-[11px] text-red-600 mt-1">{formErrors.telephone}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">User Role <span className="text-red-500">*</span></label>
                <select
                  value={form.user_type}
                  onChange={(e) => setForm({ ...form, user_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="examination_officer">Examination Officer</option>
                  <option value="DAS">Director of Academic Services (DAS)</option>
                  <option value="Invigilator">Invigilator</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              {!editing && (
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Custom Initial Password (Optional &bull; Leave blank for default 12345)
                  </label>
                  <input
                    type="password"
                    value={form.password || ''}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Optional strong initial password"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  {formErrors.password && <p className="text-[11px] text-red-600 mt-1">{formErrors.password}</p>}
                  {form.password && <PasswordStrengthChecklist password={form.password} />}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold"
                >
                  {editing ? 'Update User' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 3. SCHOOLS / DEPARTMENTS PAGE (DATATABLE) ====================
export function DepartmentsPage({ readOnly = false }) {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ abbreviation: '', dep_name: '' });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/admin/departments').then((res) => setDepartments(res.data.departments)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateDepartmentForm(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/admin/departments/${editing.dep_id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/admin/departments', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save department' });
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete ${d.dep_name}?`)) return;
    try {
      await api.delete(`/admin/departments/${d.dep_id}`);
      setAlert({ type: 'success', text: 'School / Department deleted' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Cannot delete' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'dep_id',
      render: (_r, idx) => <span className="font-semibold text-slate-500">{idx + 1}</span>,
    },
    {
      header: 'Abbreviation',
      accessor: 'abbreviation',
      render: (d) => (
        <span className="px-2.5 py-1 rounded-md bg-[#6d1323] text-[#e39600] font-bold">
          {d.abbreviation}
        </span>
      ),
    },
    {
      header: 'School / Department Name',
      accessor: 'dep_name',
      render: (d) => <span className="font-bold text-slate-900">{d.dep_name}</span>,
    },
  ];

  if (!readOnly) {
    columns.push({
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (d) => (
        <>
          <button
            onClick={() => {
              setEditing(d);
              setForm({ abbreviation: d.abbreviation, dep_name: d.dep_name });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(d)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">University of Kigali Schools &amp; Departments</h2>
          <p className="text-xs text-slate-500">Academic schools across University of Kigali campuses.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setEditing(null);
              setForm({ abbreviation: '', dep_name: '' });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
          >
            <Plus size={16} />
            <span>Add School / Department</span>
          </button>
        )}
      </div>

      {alert && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={departments}
        keyField="dep_id"
        searchPlaceholder="Search schools & departments..."
        exportFileName="UoK_Schools"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit School / Department' : 'Add School / Department'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Abbreviation (e.g. SCIT, SBM, SL) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.abbreviation}
                  onChange={(e) => setForm({ ...form, abbreviation: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.abbreviation ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.abbreviation && <p className="text-[11px] text-red-600 mt-1">{formErrors.abbreviation}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">School / Department Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.dep_name}
                  onChange={(e) => setForm({ ...form, dep_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.dep_name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.dep_name && <p className="text-[11px] text-red-600 mt-1">{formErrors.dep_name}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  Save School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 4. PROGRAMS / FACULTIES PAGE (DATATABLE) ====================
export function FacultiesPage({ readOnly = false }) {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ abbreviation: '', fac_name: '', dep_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/admin/faculties').then((res) => setFaculties(res.data.faculties)).catch(console.error);
    api.get('/admin/departments').then((res) => setDepartments(res.data.departments)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateFacultyForm(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/admin/faculties/${editing.fac_id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/admin/faculties', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save program' });
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete ${f.fac_name}?`)) return;
    try {
      await api.delete(`/admin/faculties/${f.fac_id}`);
      setAlert({ type: 'success', text: 'Program deleted' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Cannot delete' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'fac_id',
      render: (_r, idx) => <span className="font-semibold text-slate-500">{idx + 1}</span>,
    },
    {
      header: 'Code',
      accessor: 'abbreviation',
      render: (f) => (
        <span className="px-2.5 py-1 rounded-md bg-[#6d1323]/10 text-[#6d1323] font-bold">
          {f.abbreviation}
        </span>
      ),
    },
    {
      header: 'Program / Option Name',
      accessor: 'fac_name',
      render: (f) => <span className="font-bold text-slate-900">{f.fac_name}</span>,
    },
    {
      header: 'Parent School',
      accessor: 'dep_name',
      render: (f) => <span className="text-slate-600">{f.dep_name} ({f.dep_abbreviation})</span>,
    },
  ];

  if (!readOnly) {
    columns.push({
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (f) => (
        <>
          <button
            onClick={() => {
              setEditing(f);
              setForm({ abbreviation: f.abbreviation, fac_name: f.fac_name, dep_id: f.dep_id });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(f)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Academic Programs &amp; Degree Options</h2>
          <p className="text-xs text-slate-500">Undergraduate and Honours degree programs linked to UoK Schools.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setEditing(null);
              setForm({ abbreviation: '', fac_name: '', dep_id: departments[0]?.dep_id || '' });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
          >
            <Plus size={16} />
            <span>Add Degree Program</span>
          </button>
        )}
      </div>

      {alert && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={faculties}
        keyField="fac_id"
        searchPlaceholder="Search academic programs..."
        exportFileName="UoK_Academic_Programs"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Program / Option' : 'Add Program / Option'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Parent School / Department <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.dep_id}
                  onChange={(e) => setForm({ ...form, dep_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.dep_id ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                >
                  <option value="">Select School</option>
                  {departments.map((d) => (
                    <option key={d.dep_id} value={d.dep_id}>{d.dep_name} ({d.abbreviation})</option>
                  ))}
                </select>
                {formErrors.dep_id && <p className="text-[11px] text-red-600 mt-1">{formErrors.dep_id}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Program Code (e.g. BIT, BCS, BBA-FIN) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.abbreviation}
                  onChange={(e) => setForm({ ...form, abbreviation: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.abbreviation ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.abbreviation && <p className="text-[11px] text-red-600 mt-1">{formErrors.abbreviation}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Program Full Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.fac_name}
                  onChange={(e) => setForm({ ...form, fac_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.fac_name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.fac_name && <p className="text-[11px] text-red-600 mt-1">{formErrors.fac_name}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 5. STUDENTS REGISTRY PAGE (DATATABLE) ====================
export function StudentsPage({ readOnly = false }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    reg_number: '',
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    department: '',
    options: '',
    year: 1,
  });

  const loadData = () => {
    api.get('/admin/students').then((res) => setStudents(res.data.students)).catch(console.error);
    api.get('/admin/departments').then((res) => setDepartments(res.data.departments)).catch(console.error);
    api.get('/admin/faculties').then((res) => setFaculties(res.data.faculties)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFaculties = form.department
    ? faculties.filter((f) => Number(f.dep_id) === Number(form.department))
    : faculties;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStudentForm(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/admin/students/${editing.id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/admin/students', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save student' });
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student ${s.firstname} ${s.lastname} (${s.reg_number})?`)) return;
    try {
      await api.delete(`/admin/students/${s.id}`);
      setAlert({ type: 'success', text: 'Student deleted successfully' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: 'Could not delete student' });
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsed = [];
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length >= 4 && cols[0].toLowerCase() !== 'reg_number') {
          parsed.push({
            reg_number: cols[0],
            firstname: cols[1],
            lastname: cols[2],
            email: cols[3],
            telephone: cols[4] || '0780000000',
            department: Number(cols[5] || 1),
            options: Number(cols[6] || 1),
            year: Number(cols[7] || 1),
          });
        }
      }
      if (parsed.length === 0) {
        setAlert({ type: 'error', text: 'No valid student rows found in CSV' });
        return;
      }
      try {
        const res = await api.post('/admin/students/bulk', { students: parsed });
        setAlert({ type: 'success', text: res.data.message });
        loadData();
      } catch (err) {
        setAlert({ type: 'error', text: 'Bulk CSV import failed' });
      }
    };
    reader.readAsText(file);
  };

  const columns = [
    {
      header: '#',
      accessor: 'id',
      render: (_r, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
    },
    {
      header: 'Reg Number',
      accessor: 'reg_number',
      render: (s) => <span className="font-mono font-bold text-[#6d1323]">{s.reg_number}</span>,
    },
    {
      header: 'First Name',
      accessor: 'firstname',
      render: (s) => <span className="font-bold text-slate-900">{s.firstname}</span>,
    },
    {
      header: 'Last Name',
      accessor: 'lastname',
      render: (s) => <span className="font-bold text-slate-900">{s.lastname}</span>,
    },
    {
      header: 'Email & Phone',
      accessor: 'email',
      render: (s) => (
        <div className="text-slate-600">
          <div>{s.email}</div>
          <div className="text-[11px] text-slate-400">{s.telephone}</div>
        </div>
      ),
    },
    {
      header: 'School',
      accessor: 'dep_abbreviation',
      render: (s) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
          {s.dep_abbreviation || s.dep_name}
        </span>
      ),
    },
    {
      header: 'Program',
      accessor: 'fac_abbreviation',
      render: (s) => (
        <span className="px-2 py-0.5 rounded bg-[#6d1323]/10 text-[#6d1323] font-bold">
          {s.fac_abbreviation || s.fac_name}
        </span>
      ),
    },
    {
      header: 'Year',
      accessor: 'year',
      render: (s) => <span className="font-bold">Year {s.year}</span>,
    },
  ];

  if (!readOnly) {
    columns.push({
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (s) => (
        <>
          <button
            onClick={() => {
              setEditing(s);
              setForm({
                reg_number: s.reg_number,
                firstname: s.firstname,
                lastname: s.lastname,
                email: s.email,
                telephone: s.telephone,
                department: s.department,
                options: s.options,
                year: s.year,
              });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(s)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">University of Kigali Students Registry</h2>
          <p className="text-xs text-slate-500">Enrolled students eligible for examination room allocation and barcoded booklets.</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800">
              <Upload size={15} />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            </label>
            <button
              onClick={() => {
                setEditing(null);
                setForm({
                  reg_number: `UoK/2026/IT/0${students.length + 1}`,
                  firstname: '',
                  lastname: '',
                  email: '',
                  telephone: '',
                  department: departments[0]?.dep_id || 1,
                  options: faculties[0]?.fac_id || 1,
                  year: 1,
                });
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
            >
              <Plus size={16} />
              <span>Register Student</span>
            </button>
          </div>
        )}
      </div>

      {alert && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={students}
        keyField="id"
        searchPlaceholder="Search by Reg Number, Name, School..."
        exportFileName="UoK_Students_Registry"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Student Record' : 'Register New UoK Student'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Registration Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.reg_number}
                  onChange={(e) => setForm({ ...form, reg_number: e.target.value })}
                  placeholder="e.g. UoK/2024/IT/001"
                  className={`w-full px-3 py-2 rounded-lg border font-mono ${formErrors.reg_number ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.reg_number && <p className="text-[11px] text-red-600 mt-1">{formErrors.reg_number}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.firstname ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  {formErrors.firstname && <p className="text-[11px] text-red-600 mt-1">{formErrors.firstname}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.lastname}
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.lastname ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  {formErrors.lastname && <p className="text-[11px] text-red-600 mt-1">{formErrors.lastname}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  {formErrors.email && <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Telephone (10 digits) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  {formErrors.telephone && <p className="text-[11px] text-red-600 mt-1">{formErrors.telephone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">School</label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) => {
                      const depId = e.target.value;
                      const firstFac = faculties.find((f) => Number(f.dep_id) === Number(depId));
                      setForm({ ...form, department: depId, options: firstFac ? firstFac.fac_id : '' });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="">Select School</option>
                    {departments.map((d) => (
                      <option key={d.dep_id} value={d.dep_id}>{d.abbreviation} - {d.dep_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Program</label>
                  <select
                    required
                    value={form.options}
                    onChange={(e) => setForm({ ...form, options: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="">Select Program</option>
                    {filteredFaculties.map((f) => (
                      <option key={f.fac_id} value={f.fac_id}>{f.abbreviation} - {f.fac_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Year of Study</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  {editing ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
