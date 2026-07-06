import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
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
  resumeId?: string; // Optional if created from bulk upload without full student account
  name: string;
  email: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected';
  parsedData?: any;
  createdAt: string;
}

export interface AnalysisResult {
  _id: string;
  studentId: string;
  resumeId: string;
  jobRoleTargeted: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  authenticityScore: number;
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

export interface ShortlistedCandidate {
  _id: string;
  recruiterId: string;
  jobRoleId: string;
  candidateId: string;
  score: number;
  status: string;
  createdAt: string;
}

interface DBStructure {
  users: User[];
  resumes: Resume[];
  jobRoles: JobRole[];
  candidates: Candidate[];
  analysisResults: AnalysisResult[];
  shortlistedCandidates: ShortlistedCandidate[];
}

const DEFAULT_DB: DBStructure = {
  users: [],
  resumes: [],
  jobRoles: [],
  candidates: [],
  analysisResults: [],
  shortlistedCandidates: []
};

class JSONDatabase {
  private init() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    }
  }

  private read(): DBStructure {
    this.init();
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading DB, returning default structure', e);
      return DEFAULT_DB;
    }
  }

  private write(data: DBStructure) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  getCollection<K extends keyof DBStructure>(collection: K): DBStructure[K] {
    const data = this.read();
    return data[collection] || [];
  }

  insert<K extends keyof DBStructure>(collection: K, doc: Omit<DBStructure[K][number], '_id' | 'createdAt'>): DBStructure[K][number] {
    const data = this.read();
    const id = Math.random().toString(36).substring(2, 11);
    const createdAt = new Date().toISOString();
    const newDoc = { _id: id, ...doc, createdAt } as any;
    
    if (!data[collection]) {
      data[collection] = [] as any;
    }
    data[collection].push(newDoc);
    this.write(data);
    return newDoc;
  }

  find<K extends keyof DBStructure>(collection: K, filter: Partial<DBStructure[K][number]>): DBStructure[K] {
    const items = this.getCollection(collection);
    return items.filter((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    }) as any;
  }

  findOne<K extends keyof DBStructure>(collection: K, filter: Partial<DBStructure[K][number]>): DBStructure[K][number] | null {
    const items = this.find(collection, filter);
    return items.length > 0 ? items[0] : null;
  }

  update<K extends keyof DBStructure>(
    collection: K, 
    filter: Partial<DBStructure[K][number]>, 
    updateFields: Partial<DBStructure[K][number]>
  ): boolean {
    const data = this.read();
    const items = data[collection] as any[];
    if (!items) return false;

    let updated = false;
    for (let i = 0; i < items.length; i++) {
      let match = true;
      for (const key in filter) {
        if (items[i][key] !== filter[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        items[i] = { ...items[i], ...updateFields };
        updated = true;
      }
    }

    if (updated) {
      this.write(data);
    }
    return updated;
  }

  delete<K extends keyof DBStructure>(collection: K, filter: Partial<DBStructure[K][number]>): number {
    const data = this.read();
    const items = data[collection] as any[];
    if (!items) return 0;

    const initialLength = items.length;
    data[collection] = items.filter((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return true; // Keep
      }
      return false; // Remove
    }) as any;

    const deletedCount = initialLength - data[collection].length;
    if (deletedCount > 0) {
      this.write(data);
    }
    return deletedCount;
  }

  clearCollection<K extends keyof DBStructure>(collection: K) {
    const data = this.read();
    data[collection] = [] as any;
    this.write(data);
  }
}

export const db = new JSONDatabase();
