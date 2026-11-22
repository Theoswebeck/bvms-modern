import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import UoKLogo from '../../components/UoKLogo';
import PasswordStrengthChecklist from '../../components/PasswordStrengthChecklist';
import { evaluatePasswordStrength, EMAIL_REGEX } from '../../utils/validation';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot-step1' | 'forgot-step2'
  const [viewMode, setViewMode] = useState('login');

  const [email, setEmail] = useState('theoswelbeck@gmail.com');
  const [password, setPassword] = useState('12345');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password State (Email only)
  const [recoverEmail, setRecoverEmail] = useState('theoswelbeck@gmail.com');
  const [resetCode, setResetCode] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [generatedDemoCode, setGeneratedDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);

  const quickRoles = [
    { label: 'Admin', email: 'theoswelbeck@gmail.com', pass: '12345' },
    { label: 'Exam Officer', email: 'jolly@gmail.com', pass: '12345' },
    { label: 'Invigilator', email: 'uwambajebetty@gmail.com', pass: '12345' },
    { label: 'DAS Director', email: 'das@gmail.com', pass: '12345' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid Official Email address (e.g. name@uok.ac.rw).');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      const data = await login(email.trim(), password);
      const role = (data.user.user_type || '').toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'examination_officer') navigate('/officer');
      else if (role === 'invigilator') navigate('/invigilator');
      else if (role === 'das') navigate('/das');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    }
  };

  // Forgot Password Step 1: Request 6-digit OTP via Email only
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!EMAIL_REGEX.test(recoverEmail.trim())) {
      setError('Please enter a valid Official Email address.');
      return;
    }

    setRecoverLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: recoverEmail.trim(),
      });
      setTargetEmail(res.data.email || recoverEmail.trim());
      setEmailPreviewUrl(res.data.emailPreviewUrl || '');
      setGeneratedDemoCode(res.data.demoResetCode || '');
      setResetCode('');
      setSuccessMsg(res.data.message);
      setViewMode('forgot-step2');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find an account with that email address.');
    } finally {
      setRecoverLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP & Set Strong Password
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    const pwEval = evaluatePasswordStrength(newPassword);
    if (!pwEval.isValid) {
      setError('Your new password must satisfy all 5 password strength requirements.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setRecoverLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        identifier: recoverEmail.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });
      setSuccessMsg(res.data.message);
      setEmail(recoverEmail.trim());
      setPassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setViewMode('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem('uok_bvms_token');
    localStorage.removeItem('uok_bvms_user');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#8c1d31] via-[#6d1323] to-[#420a14]">
      <div className="w-full max-w-[940px] min-h-[540px] rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-white/15 bg-white">
        
        {/* Left Panel (5/12): University of Kigali Maroon & Gold Branding */}
        <div className="md:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#6d1323] via-[#590e1c] to-[#3d0812] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-[#e39600]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#29abe2]/15 blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/95 shadow-md border border-[#e39600]/50">
              <UoKLogo variant="sidebar" size="sm" />
            </div>
          </div>

          <div className="relative z-10 my-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white uppercase">
              WELCOME
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-[#e39600] mt-2">
              UoK Booklet Verification System
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-3 leading-relaxed">
              Official digital examination booklet generation, room seating allocation, barcode verification, and academic quality assurance portal of the University of Kigali.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80 font-medium">
            <span>University of Kigali</span>
            <span className="inline-flex items-center gap-1 text-[#e39600] font-semibold">
              <ShieldCheck size={14} />
              Official UoK Portal
            </span>
          </div>
        </div>

        {/* Right Panel (7/12): Sign In OR Forgot Password Recovery Wizard */}
        <div className="md:col-span-7 bg-white p-8 sm:p-11 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">

            {/* ==================== VIEW 1: SIGN IN ==================== */}
            {viewMode === 'login' && (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sign In</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Enter your institutional email credentials to securely access your account.
                </p>

                {successMsg && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@uok.ac.rw"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-[#6d1323] focus:ring-2 focus:ring-[#6d1323]/15 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverEmail(email || 'theoswelbeck@gmail.com');
                          setError('');
                          setSuccessMsg('');
                          setViewMode('forgot-step1');
                        }}
                        className="text-xs font-bold text-[#6d1323] hover:text-[#d58a00] transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-4 pr-11 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-[#6d1323] focus:ring-2 focus:ring-[#6d1323]/15 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-5 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-sm shadow-md shadow-[#6d1323]/20 transition disabled:opacity-60"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>
                </form>

                {/* Quick Demo Role Switcher Pills */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
                    Quick Demo Accounts (Click to Fill &bull; Default Password: 12345)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickRoles.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => {
                          setEmail(r.email);
                          setPassword(r.pass);
                          setError('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center border transition ${
                          email === r.email
                            ? 'bg-[#6d1323]/10 border-[#6d1323] text-[#6d1323] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleClearSession}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                  >
                    Clear saved browser session
                  </button>
                </div>
              </>
            )}

            {/* ==================== VIEW 2: FORGOT PASSWORD (STEP 1 - EMAIL ONLY) ==================== */}
            {viewMode === 'forgot-step1' && (
              <>
                <div className="flex items-center gap-2 text-[#6d1323] mb-2">
                  <KeyRound size={22} />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Account Recovery</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Forgot Password?</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your University of Kigali Official Email address to receive a 6-digit password reset verification code in your email inbox.
                </p>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRequestResetCode} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="e.g. theoswelbeck@gmail.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:bg-white focus:border-[#6d1323]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recoverLoading}
                    className="w-full py-3 px-5 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-sm shadow-md transition disabled:opacity-60"
                  >
                    {recoverLoading ? 'Sending Email...' : 'Send 6-Digit Verification Code'}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setViewMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#6d1323]"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </>
            )}

            {/* ==================== VIEW 3: FORGOT PASSWORD (STEP 2 - VERIFY CODE & SET STRONG PASSWORD) ==================== */}
            {viewMode === 'forgot-step2' && (
              <>
                <div className="flex items-center gap-2 text-[#6d1323] mb-1">
                  <KeyRound size={20} />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Email Verification</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Check Your Email Inbox</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a 6-digit verification code to <strong className="text-[#6d1323]">{targetEmail}</strong>. Enter the code from your email below to reset your password.
                </p>

                {emailPreviewUrl && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex flex-col gap-1.5">
                    <div className="font-bold flex items-center justify-between">
                      <span>📧 Verification Email Dispatched!</span>
                      <a
                        href={emailPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-[11px] shadow-sm transition"
                      >
                        Open Delivered Email &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {!emailPreviewUrl && generatedDemoCode && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                    <div className="font-bold">Offline Fallback Verification Code:</div>
                    <div className="mt-0.5">
                      Code:{' '}
                      <button
                        type="button"
                        onClick={() => setResetCode(generatedDemoCode)}
                        className="font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-white border border-amber-400 text-[#6d1323]"
                      >
                        {generatedDemoCode} (Click to Fill)
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmResetPassword} className="mt-4 space-y-3" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit Verification Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code from email"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 font-mono font-bold text-center tracking-widest text-base text-[#6d1323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Strong Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. UoK@2026!"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs outline-none focus:border-[#6d1323]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <PasswordStrengthChecklist password={newPassword} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-xs outline-none ${
                        confirmNewPassword && confirmNewPassword !== newPassword
                          ? 'border-red-400 bg-red-50'
                          : 'border-slate-300 focus:border-[#6d1323]'
                      }`}
                    />
                    {confirmNewPassword && confirmNewPassword !== newPassword && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={recoverLoading}
                    className="w-full py-2.5 px-5 rounded-lg bg-[#6d1323] hover:bg-[#580f1c] text-white font-bold text-xs shadow-md transition disabled:opacity-60"
                  >
                    {recoverLoading ? 'Updating Password...' : 'Reset Password & Sign In'}
                  </button>
                </form>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setViewMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#6d1323]"
                  >
                    <ArrowLeft size={14} />
                    <span>Cancel &amp; Return to Sign In</span>
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
