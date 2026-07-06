import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Award, 
  Github, 
  Linkedin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Candidate } from '../types';

interface CandidateProfileProps {
  candidate: Candidate;
  token: string;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export default function CandidateProfile({ candidate, token, onClose, onStatusUpdated }: CandidateProfileProps) {
  const [updating, setUpdating] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  
  // Destructure AI Audit payload if available
  const audit = candidate.parsedData?.audit;
  
  const scoreData = [
    { name: 'Compatibility', value: candidate.score },
    { name: 'Gaps', value: 100 - candidate.score }
  ];

  const handleUpdateStatus = async (newStatus: Candidate['status']) => {
    setUpdating(true);
    setActionSuccess('');

    try {
      const res = await fetch(`/api/recruiter/candidates/${candidate._id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setActionSuccess(`Status successfully marked as: ${newStatus}`);
        onStatusUpdated();
        setTimeout(() => setActionSuccess(''), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintCandidateReport = () => {
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HireScan Candidate Professional Audit - ${candidate.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      line-height: 1.6;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    .badge {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      background-color: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    .score-grid {
      display: grid;
      grid-template-cols: 1fr 1.5fr;
      gap: 20px;
      margin-bottom: 32px;
    }
    .score-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    .score-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .score-value {
      font-size: 48px;
      font-weight: 800;
      margin: 12px 0 4px 0;
    }
    .score-value.indigo { color: #4f46e5; }
    .score-desc {
      font-size: 12px;
      color: #64748b;
    }
    .details-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      font-size: 13.5px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #e2e8f0;
      padding: 8px 0;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .skills-block {
      background-color: #f8fafc;
      border-left: 4px solid #4f46e5;
      padding: 16px;
      border-radius: 4px 12px 12px 4px;
      margin-bottom: 16px;
    }
    .skills-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 6px;
    }
    .tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 500;
      background-color: white;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      border-radius: 5px;
      margin-right: 5px;
      margin-bottom: 5px;
    }
    .grid-2 {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 16px;
    }
    .project-item {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .project-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #0f172a;
    }
    .project-summary {
      font-size: 12px;
      color: #475569;
      margin: 0;
    }
    .red-flag-card {
      background-color: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .red-flag-title {
      color: #be123c;
      font-weight: 700;
      font-size: 15px;
      margin: 0 0 8px 0;
    }
    .red-flag-list {
      margin: 0;
      padding-left: 20px;
      color: #9f1239;
      font-size: 13px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 48px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">${candidate.name}</h1>
        <p class="subtitle">Email: <strong>${candidate.email}</strong> &bull; Screened on: ${new Date(candidate.createdAt).toLocaleDateString()}</p>
      </div>
      <span class="badge" style="background-color: ${candidate.score >= 60 ? '#d1fae5' : '#f3f4f6'}; color: ${candidate.score >= 60 ? '#065f46' : '#374151'};">
        ${candidate.status.toUpperCase()}
      </span>
    </div>

    <div class="score-grid">
      <div class="score-card">
        <span class="score-label">Compatibility Match</span>
        <div class="score-value indigo">${candidate.score} <span style="font-size: 20px; font-weight: 500;">/100</span></div>
        <span class="score-desc">Overall Algorithmic Fit</span>
      </div>
      <div class="details-card">
        <div class="details-row">
          <span style="color:#64748b;">Trust Score</span>
          <strong style="color:#10b981;">${audit ? audit.authenticityScore + '%' : 'N/A'}</strong>
        </div>
        <div class="details-row">
          <span style="color:#64748b;">LinkedIn Audit</span>
          <strong style="text-transform: capitalize;">${audit ? audit.linkedinVerification?.status : 'Unverified'}</strong>
        </div>
        <div class="details-row">
          <span style="color:#64748b;">GitHub Match</span>
          <strong style="text-transform: capitalize;">${audit ? audit.githubVerification?.status : 'Not provided'}</strong>
        </div>
      </div>
    </div>

    <div class="section-title">Technical Skill Alignment</div>
    ${audit ? `
      <div class="grid-2">
        <div class="skills-block" style="border-left-color: #10b981;">
          <div class="skills-title" style="color:#047857;">Matched Job Skills</div>
          <div>
            ${audit.matchedSkills?.map(sk => `<span class="tag" style="border-color:#a7f3d0;color:#047857;">${sk}</span>`).join('') || '<span style="color:#64748b;font-style:italic;">None</span>'}
          </div>
        </div>
        <div class="skills-block" style="border-left-color: #f43f5e;">
          <div class="skills-title" style="color:#be123c;">Missing Job Skills</div>
          <div>
            ${audit.missingSkills?.map(sk => `<span class="tag" style="border-color:#fecdd3;color:#be123c;">${sk}</span>`).join('') || '<span style="color:#0f766e;font-style:italic;">None</span>'}
          </div>
        </div>
      </div>
    ` : `
      <div class="skills-block">
        <div class="skills-title">Extracted Skills</div>
        <div>
          ${candidate.parsedData?.skills?.map(sk => `<span class="tag">${sk}</span>`).join('') || 'None detected'}
        </div>
      </div>
    `}

    ${audit && audit.redFlags?.length > 0 ? `
      <div class="red-flag-card">
        <h3 class="red-flag-title">AI Credibility Alerts (Red Flags)</h3>
        <ul class="red-flag-list">
          ${audit.redFlags.map(flag => `<li>${flag}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="section-title">Projects Verification &amp; Reviews</div>
    <div>
      ${audit && audit.projectVerification ? audit.projectVerification.map(proj => `
        <div class="project-item">
          <div style="display:flex;justify-content:between;align-items:center;margin-bottom:4px;">
            <h4 class="project-title" style="flex:1;">${proj.title}</h4>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:4px;margin-right:6px;">Quality: ${proj.quality}</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;background:#ecfdf5;color:#047857;padding:2px 8px;border-radius:4px;">Relevance: ${proj.relevance}</span>
          </div>
          <p class="project-summary">${proj.summary}</p>
        </div>
      `).join('') : (candidate.parsedData?.projects?.map(proj => `
        <div class="project-item">
          <h4 class="project-title">${proj.title}</h4>
          <p class="project-summary">${proj.description}</p>
        </div>
      `).join('') || '<p style="font-size:13px;color:#64748b;font-style:italic;">No project files parsed</p>')}
    </div>

    ${audit && audit.linkedinVerification && audit.linkedinVerification.summary ? `
      <div class="section-title">Professional LinkedIn Audit Summary</div>
      <div style="background:#f1f5f9;border-radius:12px;padding:16px;font-size:13px;color:#334155;">
        <div style="margin-bottom:8px;">
          <strong>Profile Match:</strong> ${audit.linkedinVerification.profileExists ? '✓ Public Profile Located' : '⚠️ No Direct Profile Match Found'} 
          &bull; <strong>Experience Confidence:</strong> <span style="text-transform:uppercase;">${audit.linkedinVerification.experienceConfidence}</span>
        </div>
        <p style="margin:0;line-height:1.5;">${audit.linkedinVerification.summary}</p>
      </div>
    ` : ''}

    <div class="footer">
      <p>Report Compiled on ${new Date().toLocaleDateString()} &bull; Powered by HireScan Screening Suite</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 800);
    };
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hirescan-candidate-${candidate.name.replace(/\s+/g, '-').toLowerCase()}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-gray-800">
      
      {/* Print CSS styling settings */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          aside, header, nav, button, .no-print { display: none !important; }
          .print-container { display: block !important; width: 100% !important; }
        }
      `}</style>

      {/* Back button and profile controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-6 mb-8 gap-4 no-print">
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Pool
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrintCandidateReport}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Export Candidate PDF
          </button>
          
          <button
            onClick={() => handleUpdateStatus('interview')}
            disabled={updating || candidate.status === 'interview'}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Mark for Interview
          </button>

          <button
            onClick={() => handleUpdateStatus('shortlisted')}
            disabled={updating || candidate.status === 'shortlisted'}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Shortlist
          </button>

          <button
            onClick={() => handleUpdateStatus('rejected')}
            disabled={updating || candidate.status === 'rejected'}
            className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 hover:border-rose-100 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm cursor-pointer"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6 no-print shadow-sm font-bold">
          {actionSuccess}
        </div>
      )}

      {/* PRINT-ONLY View of the Candidate Profile Audit */}
      <div className="print-container hidden print:block text-slate-950 max-w-4xl mx-auto">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold">{candidate.name} • Professional Resume Audit</h1>
          <p className="text-sm text-slate-600">Candidate Email: {candidate.email} • Calculated Score: {candidate.score} / 100</p>
          <p className="text-xs text-slate-400 mt-1">Status Badge: {candidate.status.toUpperCase()} • Checked by HireScan AI</p>
        </div>

        <div className="border border-slate-200 p-4 rounded-xl mb-6">
          <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">Technical Skills & Stacks</h3>
          <p className="text-sm">{candidate.parsedData?.skills?.join(', ') || 'None explicitly found'}</p>
        </div>

        {audit && (
          <>
            <div className="border border-slate-200 p-4 rounded-xl mb-6">
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">Skill Gap Audit</h3>
              <p className="text-sm"><strong>Matched Target Skills:</strong> {audit.matchedSkills?.join(', ') || 'N/A'}</p>
              <p className="text-sm mt-2"><strong>Missing Core Requirements:</strong> {audit.missingSkills?.join(', ') || 'N/A'}</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl mb-6">
              <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">Project Legitimacy Audits</h3>
              <ul className="list-disc list-inside text-sm space-y-1.5">
                {audit.projectVerification?.map((proj: any, idx: number) => (
                  <li key={idx}><strong>{proj.title}</strong>: {proj.summary} ({proj.quality} Quality, {proj.relevance} Relevance)</li>
                ))}
              </ul>
            </div>

            {audit.githubVerification?.repositories?.length > 0 && (
              <div className="border border-slate-200 p-4 rounded-xl mb-6">
                <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">GitHub Repositories Audit</h3>
                <ul className="list-disc list-inside text-sm space-y-1.5">
                  {audit.githubVerification.repositories.map((repo: any, idx: number) => (
                    <li key={idx}><strong>{repo.name}</strong>: Contribution Index: {repo.contribution} (~{repo.commits} commits, complexity: {repo.complexity})</li>
                  ))}
                </ul>
              </div>
            )}

            {audit.linkedinVerification && (
              <div className="border border-slate-200 p-4 rounded-xl mb-6">
                <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">LinkedIn Trust Verification</h3>
                <p className="text-sm"><strong>Profile Status:</strong> {audit.linkedinVerification.status}</p>
                <p className="text-sm mt-1"><strong>Identity Match:</strong> {audit.linkedinVerification.profileExists ? 'Public profile located' : 'No matches'}</p>
                <p className="text-sm mt-1"><strong>Experience Confidence:</strong> {audit.linkedinVerification.experienceConfidence}</p>
                <p className="text-sm mt-1 leading-relaxed"><strong>Overview:</strong> {audit.linkedinVerification.summary}</p>
              </div>
            )}

            {audit.redFlags?.length > 0 && (
              <div className="border border-rose-200 bg-rose-50 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-rose-800 border-b border-rose-200 pb-2 mb-2">AI Detected Red Flags</h3>
                <ul className="list-disc list-inside text-sm text-rose-700 space-y-1">
                  {audit.redFlags.map((flag: string, idx: number) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Screen Layout Dashboard (no-print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        
        {/* Left Column: Stats & Status cards */}
        <div className="space-y-6">
          
          {/* Donut compatibility widget */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <span className="text-gray-400 font-sans text-[10px] uppercase font-bold tracking-wider">Candidate Fit Index</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{candidate.score}</span>
              <span className="text-gray-400 font-semibold text-lg">/ 100</span>
            </div>

            <div className="h-44 flex items-center justify-center mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill={candidate.score >= 60 ? '#10b981' : '#f43f5e'} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center mt-8">
                <span className="text-xs text-gray-400 font-sans uppercase font-bold">Active Status</span>
                <p className="text-sm font-bold text-gray-700 mt-0.5 capitalize">{candidate.status}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Match Probability</span>
                <span className="font-bold text-emerald-600">{candidate.score >= 60 ? 'HIGH' : 'LOW'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Autonomously Shortlisted</span>
                <span className="font-bold text-indigo-600">{candidate.score >= 60 ? 'Yes (&ge;60%)' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Verification summary stats if audit payload exists */}
          {audit && (
            <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h4 className="font-display font-bold text-xs text-gray-400 uppercase tracking-wider">Trust Indices</h4>
              
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Authenticity Score</span>
                  <span className="font-bold text-emerald-600">{audit.authenticityScore}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">GitHub Link verified</span>
                  <span className="font-bold text-indigo-600 capitalize">{audit.githubVerification?.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">LinkedIn completeness</span>
                  <span className="font-bold text-indigo-600 capitalize">{audit.linkedinVerification?.status}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Center / Right Column: Detailed resume sections and Gaps */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI detected warnings & Red Flags */}
          {audit && audit.redFlags?.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-800 text-sm">AI Credibility Audits Alert</h4>
                <ul className="text-xs text-rose-700 list-disc list-inside mt-2 space-y-1.5 leading-relaxed">
                  {audit.redFlags.map((flag: string, idx: number) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Skills segment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Stacks and Compatibility
            </h3>

            {/* If fully audited by recruiter, show skill gaps */}
            {audit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-sans text-emerald-700 uppercase font-bold tracking-wider">Matched Target Skills</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {audit.matchedSkills?.map((sk: string, i: number) => (
                      <span key={i} className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">{sk}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-sans text-indigo-700 uppercase font-bold tracking-wider">Missing Core Requirements</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {audit.missingSkills?.map((sk: string, i: number) => (
                      <span key={i} className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{sk}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {candidate.parsedData?.skills?.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-mono bg-gray-50 border border-gray-200 text-gray-700 rounded-md shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Projects and authenticity audit tables */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Project Credibility Check</h3>
            
            <div className="space-y-3">
              {audit && audit.projectVerification ? (
                audit.projectVerification.map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <span className="text-sm font-bold text-gray-800">{proj.title}</span>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{proj.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs font-sans text-gray-500">
                      <span className={`px-2 py-0.5 rounded-md border font-sans font-bold uppercase text-[9px] ${
                        proj.quality === 'exceptional' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>Quality: {proj.quality}</span>
                      <span className={`px-2 py-0.5 rounded-md border font-sans font-bold uppercase text-[9px] ${
                        proj.relevance === 'high' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>Relevance: {proj.relevance}</span>
                    </div>
                  </div>
                ))
              ) : (
                candidate.parsedData?.projects?.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                    <span className="text-sm font-bold text-gray-800">{proj.title}</span>
                    <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.techStack?.map((stack, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white text-gray-700 px-1.5 py-0.5 border border-gray-200 rounded-md shadow-sm">{stack}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GitHub Verification repositories detail if exists */}
          {audit && audit.githubVerification?.repositories?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Github className="w-5 h-5 text-indigo-600" /> Active GitHub Codebase Check
              </h3>
              <div className="space-y-3">
                {audit.githubVerification.repositories.map((repo: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{repo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Contribution Index: {repo.contribution}</p>
                    </div>
                    <div className="text-xs font-sans text-gray-500 space-y-1 md:text-right">
                      <p className="font-bold">Commits: <span className="font-normal font-mono text-indigo-600">~{repo.commits}</span></p>
                      <p className="font-bold">Complexity: <span className="font-normal font-mono text-indigo-600">{repo.complexity}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn Verification & Professional Integrity Audit */}
          {audit && audit.linkedinVerification && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-indigo-600" /> Professional LinkedIn Audit
              </h3>
              
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Profile Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase mt-1 border ${
                      audit.linkedinVerification.status === 'verified' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : audit.linkedinVerification.status === 'unverified'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {audit.linkedinVerification.status}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Identity Verified</span>
                    <span className={`text-xs font-semibold block mt-1 ${audit.linkedinVerification.profileExists ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {audit.linkedinVerification.profileExists ? '✓ Public Profile Located' : '⚠️ No Live Match Found'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Experience Confidence</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase mt-1 border ${
                      audit.linkedinVerification.experienceConfidence === 'high' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : audit.linkedinVerification.experienceConfidence === 'medium'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {audit.linkedinVerification.experienceConfidence} Confidence
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">AI Audit Verification Overview</span>
                  <p className="text-xs text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
                    {audit.linkedinVerification.summary || 'LinkedIn data is fully consistent with candidate credentials listed on the CV.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
