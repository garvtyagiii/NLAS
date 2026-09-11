import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { alertApi } from '../../services/alertApi.js';

export function Topbar({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    alertApi.getAlerts()
      .then(res => setUnread(res.data?.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search (placeholder) */}
      <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search projects..."
          className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value) {
              navigate(`/projects?search=${encodeURIComponent(e.target.value)}`);
            }
          }}
        />
      </div>

      <div className="flex-1" />

      {/* Alert bell */}
      <button
        onClick={() => navigate('/alerts')}
        className="relative w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Alerts"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-2 pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name?.split(' ')[0]}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name?.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
}
