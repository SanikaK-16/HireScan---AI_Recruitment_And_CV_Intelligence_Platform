import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  Briefcase, 
  ChevronLeft,
  BrainCircuit,
  Award,
  Users,
  Clock,
  History
} from 'lucide-react';

import { User, Resume, AnalysisResult, Candidate } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import StudentAnalysis from './components/StudentAnalysis';
import StudentChat from './components/StudentChat';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidateProfile from './components/CandidateProfile';

export default function App() {
  // Session states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State-driven router configuration
  const [page, setPage] = useState<string>('landing');
  const [history, setHistory] = useState<string[]>([]);
  
  // Shared data states
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Initialize and check persistent token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('hirescan_token');
    const storedUser = localStorage.getItem('hirescan_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Direct to their respective dashboard
        if (parsedUser.role === 'student') {
          setPage('student-dashboard');
        } else {
          setPage('recruiter-dashboard');
        }
      } catch (e) {
        console.error('Error recovering session', e);
        localStorage.removeItem('hirescan_token');
        localStorage.removeItem('hirescan_user');
      }
    }
    setLoading(false);
  }, []);

  // Standard router navigator that logs history
  const navigateTo = (nextPage: string) => {
    // Avoid double logging identical pages in history
    if (page !== nextPage) {
      setHistory(prev => [...prev, page]);
    }
    setPage(nextPage);
  };

  // Global Interactive Back Button Action
  const navigateBack = () => {
    if (history.length > 0) {
      const prev = [...history];
      const lastPage = prev.pop();
      setHistory(prev);
      if (lastPage) {
        setPage(lastPage);
      }
    } else {
      // Fallback: If history empty, default home based on authentication
      if (user) {
        navigateTo(user.role === 'student' ? 'student-dashboard' : 'recruiter-dashboard');
      } else {
        navigateTo('landing');
      }
    }
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hirescan_token', newToken);
    localStorage.setItem('hirescan_user', JSON.stringify(newUser));
    setHistory([]); // Reset history on auth swap

    if (newUser.role === 'student') {
      setPage('student-dashboard');
    } else {
      setPage('recruiter-dashboard');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hirescan_token');
    localStorage.removeItem('hirescan_user');
    setHistory([]);
    setPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-gray-500 font-sans">
        <Sparkles className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-semibold text-gray-600">Initializing HireScan...</p>
      </div>
    );
  }

  // Define whether the screen is full-bleed (landing / auth page without headers/sidebar wrapper)
  const isFullBleed = page === 'landing' || page === 'auth';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col overflow-x-hidden">
      
      {isFullBleed ? (
        // Render simple authentication or introduction pages
        page === 'landing' ? (
          <LandingPage 
            onStart={(role) => navigateTo('auth')} 
            onLogin={() => navigateTo('auth')} 
          />
        ) : (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess} 
            onBack={() => navigateTo('landing')} 
          />
        )
      ) : (
        // Authenticated Dashboard Layout with Header, Sidebar, and Body
        <div className="flex flex-1 min-h-screen relative">
          
          {/* Left collapsible Sidebar */}
          {user && (
            <Sidebar 
              user={user}
              currentPage={page}
              isSidebarOpen={!sidebarCollapsed}
              setIsSidebarOpen={(open) => setSidebarCollapsed(!open)}
              navigateTo={(dest) => {
                // If student uploads, route to upload component
                if (dest === 'student-upload') {
                  navigateTo('student-dashboard');
                } else {
                  navigateTo(dest);
                }
              }}
              onLogout={handleLogout}
            />
          )}

          {/* Main Workspace Frame with offset spacing corresponding to sidebar state */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 print:pl-0 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
            
            {/* Upper Global Navigation & Back Bar */}
            <header className="no-print h-16 border-b border-gray-200 bg-white sticky top-0 z-40 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                {/* Global Back Button */}
                {history.length > 0 && (
                  <button
                    onClick={navigateBack}
                    className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-150 flex items-center gap-1 text-xs font-semibold"
                    title="Navigate back to previous view"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight text-indigo-900">
                    HireScan AI
                  </span>
                </div>
              </div>

              {/* Active user status and quick logout */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-800 leading-none">{user?.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider mt-1">{user?.role} Portal</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out of HireScan Workspace"
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-100 rounded-lg transition-all"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </header>

            {/* Inner Route Component Manager */}
            <main className="flex-1 overflow-y-auto">
              {page === 'student-dashboard' && user && token && (
                <StudentDashboard 
                  user={user} 
                  token={token} 
                  navigateTo={navigateTo} 
                  onAnalysisDone={(result) => {
                    setSelectedAnalysis(result);
                    navigateTo('student-analysis');
                  }} 
                />
              )}

              {page === 'student-analysis' && selectedAnalysis && (
                <StudentAnalysis 
                  analysis={selectedAnalysis} 
                  navigateTo={() => navigateTo('student-chat')} 
                  onRestart={() => navigateTo('student-dashboard')}
                />
              )}

              {page === 'student-chat' && user && token && (
                <StudentChat 
                  user={user} 
                  token={token} 
                  analysis={selectedAnalysis} 
                />
              )}

              {/* Recruiter views handled by RecruiterDashboard wrapper */}
              {user?.role === 'recruiter' && token && [
                'recruiter-dashboard',
                'recruiter-role-create',
                'recruiter-bulk-upload',
                'recruiter-candidates',
                'recruiter-history'
              ].includes(page) && (
                <RecruiterDashboard 
                  user={user} 
                  token={token} 
                  navigateTo={navigateTo} 
                  onOpenProfile={(candidate) => {
                    setSelectedCandidate(candidate);
                    navigateTo('recruiter-candidate-profile');
                  }} 
                  subPage={
                    page === 'recruiter-role-create' ? 'role-create' :
                    page === 'recruiter-bulk-upload' ? 'bulk-upload' :
                    page === 'recruiter-candidates' ? 'candidates' :
                    page === 'recruiter-history' ? 'history' : 'dashboard'
                  }
                />
              )}

              {page === 'recruiter-candidate-profile' && selectedCandidate && token && (
                <CandidateProfile 
                  candidate={selectedCandidate} 
                  token={token} 
                  onClose={() => navigateTo('recruiter-dashboard')}
                  onStatusUpdated={() => {
                    // Refresh status
                    fetch(`/api/recruiter/candidates`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    })
                      .then(r => r.json())
                      .then(d => {
                        const updated = d.candidates.find((c: Candidate) => c._id === selectedCandidate._id);
                        if (updated) setSelectedCandidate(updated);
                      });
                  }}
                />
              )}
            </main>

          </div>

        </div>
      )}

    </div>
  );
}
