import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import api from '../services/api.js';
import { Bell, Globe, ChevronDown, Check, Trash2, Search, X } from 'lucide-react';

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { locale, setLocale, t, languages } = useLanguage();
  const { addEventListener } = useRealtime();

  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const langDropdownRef = useRef(null);

  const currentLang = languages?.find((l) => l.code === locale) || {
    code: 'en',
    label: 'English',
    native: 'English',
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = (languages || []).filter((l) => {
    const q = langSearch.toLowerCase();
    return (
      l.label.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const regionalLangs = filteredLanguages.filter((l) => l.region === 'Regional');
  const globalLangs = filteredLanguages.filter((l) => l.region === 'Global');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Quiet fail if not authenticated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      try {
        await api.post('/notifications/read-all');
        setUnreadCount(0);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to mark notifications read', err);
      }
    }
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-20 border-b border-[#E5E2DC]/60">
      <div className="flex-1"></div>

      <div className="flex items-center space-x-6">
        {/* Language Dropdown with Google Translate & 20+ Regional Languages */}
        <div className="relative notranslate" ref={langDropdownRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E5E2DC] rounded-full text-xs font-bold text-[#1A1A1A] hover:border-[#2D3A2D] transition-all shadow-sm cursor-pointer notranslate"
            title="Select Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#2D3A2D]" />
            <span className="font-semibold notranslate">{currentLang.native}</span>
            <ChevronDown className={`w-3 h-3 text-[#706F6C] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5E2DC] z-50 overflow-hidden animate-in fade-in duration-150 notranslate">
              {/* Header & Search */}
              <div className="p-3 bg-[#F8F8F6] border-b border-[#E5E2DC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 notranslate">
                    <Globe className="w-3.5 h-3.5 text-[#2D3A2D]" />
                    <span>Select Language / భాష / भाषा</span>
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Hindi, Telugu, Tamil, French..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E2DC] rounded-xl text-xs outline-none focus:border-[#2D3A2D] placeholder-[#706F6C] notranslate"
                  />
                  {langSearch && (
                    <button
                      onClick={() => setLangSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#706F6C] hover:text-[#1A1A1A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Languages List */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-3">
                {/* Regional Languages */}
                {regionalLangs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider px-2 py-1">
                      Indian Regional Languages ({regionalLangs.length})
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {regionalLangs.map((lang) => {
                        const isSelected = locale === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLocale(lang.code);
                              setLangOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D3A2D] text-white font-bold'
                                : 'hover:bg-[#F5F3EF] text-[#1A1A1A]'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <p className="text-xs font-semibold truncate leading-tight">{lang.native}</p>
                              <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#706F6C]'}`}>
                                {lang.label}
                              </p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Global Languages */}
                {globalLangs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider px-2 py-1 border-t border-[#E5E2DC]/80 pt-2">
                      Global Languages ({globalLangs.length})
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {globalLangs.map((lang) => {
                        const isSelected = locale === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLocale(lang.code);
                              setLangOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D3A2D] text-white font-bold'
                                : 'hover:bg-[#F5F3EF] text-[#1A1A1A]'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <p className="text-xs font-semibold truncate leading-tight">{lang.native}</p>
                              <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#706F6C]'}`}>
                                {lang.label}
                              </p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredLanguages.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#706F6C]">
                    No matching languages found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="relative p-2 text-[#706F6C] hover:text-[#2D3A2D] transition-colors"
            title={t('notifications')}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#9B5A46] rounded-full border-2 border-white"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E5E2DC] z-50 overflow-hidden">
              <div className="p-4 px-5 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]">
                <h4 className="heading-editorial text-sm font-bold text-[#1A1A1A]">
                  {t('notifications')}
                </h4>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-[#9B5A46] hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('clear_all')}</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E2DC]/50">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id)}
                      className={`p-4 hover:bg-[#FBFBF9] transition-colors cursor-pointer ${
                        n.is_read ? 'opacity-60' : 'bg-[#FBFBF9]/30'
                      }`}
                    >
                      <h5 className="text-xs font-bold text-[#1A1A1A] leading-tight">
                        {n.title}
                      </h5>
                      <p className="text-[11px] text-[#706F6C] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] font-bold text-[#706F6C]/70 mt-2 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#706F6C] text-xs">
                    {t('no_notifications')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#2D3A2D] font-bold overflow-hidden border border-[#E5E2DC] shadow-sm">
            <span className="text-sm font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-[#1A1A1A] leading-tight">
              {user?.name}
            </p>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2D3A2D]/10 text-[#2D3A2D]">
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="text-[10px] text-[#706F6C] hover:text-[#9B5A46] transition font-bold uppercase tracking-wider"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
