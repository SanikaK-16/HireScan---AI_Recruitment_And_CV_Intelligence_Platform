import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle, GraduationCap, Briefcase, Mail, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  initialRole?: 'student' | 'recruiter';
  onAuthSuccess: (token: string, user: User) => void;
  onBack: () => void;
}

export default function AuthPage({ initialRole, onAuthSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [role, setRole] = useState<'student' | 'recruiter'>(initialRole || 'student');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, role };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connecting to server failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-lg relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div 
            onClick={onBack}
            className="flex items-center gap-2 cursor-pointer group mb-4"
          >
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-indigo-900">
              HireScan
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mt-1.5">
            {isLogin ? 'Sign in to access your HireScan workspace' : 'Create an account to start analyzing resumes'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Role Selection during Signup */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all ${
                    role === 'student'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all ${
                    role === 'recruiter'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Recruiter
                </button>
              </div>
            </div>
          )}

          {/* Name Field (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Sanika Kulkarni"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="developer@hirescan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 mt-6 text-sm"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
