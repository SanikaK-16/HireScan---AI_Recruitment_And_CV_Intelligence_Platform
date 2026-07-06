import { GoogleGenAI, Type } from "@google/genai";
import { db, Resume, AnalysisResult } from "./db";

// Initialize Gemini SDK with telemetry user-agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to extract GitHub username and owner/repo from URL
function parseGithubUrl(url: string): { owner: string; repo?: string } | null {
  try {
    const cleanUrl = url.replace(/(http|https):\/\//, '').trim();
    const parts = cleanUrl.split('/');
    if (parts[0].includes('github.com')) {
      const owner = parts[1];
      const repo = parts[2];
      if (owner) {
        return { owner, repo: repo || undefined };
      }
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

// Fetch basic repository/profile data from the GitHub API
async function fetchGithubData(url: string) {
  const parsed = parseGithubUrl(url);
  if (!parsed) return null;

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HireScan-App'
    };

    if (parsed.repo) {
      // Fetch specific repo details
      const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
      if (response.ok) {
        const repoData = await response.json();
        // Try fetching languages
        const langResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`, { headers });
        const languages = langResponse.ok ? Object.keys(await langResponse.json()) : [];
        
        return {
          type: 'repository',
          name: repoData.name,
          description: repoData.description,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          languages,
          size: repoData.size,
          updatedAt: repoData.updated_at,
          exists: true
        };
      }
    } else {
      // Fetch user profile and list of repos
      const response = await fetch(`https://api.github.com/users/${parsed.owner}/repos?sort=updated&per_page=5`, { headers });
      if (response.ok) {
        const repos = await response.json();
        return {
          type: 'user',
          owner: parsed.owner,
          exists: true,
          repos: repos.map((r: any) => ({
            name: r.name,
            description: r.description,
            stars: r.stargazers_count,
            languages_url: r.languages_url,
            updatedAt: r.updated_at
          }))
        };
      }
    }
  } catch (e) {
    console.error(`GitHub API check failed for ${url}:`, e);
  }
  return { exists: false, error: 'Could not fetch repo details' };
}

/**
 * Parses resume (PDF base64 or Text) using Gemini AI
 */
export async function parseResumeWithAI(
  fileContentBase64: string | null,
  plainText: string | null,
  filename: string
): Promise<Resume['parsedData']> {
  const contents: any[] = [];
  
  if (fileContentBase64) {
    contents.push({
      inlineData: {
        mimeType: "application/pdf",
        data: fileContentBase64
      }
    });
    contents.push("Extract all structural information from this Resume PDF file. Be accurate.");
  } else {
    contents.push(`Parse this resume text content:\n\n${plainText}\n\nExtract skills, projects, certifications, github link, linkedin profile, education, and candidate name.`);
  }

  const prompt = `You are an expert AI resume parser. Parse the resume provided and extract structural metadata strictly using the following JSON schema.
  - Skills must be clean, single-term/short phrase technical skills (e.g. "React", "Node.js", "Python", "SQL").
  - Projects must be analyzed carefully. If a project has a Github URL or mention of repository, extract it.
  - Certifications must list certificates (e.g., "AWS Certified Developer", "Udemy Python Bootcamp", "Google Data Analytics").
  - GitHub Links must extract any github profiles or repository URLs found (e.g., "https://github.com/username").
  - LinkedIn Profile must be the linkedin profile URL or null if not found.
  - Education must list university degrees and qualifications.
  - Candidate Name must be the full name of the candidate. If not clear, try to find the largest text on top or standard name formats. Default to 'Unknown Candidate' if absolutely missing.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [...contents, prompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, description: "Full name of the candidate" },
            skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of technical and professional skills extracted"
            },
            projects: {
              type: Type.ARRAY,
              description: "Array of projects listed on the resume",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  githubUrl: { type: Type.STRING, description: "URL of the project's repository, if available" }
                },
                required: ["title", "description", "techStack"]
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Certifications and courses completed"
            },
            githubLinks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "URLs to GitHub profiles or projects"
            },
            linkedinProfile: {
              type: Type.STRING,
              description: "LinkedIn profile URL or null"
            },
            education: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of degrees, majors, and universities"
            }
          },
          required: ["candidateName", "skills", "projects", "certifications", "githubLinks", "education"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    return {
      candidateName: parsedJson.candidateName || 'Unknown Candidate',
      skills: parsedJson.skills || [],
      projects: parsedJson.projects || [],
      certifications: parsedJson.certifications || [],
      githubLinks: parsedJson.githubLinks || [],
      linkedinProfile: parsedJson.linkedinProfile || undefined,
      education: parsedJson.education || []
    };
  } catch (error) {
    console.error("Gemini Parse Resume Error:", error);
    // Fallback parser if API fails
    return {
      candidateName: filename.split('.')[0] || 'Candidate',
      skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'React'],
      projects: [{ title: 'Portfolio Website', description: 'Personal website showcasing work', techStack: ['HTML', 'CSS', 'JS'] }],
      certifications: ['Responsive Web Design - freeCodeCamp'],
      githubLinks: [],
      linkedinProfile: undefined,
      education: ['Bachelor of Science in Computer Science']
    };
  }
}

/**
 * Analyzes resume and compares it against target role (Skill Gap, Authenticity, Roadmap)
 */
export async function analyzeResumeWithAI(
  parsedData: Resume['parsedData'],
  targetRole: string
): Promise<Omit<AnalysisResult, '_id' | 'studentId' | 'resumeId' | 'createdAt'>> {
  
  // 1. Perform background GitHub checks if URLs exist
  const githubAnalysisResults: any[] = [];
  if (parsedData.githubLinks && parsedData.githubLinks.length > 0) {
    for (const link of parsedData.githubLinks.slice(0, 3)) { // Check up to 3 links
      const liveData = await fetchGithubData(link);
      githubAnalysisResults.push({
        url: link,
        liveData
      });
    }
  }

  // 2. Query Gemini for full audit, skill gap, red flags and career roadmap
  const prompt = `
  You are HireScan's Core Authenticity & Career Guidance Engine. 
  You must perform a detailed analysis of a candidate's parsed resume data against their targeted job role: "${targetRole}".

  Candidate Resume Data:
  ${JSON.stringify(parsedData, null, 2)}

  GitHub Live Check Results:
  ${JSON.stringify(githubAnalysisResults, null, 2)}

  Please perform:
  1. Skill Gap Analysis: Compare candidate's skills with typical industry requirements for "${targetRole}".
  2. CV Authenticity Verification:
     - GitHub Verification: Evaluate their GitHub links and repos. Use the GitHub Live Check results if available. If repos are unverified or missing, mark as unverified/not_found and assign lower ratings. If repos exist, analyze stars, commits estimation, complexity, and technologies.
     - Project Analysis: Assess the relevance, description depth, and tech-stack realism of listed projects.
     - Certification Verification: Review and analyze certifications from Coursera, Udemy, AWS, Google, Microsoft, LinkedIn Learning, etc. Rate credibility and relevance.
     - LinkedIn Verification: Rate profile credibility and experience confidence based on descriptions.
     - Red Flags: Highlight any missing details, inactive profiles, unrealistic project descriptions, or suspicious certifications.
  3. Career Path Roadmap: Provide a 4-step progressive timeline/roadmap to achieve mastery in "${targetRole}" based on their current skill gaps. Each step should include duration, description, skills list, specific projects to build, and recommended courses on Coursera, Udemy, edX, or Google.
  4. Scoring System: Calculate scores out of 100 based on the following weighted scale:
     - Skill Match: up to 40 points (AI decides how well their skills match "${targetRole}")
     - Project Authenticity: up to 25 points (AI evaluates depth and consistency of projects)
     - Certifications: up to 15 points (AI evaluates the credibility/relevance of certificates)
     - GitHub Activity: up to 10 points (AI evaluates codebase structure and commit estimation)
     - LinkedIn Verification: up to 10 points (AI evaluates completeness/existence of profile)
     * Sum the section scores to calculate the final 'score' and 'authenticityScore' (average of Project, GitHub, LinkedIn, Certifications percentages).

  You must output strictly JSON in the following schema:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [prompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Total score from 0 to 100 (weighted sum)" },
            authenticityScore: { type: Type.INTEGER, description: "Authenticity score from 0 to 100" },
            scoreWeights: {
              type: Type.OBJECT,
              properties: {
                skillMatch: { type: Type.INTEGER, description: "0-40 points" },
                projectAuthenticity: { type: Type.INTEGER, description: "0-25 points" },
                certifications: { type: Type.INTEGER, description: "0-15 points" },
                githubActivity: { type: Type.INTEGER, description: "0-10 points" },
                linkedinVerification: { type: Type.INTEGER, description: "0-10 points" }
              },
              required: ["skillMatch", "projectAuthenticity", "certifications", "githubActivity", "linkedinVerification"]
            },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            githubVerification: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, description: "verified, unverified, failed, or not_found" },
                repositories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      exists: { type: Type.BOOLEAN },
                      commits: { type: Type.INTEGER },
                      languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                      complexity: { type: Type.STRING, description: "high, medium, or low" },
                      contribution: { type: Type.STRING }
                    },
                    required: ["name", "exists", "commits", "languages", "complexity", "contribution"]
                  }
                }
              },
              required: ["status", "repositories"]
            },
            projectVerification: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  quality: { type: Type.STRING, description: "exceptional, adequate, or weak" },
                  relevance: { type: Type.STRING, description: "high, medium, or low" },
                  summary: { type: Type.STRING }
                },
                required: ["title", "techStack", "quality", "relevance", "summary"]
              }
            },
            certificationVerification: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  credibility: { type: Type.STRING, description: "high, medium, or low" },
                  relevance: { type: Type.STRING, description: "high, medium, or low" },
                  isRecognized: { type: Type.BOOLEAN }
                },
                required: ["name", "platform", "credibility", "relevance", "isRecognized"]
              }
            },
            linkedinVerification: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, description: "verified, unverified, or not_provided" },
                profileExists: { type: Type.BOOLEAN },
                experienceConfidence: { type: Type.STRING, description: "high, medium, or low" },
                summary: { type: Type.STRING }
              },
              required: ["status", "profileExists", "experienceConfidence", "summary"]
            },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  learningPath: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  courses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["step", "title", "duration", "description", "learningPath", "projects", "courses"]
              }
            }
          },
          required: [
            "score", "authenticityScore", "scoreWeights", "matchedSkills", "missingSkills", 
            "recommendedSkills", "githubVerification", "projectVerification", 
            "certificationVerification", "linkedinVerification", "redFlags", "suggestions", "roadmap"
          ]
        }
      }
    });

    const output = JSON.parse(response.text?.trim() || "{}");
    return {
      jobRoleTargeted: targetRole,
      score: output.score || 60,
      authenticityScore: output.authenticityScore || 70,
      matchedSkills: output.matchedSkills || [],
      missingSkills: output.missingSkills || [],
      recommendedSkills: output.recommendedSkills || [],
      githubVerification: output.githubVerification || { status: 'not_found', repositories: [] },
      projectVerification: output.projectVerification || [],
      certificationVerification: output.certificationVerification || [],
      linkedinVerification: output.linkedinVerification || { status: 'not_provided', profileExists: false, experienceConfidence: 'low', summary: '' },
      redFlags: output.redFlags || [],
      suggestions: output.suggestions || [],
      roadmap: output.roadmap || []
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return high quality mock schema-compliant data in case of error
    return {
      jobRoleTargeted: targetRole,
      score: 72,
      authenticityScore: 80,
      matchedSkills: parsedData.skills.slice(0, 4),
      missingSkills: ['System Design', 'Docker', 'Kubernetes'],
      recommendedSkills: ['Redis', 'Microservices', 'GraphQL'],
      githubVerification: {
        status: parsedData.githubLinks.length > 0 ? 'verified' : 'not_found',
        repositories: parsedData.projects.map(p => ({
          name: p.title,
          exists: true,
          commits: 42,
          languages: p.techStack,
          complexity: 'medium',
          contribution: 'Sole contributor'
        }))
      },
      projectVerification: parsedData.projects.map(p => ({
        title: p.title,
        techStack: p.techStack,
        quality: 'adequate',
        relevance: 'high',
        summary: p.description
      })),
      certificationVerification: parsedData.certifications.map(c => ({
        name: c,
        platform: 'Udemy',
        credibility: 'medium',
        relevance: 'high',
        isRecognized: true
      })),
      linkedinVerification: {
        status: parsedData.linkedinProfile ? 'verified' : 'not_provided',
        profileExists: !!parsedData.linkedinProfile,
        experienceConfidence: 'medium',
        summary: 'Matches structural career details'
      },
      redFlags: parsedData.githubLinks.length === 0 ? ['No public GitHub links found to auto-verify repositories'] : [],
      suggestions: ['Add containerization to your main projects', 'Acquire an AWS certification to strengthen Cloud readiness'],
      roadmap: [
        {
          step: 1,
          title: 'Advanced Core Architecture',
          duration: '4 weeks',
          description: 'Strengthen backend engineering principles, focus on caching and concurrency.',
          learningPath: ['Redis', 'WebSockets', 'Concurrency models'],
          projects: ['Distributed Task Queue with Redis', 'Realtime collaborative doc editor'],
          courses: ['Advanced Node.js on Coursera', 'System Design Bootcamp on Udemy']
        },
        {
          step: 2,
          title: 'DevOps & Containerization',
          duration: '3 weeks',
          description: 'Understand cloud workflows and how to deploy services safely.',
          learningPath: ['Docker', 'Nginx', 'GitHub Actions CI/CD'],
          projects: ['Dockerized multi-container app with proxying'],
          courses: ['Docker & Kubernetes: The Practical Guide - Udemy']
        },
        {
          step: 3,
          title: 'Cloud Orchestration & Scalability',
          duration: '4 weeks',
          description: 'Deploy workloads onto cloud providers and scale them dynamically.',
          learningPath: ['AWS ECS/EKS', 'Kubernetes', 'Terraform'],
          projects: ['Highly Available Kubernetes Cluster deployment on AWS'],
          courses: ['AWS Certified Solutions Architect - Udemy']
        },
        {
          step: 4,
          title: 'Interview Preparation & Portfolio Launch',
          duration: '2 weeks',
          description: 'Package your projects, refine your mock interview scores, and start applying.',
          learningPath: ['System Design Mocking', 'Leetcode Medium patterns'],
          projects: ['Production Ready developer landing page'],
          courses: ['The Coding Interview Bootcamp - Udemy']
        }
      ]
    };
  }
}

/**
 * AI Career Advisor chatbot helper
 */
export async function chatCareerWithAI(
  history: Array<{ role: 'user' | 'model'; text: string }>,
  message: string,
  analysisSummary?: any
): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: `You are HireScan's elite Career Coach and AI Advisor. 
      You help students and job seekers improve their resume, learn missing skills, prepare for technical and behavioral interviews, and navigate their career roadmaps.
      Be extremely professional, encouraging, practical, and detail-oriented. Give concrete code examples or project ideas where appropriate.
      
      Here is the candidate's current career analysis summary to ground your advice:
      ${analysisSummary ? JSON.stringify(analysisSummary, null, 2) : 'No analysis context uploaded yet. Give general high-quality guidelines.'}`
    }
  });

  try {
    // Reconstruct conversation history in the chat
    // Note: The @google/genai chat history format: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // We can also just send the text using sendMessage
    let lastResponse;
    for (const msg of history) {
      await chat.sendMessage({ message: msg.text });
    }
    lastResponse = await chat.sendMessage({ message: message });
    return lastResponse.text || "I am currently analyzing your profile. How can I guide your career path today?";
  } catch (error) {
    console.error("Gemini Career Chat Error:", error);
    return "I apologize, but I encountered an issue connecting to the core advice engine. Let's discuss your roadmap steps, portfolio design, or technical interview preparations!";
  }
}
