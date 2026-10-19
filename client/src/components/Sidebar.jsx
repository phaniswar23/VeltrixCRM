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
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const prefix = isAdmin ? '/admin' : '/staff';

  const navItems = [
    {
      to: `${prefix}/dashboard`,
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      to: `${prefix}/customers`,
      label: t('customers'),
      icon: Users,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin/staff',
            label: t('staff'),
            icon: UserCheck,
          },
        ]
      : []),
    {
      to: `${prefix}/tasks`,
      label: t('tasks'),
      icon: CheckSquare,
    },
    {
      to: `${prefix}/analytics`,
      label: t('analytics'),
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

      {/* Upgrade Card */}
      <div className="mt-auto pt-6">
        <div className="bg-[#F5F3EF] p-5 rounded-[24px] relative overflow-hidden border border-[#E5E2DC]">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-[#2D3A2D]/5 rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-1.5 mb-1 text-[#2D3A2D]">
            <Sparkles className="w-3.5 h-3.5 text-[#9B5A46]" />
            <h4 className="font-bold text-xs">Upgrade Experience</h4>
          </div>
          <p className="text-[10px] text-[#706F6C] mb-4 leading-relaxed">
            Unlock advanced AI workflows and priority processing.
          </p>
          <Link
            to="/pricing"
            className="w-full bg-[#2D3A2D] text-white text-[10px] font-bold py-2.5 rounded-xl hover:opacity-90 transition block text-center shadow-sm"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
