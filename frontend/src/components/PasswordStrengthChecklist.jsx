import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/validation';

export default function PasswordStrengthChecklist({ password = '' }) {
  const { checks, passedCount, strengthLabel, strengthColor } = evaluatePasswordStrength(password);

  return (
    <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
      <div className="flex items-center justify-between font-bold">
        <span className="text-slate-600">Password Security Strength:</span>
        <span
          className={`px-2 py-0.5 rounded text-white text-[10px] uppercase ${
            password ? strengthColor : 'bg-slate-400'
          }`}
        >
          {password ? strengthLabel : 'Enter Password'} ({passedCount}/5)
        </span>
      </div>

      {/* 5-segment progress bar */}
      <div className="grid grid-cols-5 gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`rounded-full transition-all ${
              passedCount >= step ? strengthColor : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Checklist items */}
      <ul className="space-y-1 pt-1">
        {checks.map((c) => (
          <li
            key={c.id}
            className={`flex items-center gap-1.5 font-medium ${
              c.passed ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {c.passed ? (
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <Circle size={13} className="text-slate-300 shrink-0" />
            )}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
