import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  Briefcase,
  Receipt,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const prefix = isAdmin ? '/admin' : '/staff';

  const navItems = [
    {
      to: `${prefix}/dashboard`,
      label: t('dashboard') || 'Dashboard',
      icon: LayoutDashboard,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin/pipeline',
            label: 'Deals Tracker',
            icon: Briefcase,
          },
        ]
      : []),
    {
      to: `${prefix}/customers`,
      label: t('customers') || 'Customers',
      icon: Users,
    },
    {
      to: `${prefix}/tasks`,
      label: t('tasks') || 'Tasks',
      icon: CheckSquare,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin/invoices',
            label: 'Invoices & Billing',
            icon: Receipt,
          },
          {
            to: '/admin/staff',
            label: t('staff') || 'Staff Management',
            icon: UserCheck,
          },
          {
            to: '/admin/activity',
            label: 'Activity Logs',
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      to: `${prefix}/analytics`,
      label: t('analytics') || 'Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <aside
      className={`bg-white flex flex-col justify-between fixed top-0 bottom-0 left-0 h-full z-30 border-r border-[#E5E2DC] select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px] p-3' : 'w-72 p-5'
      }`}
    >
      {/* Top Section */}
      <div className={isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}>
        {/* Brand Header */}
        <div
          className={`flex items-center mb-6 transition-all duration-300 ${
            isCollapsed ? 'justify-center' : 'px-2'
          }`}
        >
          <Link
            to={`${prefix}/dashboard`}
            className="flex items-center gap-2.5 group relative cursor-pointer"
            title=""
          >
            <div className="w-10 h-10 bg-[#2D3A2D] rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-md shadow-[#2D3A2D]/20 shrink-0">
              V
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A] group-hover:text-[#2D3A2D] transition-colors whitespace-nowrap animate-in fade-in duration-200">
                Veltrix<span className="text-[#4A5D4E]">CRM</span>
              </span>
            )}

            {/* Smooth Brand Flyout Pill when collapsed on hover */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#2D3A2D] text-white rounded-xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-out border border-white/10">
                <span className="font-black text-sm tracking-tight">
                  Veltrix<span className="text-emerald-400 font-medium">CRM</span>
                </span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#2D3A2D]"></div>
              </div>
            )}
          </Link>
        </div>

        {/* Section Heading (only when expanded) */}
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-[0.2em] mb-3 px-3 opacity-50 animate-in fade-in duration-200">
            {t('main_menu')}
          </p>
        )}

        {/* Navigation Items (Showing logos/icons always with hover flyouts in collapsed mode) */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-xs font-semibold transition-all duration-200 relative group cursor-pointer ${
                    isCollapsed
                      ? 'justify-center w-11 h-11 mx-auto'
                      : 'gap-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#2D3A2D] text-white shadow-sm font-bold'
                      : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#F5F3EF]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    {!isCollapsed && (
                      <span className="truncate whitespace-nowrap animate-in fade-in duration-150">
                        {item.label}
                      </span>
                    )}

                    {/* Smooth Floating Pill when collapsed on hover */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1A1A1A] text-white rounded-xl shadow-xl flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-out font-bold text-xs tracking-wide">
                        <span>{item.label}</span>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1A1A1A]"></div>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Dedicated Big Arrow Button centered, no words, button click only */}
      <div className="mt-auto pt-3 border-t border-[#E5E2DC]/80 overflow-visible">
        <div className="space-y-3">
          {/* User profile row when expanded */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-1 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#F5F3EF] border border-[#E5E2DC] text-[#2D3A2D] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#1A1A1A] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#706F6C] uppercase tracking-wider">
                  {isAdmin ? 'Admin' : 'Staff'}
                </p>
              </div>
            </div>
          )}

          {/* Big Centered Arrow Button in VeltrixCRM Color (#2D3A2D), No Text */}
          <div className="relative group">
            <button
              onClick={toggleSidebar}
              className={`rounded-xl bg-[#2D3A2D] hover:bg-[#3D4F3D] text-white flex items-center justify-center shadow-md hover:scale-[1.05] active:scale-95 transition-all cursor-pointer ${
                !isCollapsed ? 'w-full h-11' : 'w-11 h-11 mx-auto'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-6 h-6 text-white stroke-[2.5]" />
              ) : (
                <ChevronLeft className="w-6 h-6 text-white stroke-[2.5]" />
              )}
            </button>

            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#2D3A2D] text-white rounded-xl shadow-xl flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-out font-bold text-xs tracking-wide">
                <span>Expand Sidebar</span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#2D3A2D]"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
