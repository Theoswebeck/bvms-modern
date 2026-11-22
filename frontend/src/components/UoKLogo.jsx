import React from 'react';

/**
 * University of Kigali Official Emblem & Wordmark Component
 */
export default function UoKLogo({ variant = 'sidebar', size = 'md', light = false }) {
  const isLoginBox = variant === 'login';

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        isLoginBox
          ? 'bg-[#e39600] px-5 py-3.5 rounded-lg shadow-md border border-[#f5b82e]/60 w-full justify-center'
          : ''
      }`}
    >
      {/* Official Crest Shield SVG */}
      <svg
        viewBox="0 0 100 115"
        className={isLoginBox ? 'w-16 h-18 shrink-0' : size === 'sm' ? 'w-9 h-10 shrink-0' : 'w-12 h-14 shrink-0'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Yellow Header Bar with 3 Graduation Caps */}
        <path d="M12 8 H88 L82 26 H18 Z" fill="#e5a000" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* 3 Mortarboards */}
        <polygon points="28,13 35,10 42,13 35,16" fill="#111" />
        <rect x="32" y="15" width="6" height="4" fill="#111" />
        <polygon points="43,13 50,10 57,13 50,16" fill="#111" />
        <rect x="47" y="15" width="6" height="4" fill="#111" />
        <polygon points="58,13 65,10 72,13 65,16" fill="#111" />
        <rect x="62" y="15" width="6" height="4" fill="#111" />

        {/* Left Shield Half (Royal Blue) */}
        <path
          d="M18 26 H50 V92 C32 88 18 75 18 56 Z"
          fill="#1b75bc"
          stroke="#1a1a1a"
          strokeWidth="2.5"
        />
        {/* Right Shield Half (Maroon / Burgundy) */}
        <path
          d="M50 26 H82 V56 C82 75 68 88 50 92 Z"
          fill="#6d1323"
          stroke="#1a1a1a"
          strokeWidth="2.5"
        />

        {/* Red Rose in Upper Shield */}
        <circle cx="40" cy="43" r="6" fill="#d92027" stroke="#fff" strokeWidth="1.2" />
        <path d="M40 49 V62" stroke="#1f7a3a" strokeWidth="2.2" />

        {/* Open Book in Lower Shield */}
        <path
          d="M27 65 Q38 61 50 67 Q62 61 73 65 L70 78 Q59 74 50 80 Q41 74 30 78 Z"
          fill="#8c6239"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <line x1="50" y1="67" x2="50" y2="80" stroke="#ffffff" strokeWidth="1.8" />

        {/* Bottom Ribbon: "Labour for the future" */}
        <path
          d="M18 96 Q50 104 82 96 L85 106 Q50 114 15 106 Z"
          fill="#e5a000"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      </svg>

      {/* Wordmark Typography */}
      <div className="text-left leading-none">
        <div
          className={`font-serif font-extrabold tracking-tight ${
            light ? 'text-white' : 'text-[#6d1323]'
          } ${isLoginBox ? 'text-2xl sm:text-[26px]' : 'text-sm sm:text-base'}`}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          UNIVERSITY
        </div>
        {/* Divider Rule */}
        <div className={`h-[2px] w-full my-0.5 ${light ? 'bg-[#e39600]' : 'bg-[#1b75bc]'}`} />
        <div
          className="flex items-baseline gap-1"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          <span
            className={`italic font-bold ${
              light ? 'text-[#e39600]' : 'text-[#6d1323]'
            } ${isLoginBox ? 'text-xl sm:text-2xl' : 'text-xs sm:text-sm'}`}
          >
            Of
          </span>
          <span
            className={`font-extrabold tracking-widest ${
              light ? 'text-[#e39600]' : 'text-[#1b75bc]'
            } ${isLoginBox ? 'text-xl sm:text-2xl' : 'text-xs sm:text-sm'}`}
          >
            KIGALI
          </span>
        </div>
      </div>
    </div>
  );
}
