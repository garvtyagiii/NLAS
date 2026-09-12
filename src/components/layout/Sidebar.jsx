import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Bell, LogOut, UserRound,
  Map, Shield, FileText, Users, X, Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleLabel, getRoleColor } from '../../utils/permissions.js';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: UserRound, label: 'Profile' },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'active' : ''}`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">NLAS</p>
            <p className="text-slate-500 text-[10px] leading-tight">National Land Acquisition</p>
          </div>
        </div>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800">
        {user && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${getRoleColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/30"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 flex flex-col">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
