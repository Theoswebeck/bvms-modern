import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, Edit3, X, Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PasswordStrengthChecklist from '../../components/PasswordStrengthChecklist';
import {
  evaluatePasswordStrength,
  NAME_REGEX,
  EMAIL_REGEX,
  RWANDA_PHONE_REGEX,
} from '../../utils/validation';

export default function ProfilePage() {
  const { user, updateUserState } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [firstname, setFirstname] = useState(user?.firstname || '');
  const [lastname, setLastname] = useState(user?.lastname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [fieldErrors, setFieldErrors] = useState({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pwError, setPwError] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    const errors = {};
    if (!NAME_REGEX.test(firstname.trim())) {
      errors.firstname = 'First name must be at least 2 letters (letters only).';
    }
    if (!NAME_REGEX.test(lastname.trim())) {
      errors.lastname = 'Last name must be at least 2 letters (letters only).';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid UoK or personal email address.';
    }
    if (!RWANDA_PHONE_REGEX.test(telephone.trim())) {
      errors.telephone = 'Enter a valid 10-digit Rwanda phone number (e.g. 0788123456).';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await api.put('/auth/profile', {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      });
      updateUserState({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      });
      setMsg(res.data.message);
      setEditMode(false);
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setPwError('');

    if (!currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }

    const pwEval = evaluatePasswordStrength(newPassword);
    if (!pwEval.isValid) {
      setPwError('Your new password must meet all 5 security requirements below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      updateUserState({ must_change_password: false });
      setMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModal(false);
    } catch (error) {
      setPwError(error.response?.data?.error || 'Failed to change password');
    }
  };

  const admissionNo = user?.id === 1 ? '2405001064' : `240500106${user?.id || 1}`;
  const roleTitle = {
    admin: 'MSCIT-23 - Master of Science in Information Technology (System Administrator)',
    examination_officer: 'Examinations Office - Chief Examination Officer',
    invigilator: 'Academic Quality Assurance - Examination Invigilator',
    das: 'Office of the DVC Academics - Director of Academic Services (DAS)',
  }[(user?.user_type || '').toLowerCase()] || user?.user_type;

  const detailsRows = [
    { label: 'Admission / Staff No:', value: admissionNo },
    { label: 'Full Name:', value: `${user?.firstname} ${user?.lastname}` },
    { label: 'Campus:', value: 'MAIN CAMPUS (KACYIRU)' },
    { label: 'Session:', value: 'WEEKEND / DAY' },
    { label: 'Intake / Academic Year:', value: '2025-2026' },
    { label: 'System Role:', value: (user?.user_type || '').toUpperCase() },
    { label: 'Gender:', value: 'Verified Staff' },
    { label: 'Phone Number:', value: user?.telephone || '0788878180' },
    { label: 'UoK Email Address:', value: user?.email },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setEditMode(false)}
          className="px-4 py-2 rounded-lg bg-[#29abe2] hover:bg-[#1e97cb] text-white text-xs font-semibold shadow-sm"
        >
          View your details
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFieldErrors({});
              setEditMode(!editMode);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#6d1323]"
          >
            <Edit3 size={14} />
            <span>{editMode ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
          <button
            onClick={() => {
              setPwError('');
              setPasswordModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white text-xs font-bold"
          >
            <Lock size={14} />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}
      {err && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{err}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Avatar Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7 text-center">
          <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-[#6d1323] to-[#d58a00] text-white flex items-center justify-center text-3xl font-extrabold shadow-md border-4 border-slate-100">
            {user?.firstname?.[0]}{user?.lastname?.[0]}
          </div>

          <div className="mt-4 text-xl font-bold text-slate-800 tracking-wide">
            {admissionNo}
          </div>

          <div className="mt-3 text-xs font-medium text-[#2ea843] leading-relaxed text-left">
            {roleTitle}
          </div>

          <hr className="my-5 border-slate-100" />

          <div className="text-left">
            <button
              onClick={() => {
                setPwError('');
                setPasswordModal(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#e84c64] hover:bg-[#d63b53] text-white text-xs font-semibold shadow-sm transition"
            >
              Security &amp; Password
            </button>
          </div>
        </div>

        {/* Right Details Table Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7">
          {!editMode ? (
            <div className="divide-y divide-slate-100">
              {detailsRows.map((row) => (
                <div key={row.label} className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-4 font-semibold text-[#29abe2]">
                    {row.label}
                  </div>
                  <div className="sm:col-span-8 font-medium text-slate-800">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs" noValidate>
              <h3 className="text-sm font-bold text-[#6d1323] border-b pb-2">
                Update Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.firstname ? 'border-red-400 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.firstname && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.firstname}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.lastname ? 'border-red-400 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.lastname && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.lastname}</p>}
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">UoK Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Phone Number (10 digits) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="0788123456"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    fieldErrors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.telephone && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.telephone}</p>}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Change Modal with Full Strength Validation */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#6d1323]">Change UoK Portal Password</h3>
              <button onClick={() => setPasswordModal(false)}><X size={18} /></button>
            </div>

            {pwError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs" noValidate>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Current Password <span className="text-red-500">*</span></label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">New Strong Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. UoK@2026!"
                    className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrengthChecklist password={newPassword} />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300'
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">Passwords do not match.</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#6d1323] text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
