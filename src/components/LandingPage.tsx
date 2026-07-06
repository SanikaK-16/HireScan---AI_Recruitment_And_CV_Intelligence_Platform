import React from 'react';
import { Sparkles, ShieldCheck, Search, Award, Briefcase, ChevronRight, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onStart: (role: 'student' | 'recruiter') => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-indigo-900">
              HireScan
            </span>
          </div>
          <button 
            onClick={onLogin}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
          >
            Sign In / Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center items-center text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-8 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation CV Authenticity Verification
        </span>
        
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl leading-[1.1] mb-6">
          Verify Resume <span className="text-indigo-600">Authenticity</span>. Unlock Career Insights.
        </h1>
        
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          The ultimate dual-portal AI platform that evaluates skill gaps, verifies project credentials with GitHub live check, audits certification authenticity, and ranks candidates automatically.
        </p>

        {/* Dual Portal CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-20">
          {/* Student Portal Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left group">
            <div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Student & Candidate Portal</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Upload your resume, find skill gaps for targeted job roles, verify certifications, access an AI-generated learning timeline roadmap, and consult our career coach advisor.
              </p>
            </div>
            <button 
              onClick={() => onStart('student')}
              className="w-full flex items-center justify-between text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-lg transition-all duration-200 shadow-sm"
            >
              Analyze Your Resume <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recruiter Portal Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left group">
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Recruiter & Manager Portal</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Upload multiple resumes simultaneously, extract candidate credentials automatically, rank candidates with a weighted scoring system, audit red flags, and manage interview lists.
              </p>
            </div>
            <button 
              onClick={() => onStart('recruiter')}
              className="w-full flex items-center justify-between text-sm font-semibold bg-indigo-900 hover:bg-indigo-950 text-white px-6 py-3.5 rounded-lg transition-all duration-200 shadow-sm"
            >
              Start Candidate Screening <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="w-full border-t border-gray-200 pt-16">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-400 mb-8">
            Features Powered by Advanced Gemini AI
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600 mb-3" />
              <p className="font-semibold text-gray-800 text-sm mb-1">Authenticity Auditing</p>
              <p className="text-gray-500 text-xs text-center">Auto-verify projects and profile links</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Search className="w-8 h-8 text-indigo-600 mb-3" />
              <p className="font-semibold text-gray-800 text-sm mb-1">Live GitHub Analysis</p>
              <p className="text-gray-500 text-xs text-center">Evaluate project commits and complexity</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Award className="w-8 h-8 text-indigo-600 mb-3" />
              <p className="font-semibold text-gray-800 text-sm mb-1">Skill Gap Mapping</p>
              <p className="text-gray-500 text-xs text-center">Analyze skills against targeted positions</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Sparkles className="w-8 h-8 text-indigo-600 mb-3" />
              <p className="font-semibold text-gray-800 text-sm mb-1">Interactive Advisor</p>
              <p className="text-gray-500 text-xs text-center">AI Guidance chatbot for active mentoring</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-500 font-sans">
        &copy; {new Date().getFullYear()} HireScan: Dual-Portal AI-powered CV Authenticity & Career Insights platform.
      </footer>
    </div>
  );
}
