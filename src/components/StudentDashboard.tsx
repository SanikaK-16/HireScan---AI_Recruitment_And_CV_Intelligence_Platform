import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  Sparkles, 
  CheckCircle, 
  Briefcase, 
  Search, 
  ArrowRight, 
  Cpu, 
  AlertTriangle, 
  ArrowLeft,
  GraduationCap,
  Award,
  Github,
  Linkedin
} from 'lucide-react';
import { User, Resume, AnalysisResult } from '../types';

interface StudentDashboardProps {
  user: User;
  token: string;
  navigateTo: (page: string) => void;
  onAnalysisDone: (analysis: AnalysisResult) => void;
}

const TARGET_JOB_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'Mobile App Developer',
  'Game Developer',
  'UI/UX Designer',
  'Blockchain Developer',
  'Product Manager',
  'QA Engineer',
  'Business Analyst',
  'Other'
];

export default function StudentDashboard({ user, token, navigateTo, onAnalysisDone }: StudentDashboardProps) {
  const [latestResume, setLatestResume] = useState<Resume | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Initializing analysis modules...');
  
  // Resume uploading flow states
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Software Developer');
  const [customRole, setCustomRole] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch student's latest resume and analysis on mount
  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    try {
      const res = await fetch('/api/student/resume/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLatestResume(data.resume);
        setLatestAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');
    
    // Check if PDF format
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('HireScan AI currently parses resumes in PDF format to ensure live authenticity checks.');
      return;
    }

    setUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/student/resume/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            fileContent: base64String,
            isBase64: true
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse resume');
        }

        setUploadedResume(data.resume);
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing resume file.');
    } finally {
      setUploading(false);
    }
  };

  const triggerDeepAnalysis = async () => {
    const activeResume = uploadedResume || latestResume;
    if (!activeResume) return;

    setError('');
    setAnalyzing(true);

    const roleName = targetRole === 'Other' ? customRole : targetRole;
    if (!roleName || roleName.trim() === '') {
      setError('Please provide a valid targeted job role.');
      setAnalyzing(false);
      return;
    }

    // Step animation feedback simulation
    const steps = [
      'Reading parsed structures and layout...',
      'Mapping technical skills against target industry baseline...',
      'Initiating live GitHub repositories audit (checking languages, stars & forks)...',
      'Verifying academic qualifications and credentials...',
      'Auditing certification legitimacy and matching Platform registries...',
      'Running AI-driven red-flags checks and drafting learning timelines...',
      'Synthesizing final Authenticity & Career Roadmap index scores...'
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[stepIndex]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setAnalysisStep(steps[stepIndex]);
      }
    }, 1800);

    try {
      const response = await fetch('/api/student/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: activeResume._id,
          targetRole: roleName
        })
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(data.error || 'Deep analysis failed.');
      }

      onAnalysisDone(data.analysis);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.message || 'Deep analysis failed. Verify internet connection.');
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-gray-500 font-sans">
        <Cpu className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-semibold">Loading HireScan Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <span className="text-indigo-600 font-sans text-xs font-bold tracking-wider uppercase">Student Portal</span>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mt-1">CV Authenticity & Career Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Scan resumes, trace industry skill gaps, and access custom AI-generated career paths.</p>
        </div>
        {(latestAnalysis || uploadedResume) && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('student-chat')}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm transition-colors flex items-center gap-2"
            >
              Consult AI Coach
            </button>
            {latestAnalysis && (
              <button
                onClick={() => onAnalysisDone(latestAnalysis)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
              >
                View Latest Analysis
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-5 py-4 rounded-lg mb-8 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Analyzing Overlay Screen */}
      {analyzing && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex flex-col justify-center items-center px-6 text-center">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-gray-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-800 animate-pulse"></div>
            <Cpu className="w-16 h-16 text-indigo-600 animate-spin mb-6 mx-auto" />
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">HireScan AI Audit</h3>
            <p className="text-gray-500 text-sm mb-6">Running comprehensive credential algorithms and skill metrics checks...</p>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6 text-left">
              <span className="text-[10px] font-mono text-indigo-600 uppercase font-semibold">Active Engine Sub-Task</span>
              <p className="text-gray-700 text-sm font-medium mt-1 animate-fade-in">{analysisStep}</p>
            </div>
            
            <p className="text-xs text-gray-400 font-sans">This may take up to 10 seconds. Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Core Upload Action View */}
      {!uploadedResume && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Drag & Drop zone */}
          <div className="lg:col-span-2">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 h-96 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/5'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileInput}
              />
              
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
                <FileUp className="w-10 h-10" />
              </div>
              
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                {uploading ? 'Processing Resume Document...' : 'Upload PDF Resume'}
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                Drag and drop your PDF CV here, or click to browse. Real AI-powered verification extracts components instantly.
              </p>
              
              <span className="inline-flex items-center gap-1 text-[11px] font-sans text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Supports Native PDF format
              </span>
            </div>
          </div>

          {/* Quick Guide & Stats Column */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" /> Auto-Verification Checklist
              </h3>
              <ul className="space-y-3.5 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Skills Extraction:</strong> Compare matched skills directly with recruiters baseline.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>GitHub Code Verification:</strong> Confirms repo existence, complex commits, and stacks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Certification Auditing:</strong> Checks platform validity (AWS, Udemy, Coursera).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Red Flags Check:</strong> Spot inactive links or description mismatches.</span>
                </li>
              </ul>
            </div>

            {latestResume && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs text-gray-400 font-sans font-semibold uppercase tracking-wider">Active Resume Stored</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 truncate" title={latestResume.filename}>
                  {latestResume.filename}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-400 font-sans">Parsed: {new Date(latestResume.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => setUploadedResume(latestResume)}
                    className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800"
                  >
                    Configure Analysis <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Job Role & Setup Panel (After Resume uploaded or chosen) */}
      {uploadedResume && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-250 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Parsed Resume Source</h3>
                <p className="text-xs text-gray-500">{uploadedResume.filename}</p>
              </div>
            </div>
            <button
              onClick={() => setUploadedResume(null)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-850 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Upload Another File
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Parsed Resume Details Review Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-sans text-indigo-600 uppercase font-bold tracking-wider">Extracted Candidate Name</span>
                    <h4 className="text-xl font-bold text-gray-900 mt-0.5">{uploadedResume.parsedData.candidateName}</h4>
                  </div>
                  {uploadedResume.parsedData.linkedinProfile && (
                    <a 
                      href={uploadedResume.parsedData.linkedinProfile} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors border border-gray-200"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Skills Segment */}
                <div>
                  <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider">Technical Stacks Detected ({uploadedResume.parsedData.skills.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {uploadedResume.parsedData.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-mono bg-white border border-gray-200 text-gray-700 rounded-md shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects Segment */}
                <div>
                  <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider">Resume Projects Listed ({uploadedResume.parsedData.projects.length})</span>
                  <div className="space-y-2 mt-1.5">
                    {uploadedResume.parsedData.projects.map((proj, i) => (
                      <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{proj.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-md truncate">{proj.description}</p>
                        </div>
                        {proj.githubUrl && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold border border-indigo-100">
                            <Github className="w-3 h-3" /> URL Found
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education and certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education
                    </span>
                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-1">
                      {uploadedResume.parsedData.education.map((edu, idx) => (
                        <li key={idx} className="truncate" title={edu}>{edu}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" /> Certifications
                    </span>
                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-1">
                      {uploadedResume.parsedData.certifications.length === 0 ? (
                        <li className="text-gray-400 italic">No certs explicitly found</li>
                      ) : (
                        uploadedResume.parsedData.certifications.map((cert, idx) => (
                          <li key={idx} className="truncate" title={cert}>{cert}</li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Job Role and Launch actions */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-indigo-600 font-sans text-[10px] font-bold tracking-wider uppercase block mb-1">Deep analysis setting</span>
                <h4 className="font-display text-lg font-bold text-gray-900 mb-4">Compare Target Career Role</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Job Role Title</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="block w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    >
                      {TARGET_JOB_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {targetRole === 'Other' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Type Custom Role</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Systems Engineer"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="block w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 p-4 rounded-xl text-xs text-gray-500 leading-relaxed space-y-1 shadow-sm">
                    <p className="font-bold text-gray-700">Analysis Weights Scale:</p>
                    <p>• Skill Match (40 pts) • Projects (25 pts)</p>
                    <p>• Certs (15 pts) • GitHub (10) • LinkedIn (10)</p>
                  </div>

                  <button
                    onClick={triggerDeepAnalysis}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-md transition-all duration-200"
                  >
                    Start AI Authenticity Audit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
