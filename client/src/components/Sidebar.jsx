import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const prefix = isAdmin ? '/admin' : '/staff';

  const navItems = [
    {
      to: `${prefix}/dashboard`,
      label: t('dashboard') || 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: `${prefix}/customers`,
      label: t('customers') || 'Customers',
      icon: Users,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin/staff',
            label: t('staff') || 'Staff Management',
            icon: UserCheck,
          },
        ]
      : []),
    {
      to: `${prefix}/tasks`,
      label: t('tasks') || 'Tasks',
      icon: CheckSquare,
    },
    ...(isAdmin
      ? [
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
    <aside className="w-72 bg-white flex flex-col justify-between fixed h-full z-20 border-r border-[#E5E2DC] p-6 select-none">
      <div>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 px-3 group">
          <div className="w-9 h-9 bg-[#2D3A2D] rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 shadow-md shadow-[#2D3A2D]/20">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1A1A1A] group-hover:text-[#2D3A2D] transition-colors">
            Veltrix<span className="text-[#4A5D4E]">CRM</span>
          </span>
        </Link>

        {/* Menu Title */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-[0.2em] mb-4 mt-6 px-4 opacity-50">
            {t('main_menu')}
          </p>

          {/* Navigation Links */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item-veltrix ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Staff Profile or Admin Plan Link */}
      <div className="mt-auto pt-6">
        {isAdmin ? (
          <div className="bg-[#F5F3EF] p-5 rounded-[24px] relative overflow-hidden border border-[#E5E2DC]">
            <div className="flex items-center gap-1.5 mb-1 text-[#2D3A2D]">
              <Sparkles className="w-3.5 h-3.5 text-[#9B5A46]" />
              <h4 className="font-bold text-xs">Workspace Plan</h4>
            </div>
            <p className="text-[10px] text-[#706F6C] mb-3 leading-relaxed">
              Manage your subscription and team features.
            </p>
            <Link
              to="/pricing"
              className="w-full bg-[#2D3A2D] text-white text-[10px] font-bold py-2.5 rounded-xl hover:opacity-90 transition block text-center shadow-sm"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <div className="bg-[#F5F3EF] p-4 rounded-[24px] border border-[#E5E2DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{user?.name || 'Staff User'}</h4>
              </div>
              <p className="text-[10px] text-[#706F6C] truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#2D3A2D] bg-[#2D3A2D]/10 px-2 py-0.5 rounded">
                Staff Portal
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
