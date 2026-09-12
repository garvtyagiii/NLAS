import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { INDIA_STATES_AND_UTS } from '../utils/locations.js';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FIELD_OFFICER'], {
    required_error: 'Select your officer position',
  }),
  state: z.string().optional(),
}).superRefine((values, context) => {
  if (values.role === 'STATE_OFFICER' && !values.state) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['state'], message: 'Select your state' });
  }
});

const DEMO_CREDENTIALS = [
  { role: 'Central Officer', roleValue: 'CENTRAL_OFFICER', name: 'Central Officer', email: 'rajesh.sharma@nlas.gov.in', password: 'Demo@1234' },
  { role: 'State Officer', roleValue: 'STATE_OFFICER', name: 'State Officer', email: 'state.officer@nlas.gov.in', password: 'Demo@1234', state: 'Uttar Pradesh' },
  { role: 'District Officer', roleValue: 'DISTRICT_OFFICER', name: 'District Officer', email: 'district.officer@nlas.gov.in', password: 'Demo@1234' },
  { role: 'Field Officer', roleValue: 'FIELD_OFFICER', name: 'Field Officer', email: 'field.officer@nlas.gov.in', password: 'Demo@1234' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.code === 'INVALID_CREDENTIALS') {
        setApiError('Invalid email or password. Please try again.');
      } else if (err?.code === 'NETWORK_ERROR') {
        setApiError('Unable to connect to the server. Check your connection.');
      } else {
        setApiError(err?.message || 'Login failed. Please try again.');
      }
    }
  };

  const fillDemo = (cred) => {
    setValue('name', cred.name);
    setValue('email', cred.email);
    setValue('password', cred.password);
    setValue('role', cred.roleValue);
    setValue('state', cred.state || '');
    setApiError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-navy-950 to-slate-800 p-12 relative overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-navy-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">NLAS</p>
              <p className="text-slate-400 text-xs">National Land Acquisition System</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
            Digital Platform for<br />
            Land Acquisition<br />
            Management
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Unified government platform for transparent, efficient, and compliant land acquisition across all states.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            '47 active acquisition projects',
            '18,450 hectares under management',
            '14,820 affected families tracked',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-400" />
              <span className="text-slate-400 text-xs">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">NLAS</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-8">Use your official government credentials</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-700 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Garv"
                {...register('name')}
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="officer@nlas.gov.in"
                {...register('email')}
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Officer position */}
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-slate-700 mb-1.5">
                Officer Position
              </label>
              <select
                id="role"
                {...register('role')}
                className={`form-input ${errors.role ? 'error' : ''}`}
                defaultValue=""
              >
                <option value="" disabled>Select your position</option>
                <option value="CENTRAL_OFFICER">Central Officer</option>
                <option value="STATE_OFFICER">State Officer</option>
                <option value="DISTRICT_OFFICER">District Officer</option>
                <option value="FIELD_OFFICER">Field Officer</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            {selectedRole === 'STATE_OFFICER' && (
              <div>
                <label htmlFor="state" className="block text-xs font-medium text-slate-700 mb-1.5">
                  State
                </label>
                <select
                  id="state"
                  {...register('state')}
                  className={`form-input ${errors.state ? 'error' : ''}`}
                  defaultValue=""
                >
                  <option value="" disabled>Select your state</option>
                  {INDIA_STATES_AND_UTS.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary btn w-full justify-center h-10"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Demo Credentials</p>
            </div>
            <div className="divide-y divide-slate-100">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{cred.role}</p>
                    <p className="text-[11px] text-slate-400">{cred.email}</p>
                  </div>
                  <span className="text-[10px] text-navy-600 group-hover:text-navy-700 font-medium">Use →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
