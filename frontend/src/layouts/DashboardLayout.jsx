import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  DoorOpen,
  CalendarCheck,
  UserCheck,
  QrCode,
  FileBarChart,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Search,
  ChevronDown,
  Disc,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UoKLogo from '../components/UoKLogo';

export default function DashboardLayout({ children }) {
  const { user, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isExpanded = sidebarOpen || sidebarHovered;

  const role = (user?.user_type || '').toLowerCase();

  // Grouped Navigation matching the RWB Control Center reference
  const navGroups = {
    admin: [
      {
        section: 'ADMIN CONTROL CENTER',
        items: [
          { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'User Management', path: '/admin/users', icon: Users },
          { label: 'Schools & Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Academic Programs', path: '/admin/faculties', icon: BookOpen },
        ],
      },
      {
        section: 'REGISTRIES',
        items: [
          { label: 'Students Registry', path: '/admin/students', icon: GraduationCap },
        ],
      },
      {
        section: 'STAFF WORKBENCHES',
        items: [
          { label: 'Personal Profile', path: '/profile', icon: UserCircle },
        ],
      },
    ],
    examination_officer: [
      {
        section: 'OFFICER CONTROL CENTER',
        items: [
          { label: 'System Overview', path: '/officer', icon: LayoutDashboard },
          { label: 'Create Timetable', path: '/officer/make-timetable', icon: CalendarCheck },
          { label: 'Assign Invigilators', path: '/officer/assign-invigilators', icon: ShieldCheck },
          { label: 'Booklets & Barcodes', path: '/officer/view-timetable', icon: QrCode },
          { label: 'Submission Reports', path: '/officer/reports', icon: FileBarChart },
        ],
      },
      {
        section: 'REGISTRIES',
        items: [
          { label: 'Academic Modules', path: '/officer/modules', icon: BookOpen },
          { label: 'Examination Rooms', path: '/officer/rooms', icon: DoorOpen },
          { label: 'Invigilators Registry', path: '/officer/invigilators', icon: UserCheck },
        ],
      },
      {
        section: 'STAFF WORKBENCHES',
        items: [
          { label: 'Personal Profile', path: '/profile', icon: UserCircle },
        ],
      },
    ],
    invigilator: [
      {
        section: 'INVIGILATOR WORKBENCH',
        items: [
          { label: 'Scan & Verify Booklets', path: '/invigilator', icon: QrCode },
        ],
      },
      {
        section: 'STAFF WORKBENCHES',
        items: [
          { label: 'Personal Profile', path: '/profile', icon: UserCircle },
        ],
      },
    ],
    das: [
      {
        section: 'DAS CONTROL CENTER',
        items: [
          { label: 'Executive Overview', path: '/das', icon: LayoutDashboard },
          { label: 'Booklet Audit Reports', path: '/das/reports', icon: FileBarChart },
        ],
      },
      {
        section: 'REGISTRIES',
        items: [
          { label: 'Schools & Programs', path: '/das/schools', icon: Building2 },
          { label: 'Students Directory', path: '/das/students', icon: GraduationCap },
          { label: 'Invigilators Directory', path: '/das/invigilators', icon: UserCheck },
        ],
      },
      {
        section: 'STAFF WORKBENCHES',
        items: [
          { label: 'Personal Profile', path: '/profile', icon: UserCircle },
        ],
      },
    ],
  };

  const groups = navGroups[role] || navGroups.admin;

  const roleBadgeText = {
    admin: 'ADMIN',
    examination_officer: 'OFFICER',
    invigilator: 'INVIGILATOR',
    das: 'DAS',
  }[role] || 'STAFF';

  const roleSwitchAccounts = [
    { label: 'Admin Portal', email: 'theoswelbeck@gmail.com', role: 'admin', path: '/admin' },
    { label: 'Exam Officer Portal', email: 'jolly@gmail.com', role: 'examination_officer', path: '/officer' },
    { label: 'Invigilator Scanner', email: 'uwambajebetty@gmail.com', role: 'invigilator', path: '/invigilator' },
    { label: 'DAS Audit Portal', email: 'das@gmail.com', role: 'das', path: '/das' },
  ];

  const handleQuickRoleSwitch = async (acc) => {
    try {
      await login(acc.email, '12345');
      setDropdownOpen(false);
      navigate(acc.path);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f3f6f9]">
      {/* ==================== 1. FULL-WIDTH TOP HEADER BAR (UoK Maroon #6d1323) ==================== */}
      <header className="no-print h-14 bg-[#6d1323] text-white px-4 sm:px-6 flex items-center justify-between shrink-0 z-40 shadow-sm border-b border-white/10">
        {/* Left: UoK Logo, Sidebar Toggle & System Title */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center pr-2">
            <UoKLogo variant="header" size="sm" light />
          </Link>

          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/90 transition"
            title="Toggle Sidebar Menu"
          >
            <Disc size={20} className="text-[#e39600]" />
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/20">
            <span className="text-sm sm:text-base font-bold tracking-wide text-white">
              UoK Booklet Verification System
            </span>
          </div>
        </div>

        {/* Right: Pill Search Input & User Name + Role Badge Dropdown */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-black/25 hover:bg-black/30 border border-white/15 transition rounded-full px-4 py-1.5 w-64">
            <input
              type="text"
              placeholder="Search booklet, student..."
              className="bg-transparent text-white placeholder-white/70 text-xs outline-none w-full"
            />
            <Search size={14} className="text-white/80 shrink-0" />
          </div>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-white/10 transition"
            >
              <span className="text-xs sm:text-sm font-bold text-white">
                {user?.firstname} {user?.lastname}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-[#e39600] border border-[#e39600]/40">
                {roleBadgeText}
              </span>
              <ChevronDown size={14} className="text-white/80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-[#6d1323]">
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                </div>

                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                    Instant Demo Role Switcher
                  </div>
                  {roleSwitchAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      onClick={() => handleQuickRoleSwitch(acc)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between ${
                        role === acc.role
                          ? 'bg-[#6d1323] text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {role === acc.role && (
                        <span className="text-[10px] bg-[#e39600] text-[#6d1323] font-bold px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Personal Profile &amp; Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================== 2. MIDDLE WORKSPACE (FIXED WHITE SIDEBAR + SCROLLABLE CONTENT) ==================== */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Desktop Sidebar Placeholder wrapper (prevents main content jump on hover) */}
        <div
          className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        />

        {/* Clean White Fixed Left Sidebar with Maroon Accent Border (Mini Icon Rail when collapsed, expands on hover over content) */}
        <aside
          onMouseEnter={() => {
            if (!sidebarOpen) setSidebarHovered(true);
          }}
          onMouseLeave={() => {
            if (!sidebarOpen) setSidebarHovered(false);
          }}
          className={`no-print fixed top-14 bottom-8 left-0 z-30 bg-white border-r-[3px] border-[#6d1323] flex flex-col transition-all duration-200 ease-in-out ${
            mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
          } ${
            sidebarOpen
              ? 'lg:w-64 lg:shadow-none'
              : sidebarHovered
              ? 'lg:w-64 lg:shadow-2xl'
              : 'lg:w-16'
          }`}
        >
          <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[#6d1323]">Navigation Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-slate-500">
              <X size={18} />
            </button>
          </div>

          <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${isExpanded ? 'px-3 space-y-6' : 'px-2 space-y-2'}`}>
            {groups.map((grp) => (
              <div key={grp.section}>
                {isExpanded ? (
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-3 whitespace-nowrap">
                    {grp.section}
                  </div>
                ) : (
                  <div className="h-px bg-slate-100 my-2 mx-2" />
                )}
                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={!isExpanded ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center rounded-lg text-[13px] transition-colors whitespace-nowrap ${
                          isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
                        } ${
                          active
                            ? 'bg-[#6d1323]/10 text-[#6d1323] font-bold'
                            : 'text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          size={19}
                          className={`shrink-0 ${active ? 'text-[#6d1323]' : 'text-slate-700'}`}
                        />
                        {isExpanded && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Sidebar Sign Out Button */}
          <div className="p-2.5 border-t border-slate-100">
            <button
              onClick={handleLogout}
              title={!isExpanded ? 'Sign Out of Portal' : undefined}
              className={`w-full flex items-center rounded-lg text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700 transition whitespace-nowrap ${
                isExpanded ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5'
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {isExpanded && <span>Sign Out of Portal</span>}
            </button>
          </div>
        </aside>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ==================== 3. FULL-WIDTH FIXED BOTTOM FOOTER BAR (UoK Maroon #6d1323) ==================== */}
      <footer className="no-print h-8 bg-[#6d1323] text-white px-5 flex items-center justify-between text-[11px] font-medium shrink-0 z-40 border-t border-white/10">
        <span>
          &copy; {new Date().getFullYear()} University of Kigali (UoK) &bull; Booklet Verification Management System. All rights reserved.
        </span>
        <span className="hidden sm:inline text-[#e39600] font-semibold">
          Republic of Rwanda
        </span>
      </footer>
    </div>
  );
}
