import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, UserRound } from 'lucide-react';
import { Card } from '../components/common/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleLabel, getRoleColor } from '../utils/permissions.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your officer account details</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-navy-700 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || <UserRound className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">{user?.name || 'User'}</h2>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user?.role)}`}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        <dl className="divide-y divide-slate-100">
          <div className="flex items-center gap-3 py-4">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <dt className="text-xs text-slate-400">Email</dt>
              <dd className="text-sm text-slate-700 break-all">{user?.email || '—'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4">
            <UserRound className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <dt className="text-xs text-slate-400">Officer Position</dt>
              <dd className="text-sm text-slate-700">{getRoleLabel(user?.role) || '—'}</dd>
            </div>
          </div>
        </dl>

        <div className="pt-4 border-t border-slate-100">
          <button onClick={handleLogout} className="btn btn-secondary text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </Card>
    </div>
  );
}
