import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';
import api from '../../api/client';
import DataTable from '../../components/DataTable';

export default function InvigilatorPage() {
  const [assignments, setAssignments] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const [scanInput, setScanInput] = useState('');
  const [verifyAction, setVerifyAction] = useState('Submitted');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const scannerRef = useRef(null);

  const loadData = () => {
    api.get('/invigilator/my-schedule').then((res) => {
      setAssignments(res.data.assignments);
      if (res.data.assignments.length > 0 && !selectedDate) {
        setSelectedDate(res.data.assignments[0].exam_date);
        setSelectedRoomId(String(res.data.assignments[0].room_id));
      }
    });
    api.get('/officer/exam-plans').then((res) => setPlans(res.data.examPlans));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let html5QrCode = null;
    if (cameraOpen) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode('uok-camera-reader');
        scannerRef.current = html5QrCode;
        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 120 } },
            (decodedText) => {
              setScanInput(decodedText);
              handleVerifyCode(decodedText);
            },
            () => {}
          )
          .catch((err) => {
            console.warn('Camera start error:', err);
            setAlert({
              type: 'error',
              text: 'Could not access webcam. You can still use a USB barcode scanner or type/click any Registration Number below.',
            });
            setCameraOpen(false);
          });
      });
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraOpen]);

  const handleVerifyCode = async (codeToVerify) => {
    const code = codeToVerify || scanInput;
    if (!code) return;
    setAlert(null);
    try {
      const res = await api.post('/invigilator/verify', {
        room_id: selectedRoomId || undefined,
        exam_date: selectedDate || undefined,
        module_code: selectedModule || undefined,
        code,
        action: verifyAction,
      });
      setAlert({ type: 'success', text: res.data.message });
      setScanInput('');
      loadData();
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.response?.data?.error || 'Student verification failed',
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleVerifyCode(scanInput);
  };

  const assignedDates = [...new Set(assignments.map((a) => a.exam_date))];
  const assignedRoomsForDate = assignments.filter((a) => !selectedDate || a.exam_date === selectedDate);

  const visiblePlans = plans.filter((p) => {
    if (selectedDate && p.exam_date !== selectedDate) return false;
    if (selectedRoomId && Number(p.room_id) !== Number(selectedRoomId)) return false;
    if (selectedModule && p.module_code !== selectedModule) return false;
    return true;
  });

  const modulesInRoom = [...new Map(
    plans
      .filter((p) => (!selectedDate || p.exam_date === selectedDate) && (!selectedRoomId || Number(p.room_id) === Number(selectedRoomId)))
      .map((p) => [p.module_code, { code: p.module_code, name: p.module_name }])
  ).values()];

  const rosterColumns = [
    {
      header: 'Seat',
      accessor: 'seat_number',
      render: (p, idx) => <span className="font-bold text-slate-500">#{p.seat_number || idx + 1}</span>,
    },
    {
      header: 'Reg Number & Serial',
      accessor: 'reg_number',
      render: (p) => (
        <div>
          <div className="font-mono font-bold text-[#6d1323]">{p.reg_number}</div>
          <div className="font-mono text-[10px] text-slate-400">{p.booklet_code}</div>
        </div>
      ),
    },
    {
      header: 'Candidate Name',
      accessor: 'firstname',
      render: (p) => (
        <div className="font-bold text-slate-800">
          {p.firstname} {p.lastname}
          <div className="text-[10px] text-slate-500 font-normal">
            {p.fac_abbreviation} Year {p.year}
          </div>
        </div>
      ),
    },
    {
      header: 'Module & Room',
      accessor: 'module_code',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900">[{p.module_code}] {p.module_name}</div>
          <div className="text-[11px] text-slate-500">{p.room_name} &bull; {p.exam_date}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'exam_status',
      render: (p) =>
        p.exam_status === 'Submitted' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 size={12} />
            Submitted
          </span>
        ) : p.exam_status === 'Present' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
            Present
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
            Not Submitted
          </span>
        ),
    },
    {
      header: 'Quick Verify',
      sortable: false,
      className: 'text-right',
      cellClassName: 'text-right space-x-1',
      render: (p) => (
        <>
          {p.exam_status === 'Not Submitted' && (
            <button
              onClick={async () => {
                await api.post('/invigilator/verify', {
                  code: p.reg_number,
                  room_id: p.room_id,
                  exam_date: p.exam_date,
                  module_code: p.module_code,
                  action: 'Present',
                });
                loadData();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
            >
              Check-In
            </button>
          )}
          {p.exam_status !== 'Submitted' && (
            <button
              onClick={async () => {
                const res = await api.post('/invigilator/verify', {
                  code: p.reg_number,
                  room_id: p.room_id,
                  exam_date: p.exam_date,
                  module_code: p.module_code,
                  action: 'Submitted',
                });
                setAlert({ type: 'success', text: res.data.message });
                loadData();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-[11px]"
            >
              Submit Booklet
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Invigilator Barcode Verification Workbench
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verify student attendance (Booklet Issued) and final booklet submission by scanning the Code128 barcode or entering the Registration Number
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Scanner Ready</span>
          </div>
          <button
            onClick={() => setCameraOpen(!cameraOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-xs shadow transition"
          >
            <Camera size={16} />
            <span>{cameraOpen ? 'Close Camera Scanner' : 'Open Camera Scanner'}</span>
          </button>
        </div>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-sm ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-700" /> : <AlertCircle size={18} className="text-red-600" />}
            <span>{alert.text}</span>
          </div>
          <button onClick={() => setAlert(null)}><X size={16} /></button>
        </div>
      )}

      {cameraOpen && (
        <div className="bg-white rounded-2xl border-2 border-[#6d1323] p-4 shadow-md max-w-md mx-auto text-center">
          <div className="text-xs font-bold text-slate-900 mb-2">
            Point Camera at University of Kigali Booklet Barcode
          </div>
          <div id="uok-camera-reader" className="w-full rounded-xl overflow-hidden bg-slate-900 min-h-[220px]" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Filter & Instant Barcode Verification Box */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b pb-2.5">
              <Calendar size={16} className="text-[#6d1323]" />
              <span>1. Select Assigned Exam Session</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1">Exam Date</label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedModule('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="">All Assigned Dates</option>
                {assignedDates.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1">Assigned Examination Room</label>
              <select
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedModule('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="">All Assigned Rooms</option>
                {assignedRoomsForDate.map((a) => (
                  <option key={a.id} value={a.room_id}>{a.room_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1">Module Filter (Optional)</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="">All Modules in Room</option>
                {modulesInRoom.map((m) => (
                  <option key={m.code} value={m.code}>[{m.code}] {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border-2 border-[#6d1323] p-5 shadow-md space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b pb-2.5">
              <QrCode size={18} className="text-[#6d1323]" />
              <span>2. Verify Student Booklet</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1.5">Verification Stage</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyAction('Present')}
                  className={`py-2 px-3 rounded-lg font-bold border text-center transition ${
                    verifyAction === 'Present'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  1. Check-In (Present)
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyAction('Submitted')}
                  className={`py-2 px-3 rounded-lg font-bold border text-center transition ${
                    verifyAction === 'Submitted'
                      ? 'bg-[#6d1323] text-white border-[#6d1323]'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  2. Submit Booklet
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1">
                Scan Barcode or Enter Reg Number
              </label>
              <input
                type="text"
                required
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="e.g. UoK/2024/IT/002 or UOK-BK-2026-0002"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:border-[#6d1323] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-sm shadow transition"
            >
              Verify &amp; Mark as &ldquo;{verifyAction}&rdquo;
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Live Room Student Roster DataTable */}
        <div className="lg:col-span-2">
          <DataTable
            columns={rosterColumns}
            data={visiblePlans}
            keyField="id"
            searchPlaceholder="Search candidate Reg No, serial, name..."
            exportFileName="UoK_Invigilator_Room_Roster"
            headerRight={
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Submitted: {visiblePlans.filter((p) => p.exam_status === 'Submitted').length}
                </span>
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                  Present: {visiblePlans.filter((p) => p.exam_status === 'Present').length}
                </span>
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Pending: {visiblePlans.filter((p) => p.exam_status === 'Not Submitted').length}
                </span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
