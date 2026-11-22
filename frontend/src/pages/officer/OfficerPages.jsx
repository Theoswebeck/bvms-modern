import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  BookOpen,
  DoorOpen,
  CalendarCheck,
  QrCode,
  Plus,
  Edit3,
  Trash2,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';
import BookletViewerModal from '../../components/BookletViewerModal';
import DataTable from '../../components/DataTable';
import {
  validateUserForm,
  validateRoomForm,
  validateModuleForm,
} from '../../utils/validation';

// ==================== 1. EXAMINATION OFFICER DASHBOARD ====================
export function OfficerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    {
      title: 'Invigilators',
      value: stats?.invigilators ?? '...',
      sub: 'Assigned Examination Supervisors',
      icon: UserCheck,
      link: '/officer/invigilators',
      color: 'from-[#6d1323] to-[#580f1c]',
    },
    {
      title: 'Examination Rooms',
      value: stats?.rooms ?? '...',
      sub: 'Kacyiru & Musanze Exam Halls',
      icon: DoorOpen,
      link: '/officer/rooms',
      color: 'from-[#007a3d] to-emerald-700',
    },
    {
      title: 'Academic Modules',
      value: stats?.modules ?? '...',
      sub: 'Registered Examination Courses',
      icon: BookOpen,
      link: '/officer/modules',
      color: 'from-amber-600 to-amber-700',
    },
    {
      title: 'Allocated Booklets',
      value: stats?.totalAllocatedBooklets ?? '...',
      sub: `${stats?.submittedBooklets ?? 0} Submitted / Verified`,
      icon: QrCode,
      link: '/officer/view-timetable',
      color: 'from-indigo-700 to-indigo-900',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Examination Officer Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule exams, allocate students to rooms, assign invigilators, and generate barcoded A4 examination booklets
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: System Operational</span>
          </div>
          <Link
            to="/officer/make-timetable"
            className="px-4 py-2 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-xs shadow transition"
          >
            + Create Timetable
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.link}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center shadow`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-bold text-[#6d1323] group-hover:underline">Open &rarr;</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-slate-900">{c.value}</div>
              <div className="text-sm font-bold text-slate-700 mt-0.5">{c.title}</div>
              <div className="text-xs text-slate-400">{c.sub}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 2. INVIGILATORS PAGE (DATATABLE) ====================
export function InvigilatorsPage({ readOnly = false }) {
  const [invigilators, setInvigilators] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', telephone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/officer/invigilators').then((res) => setInvigilators(res.data.invigilators)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(form, false);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/officer/invigilators/${editing.invigilator_id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/officer/invigilators', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save invigilator' });
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invigilator ${inv.firstname} ${inv.lastname}?`)) return;
    try {
      await api.delete(`/officer/invigilators/${inv.invigilator_id}`);
      setAlert({ type: 'success', text: 'Invigilator deleted successfully' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: 'Failed to delete invigilator' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'invigilator_id',
      render: (_r, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
    },
    {
      header: 'First Name',
      accessor: 'firstname',
      render: (inv) => <span className="font-bold text-slate-900">{inv.firstname}</span>,
    },
    {
      header: 'Last Name',
      accessor: 'lastname',
      render: (inv) => <span className="font-bold text-slate-900">{inv.lastname}</span>,
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
  ];

  if (!readOnly) {
    columns.push({
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (inv) => (
        <>
          <button
            onClick={() => {
              setEditing(inv);
              setForm({
                firstname: inv.firstname,
                lastname: inv.lastname,
                email: inv.email,
                telephone: inv.telephone,
              });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(inv)}
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
          <h2 className="text-xl font-extrabold text-slate-900">University of Kigali Examination Invigilators</h2>
          <p className="text-xs text-slate-500">
            Registering an invigilator automatically creates their staff login account (Default password: 12345).
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setEditing(null);
              setForm({ firstname: '', lastname: '', email: '', telephone: '' });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
          >
            <Plus size={16} />
            <span>Add Invigilator</span>
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
        data={invigilators}
        keyField="invigilator_id"
        searchPlaceholder="Search invigilators..."
        exportFileName="UoK_Invigilators"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Invigilator' : 'Register New Invigilator'}
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
                <label className="block font-bold text-slate-600 mb-1">Telephone (10 digits, e.g. 0788123456) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.telephone && <p className="text-[11px] text-red-600 mt-1">{formErrors.telephone}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  Save Invigilator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 3. EXAMINATION ROOMS PAGE (DATATABLE) ====================
export function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ room: '', numberofstudent: 30 });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/officer/rooms').then((res) => setRooms(res.data.rooms)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRoomForm(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/officer/rooms/${editing.room_id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/officer/rooms', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save room' });
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete room ${r.room}?`)) return;
    try {
      await api.delete(`/officer/rooms/${r.room_id}`);
      setAlert({ type: 'success', text: 'Room deleted' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: 'Could not delete room' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'room_id',
      render: (_r, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
    },
    {
      header: 'Examination Room Name',
      accessor: 'room',
      render: (r) => <span className="font-bold text-slate-900">{r.room}</span>,
    },
    {
      header: 'Maximum Seating Capacity',
      accessor: 'numberofstudent',
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
          {r.numberofstudent} Students Max
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (r) => (
        <>
          <button
            onClick={() => {
              setEditing(r);
              setForm({ room: r.room, numberofstudent: r.numberofstudent });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(r)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Examination Rooms &amp; Capacities</h2>
          <p className="text-xs text-slate-500">Manage Kacyiru and Musanze campus examination halls and maximum student seating limits.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ room: '', numberofstudent: 30 });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
        >
          <Plus size={16} />
          <span>Register Exam Room</span>
        </button>
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
        data={rooms}
        keyField="room_id"
        searchPlaceholder="Search examination rooms..."
        exportFileName="UoK_Exam_Rooms"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Examination Room' : 'Register Examination Room'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Room Name / Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kacyiru Block A - Room 105"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.room ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.room && <p className="text-[11px] text-red-600 mt-1">{formErrors.room}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Maximum Student Capacity (1–500) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={form.numberofstudent}
                  onChange={(e) => setForm({ ...form, numberofstudent: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.numberofstudent ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.numberofstudent && <p className="text-[11px] text-red-600 mt-1">{formErrors.numberofstudent}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 4. ACADEMIC MODULES PAGE (DATATABLE) ====================
export function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ module_code: '', module_name: '', dep_id: '', fac_id: '', year: 1 });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/officer/modules').then((res) => setModules(res.data.modules)).catch(console.error);
    api.get('/admin/departments').then((res) => setDepartments(res.data.departments)).catch(console.error);
    api.get('/admin/faculties').then((res) => setFaculties(res.data.faculties)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFaculties = form.dep_id
    ? faculties.filter((f) => Number(f.dep_id) === Number(form.dep_id))
    : faculties;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateModuleForm(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editing) {
        const res = await api.put(`/officer/modules/${editing.id}`, form);
        setAlert({ type: 'success', text: res.data.message });
      } else {
        const res = await api.post('/officer/modules', form);
        setAlert({ type: 'success', text: res.data.message });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Failed to save module' });
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete module ${m.module_code}?`)) return;
    try {
      await api.delete(`/officer/modules/${m.id}`);
      setAlert({ type: 'success', text: 'Module deleted' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: 'Could not delete module' });
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'id',
      render: (_r, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
    },
    {
      header: 'Module Code',
      accessor: 'module_code',
      render: (m) => <span className="font-mono font-bold text-[#6d1323]">{m.module_code}</span>,
    },
    {
      header: 'Module Title',
      accessor: 'module_name',
      render: (m) => <span className="font-bold text-slate-900">{m.module_name}</span>,
    },
    {
      header: 'School',
      accessor: 'dep_abbreviation',
      cellClassName: 'text-slate-600 font-semibold',
    },
    {
      header: 'Program',
      accessor: 'fac_abbreviation',
      render: (m) => (
        <span className="px-2 py-0.5 rounded bg-[#6d1323]/10 text-[#6d1323] font-bold">
          {m.fac_abbreviation}
        </span>
      ),
    },
    {
      header: 'Year',
      accessor: 'year',
      render: (m) => <span className="font-bold">Year {m.year}</span>,
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1.5',
      render: (m) => (
        <>
          <button
            onClick={() => {
              setEditing(m);
              setForm({
                module_code: m.module_code,
                module_name: m.module_name,
                dep_id: m.dep_id,
                fac_id: m.fac_id,
                year: m.year,
              });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(m)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Academic Examination Modules</h2>
          <p className="text-xs text-slate-500">Courses &amp; modules linked to specific University of Kigali Schools, Programs, and Years.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              module_code: '',
              module_name: '',
              dep_id: departments[0]?.dep_id || 1,
              fac_id: faculties[0]?.fac_id || 1,
              year: 1,
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1323] text-white text-xs font-bold"
        >
          <Plus size={16} />
          <span>Register Module</span>
        </button>
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
        data={modules}
        keyField="id"
        searchPlaceholder="Search modules..."
        exportFileName="UoK_Modules"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#6d1323]">
                {editing ? 'Edit Academic Module' : 'Register New Academic Module'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Module Code (e.g. CIT3101) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.module_code}
                  onChange={(e) => setForm({ ...form, module_code: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border font-mono ${formErrors.module_code ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.module_code && <p className="text-[11px] text-red-600 mt-1">{formErrors.module_code}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Module Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.module_name}
                  onChange={(e) => setForm({ ...form, module_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${formErrors.module_name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {formErrors.module_name && <p className="text-[11px] text-red-600 mt-1">{formErrors.module_name}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">School / Department</label>
                <select
                  required
                  value={form.dep_id}
                  onChange={(e) => {
                    const depId = e.target.value;
                    const firstFac = faculties.find((f) => Number(f.dep_id) === Number(depId));
                    setForm({ ...form, dep_id: depId, fac_id: firstFac ? firstFac.fac_id : '' });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {departments.map((d) => (
                    <option key={d.dep_id} value={d.dep_id}>{d.abbreviation} - {d.dep_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Program / Option</label>
                <select
                  required
                  value={form.fac_id}
                  onChange={(e) => setForm({ ...form, fac_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
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
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold">
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 5. MAKE TIMETABLE & ALLOCATE STUDENTS PAGE (DATATABLE) ====================
export function MakeTimetablePage() {
  const [rooms, setRooms] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectionForm, setSelectionForm] = useState({
    room_id: '',
    module_code: '',
    exam_date: '2026-11-20',
  });

  const [eligibilityData, setEligibilityData] = useState(null);
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    api.get('/officer/rooms').then((res) => {
      setRooms(res.data.rooms);
      if (res.data.rooms.length > 0) {
        setSelectionForm((prev) => ({ ...prev, room_id: res.data.rooms[0].room_id }));
      }
    });
    api.get('/officer/modules').then((res) => {
      setModules(res.data.modules);
      if (res.data.modules.length > 0) {
        setSelectionForm((prev) => ({ ...prev, module_code: res.data.modules[0].module_code }));
      }
    });
  }, []);

  const handleCheckStudents = async (e) => {
    if (e) e.preventDefault();
    setAlert(null);
    try {
      const res = await api.get('/officer/eligible-students', { params: selectionForm });
      setEligibilityData(res.data);
      setSelectedRegs([]);
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Could not load eligible students' });
    }
  };

  const handleAutoSelect = () => {
    if (!eligibilityData) return;
    const maxToTake = eligibilityData.remainingCapacity;
    const autoList = eligibilityData.eligibleStudents.slice(0, maxToTake).map((s) => s.reg_number);
    setSelectedRegs(autoList);
  };

  const toggleStudent = (reg) => {
    if (selectedRegs.includes(reg)) {
      setSelectedRegs(selectedRegs.filter((r) => r !== reg));
    } else {
      if (eligibilityData && selectedRegs.length >= eligibilityData.remainingCapacity) {
        setAlert({ type: 'error', text: `Maximum remaining room capacity (${eligibilityData.remainingCapacity}) reached.` });
        return;
      }
      setSelectedRegs([...selectedRegs, reg]);
    }
  };

  const handleAllocateSubmit = async () => {
    if (selectedRegs.length === 0) {
      setAlert({ type: 'error', text: 'Please select at least one student to allocate.' });
      return;
    }
    try {
      const res = await api.post('/officer/timetable', {
        ...selectionForm,
        reg_numbers: selectedRegs,
      });
      setAlert({ type: 'success', text: res.data.message });
      handleCheckStudents();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Allocation failed' });
    }
  };

  const eligibleColumns = [
    {
      header: '#',
      accessor: 'id',
      render: (_s, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
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
      header: 'Email',
      accessor: 'email',
      cellClassName: 'text-slate-600',
    },
    {
      header: 'Select Student',
      sortable: false,
      className: 'text-center',
      cellClassName: 'text-center',
      render: (s) => (
        <input
          type="checkbox"
          checked={selectedRegs.includes(s.reg_number)}
          onChange={() => {}}
          className="w-4 h-4 accent-[#6d1323] rounded cursor-pointer"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Create Examination Timetable &amp; Allocate Room Seating</h2>
        <p className="text-xs text-slate-500">
          Select an examination room, academic module, and exam date to assign eligible students and generate unique barcoded booklets.
        </p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)}><X size={15} /></button>
        </div>
      )}

      {/* Step 1: Filter Form */}
      <form onSubmit={handleCheckStudents} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1.5">Examination Room</label>
            <select
              required
              value={selectionForm.room_id}
              onChange={(e) => setSelectionForm({ ...selectionForm, room_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
            >
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room} (Capacity: {r.numberofstudent})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1.5">Academic Module</label>
            <select
              required
              value={selectionForm.module_code}
              onChange={(e) => setSelectionForm({ ...selectionForm, module_code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
            >
              {modules.map((m) => (
                <option key={m.module_code} value={m.module_code}>
                  [{m.module_code}] {m.module_name} ({m.fac_abbreviation} Y{m.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1.5">Examination Date</label>
            <input
              type="date"
              required
              value={selectionForm.exam_date}
              onChange={(e) => setSelectionForm({ ...selectionForm, exam_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-5 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold transition"
            >
              Load Eligible Students
            </button>
          </div>
        </div>
      </form>

      {/* Step 2: Eligible Students DataTable */}
      {eligibilityData && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Eligible Students for <span className="text-[#6d1323]">{eligibilityData.module.module_name} ({eligibilityData.module.module_code})</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {eligibilityData.module.dep_name} &bull; {eligibilityData.module.fac_name} (Year {eligibilityData.module.year}) &bull; Room: <strong>{eligibilityData.room.room}</strong> ({eligibilityData.remainingCapacity} seats available of {eligibilityData.room.numberofstudent})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoSelect}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100"
              >
                <Sparkles size={14} />
                <span>Auto-Fill Room ({Math.min(eligibilityData.eligibleStudents.length, eligibilityData.remainingCapacity)})</span>
              </button>
              <button
                type="button"
                onClick={handleAllocateSubmit}
                disabled={selectedRegs.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white text-xs font-bold disabled:opacity-40"
              >
                <CalendarCheck size={15} />
                <span>Allocate Selected ({selectedRegs.length})</span>
              </button>
            </div>
          </div>

          <DataTable
            columns={eligibleColumns}
            data={eligibilityData.eligibleStudents}
            keyField="id"
            searchPlaceholder="Search eligible students..."
            exportFileName="UoK_Eligible_Students"
            onRowClick={(s) => toggleStudent(s.reg_number)}
            rowClassName={(s) =>
              selectedRegs.includes(s.reg_number) ? 'bg-[#6d1323]/10' : 'hover:bg-slate-50'
            }
            emptyMessage={`All students in this program & year are already allocated on ${eligibilityData.exam_date}.`}
          />
        </div>
      )}
    </div>
  );
}

// ==================== 6. ASSIGN INVIGILATORS TO ROOMS PAGE (DATATABLE) ====================
export function AssignInvigilatorsPage() {
  const [assignments, setAssignments] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ invigilator_id: '', room_id: '', exam_date: '2026-11-20' });
  const [alert, setAlert] = useState(null);

  const loadData = () => {
    api.get('/officer/invigilator-assignments').then((res) => setAssignments(res.data.assignments));
    api.get('/officer/invigilators').then((res) => {
      setInvigilators(res.data.invigilators);
      if (res.data.invigilators.length > 0) {
        setForm((p) => ({ ...p, invigilator_id: p.invigilator_id || res.data.invigilators[0].invigilator_id }));
      }
    });
    api.get('/officer/rooms').then((res) => {
      setRooms(res.data.rooms);
      if (res.data.rooms.length > 0) {
        setForm((p) => ({ ...p, room_id: p.room_id || res.data.rooms[0].room_id }));
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/officer/invigilator-assignments', form);
      setAlert({ type: 'success', text: res.data.message });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.error || 'Could not assign invigilator' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this invigilator assignment?')) return;
    await api.delete(`/officer/invigilator-assignments/${id}`);
    loadData();
  };

  const columns = [
    {
      header: '#',
      accessor: 'id',
      render: (_a, idx) => <span className="text-slate-500 font-semibold">{idx + 1}</span>,
    },
    {
      header: 'Exam Date',
      accessor: 'exam_date',
      render: (a) => <span className="font-bold text-slate-900">{a.exam_date}</span>,
    },
    {
      header: 'Examination Room',
      accessor: 'room',
      render: (a) => <span className="font-bold text-[#6d1323]">{a.room}</span>,
    },
    {
      header: 'Assigned Invigilator',
      accessor: 'firstname',
      render: (a) => <span className="font-bold text-slate-900">{a.firstname} {a.lastname}</span>,
    },
    {
      header: 'Contact',
      accessor: 'email',
      render: (a) => <span className="text-slate-600">{a.email} &bull; {a.telephone}</span>,
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right',
      render: (a) => (
        <button
          onClick={() => handleDelete(a.id)}
          className="p-1.5 rounded-lg bg-red-50 text-red-600"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Assign Invigilators to Examination Rooms</h2>
        <p className="text-xs text-slate-500">Schedule invigilators to supervise specific examination rooms and dates.</p>
      </div>

      {alert && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Invigilator</label>
          <select
            required
            value={form.invigilator_id}
            onChange={(e) => setForm({ ...form, invigilator_id: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
          >
            {invigilators.map((i) => (
              <option key={i.invigilator_id} value={i.invigilator_id}>
                {i.firstname} {i.lastname} ({i.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Examination Room</label>
          <select
            required
            value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
          >
            {rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>{r.room}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Exam Date</label>
          <input
            type="date"
            required
            value={form.exam_date}
            onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold"
          >
            + Assign Invigilator
          </button>
        </div>
      </form>

      <DataTable
        columns={columns}
        data={assignments}
        keyField="id"
        searchPlaceholder="Search room assignments..."
        exportFileName="UoK_Invigilator_Assignments"
      />
    </div>
  );
}

// ==================== 7. VIEW TIMETABLE, PRINT BOOKLETS & SUBMISSION REPORTS (DATATABLE) ====================
export function TimetableAndReportsPage({ mode = 'booklets' }) {
  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [previewPlans, setPreviewPlans] = useState(null);

  const loadPlans = () => {
    api.get('/officer/exam-plans').then((res) => setPlans(res.data.examPlans)).catch(console.error);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const dates = [...new Set(plans.map((p) => p.exam_date))].sort();
  const filteredPlans = plans.filter((p) => {
    if (selectedDate && p.exam_date !== selectedDate) return false;
    if (selectedRoomId && Number(p.room_id) !== Number(selectedRoomId)) return false;
    if (selectedModule && p.module_code !== selectedModule) return false;
    return true;
  });

  const roomsForFilter = [...new Map(plans.map((p) => [p.room_id, { id: p.room_id, name: p.room_name }])).values()];
  const modulesForFilter = [...new Map(plans.map((p) => [p.module_code, { code: p.module_code, name: p.module_name }])).values()];

  const columns = [
    {
      header: 'Seat',
      accessor: 'seat_number',
      render: (p, idx) => <span className="font-bold text-slate-500">#{p.seat_number || idx + 1}</span>,
    },
    {
      header: 'Reg Number',
      accessor: 'reg_number',
      render: (p) => <span className="font-mono font-bold text-[#6d1323]">{p.reg_number}</span>,
    },
    {
      header: 'Candidate Name',
      accessor: 'firstname',
      render: (p) => <span className="font-bold text-slate-900">{p.firstname} {p.lastname}</span>,
    },
    {
      header: 'Program',
      accessor: 'fac_abbreviation',
      render: (p) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
          {p.fac_abbreviation} Y{p.year}
        </span>
      ),
    },
    {
      header: 'Module',
      accessor: 'module_code',
      render: (p) => (
        <span className="font-semibold text-slate-700">
          [{p.module_code}] {p.module_name}
        </span>
      ),
    },
    {
      header: 'Date & Room',
      accessor: 'exam_date',
      render: (p) => (
        <div className="text-slate-600">
          <div className="font-bold text-slate-900">{p.exam_date}</div>
          <div className="text-[11px]">{p.room_name}</div>
        </div>
      ),
    },
    {
      header: 'Invigilator',
      accessor: 'invigilator_name',
      cellClassName: 'text-slate-600',
    },
    {
      header: 'Booklet Status',
      accessor: 'exam_status',
      render: (p) =>
        p.exam_status === 'Submitted' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 size={12} />
            Submitted
          </span>
        ) : p.exam_status === 'Present' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
            Present (In Room)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
            Not Submitted
          </span>
        ),
    },
    {
      header: 'Booklet',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right',
      render: (p) => (
        <button
          onClick={() => setPreviewPlans([p])}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-[11px]"
        >
          <QrCode size={13} />
          <span>Booklet</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {mode === 'booklets'
              ? 'Examination Timetable & Barcoded Booklet Generator'
              : 'University of Kigali Booklet Submission Audit Report'}
          </h2>
          <p className="text-xs text-slate-500">
            Filter by Date, Room, or Module to view student sitting status or batch-print barcoded A4 examination booklets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredPlans.length > 0 && (
            <button
              onClick={() => setPreviewPlans(filteredPlans)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white text-xs font-bold shadow"
            >
              <Printer size={15} />
              <span>Batch Print Booklets ({filteredPlans.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-500 uppercase mb-1">Filter by Exam Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          >
            <option value="">All Exam Dates</option>
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-500 uppercase mb-1">Filter by Room</label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          >
            <option value="">All Examination Rooms</option>
            {roomsForFilter.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-500 uppercase mb-1">Filter by Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          >
            <option value="">All Academic Modules</option>
            {modulesForFilter.map((m) => (
              <option key={m.code} value={m.code}>[{m.code}] {m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedDate('');
              setSelectedRoomId('');
              setSelectedModule('');
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-semibold">Total Scheduled in View</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{filteredPlans.length}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-xs text-emerald-800 font-semibold">Submitted &amp; Verified Booklets</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {filteredPlans.filter((p) => p.exam_status === 'Submitted').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-xs text-red-800 font-semibold">Pending / Not Yet Submitted</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">
            {filteredPlans.filter((p) => p.exam_status !== 'Submitted').length}
          </div>
        </div>
      </div>

      {/* Roster DataTable */}
      <DataTable
        columns={columns}
        data={filteredPlans}
        keyField="id"
        searchPlaceholder="Search candidate Reg No, name, room, module..."
        exportFileName={`UoK_BVMS_Report_${selectedDate || 'All'}`}
      />

      {/* Printable Barcoded Booklet Modal */}
      {previewPlans && (
        <BookletViewerModal
          plans={previewPlans}
          onClose={() => setPreviewPlans(null)}
        />
      )}
    </div>
  );
}
