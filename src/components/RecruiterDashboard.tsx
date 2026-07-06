import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  FileUp, 
  Briefcase, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Trash2, 
  Search, 
  Plus, 
  UserCheck, 
  Download,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { User, JobRole, Candidate } from '../types';

interface RecruiterDashboardProps {
  user: User;
  token: string;
  navigateTo: (page: string) => void;
  onOpenProfile: (candidate: Candidate) => void;
  subPage?: string; // Optional indicator of active tab (e.g. 'role-create' | 'bulk-upload' | 'candidates' | 'history')
}

export default function RecruiterDashboard({ 
  user, 
  token, 
  navigateTo, 
  onOpenProfile,
  subPage = 'dashboard'
}: RecruiterDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(subPage === 'dashboard' ? 'overview' : subPage);
  const [stats, setStats] = useState({ totalResumes: 0, totalShortlisted: 0, totalAnalyzed: 0 });
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // Job role configuration form state
  const [roleTitle, setRoleTitle] = useState<string>('Full Stack Developer');
  const [roleSkills, setRoleSkills] = useState<string>('React, Node.js, TypeScript, Express, PostgreSQL');
  const [roleExperience, setRoleExperience] = useState<string>('Mid Level');
  const [roleSuccess, setRoleSuccess] = useState<boolean>(false);

  // Bulk upload files state
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<string>('');
  const [bulkSuccess, setBulkSuccess] = useState<string>('');

  // Filtering states
  const [filterRoleId, setFilterRoleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom modal dialog & Toast states
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<boolean>(false);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch critical workspace data on mount
  useEffect(() => {
    fetchStats();
    fetchJobRoles();
    fetchCandidates();
  }, [activeTab, subPage]);

  // Synchronize internal state with parent prop navigation
  useEffect(() => {
    if (subPage && subPage !== 'dashboard') {
      setActiveTab(subPage);
    }
  }, [subPage]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/recruiter/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJobRoles = async () => {
    try {
      const res = await fetch('/api/recruiter/job-roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJobRoles(data.jobRoles);
        if (data.jobRoles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(data.jobRoles[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCandidates = async () => {
    try {
      let url = '/api/recruiter/candidates';
      if (filterRoleId) {
        url += `?jobRoleId=${filterRoleId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.candidates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger filtering fetch
  useEffect(() => {
    fetchCandidates();
  }, [filterRoleId]);

  const handleCreateJobRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleSuccess(false);

    try {
      const res = await fetch('/api/recruiter/job-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: roleTitle,
          requiredSkills: roleSkills,
          experienceLevel: roleExperience
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create job role');

      setRoleSuccess(true);
      fetchJobRoles();
      // Reset form
      setRoleTitle('Full Stack Developer');
      setRoleSkills('React, Node.js, TypeScript, Express, PostgreSQL');
      setTimeout(() => setRoleSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files) as File[];
      const pdfs = filesArr.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      setUploadFiles(prev => [...prev, ...pdfs]);
    }
  };

  const executeBulkUpload = async () => {
    if (uploadFiles.length === 0 || !selectedRoleId) return;

    setBulkUploading(true);
    setBulkProgress('Encoding and parsing resume PDFs... (This leverages parallel AI parsing)');
    setBulkSuccess('');

    const encodedResumes: Array<{ filename: string; content: string; isBase64: boolean }> = [];

    // Helper to read file as Base64 in promise format
    const readAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (e) => reject(e);
      });
    };

    try {
      for (const file of uploadFiles) {
        setBulkProgress(`Encoding file: ${file.name}...`);
        const base64Content = await readAsBase64(file);
        encodedResumes.push({
          filename: file.name,
          content: base64Content,
          isBase64: true
        });
      }

      setBulkProgress('Querying Gemini AI Resume parsing & authenticity audit... This takes ~5-10s...');
      
      const response = await fetch('/api/recruiter/candidates/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobRoleId: selectedRoleId,
          resumes: encodedResumes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze bulk uploads');
      }

      setBulkSuccess(`Successfully parsed & scored ${encodedResumes.length} resume(s)! Candidate profiles updated.`);
      setUploadFiles([]);
      fetchStats();
      fetchCandidates();
    } catch (err: any) {
      console.error(err);
      setBulkProgress(`Error processing bulk upload: ${err.message || 'Verification issue'}`);
    } finally {
      setBulkUploading(false);
    }
  };

  const handleClearHistory = async () => {
    setShowPurgeConfirm(true);
  };

  const executeClearHistory = async () => {
    setShowPurgeConfirm(false);
    try {
      const res = await fetch('/api/recruiter/candidates/clear-history', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAlertMessage('Candidate history cleared successfully.');
        fetchStats();
        fetchCandidates();
        setTimeout(() => setAlertMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidateToDelete(id);
  };

  const executeDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    const id = candidateToDelete;
    setCandidateToDelete(null);

    try {
      const res = await fetch(`/api/recruiter/candidates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAlertMessage('Candidate record deleted successfully.');
        fetchStats();
        fetchCandidates();
        setTimeout(() => setAlertMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Print-friendly shortlists PDF compilation download
  const handlePrintShortlistReport = () => {
    try {
      const activeRoleTitle = filterRoleId 
        ? (jobRoles.find(r => r._id === filterRoleId)?.title || 'Selected Job Role')
        : 'All Active Recruiter Roles';

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HireScan Candidate Shortlist Report - ${activeRoleTitle}</title>
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
      max-width: 900px;
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
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background-color: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      font-size: 13px;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:hover {
      background-color: #f8fafc;
    }
    .candidate-name {
      font-weight: 700;
      color: #0f172a;
    }
    .candidate-email {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .score-badge {
      font-weight: 800;
      color: #4f46e5;
      font-family: monospace;
      font-size: 14px;
    }
    .status-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid;
      display: inline-block;
    }
    .status-shortlisted {
      background-color: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }
    .status-applied {
      background-color: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
    }
    .tag {
      display: inline-block;
      font-size: 10px;
      font-family: monospace;
      background-color: #f1f5f9;
      color: #475569;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 4px;
      margin-bottom: 4px;
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
        <h1 class="title">Candidate Screening Shortlist Report</h1>
        <p class="subtitle">Role Target: <strong>${activeRoleTitle}</strong> &bull; Total Screened: ${filteredCandidates.length}</p>
      </div>
      <span class="badge">HireScan Recruiter Audit</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 5%">Rank</th>
          <th style="width: 30%">Candidate Information</th>
          <th style="width: 15%; text-align: center;">Score</th>
          <th style="width: 15%; text-align: center;">Status</th>
          <th style="width: 35%">Matched Skills Gap</th>
        </tr>
      </thead>
      <tbody>
        ${filteredCandidates.length === 0 ? `
          <tr>
            <td colspan="5" style="text-align: center; color: #94a3b8; font-style: italic; padding: 32px;">
              No candidates currently matches criteria in this pool.
            </td>
          </tr>
        ` : filteredCandidates.map((cand, idx) => `
          <tr>
            <td style="font-family: monospace; font-weight: bold; color: #64748b; text-align: center;">#${idx + 1}</td>
            <td>
              <div class="candidate-name">${cand.name}</div>
              <div class="candidate-email">${cand.email}</div>
            </td>
            <td style="text-align: center;" class="score-badge">${cand.score} / 100</td>
            <td style="text-align: center;">
              <span class="status-badge ${cand.score >= 60 ? 'status-shortlisted' : 'status-applied'}">
                ${cand.score >= 60 ? 'Shortlisted' : 'Applied'}
              </span>
            </td>
            <td>
              ${cand.matchedSkills && cand.matchedSkills.length > 0 
                ? cand.matchedSkills.map(sk => `<span class="tag" style="background:#e6f4ea;color:#137333;">${sk}</span>`).join('') 
                : '<span style="color:#94a3b8;font-style:italic;font-size:11px;">No matched skills detected</span>'
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Report Compiled on ${new Date().toLocaleDateString()} &bull; Powered by HireScan Candidate Screening Workspace</p>
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
      link.setAttribute('download', `shortlisted-candidates-${activeRoleTitle.replace(/\s+/g, '-').toLowerCase()}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter candidates locally for the table based on search
  const filteredCandidates = candidates.filter(cand => {
    const query = searchQuery.toLowerCase();
    return cand.name.toLowerCase().includes(query) || cand.email.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans text-gray-800">
      
      {/* Printable CSS style config */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          aside, header, nav, button, .no-print, .tabs-bar { display: none !important; }
          .print-list { display: block !important; width: 100% !important; }
        }
      `}</style>

      {/* Main Recruiter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-6 mb-8 gap-4 no-print">
        <div>
          <span className="text-indigo-600 font-sans text-xs font-bold tracking-wider uppercase">Recruiter Portal</span>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mt-1">Candidate Screening Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Screen candidate CVs, audit authenticity indexes, and automate talent shortlisting.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrintShortlistReport}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Export Shortlisted PDF
          </button>
          <button
            onClick={() => {
              setActiveTab('bulk-upload');
              navigateTo('recruiter-bulk-upload');
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Bulk Resume Scan
          </button>
        </div>
      </div>

      {/* Recruiter Statistics Blocks (no-print) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Total Resumes Managed</span>
            <span className="text-4xl font-extrabold text-gray-900 mt-2 block">{stats.totalResumes}</span>
            <p className="text-gray-400 text-xs mt-1.5 font-sans font-bold">Current system capacity</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Shortlisted Candidates</span>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl font-extrabold text-indigo-600">{stats.totalShortlisted}</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100">&ge; 60% Score</span>
            </div>
            <p className="text-gray-400 text-xs mt-1.5 font-sans font-bold">Ready for active interviews</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Total Audits Analyzed</span>
            <span className="text-4xl font-extrabold text-emerald-600 mt-2 block">{stats.totalAnalyzed}</span>
            <p className="text-gray-400 text-xs mt-1.5 font-sans font-bold">Full AI checks evaluated</p>
          </div>
        </div>
      )}

      {/* Navigation tabs for subviews within the same panel */}
      <div className="tabs-bar flex border-b border-gray-200 mb-8 gap-6 no-print text-sm font-bold">
        <button 
          onClick={() => { setActiveTab('overview'); navigateTo('recruiter-dashboard'); }} 
          className={`pb-3 transition-colors ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Workspace Overview
        </button>
        <button 
          onClick={() => { setActiveTab('role-create'); navigateTo('recruiter-role-create'); }} 
          className={`pb-3 transition-colors ${activeTab === 'role-create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Create Job Role
        </button>
        <button 
          onClick={() => { setActiveTab('bulk-upload'); navigateTo('recruiter-bulk-upload'); }} 
          className={`pb-3 transition-colors ${activeTab === 'bulk-upload' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Bulk Upload Resumes
        </button>
        <button 
          onClick={() => { setActiveTab('candidates'); navigateTo('recruiter-candidates'); }} 
          className={`pb-3 transition-colors ${activeTab === 'candidates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Candidate Rankings ({candidates.length})
        </button>
        <button 
          onClick={() => { setActiveTab('history'); navigateTo('recruiter-history'); }} 
          className={`pb-3 transition-colors ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          History logs
        </button>
      </div>

      {/* PRINT-ONLY candidate checklist container */}
      <div className="print-list hidden print:block text-slate-950">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h2 className="text-2xl font-bold">HireScan Automated Shortlisted Candidates Report</h2>
          <p className="text-sm text-slate-600">Dual-portal AI Verification • Scored descending by weight indicators</p>
          <p className="text-xs text-slate-400 mt-1">Printed: {new Date().toLocaleDateString()}</p>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="py-2">Candidate Name</th>
              <th className="py-2">Email</th>
              <th className="py-2 text-right">Weighted Score</th>
              <th className="py-2 text-right">Rating Badge</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((cand) => (
              <tr key={cand._id} className="border-b border-slate-100">
                <td className="py-2.5 font-bold">{cand.name}</td>
                <td className="py-2.5 text-slate-600">{cand.email}</td>
                <td className="py-2.5 text-right font-mono font-bold">{cand.score} / 100</td>
                <td className="py-2.5 text-right font-mono font-bold">{cand.score >= 60 ? 'SHORTLISTED' : 'APPLIED'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. VIEW: Overview Landing Workspace */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          
          {/* Main Workspace Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" /> Active Candidate Pool ({candidates.length})
                </h3>
                <div className="relative w-full md:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Candidates Mini-Grid or state message */}
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl italic text-gray-400 text-sm bg-gray-50/50">
                  No candidate profiles found in active filter. Click 'Bulk Resume Upload' to add candidates.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCandidates.slice(0, 5).map((cand) => (
                    <div 
                      key={cand._id} 
                      className="p-4 bg-gray-50 hover:bg-indigo-50/30 border border-gray-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 transition-colors cursor-pointer shadow-sm"
                      onClick={() => onOpenProfile(cand)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{cand.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            cand.score >= 60 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-gray-100 border-gray-200 text-gray-500'
                          }`}>
                            {cand.score >= 60 ? 'Shortlisted' : 'Applied'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-sm mt-0.5">{cand.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wide block">Weight Score</span>
                          <span className="text-sm font-extrabold text-indigo-600 font-mono">{cand.score} / 100</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  {filteredCandidates.length > 5 && (
                    <button
                      onClick={() => setActiveTab('candidates')}
                      className="w-full text-center text-xs font-bold text-indigo-600 mt-4 hover:text-indigo-700"
                    >
                      See All {filteredCandidates.length} Candidates...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick shortcuts and Role Lists sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h4 className="font-display font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Active Recruiter Roles ({jobRoles.length})</h4>
              {jobRoles.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 italic">No job roles created yet. Use 'Create Job Role' tab.</div>
              ) : (
                <div className="space-y-2.5">
                  {jobRoles.map((role) => (
                    <div 
                      key={role._id} 
                      onClick={() => setFilterRoleId(role._id === filterRoleId ? '' : role._id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        role._id === filterRoleId 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{role.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Exp: {role.experienceLevel} • {role.requiredSkills.slice(0, 3).join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. VIEW: Create Job Role Form */}
      {activeTab === 'role-create' && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 no-print animate-fade-in shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Briefcase className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Create Targeted Job Role</h3>
              <p className="text-gray-500 text-xs">Define titles, essential skill baselines, and seniority for resume alignment verification.</p>
            </div>
          </div>

          {roleSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Job role created successfully!
            </div>
          )}

          <form onSubmit={handleCreateJobRole} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Developer, ML Engineer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Required Skills (Comma separated list)</label>
              <textarea
                required
                rows={3}
                placeholder="React, Node.js, TypeScript, SQL, Docker, AWS"
                value={roleSkills}
                onChange={(e) => setRoleSkills(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
              ></textarea>
              <p className="text-[10px] text-gray-400 mt-1">These values are processed to run deep matching comparisons against bulk-uploaded candidate files.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Experience Seniority Target</label>
              <select
                value={roleExperience}
                onChange={(e) => setRoleExperience(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="Entry Level">Entry Level (0-2 Years)</option>
                <option value="Mid Level">Mid Level (2-5 Years)</option>
                <option value="Senior Level">Senior Level (5+ Years)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 mt-6 cursor-pointer"
            >
              Add Job Role Configuration <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 3. VIEW: Bulk Resume PDF Upload Area */}
      {activeTab === 'bulk-upload' && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 no-print animate-fade-in shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileUp className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Bulk Resume Scanner</h3>
              <p className="text-gray-500 text-xs">Upload multiple candidates simultaneously, parse metrics using real AI algorithms, and automatically update rankings.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Target Role Criteria</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {jobRoles.map((role) => (
                  <option key={role._id} value={role._id}>{role.title} ({role.experienceLevel})</option>
                ))}
              </select>
              {jobRoles.length === 0 && (
                <p className="text-xs text-rose-600 mt-1">Please create a job role configuration first before uploading resumes!</p>
              )}
            </div>

            {/* Select Resumes Container */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleBulkUploadFiles}
              />
              <FileUp className="w-8 h-8 text-indigo-600 mb-3" />
              <p className="text-sm font-bold text-gray-800">Select Resume Files (PDF format only)</p>
              <p className="text-xs text-gray-400 mt-1">Choose up to 5 resumes to analyze in parallel.</p>
            </div>

            {/* Queue Files list */}
            {uploadFiles.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-sans text-gray-400 uppercase font-bold">Ready to parse ({uploadFiles.length})</span>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                      <span className="truncate max-w-sm">{file.name}</span>
                      <button 
                        onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-700 font-bold text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status alerts */}
            {bulkProgress && (
              <div className="p-4 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="font-medium">{bulkProgress}</span>
              </div>
            )}

            {bulkSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl shadow-sm">
                {bulkSuccess}
              </div>
            )}

            <button
              onClick={executeBulkUpload}
              disabled={bulkUploading || uploadFiles.length === 0 || !selectedRoleId}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 mt-6 cursor-pointer"
            >
              {bulkUploading ? 'Processing Dual-Portal verification...' : 'Launch Bulk Verification Scanner'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. VIEW: Candidates rankings table */}
      {activeTab === 'candidates' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 no-print animate-fade-in shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Live Candidate Rankings</h3>
              <p className="text-xs text-gray-500">Auto-ranked from highest to lowest score using weights calculations.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Job role filter selector */}
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={filterRoleId}
                  onChange={(e) => setFilterRoleId(e.target.value)}
                  className="block w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="">Filter by Job Role</option>
                  {jobRoles.map((role) => (
                    <option key={role._id} value={role._id}>{role.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative flex-1 md:flex-initial">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-sans text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Candidate Information</th>
                  <th className="py-3 px-4 text-center">Calculated Score</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center italic text-gray-400">
                      No candidate profiles matches query criteria. Click 'Bulk Resume Upload' to add.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand, idx) => {
                    const isShortlisted = cand.score >= 60;
                    return (
                      <tr key={cand._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-gray-500 text-center">#{idx + 1}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900">{cand.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{cand.email}</p>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-indigo-600 text-sm">{cand.score} / 100</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-sans font-bold uppercase border ${
                            isShortlisted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {isShortlisted ? 'Shortlisted' : 'Applied'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => onOpenProfile(cand)}
                            className="text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 font-bold shadow-sm cursor-pointer"
                          >
                            Inspect Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW: History and logs management */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 no-print animate-fade-in shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">History & Logs Management</h3>
              <p className="text-gray-500 text-xs">Securely purge candidate datasets, manage metadata indexing, and minimize container storage space.</p>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={candidates.length === 0}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Purge Candidate History
            </button>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl mb-6 flex items-start gap-4 text-xs text-rose-700 leading-normal">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-rose-800">History Storage warning notice:</p>
              <p className="mt-1">Candidate records stored locally consume system resources. Clearing history cleans records from the local workspace files and frees up system memory index. Deleted records cannot be restored.</p>
            </div>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => (
              <div key={cand._id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center gap-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-gray-900">{cand.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cand.email} • Scored: {cand.score}/100 • Audited: {new Date(cand.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDeleteCandidate(cand._id)}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
                  title="Purge profile record"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
            {candidates.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                Logs list is currently clean. No candidate logs stored.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Purge History Custom Confirmation Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl w-fit mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-900 mb-2">Purge Workspace History?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Are you sure you want to clear all candidate records stored in your recruiter workspace? This will permanently delete the parsed resume structures, compatibility index scores, and trust audit logs. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeClearHistory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold text-white shadow-sm"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Single Candidate Record Custom Modal */}
      {candidateToDelete !== null && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl w-fit mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-900 mb-2">Delete Candidate Record?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Are you sure you want to remove this candidate's parsed profile from your logs database?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCandidateToDelete(null)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteCandidate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold text-white shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Success/Info Alert Notification */}
      {alertMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-800 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{alertMessage}</span>
        </div>
      )}

    </div>
  );
}
