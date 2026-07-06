import React from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  Briefcase, 
  History, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  currentPage: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  navigateTo: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  currentPage,
  isSidebarOpen,
  setIsSidebarOpen,
  navigateTo,
  onLogout
}: SidebarProps) {
  if (!user) return null;

  const isStudent = user.role === 'student';

  const menuItems = isStudent 
    ? [
        { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'student-upload', label: 'Upload Resume', icon: FileUp },
        { id: 'student-analysis', label: 'Resume Analysis', icon: ShieldCheck },
        { id: 'student-chat', label: 'AI Career Guidance', icon: HelpCircle },
      ]
    : [
        { id: 'recruiter-dashboard', label: 'Recruiter Hub', icon: LayoutDashboard },
        { id: 'recruiter-role-create', label: 'Create Job Role', icon: Briefcase },
        { id: 'recruiter-bulk-upload', label: 'Bulk Resume Upload', icon: FileUp },
        { id: 'recruiter-candidates', label: 'Candidate Rankings', icon: Users },
        { id: 'recruiter-history', label: 'Candidate History', icon: History },
      ];

  return (
    <aside 
      className={`bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 no-print ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl italic text-white shrink-0">
            H
          </div>
          {isSidebarOpen && (
            <span className="font-display font-bold text-lg tracking-tight text-white whitespace-nowrap">
              HireScan
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded bg-indigo-950/40 text-indigo-300 hover:text-white transition-colors"
          title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info Block */}
      {isSidebarOpen && (
        <div className="p-4 mx-4 my-4 bg-indigo-800/40 rounded-xl border border-indigo-850">
          <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Logged in as</p>
          <p className="font-semibold text-white truncate mt-0.5" title={user.name}>{user.name}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isStudent ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
            <span className="text-xs text-indigo-200 capitalize font-mono">{user.role}</span>
          </div>
        </div>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-indigo-800 text-white shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0 opacity-80" />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-950/20 hover:text-rose-200 transition-all duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isSidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
