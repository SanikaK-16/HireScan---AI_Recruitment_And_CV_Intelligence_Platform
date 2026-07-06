import { Router, Response } from 'express';
import { db, Candidate, JobRole } from './db';
import { signup, login, authMiddleware, AuthenticatedRequest } from './auth';
import { parseResumeWithAI, analyzeResumeWithAI, chatCareerWithAI } from './gemini';

export const apiRouter = Router();

// Authentication Endpoints
apiRouter.post('/auth/signup', signup);
apiRouter.post('/auth/login', login);

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// --- STUDENT PORTAL ROUTES ---

// Upload a resume for parsing
apiRouter.post('/student/resume/upload', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({ error: 'Access forbidden. Student role required.' });
      return;
    }

    const { filename, fileContent, isBase64 } = req.body;
    if (!filename || !fileContent) {
      res.status(400).json({ error: 'Filename and file content are required.' });
      return;
    }

    const base64Data = isBase64 ? fileContent : null;
    const plainText = !isBase64 ? fileContent : null;

    // Use AI resume parser
    const parsedData = await parseResumeWithAI(base64Data, plainText, filename);

    // Save Resume to DB
    const resume = db.insert('resumes', {
      studentId: req.user._id,
      filename,
      textContent: plainText || 'PDF Uploaded',
      parsedData
    });

    res.status(201).json({ resume });
  } catch (err: any) {
    console.error('Resume upload/parsing error:', err);
    res.status(500).json({ error: 'Failed to upload and parse resume. Please check your file.' });
  }
});

// Run full resume analysis against a targeted job role
apiRouter.post('/student/resume/analyze', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({ error: 'Access forbidden. Student role required.' });
      return;
    }

    const { resumeId, targetRole } = req.body;
    if (!resumeId || !targetRole) {
      res.status(400).json({ error: 'ResumeId and targetRole are required.' });
      return;
    }

    const resume = db.findOne('resumes', { _id: resumeId, studentId: req.user._id });
    if (!resume) {
      res.status(404).json({ error: 'Resume not found.' });
      return;
    }

    // Call deep AI analysis
    const analysisPayload = await analyzeResumeWithAI(resume.parsedData, targetRole);

    // Save Analysis results
    const analysis = db.insert('analysisResults', {
      studentId: req.user._id,
      resumeId: resume._id,
      ...analysisPayload
    });

    res.status(201).json({ analysis });
  } catch (err: any) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze resume.' });
  }
});

// Fetch latest resume and analysis for a student
apiRouter.get('/student/resume/latest', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({ error: 'Access forbidden. Student role required.' });
      return;
    }

    const resumes = db.find('resumes', { studentId: req.user._id });
    if (resumes.length === 0) {
      res.json({ resume: null, analysis: null });
      return;
    }

    // Sort to get latest resume
    const latestResume = resumes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const analyses = db.find('analysisResults', { studentId: req.user._id, resumeId: latestResume._id });
    const latestAnalysis = analyses.length > 0 
      ? analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    res.json({ resume: latestResume, analysis: latestAnalysis });
  } catch (err) {
    console.error('Error fetching latest resume:', err);
    res.status(500).json({ error: 'Failed to fetch student data.' });
  }
});

// AI Career guidance chatbot chat endpoint
apiRouter.post('/student/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history, analysisId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    let analysisSummary = null;
    if (analysisId) {
      const analysis = db.findOne('analysisResults', { _id: analysisId });
      if (analysis) {
        analysisSummary = {
          role: analysis.jobRoleTargeted,
          score: analysis.score,
          matchedSkills: analysis.matchedSkills,
          missingSkills: analysis.missingSkills,
          suggestions: analysis.suggestions.slice(0, 3)
        };
      }
    }

    const aiResponse = await chatCareerWithAI(history || [], message, analysisSummary);
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat guidance error:', err);
    res.status(500).json({ error: 'Chat bot was unable to respond.' });
  }
});


// --- RECRUITER PORTAL ROUTES ---

// Create Job Role
apiRouter.post('/recruiter/job-roles', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden. Recruiter role required.' });
      return;
    }

    const { title, requiredSkills, experienceLevel } = req.body;
    if (!title || !requiredSkills || !experienceLevel) {
      res.status(400).json({ error: 'All job role parameters are required.' });
      return;
    }

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);

    const jobRole = db.insert('jobRoles', {
      recruiterId: req.user._id,
      title,
      requiredSkills: skillsArray,
      experienceLevel
    });

    res.status(201).json({ jobRole });
  } catch (err) {
    console.error('Create job role error:', err);
    res.status(500).json({ error: 'Failed to create job role.' });
  }
});

// List Job Roles
apiRouter.get('/recruiter/job-roles', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const roles = db.find('jobRoles', { recruiterId: req.user._id });
    res.json({ jobRoles: roles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job roles.' });
  }
});

// Get Recruiter stats
apiRouter.get('/recruiter/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const candidates = db.find('candidates', { recruiterId: req.user._id });
    const totalResumes = candidates.length;
    const totalShortlisted = candidates.filter(c => c.score >= 60).length;
    const totalAnalyzed = candidates.length; // Count of all processed candidate records

    res.json({
      totalResumes,
      totalShortlisted,
      totalAnalyzed
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// Bulk Resume Upload & Automatic Scoring
apiRouter.post('/recruiter/candidates/bulk-upload', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden. Recruiter role required.' });
      return;
    }

    const { jobRoleId, resumes } = req.body;
    if (!jobRoleId || !resumes || !Array.isArray(resumes)) {
      res.status(400).json({ error: 'jobRoleId and list of resumes are required.' });
      return;
    }

    const jobRole = db.findOne('jobRoles', { _id: jobRoleId, recruiterId: req.user._id });
    if (!jobRole) {
      res.status(404).json({ error: 'Job role not found.' });
      return;
    }

    const addedCandidates: Candidate[] = [];

    for (const resFile of resumes) {
      try {
        const base64Data = resFile.isBase64 ? resFile.content : null;
        const plainText = !resFile.isBase64 ? resFile.content : null;

        // Parse resume details
        const parsed = await parseResumeWithAI(base64Data, plainText, resFile.filename);

        // Perform comprehensive evaluation for this role
        const audit = await analyzeResumeWithAI(parsed, jobRole.title);

        const score = audit.score;
        const matched = audit.matchedSkills;
        const missing = audit.missingSkills;
        const status = score >= 60 ? 'shortlisted' : 'applied';

        // Extract a clean candidate name
        const candidateName = parsed.candidateName || resFile.filename.split('.')[0] || 'Candidate';
        const candidateEmail = parsed.education?.[0]?.includes('@') ? parsed.education[0] : `${candidateName.toLowerCase().replace(/\s+/g, '')}@example.com`;

        const candidate = db.insert('candidates', {
          recruiterId: req.user._id,
          jobRoleId,
          name: candidateName,
          email: candidateEmail,
          score,
          matchedSkills: matched,
          missingSkills: missing,
          status,
          parsedData: {
            ...parsed,
            audit
          }
        });

        addedCandidates.push(candidate);
      } catch (e) {
        console.error(`Error parsing candidate resume: ${resFile.filename}`, e);
      }
    }

    res.status(201).json({
      message: `Successfully processed ${addedCandidates.length} resume(s).`,
      candidates: addedCandidates
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to process bulk uploads.' });
  }
});

// List and Rank Candidates for Recruiter
apiRouter.get('/recruiter/candidates', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const { jobRoleId } = req.query;
    const filter: any = { recruiterId: req.user._id };
    if (jobRoleId) {
      filter.jobRoleId = jobRoleId;
    }

    const candidates = db.find('candidates', filter);
    
    // Auto-rank candidate by score desc (highest to lowest)
    candidates.sort((a, b) => b.score - a.score);

    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidate list.' });
  }
});

// Fetch Single Candidate details
apiRouter.get('/recruiter/candidates/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const candidate = db.findOne('candidates', { _id: req.params.id, recruiterId: req.user._id });
    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found.' });
      return;
    }

    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load candidate details.' });
  }
});

// Update candidate status (Shortlist, Interview, applied)
apiRouter.post('/recruiter/candidates/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required.' });
      return;
    }

    const updated = db.update(
      'candidates', 
      { _id: req.params.id, recruiterId: req.user._id },
      { status }
    );

    if (!updated) {
      res.status(404).json({ error: 'Candidate record not found.' });
      return;
    }

    res.json({ message: 'Candidate status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// Delete individual candidate profile record (History Management)
apiRouter.delete('/recruiter/candidates/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const deleted = db.delete('candidates', { _id: req.params.id, recruiterId: req.user._id });
    if (deleted === 0) {
      res.status(404).json({ error: 'Candidate profile not found.' });
      return;
    }

    res.json({ message: 'Candidate record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record.' });
  }
});

// Clear Candidate History (History Management)
apiRouter.post('/recruiter/candidates/clear-history', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'recruiter') {
      res.status(403).json({ error: 'Access forbidden.' });
      return;
    }

    const count = db.delete('candidates', { recruiterId: req.user._id });
    res.json({ message: `Successfully cleared all ${count} candidate record(s) from your workspace.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history records.' });
  }
});
