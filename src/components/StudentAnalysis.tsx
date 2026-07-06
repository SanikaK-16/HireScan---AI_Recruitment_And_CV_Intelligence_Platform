import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  ArrowRight, 
  HelpCircle,
  Award,
  Github,
  Linkedin,
  Clock,
  BookOpen,
  Play,
  RotateCw,
  Heart,
  ChevronRight
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
import { AnalysisResult } from '../types';

interface StudentAnalysisProps {
  analysis: AnalysisResult;
  navigateTo: (page: string) => void;
  onRestart: () => void;
}

export default function StudentAnalysis({ analysis, navigateTo, onRestart }: StudentAnalysisProps) {
  const [downloading, setDownloading] = useState<boolean>(false);

  // Recharts Chart configurations
  const donutData = [
    { name: 'Skill Match', value: analysis.score },
    { name: 'Gaps', value: 100 - analysis.score }
  ];

  const chartData = [
    { name: 'Skill Match', Score: analysis.score, fill: '#4f46e5' },
    { name: 'Authenticity', Score: analysis.authenticityScore, fill: '#10b981' },
    { name: 'Certs Score', Score: analysis.certificationVerification.length > 0 ? 85 : 50, fill: '#0284c7' }
  ];

  // Printable layout generator & printer trigger (Download PDF report)
  const handlePrintReport = () => {
    setDownloading(true);
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HireScan Career Intelligence Report - ${analysis.jobRoleTargeted}</title>
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
      grid-template-cols: 1fr 1fr;
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
    .score-value.emerald { color: #10b981; }
    .score-desc {
      font-size: 12px;
      color: #64748b;
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
      font-size: 12px;
      font-weight: 500;
      background-color: white;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      margin-right: 6px;
      margin-bottom: 6px;
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
      font-size: 13.5px;
    }
    .roadmap-step {
      border-left: 2px solid #e2e8f0;
      padding-left: 24px;
      position: relative;
      margin-bottom: 24px;
    }
    .roadmap-step::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #4f46e5;
    }
    .step-meta {
      font-size: 11px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
    }
    .step-title {
      font-size: 15px;
      font-weight: 700;
      margin: 4px 0;
      color: #0f172a;
    }
    .step-desc {
      font-size: 13px;
      color: #475569;
      margin: 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 48px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    @media print {
      body { background-color: white; padding: 0; }
      .container { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Career Intelligence Report</h1>
        <p class="subtitle">Candidate CV Audit &bull; Targeted Position: <strong>${analysis.jobRoleTargeted}</strong></p>
      </div>
      <span class="badge">HireScan AI Verified</span>
    </div>

    <div class="score-grid">
      <div class="score-card">
        <span class="score-label">Skill Compatibility</span>
        <div class="score-value indigo">${analysis.score} <span style="font-size: 20px; font-weight: 500;">/100</span></div>
        <span class="score-desc">Typical Industry Baseline Match</span>
      </div>
      <div class="score-card">
        <span class="score-label">CV Authenticity</span>
        <div class="score-value emerald">${analysis.authenticityScore}%</div>
        <span class="score-desc">GitHub Repos &amp; Certification Legitimacy</span>
      </div>
    </div>

    <div class="section-title">Technical Skill Gap Mapping</div>
    <div class="skills-block">
      <div class="skills-title">Matched Target Skills</div>
      <div>
        ${analysis.matchedSkills.map(sk => `<span class="tag">${sk}</span>`).join('') || '<span style="color:#64748b;font-style:italic;font-size:13px;">None explicitly detected</span>'}
      </div>
    </div>
    <div class="skills-block" style="border-left-color: #f43f5e;">
      <div class="skills-title" style="color:#e11d48;">Missing Skills Needed</div>
      <div>
        ${analysis.missingSkills.map(sk => `<span class="tag" style="border-color:#fecdd3;color:#e11d48;">${sk}</span>`).join('') || '<span style="color:#0f766e;font-style:italic;font-size:13px;">Perfect baseline compatibility</span>'}
      </div>
    </div>
    <div class="skills-block" style="border-left-color: #0ea5e9;">
      <div class="skills-title" style="color:#0369a1;">Recommended Future Stacks</div>
      <div>
        ${analysis.recommendedSkills.map(sk => `<span class="tag" style="border-color:#bae6fd;color:#0369a1;">${sk}</span>`).join('') || '<span style="color:#64748b;font-style:italic;font-size:13px;">None recommended</span>'}
      </div>
    </div>

    ${analysis.redFlags.length > 0 ? `
    <div class="red-flag-card">
      <h3 class="red-flag-title">AI Credibility Alerts (Red Flags)</h3>
      <ul class="red-flag-list">
        ${analysis.redFlags.map(flag => `<li>${flag}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="section-title">Resume Improvement Suggestions</div>
    <ul style="padding-left: 20px; font-size: 14px; color: #475569; margin-bottom: 32px;">
      ${analysis.suggestions.map(sug => `<li style="margin-bottom: 8px;">${sug}</li>`).join('')}
    </ul>

    <div class="section-title">Actionable Career Roadmap Timeline</div>
    <div style="margin-top: 16px;">
      ${analysis.roadmap.map(step => `
      <div class="roadmap-step">
        <span class="step-meta">Step ${step.step} &bull; ${step.duration}</span>
        <h4 class="step-title">${step.title}</h4>
        <p class="step-desc">${step.description}</p>
        ${step.learningPath && step.learningPath.length > 0 ? `
          <div style="margin-top:6px;font-size:11px;color:#4f46e5;"><strong>Learning Path:</strong> ${step.learningPath.join(' &rarr; ')}</div>
        ` : ''}
      </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Report Generated on ${new Date(analysis.createdAt).toLocaleDateString()} &bull; Powered by HireScan AI Intelligence Engine</p>
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
      link.setAttribute('download', `hirescan-student-report-${analysis.jobRoleTargeted.replace(/\s+/g, '-').toLowerCase()}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    if (score >= 60) return 'text-indigo-600 border-indigo-200 bg-indigo-50';
    return 'text-rose-600 border-rose-200 bg-rose-50';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-gray-900">
      
      {/* Print-optimized layout container (hidden in screen, visible only when printing) */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
            padding: 20px !important;
          }
          .print-card {
            border: 1px solid #ddd !important;
            background: #fff !important;
            color: #111 !important;
            margin-bottom: 15px !important;
            padding: 15px !important;
            border-radius: 8px !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-8 gap-4 no-print">
        <div>
          <span className="text-indigo-600 font-sans text-xs font-bold tracking-wider uppercase">Deep Analysis Report</span>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mt-1">AI Audit & Performance Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Audit results for target role: <strong className="text-indigo-600">{analysis.jobRoleTargeted}</strong></p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRestart}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-4 h-4" /> Scan Another CV
          </button>
          <button
            onClick={() => navigateTo('student-chat')} // Trigger AI coach guidance chatbot
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" /> Consult AI Coach
          </button>
          <button
            onClick={handlePrintReport}
            disabled={downloading}
            className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Preparing PDF...' : 'Download Report PDF'}
          </button>
        </div>
      </div>

      {/* Printable view of the report */}
      <div className="print-container hidden print:block text-slate-950 font-sans max-w-4xl mx-auto">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">HireScan Career Intelligence Report</h1>
          <p className="text-sm text-slate-600">Candidate CV Audit • Targeted Position: {analysis.jobRoleTargeted}</p>
          <p className="text-xs text-slate-400 mt-1">Calculated: {new Date(analysis.createdAt).toLocaleDateString()} • Powered by Gemini AI</p>
        </div>

        <div className="print-card flex justify-between items-center border border-slate-200 p-4 mb-6 rounded-xl">
          <div>
            <h3 className="text-lg font-bold">Overall Skill Compatibility Score</h3>
            <p className="text-xs text-slate-500">Calculated on typical industry baselines and certification metrics</p>
          </div>
          <span className="text-4xl font-extrabold text-indigo-600">{analysis.score} / 100</span>
        </div>

        <div className="print-card flex justify-between items-center border border-slate-200 p-4 mb-6 rounded-xl">
          <div>
            <h3 className="text-lg font-bold">CV Authenticity Score</h3>
            <p className="text-xs text-slate-500">Credibility of GitHub codebases, LinkedIn references, and recognized certs</p>
          </div>
          <span className="text-4xl font-extrabold text-emerald-600">{analysis.authenticityScore} %</span>
        </div>

        <div className="print-card mb-6 border border-slate-200 p-4 rounded-xl">
          <h4 className="font-bold border-b border-slate-200 pb-2 mb-2">Technical Skill Gap Mapping</h4>
          <p className="text-sm"><strong>Matched Skills:</strong> {analysis.matchedSkills.join(', ') || 'None explicitly found'}</p>
          <p className="text-sm mt-2"><strong>Missing Skills Needed:</strong> {analysis.missingSkills.join(', ') || 'Perfect baseline compatibility'}</p>
          <p className="text-sm mt-2"><strong>Recommended Future Stacks:</strong> {analysis.recommendedSkills.join(', ')}</p>
        </div>

        {analysis.redFlags.length > 0 && (
          <div className="print-card border border-rose-200 bg-rose-50 p-4 mb-6 rounded-xl">
            <h4 className="font-bold text-rose-800 border-b border-rose-200 pb-2 mb-2">AI Flagged Red Flags</h4>
            <ul className="list-disc list-inside text-sm text-rose-700 space-y-1">
              {analysis.redFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="print-card mb-6 border border-slate-200 p-4 rounded-xl">
          <h4 className="font-bold border-b border-slate-200 pb-2 mb-2">Resume Improvement Suggestions</h4>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5">
            {analysis.suggestions.map((sug, idx) => (
              <li key={idx}>{sug}</li>
            ))}
          </ul>
        </div>

        <div className="print-card border border-slate-200 p-4 rounded-xl">
          <h4 className="font-bold border-b border-slate-200 pb-2 mb-3">4-Step Actionable Roadmap Timeline</h4>
          <div className="space-y-3">
            {analysis.roadmap.map((step) => (
              <div key={step.step} className="border-l-2 border-indigo-400 pl-4 py-1">
                <span className="text-xs font-bold text-indigo-600 font-mono">STEP {step.step} • {step.duration}</span>
                <h5 className="font-bold text-sm text-slate-800">{step.title}</h5>
                <p className="text-xs text-slate-600 mt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Layout - Standard Visual Dashboard (no-print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        
        {/* Left Column: Big Scores & Metrics Charts */}
        <div className="space-y-6">
          
          {/* Resume Score Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            
            <span className="text-gray-400 font-sans text-[10px] uppercase font-bold tracking-wider">Overall Resume Match</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{analysis.score}</span>
              <span className="text-gray-400 font-semibold text-lg">/ 100</span>
            </div>
            
            {/* Visual Recharts Gauge Chart */}
            <div className="h-44 flex items-center justify-center mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center mt-8">
                <span className="text-xs text-gray-400 font-sans uppercase font-bold">Weighted Target</span>
                <p className="text-sm font-bold text-gray-700 mt-0.5">Role baselines</p>
              </div>
            </div>

            {/* Subscore Weights breakdowns */}
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Skill Alignment Match</span>
                <span className="font-semibold text-indigo-600">{(analysis.score * 0.4).toFixed(1)} / 40 pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Project Quality Verify</span>
                <span className="font-semibold text-emerald-600">{(analysis.authenticityScore * 0.25).toFixed(1)} / 25 pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">GitHub Activity Analysis</span>
                <span className="font-semibold text-cyan-600">{analysis.githubVerification.status === 'verified' ? '9.0' : '4.0'} / 10 pts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">LinkedIn completeness</span>
                <span className="font-semibold text-sky-600">{analysis.linkedinVerification.profileExists ? '9.0' : '5.0'} / 10 pts</span>
              </div>
            </div>
          </div>

          {/* Authenticity Score Meter */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-gray-400 font-sans text-[10px] uppercase font-bold tracking-wider">Authenticity Meter</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">CV Trust Rating</h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-mono font-bold border rounded-lg ${getScoreColor(analysis.authenticityScore)}`}>
                {analysis.authenticityScore}% Legit
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${analysis.authenticityScore}%` }}
              ></div>
            </div>

            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
              Calculates structural cross-referencing indicators (real-world host repositories, verified certificates, matching email profiles).
            </p>
          </div>

          {/* Radar Metrics Overview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-display font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Metric Score Index</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Center/Right: Technical Gaps, GitHub checks, Certs, Roadmap */}
        <div className="lg:col-span-2 space-y-6">

          {/* Red Flags warning card if any exist */}
          {analysis.redFlags.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-800 text-sm">AI Credibility Red Flags Detected</h4>
                <ul className="text-xs text-rose-700 list-disc list-inside mt-2 space-y-1.5 leading-relaxed">
                  {analysis.redFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Skill Gap Analysis Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Career Skill Gap Blueprint
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-sans text-emerald-700 uppercase font-bold tracking-wider">Matched Skills ({analysis.matchedSkills.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {analysis.matchedSkills.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No matched requirements found</span>
                  ) : (
                    analysis.matchedSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-mono bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md">
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-sans text-indigo-700 uppercase font-bold tracking-wider">Missing Target Skills ({analysis.missingSkills.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {analysis.missingSkills.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">Baseline is completely covered!</span>
                  ) : (
                    analysis.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md">
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <span className="text-[10px] font-sans text-indigo-600 uppercase font-bold tracking-wider">Recommended To Learn next</span>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {analysis.recommendedSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-mono bg-white border border-gray-200 text-gray-700 rounded-md shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub Verification Grid */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                <Github className="w-5 h-5 text-indigo-600" /> GitHub Repository Verification
              </h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border capitalize font-mono ${
                analysis.githubVerification.status === 'verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-gray-500 bg-gray-50 border-gray-200'
              }`}>
                {analysis.githubVerification.status}
              </span>
            </div>

            <div className="space-y-3">
              {analysis.githubVerification.repositories.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl italic">
                  No public GitHub links found to auto-verify repositories. Provide repository links on CV.
                </div>
              ) : (
                analysis.githubVerification.repositories.map((repo, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 truncate max-w-xs">{repo.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-sans font-bold ${
                          repo.complexity === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-gray-150 text-gray-600 border-gray-250'
                        }`}>{repo.complexity} Complexity</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Contribution: {repo.contribution}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs font-sans text-gray-500">
                      <span className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Commits: ~{repo.commits}</span>
                      <span className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Languages: {repo.languages.slice(0, 2).join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Certifications and Profile Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Certification Integrity
              </h3>
              <div className="space-y-3">
                {analysis.certificationVerification.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No certificates explicitly listed in parse blocks</p>
                ) : (
                  analysis.certificationVerification.map((cert, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-800 truncate">{cert.name}</p>
                        <p className="text-[10px] text-gray-500">Platform: {cert.platform}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-sans ${
                        cert.isRecognized ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {cert.isRecognized ? 'Audited' : 'Unchecked'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-indigo-600" /> LinkedIn Reference Audit
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Profile Linked</span>
                  <span className={`font-semibold ${analysis.linkedinVerification.profileExists ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {analysis.linkedinVerification.profileExists ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Experience Trust Confidence</span>
                  <span className="font-bold text-indigo-600 capitalize">{analysis.linkedinVerification.experienceConfidence}</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed border-t border-gray-200 pt-2 mt-2">
                  {analysis.linkedinVerification.summary || 'Matches profile descriptors provided in parsed metadata.'}
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Resume Improvement Suggestions</h3>
            <ul className="space-y-3 text-xs leading-relaxed text-gray-650">
              {analysis.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0 mt-1.5"></span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Roadmap timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> AI-Generated 4-Step Career Roadmap
            </h3>

            <div className="relative border-l-2 border-gray-200 pl-6 space-y-8 ml-3">
              {analysis.roadmap.map((step) => (
                <div key={step.step} className="relative group">
                  {/* Step Bubble Icon */}
                  <span className="absolute -left-10 top-0.5 bg-white border-2 border-indigo-600 text-indigo-600 text-xs font-sans font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    {step.step}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="font-display font-bold text-base text-gray-900">{step.title}</h4>
                      <span className="text-xs font-sans text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{step.duration}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider">Step Core Skills</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.learningPath.map((sk, idx) => (
                            <span key={idx} className="text-[9px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">{sk}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider">Step Recommended Project</span>
                        <p className="text-[10px] font-bold text-indigo-600 mt-1">{step.projects[0] || 'Build comprehensive stack mockup'}</p>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider">Recommended Learning Courses</span>
                      <p className="text-[10px] text-gray-500 mt-0.5 italic">{step.courses.join(' • ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
