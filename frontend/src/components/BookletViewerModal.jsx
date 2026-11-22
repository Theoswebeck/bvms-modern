import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../api/client';

const ANSWER_PAGES = [1, 2, 3, 4, 5, 6];
const LINES_PER_PAGE = 26;

function SingleBookletView({ plan }) {
  const barcodeText = plan.booklet_code || plan.reg_number;
  const regBarcodeUrl = `${API_BASE_URL}/barcode?value=${encodeURIComponent(plan.reg_number)}`;
  const totalPages = 1 + ANSWER_PAGES.length; // 1 Cover Page + 6 Full A4 Ruled Answer Sheets = 7 A4 Pages

  return (
    <div className="booklet-group">
      {/* ==================== PAGE 1: OFFICIAL UoK A4 COVER PAGE ==================== */}
      <div className="a4-sheet bg-white mx-auto my-6 p-7 shadow-xl border border-slate-300 text-slate-900 flex flex-col justify-between">
        <div className="border-4 border-double border-[#0c2340] p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Top Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0c2340] pb-3.5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#0c2340] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] shrink-0">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-[#0c2340] leading-tight">
                    UNIVERSITY OF KIGALI (UoK)
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#007a3d] mt-0.5">
                    Office of the Deputy Vice-Chancellor (Academics) &bull; Examinations Office
                  </p>
                  <p className="text-[10px] text-slate-500">
                    P.O. Box 2611, Kigali - Rwanda | www.uok.ac.rw
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0c2340] text-[#d4af37] text-[9px] font-bold uppercase tracking-wider">
                  <ShieldCheck size={11} />
                  Verified Exam Script
                </span>
                <div className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                  SERIAL: {barcodeText}
                </div>
                <div className="text-[10px] text-slate-600">
                  Seat No: <strong className="text-[#0c2340]">#{plan.seat_number || 1}</strong> &bull; {totalPages} A4 Pages
                </div>
              </div>
            </div>

            {/* Title Banner */}
            <div className="my-4 py-2.5 px-4 bg-slate-100 border-y-2 border-[#007a3d] text-center">
              <h2 className="text-xl font-black tracking-widest text-[#0c2340] uppercase">
                OFFICIAL EXAMINATION ANSWER BOOKLET
              </h2>
              <p className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wide">
                DO NOT WRITE YOUR NAME ANYWHERE INSIDE THIS BOOKLET &bull; USE REGISTRATION NUMBER ONLY
              </p>
            </div>

            {/* Candidate & Examination Metadata Box (Always 2 columns for A4) */}
            <div className="grid grid-cols-2 gap-4 border-2 border-[#0c2340] rounded-lg p-4 bg-slate-50/60 text-xs">
              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Candidate Registration Number:
                  </span>
                  <span className="text-base font-mono font-extrabold text-[#0c2340]">
                    {plan.reg_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    School / Faculty:
                  </span>
                  <span className="font-bold text-slate-800">
                    {plan.dep_name} ({plan.dep_abbreviation})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Academic Program &amp; Year:
                  </span>
                  <span className="font-bold text-[#007a3d]">
                    {plan.fac_name} ({plan.fac_abbreviation}) &mdash; Year {plan.year}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-l border-slate-300 pl-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Module Code &amp; Title:
                  </span>
                  <span className="font-extrabold text-[#0c2340]">
                    [{plan.module_code}] {plan.module_name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Examination Date:
                    </span>
                    <span className="font-bold text-slate-800">{plan.exam_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Examination Room:
                    </span>
                    <span className="font-bold text-slate-800">{plan.room_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Examiner Final Marks Box:
                  </span>
                  <div className="mt-1 inline-block px-3.5 py-1 border-2 border-red-700 rounded font-extrabold text-sm text-red-800 bg-white">
                    MARKS: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Official Examiner Question-by-Question Marks Grid */}
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase text-[#0c2340] mb-1">
                For Official Use Only &mdash; Examiner&apos;s Marks Breakdown:
              </div>
              <table className="w-full border-collapse text-[11px] text-center">
                <thead>
                  <tr className="bg-slate-100 text-[#0c2340] font-bold">
                    <th className="border border-slate-400 py-1 px-2 text-left">Question No.</th>
                    <th className="border border-slate-400 py-1 w-14">Q1</th>
                    <th className="border border-slate-400 py-1 w-14">Q2</th>
                    <th className="border border-slate-400 py-1 w-14">Q3</th>
                    <th className="border border-slate-400 py-1 w-14">Q4</th>
                    <th className="border border-slate-400 py-1 w-14">Q5</th>
                    <th className="border border-slate-400 py-1 w-14">Q6</th>
                    <th className="border border-slate-400 py-1 w-24 bg-[#0c2340] text-white">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 py-2.5 px-2 text-left font-semibold text-slate-600">
                      Marks Awarded
                    </td>
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5" />
                    <td className="border border-slate-400 py-2.5 font-bold text-slate-400">/ 100</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 py-2 px-2 text-left font-semibold text-slate-600">
                      Moderator Check
                    </td>
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2" />
                    <td className="border border-slate-400 py-2 font-bold text-slate-400">/ 100</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Instructions to Candidate */}
            <div className="mt-4 p-3 rounded border border-slate-300 bg-white text-[10.5px] text-slate-700 space-y-1">
              <div className="font-bold text-[#0c2340] uppercase">
                Instructions to University of Kigali Candidates:
              </div>
              <ol className="list-decimal list-inside space-y-0.5 leading-snug">
                <li>Verify that your Registration Number, Module Code, and Exam Date printed above are accurate before starting.</li>
                <li>Write clearly in blue or black ink on the 6 lined answer pages attached inside this booklet.</li>
                <li>Ensure the Room Invigilator scans the barcode below both upon booklet issuance (Check-In) and upon final submission.</li>
                <li>No examination booklet or answer sheet may be torn out or taken outside the examination room under any circumstances.</li>
              </ol>
            </div>
          </div>

          {/* Bottom Block: Invigilator Sign-Off & Dual Barcodes */}
          <div className="mt-4 pt-3.5 border-t-2 border-slate-300">
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div className="border border-slate-800 p-3 rounded bg-white text-[11px] flex flex-col justify-between space-y-2">
                <div className="font-bold text-[#0c2340] uppercase text-[10.5px]">
                  Assigned Room Invigilator Verification
                </div>
                <div>
                  Invigilator Name:{' '}
                  <strong className="text-slate-900">
                    {plan.invigilator_name || '________________________'}
                  </strong>
                </div>
                <div>Candidate Signature: _______________________</div>
                <div>Invigilator Signature: ______________________</div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 border border-slate-300 rounded space-y-1.5">
                <img
                  src={regBarcodeUrl}
                  alt={`Reg Barcode ${plan.reg_number}`}
                  className="h-14 max-w-full object-contain"
                />
                <span className="text-[9.5px] font-mono font-semibold text-slate-600 uppercase">
                  Scan Registration Number for Live BVMS Verification
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9.5px] text-slate-500">
              <span>University of Kigali (UoK) &bull; Booklet Verification Management System</span>
              <span className="font-bold text-[#0c2340]">Cover Page &bull; Page 1 of {totalPages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAGES 2–7: 6 FULL A4 RULED ANSWER SHEETS ==================== */}
      {ANSWER_PAGES.map((answerPageNum) => {
        const overallPageNum = answerPageNum + 1;
        return (
          <div
            key={answerPageNum}
            className="a4-sheet bg-white mx-auto my-6 p-7 shadow-xl border border-slate-300 text-slate-900 flex flex-col justify-between"
          >
            {/* Running Page Header */}
            <div className="border-b-2 border-[#0c2340] pb-2 mb-3 flex items-center justify-between text-[10.5px]">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0c2340] uppercase tracking-wide">
                  UNIVERSITY OF KIGALI
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-mono font-bold text-[#0c2340]">
                  Reg No: {plan.reg_number}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <span>Module: {plan.module_code}</span>
                <span>Date: {plan.exam_date}</span>
                <span className="px-2 py-0.5 rounded bg-[#0c2340] text-white font-bold">
                  Answer Sheet {answerPageNum} of {ANSWER_PAGES.length}
                </span>
              </div>
            </div>

            {/* Full-Height Ruled Writing Area with Left Question Margin */}
            <div className="flex-1 border border-slate-400 rounded-sm flex flex-col overflow-hidden">
              {/* Column Header Row */}
              <div className="flex border-b border-slate-400 bg-slate-50 text-[9.5px] font-bold uppercase text-slate-600">
                <div className="w-16 shrink-0 border-r-2 border-red-300 py-1.5 text-center">
                  Q. No.
                </div>
                <div className="flex-1 py-1.5 px-3 flex items-center justify-between">
                  <span>Candidate Answer Area (Write legibly within the lines)</span>
                  <span className="font-mono text-[9px] text-slate-400">{barcodeText}</span>
                </div>
              </div>

              {/* 26 Evenly Spaced Ruled Lines Filling the Full A4 Sheet */}
              <div className="flex-1 flex flex-col">
                {Array.from({ length: LINES_PER_PAGE }).map((_, lineIdx) => (
                  <div
                    key={lineIdx}
                    className="flex-1 flex border-b border-slate-200 last:border-b-0"
                  >
                    <div className="w-16 shrink-0 border-r-2 border-red-300" />
                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Running Page Footer */}
            <div className="mt-2.5 pt-1.5 border-t border-slate-300 flex items-center justify-between text-[9.5px] text-slate-500">
              <span>Do not write your name on this sheet &bull; Do not write outside the margins</span>
              <span className="font-bold text-[#0c2340]">
                Page {overallPageNum} of {totalPages} (Answer Sheet {answerPageNum} of {ANSWER_PAGES.length})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BookletViewerModal({ plans, onClose }) {
  if (!plans || plans.length === 0) return null;

  const handlePrint = () => {
    const prevTitle = document.title;
    const safeName =
      plans.length === 1
        ? `UoK_Booklet_${String(plans[0].reg_number).replace(/[^A-Za-z0-9_-]/g, '_')}`
        : `UoK_Booklets_${String(plans[0].room_name || 'Room').replace(/[^A-Za-z0-9_-]/g, '_')}_${plans[0].exam_date || ''}`;
    document.title = safeName;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  const totalSheets = plans.length * (1 + ANSWER_PAGES.length);

  return createPortal(
    <div className="booklet-print-root fixed inset-0 z-50 bg-slate-900/85 overflow-y-auto p-4">
      <div className="booklet-print-wrapper max-w-4xl mx-auto">
        {/* Action Bar (Hidden when printing) */}
        <div className="no-print sticky top-2 z-10 bg-[#0c2340] text-white px-6 py-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-[#d4af37]/40">
          <div>
            <div className="text-xs text-[#d4af37] font-bold uppercase">
              University of Kigali &bull; Official A4 Barcoded Examination Booklet
            </div>
            <div className="text-sm font-bold">
              {plans.length === 1
                ? `Candidate: ${plans[0].firstname} ${plans[0].lastname} (${plans[0].reg_number}) — 7 A4 Pages (Cover + 6 Answer Sheets)`
                : `Batch Printing ${plans.length} Booklets (${totalSheets} A4 Pages) for ${plans[0].room_name}`}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#007a3d] hover:bg-[#006231] text-white text-xs font-bold shadow transition"
            >
              <Printer size={16} />
              <span>Print / Save as PDF ({totalSheets} A4 Pages)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Roster</span>
            </button>
          </div>
        </div>

        {/* Render 1 or All Booklets */}
        <div>
          {plans.map((p) => (
            <SingleBookletView key={p.id} plan={p} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
