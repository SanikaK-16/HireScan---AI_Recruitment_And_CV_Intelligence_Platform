export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'recruiter';
  createdAt: string;
}

export interface Resume {
  _id: string;
  studentId: string;
  filename: string;
  textContent: string;
  parsedData: {
    candidateName: string;
    skills: string[];
    projects: Array<{
      title: string;
      description: string;
      techStack: string[];
      githubUrl?: string;
    }>;
    certifications: string[];
    githubLinks: string[];
    linkedinProfile?: string;
    education: string[];
  };
  createdAt: string;
}

export interface JobRole {
  _id: string;
  recruiterId: string;
  title: string;
  requiredSkills: string[];
  experienceLevel: string;
  createdAt: string;
}

export interface Candidate {
  _id: string;
  recruiterId: string;
  jobRoleId: string;
  resumeId?: string;
  name: string;
  email: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected';
  parsedData?: {
    candidateName: string;
    skills: string[];
    projects: Array<{
      title: string;
      description: string;
      techStack: string[];
      githubUrl?: string;
    }>;
    certifications: string[];
    githubLinks: string[];
    linkedinProfile?: string;
    education: string[];
    audit?: {
      jobRoleTargeted: string;
      score: number;
      authenticityScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      recommendedSkills: string[];
      githubVerification: {
        status: 'verified' | 'unverified' | 'failed' | 'not_found';
        repositories: Array<{
          name: string;
          exists: boolean;
          commits: number;
          languages: string[];
          complexity: 'high' | 'medium' | 'low';
          contribution: string;
        }>;
      };
      projectVerification: Array<{
        title: string;
        techStack: string[];
        quality: 'exceptional' | 'adequate' | 'weak';
        relevance: 'high' | 'medium' | 'low';
        summary: string;
      }>;
      certificationVerification: Array<{
        name: string;
        platform: string;
        credibility: 'high' | 'medium' | 'low';
        relevance: 'high' | 'medium' | 'low';
        isRecognized: boolean;
      }>;
      linkedinVerification: {
        status: 'verified' | 'unverified' | 'not_provided';
        profileExists: boolean;
        experienceConfidence: 'high' | 'medium' | 'low';
        summary: string;
      };
      redFlags: string[];
      suggestions: string[];
    };
  };
  createdAt: string;
}

export interface AnalysisResult {
  _id: string;
  studentId: string;
  resumeId: string;
  jobRoleTargeted: string;
  score: number;
  authenticityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  githubVerification: {
    status: 'verified' | 'unverified' | 'failed' | 'not_found';
    repositories: Array<{
      name: string;
      exists: boolean;
      commits: number;
      languages: string[];
      complexity: 'high' | 'medium' | 'low';
      contribution: string;
    }>;
  };
  projectVerification: Array<{
    title: string;
    techStack: string[];
    quality: 'exceptional' | 'adequate' | 'weak';
    relevance: 'high' | 'medium' | 'low';
    summary: string;
  }>;
  certificationVerification: Array<{
    name: string;
    platform: string;
    credibility: 'high' | 'medium' | 'low';
    relevance: 'high' | 'medium' | 'low';
    isRecognized: boolean;
  }>;
  linkedinVerification: {
    status: 'verified' | 'unverified' | 'not_provided';
    profileExists: boolean;
    experienceConfidence: 'high' | 'medium' | 'low';
    summary: string;
  };
  redFlags: string[];
  suggestions: string[];
  roadmap: Array<{
    step: number;
    title: string;
    duration: string;
    description: string;
    learningPath: string[];
    projects: string[];
    courses: string[];
  }>;
  createdAt: string;
}
