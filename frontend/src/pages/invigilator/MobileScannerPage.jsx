import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RefreshCw,
  Send,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';

function playScanBeep(success = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = success ? 'sine' : 'sawtooth';
    osc.frequency.value = success ? 920 : 280;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (success ? 0.16 : 0.3));
    osc.start();
    osc.stop(ctx.currentTime + (success ? 0.17 : 0.32));
  } catch {
    // Audio feedback is optional
  }
}

export default function MobileScannerPage() {
  const [searchParams] = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [stats, setStats] = useState({ total: 0, submitted: 0, present: 0, notSubmitted: 0 });
  const [invigilator, setInvigilator] = useState(null);
  const [verifyAction, setVerifyAction] = useState('Submitted');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusBanner, setStatusBanner] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  const scannerRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });
  const verifyActionRef = useRef(verifyAction);
  const soundEnabledRef = useRef(soundEnabled);
  const sessionInfoRef = useRef(sessionInfo);

  useEffect(() => {
    verifyActionRef.current = verifyAction;
  }, [verifyAction]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    sessionInfoRef.current = sessionInfo;
  }, [sessionInfo]);

  const loadSession = useCallback(async () => {
    try {
      const res = await api.get('/invigilator/mobile-session');
      setSessionInfo(res.data.session);
      setStats(res.data.stats);
      setInvigilator(res.data.invigilator);
      if (res.data.session?.action && !sessionInfoRef.current) {
        setVerifyAction(res.data.session.action);
      }
      setAuthError('');
    } catch (err) {
      setAuthError(
        err.response?.data?.error ||
          'Pairing link is invalid or expired. Please scan a fresh QR code from the laptop Invigilator screen.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize token from ?pair=... query param or existing sessionStorage
  useEffect(() => {
    const pairToken = searchParams.get('pair');
    if (pairToken) {
      sessionStorage.setItem('uok_bvms_mobile_token', pairToken);
    }
    const hasToken =
      sessionStorage.getItem('uok_bvms_mobile_token') ||
      localStorage.getItem('uok_bvms_token');

    if (!hasToken) {
      setAuthError('No scanner pairing token found. Please scan the QR code from the laptop Invigilator Workbench.');
      setLoading(false);
      return;
    }

    loadSession();
  }, [searchParams, loadSession]);

  const submitScannedCode = useCallback(
    async (rawCode) => {
      const code = String(rawCode || '').trim();
      if (!code) return;

      // Prevent duplicate rapid scans of the same barcode within 2.5 seconds
      const now = Date.now();
      if (lastScanRef.current.code === code && now - lastScanRef.current.time < 2500) {
        return;
      }
      lastScanRef.current = { code, time: now };

      const currentSession = sessionInfoRef.current;
      const action = verifyActionRef.current;

      try {
        const res = await api.post('/invigilator/verify', {
          room_id: currentSession?.room_id || undefined,
          exam_date: currentSession?.exam_date && currentSession.exam_date !== 'All Dates' ? currentSession.exam_date : undefined,
          module_code: currentSession?.module_code || undefined,
          code,
          action,
        });

        if (soundEnabledRef.current) playScanBeep(true);
        if (navigator.vibrate) navigator.vibrate(140);

        const sitting = res.data.sitting;
        const emailSent = res.data.emailNotification?.sent;
        setStatusBanner({
          type: 'success',
          title: `${sitting.firstname} ${sitting.lastname} (${sitting.reg_number})`,
          detail: `Marked as ${action}${emailSent ? ` • Receipt emailed to ${res.data.emailNotification.toEmail}` : ''}`,
        });

        setRecentScans((prev) => [
          {
            id: `${Date.now()}-${code}`,
            code: sitting.reg_number,
            name: `${sitting.firstname} ${sitting.lastname}`,
            status: action,
            emailSent: Boolean(emailSent),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            ok: true,
          },
          ...prev.slice(0, 14),
        ]);

        setManualCode('');
        loadSession();
      } catch (err) {
        if (soundEnabledRef.current) playScanBeep(false);
        if (navigator.vibrate) navigator.vibrate([100, 60, 100]);

        const msg = err.response?.data?.error || 'Verification failed';
        setStatusBanner({
          type: 'error',
          title: `Scan Rejected: ${code}`,
          detail: msg,
        });

        setRecentScans((prev) => [
          {
            id: `${Date.now()}-${code}`,
            code,
            name: msg,
            status: 'Rejected',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            ok: false,
          },
          ...prev.slice(0, 14),
        ]);
      }
    },
    [loadSession]
  );

  // Start / Stop Rear Camera Scanner
  useEffect(() => {
    if (!cameraActive) return;
    let mounted = true;
    setCameraError('');

    import('html5-qrcode').then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
      if (!mounted) return;
      const html5QrCode = new Html5Qrcode('uok-mobile-camera-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });
      scannerRef.current = html5QrCode;
      html5QrCode
        .start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 290, height: 115 },
            disableFlip: false,
            videoConstraints: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          (decodedText) => {
            const cleaned = String(decodedText || '').trim();
            if (cleaned.length >= 3 && /^[A-Za-z0-9/_-]+$/.test(cleaned)) {
              submitScannedCode(cleaned);
            }
          },
          () => {}
        )
        .catch((err) => {
          console.warn('Mobile camera error:', err);
          setCameraError(
            'Camera blocked or unavailable. Make sure you opened this page via HTTPS (accept the local certificate warning once) and granted camera permission.'
          );
          setCameraActive(false);
        });
    });

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive, submitScannedCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <Smartphone size={36} className="mx-auto text-[#e39600] animate-pulse" />
          <div className="text-sm font-bold">Connecting to UoK BVMS...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-slate-900 border border-red-500/40 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <h1 className="text-base font-extrabold">Mobile Scanner Not Paired</h1>
          <p className="text-xs text-slate-300 leading-relaxed">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10">
      {/* Compact Top Mobile Header */}
      <div className="bg-[#6d1323] border-b-2 border-[#e39600] px-4 py-3.5 sticky top-0 z-20 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#e39600] flex items-center gap-1">
              <ShieldCheck size={12} />
              UoK Mobile Booklet Scanner
            </div>
            <div className="text-sm font-extrabold leading-tight mt-0.5">
              {sessionInfo?.room_name || 'Examination Room'}
            </div>
            <div className="text-[11px] text-white/80">
              {sessionInfo?.exam_date}
              {sessionInfo?.module_code ? ` • ${sessionInfo.module_code}` : ''}
              {invigilator ? ` • ${invigilator.firstname}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="Toggle Beep Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={loadSession}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="Refresh Counts"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Live Room Progress Strip */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
            <div className="text-lg font-black text-emerald-400">{stats.submitted}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Submitted</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
            <div className="text-lg font-black text-amber-400">{stats.present}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Present</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
            <div className="text-lg font-black text-slate-200">{stats.total}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Seated</div>
          </div>
        </div>

        {/* Mode Toggle: Check-In vs Final Submission */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVerifyAction('Present')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
              verifyAction === 'Present'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            1. Check-In (Present)
          </button>
          <button
            type="button"
            onClick={() => setVerifyAction('Submitted')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
              verifyAction === 'Submitted'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            2. Submit Booklet
          </button>
        </div>

        {/* Instant Feedback Banner */}
        {statusBanner && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              statusBanner.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100'
                : 'bg-red-950/90 border-red-500/60 text-red-100'
            }`}
          >
            {statusBanner.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-extrabold">{statusBanner.title}</div>
              <div className="text-[11px] opacity-90 mt-0.5">{statusBanner.detail}</div>
            </div>
          </div>
        )}

        {/* Rear Camera Scanner Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Camera size={15} className="text-[#e39600]" />
              Phone Rear Camera Scanner
            </span>
            <button
              type="button"
              onClick={() => setCameraActive(!cameraActive)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                cameraActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#e39600] hover:bg-[#c98400] text-slate-950'
              }`}
            >
              {cameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-[11px] text-red-200">
              {cameraError}
            </div>
          )}

          {cameraActive ? (
            <div
              id="uok-mobile-camera-reader"
              className="w-full rounded-xl overflow-hidden bg-black min-h-[230px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setCameraActive(true)}
              className="w-full py-10 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#e39600] bg-slate-950/60 flex flex-col items-center justify-center gap-2 transition"
            >
              <Camera size={32} className="text-[#e39600]" />
              <span className="text-xs font-bold text-slate-200">Tap to Open Rear Camera</span>
              <span className="text-[11px] text-slate-400">
                Hold booklet barcode inside the frame — updates database instantly
              </span>
            </button>
          )}
        </div>

        {/* Manual Fallback Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitScannedCode(manualCode);
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or type Reg Number (e.g. UoK/2024/IT/001)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-[#e39600]"
          />
          <button
            type="submit"
            className="px-3.5 py-2.5 rounded-xl bg-[#6d1323] hover:bg-[#82182b] text-white font-bold text-xs inline-flex items-center gap-1"
          >
            <Send size={14} />
            <span>Verify</span>
          </button>
        </form>

        {/* Recent Scans Log */}
        {recentScans.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recent Scans ({recentScans.length})
            </div>
            <div className="space-y-2">
              {recentScans.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-white truncate">{item.code}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.name}
                      {item.emailSent ? ' • Email sent' : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.ok
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
