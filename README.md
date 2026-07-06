# HireScan — AI-Powered Talent Verification & Career Roadmap Suite

HireScan is a professional-grade, dual-portal full-stack application designed to bridge the trust gap between candidates and recruiters. By leveraging server-side Gemini AI models and simulated social verification networks (LinkedIn profile checks, public GitHub repository code audits), HireScan evaluates the authenticity of CVs, highlights technical skill gaps, generates automated learning roadmaps for students/candidates, and provides recruiters with a unified shortlist dashboard.

---

## 🌟 Key Features

### 👨‍🎓 1. Student & Candidate Career Portal
* **Interactive CV Parser:** Drag-and-drop or select PDF resumes to parse contact details, technical skillsets, and projects.
* **AI Career Intelligence Audit:** Maps extracted skills directly against desired job roles, highlighting matching baseline proficiencies, missing target skills, and recommended future stacks.
* **Authenticity Scoring:** Auto-evaluates CV claims against simulated external profiles (GitHub/LinkedIn) to calculate a credibility confidence index.
* **Smart Timeline Roadmaps:** Generates customized step-by-step learning milestones complete with estimated durations and specific recommended resource paths.
* **Downloadable PDF/HTML Reports:** Students can export fully stylized standalone HTML/PDF reports of their audits to share or save offline.

### 💼 2. Recruiter & Administrator Workspace
* **Centralized Dashboard:** Real-time metrics overview including total candidates screened, average compatibility matching scores, and shortlisted percentages.
* **Dual-Portal AI Verification:** Review comprehensive audits for each candidate, including public GitHub commit details, LinkedIn trust status, and AI-highlighted resume "Red Flags" (e.g., skill claim inflation or timeline discrepancies).
* **Workspace Management:** 
  * **Individual Deletion:** Remove stale candidate profiles with an interactive custom modal verification prompt.
  * **Global Database Purging:** A safe, custom dialog-gated database purge to clear all logged metadata indexes.
* **Shortlist Exporting:** One-click download of a compiled, print-friendly HTML/PDF applicant leaderboard sorted by matching weights.

---

## ⚙️ Prerequisites

Before setting up HireScan locally, ensure your development machine has the following tools installed:
* **Node.js:** `v18.0.0` or higher (`v20+` recommended)
* **npm:** `v9.0.0` or higher
* **Visual Studio Code (VS Code):** Recommended code editor
* **Gemini API Key:** A valid API key from Google AI Studio to run the AI resume scanning engine.

---

## 🚀 Step-by-Step Setup in VS Code

### Step 1: Open the Project in VS Code
1. Extract the downloaded ZIP or clone the project repository.
2. Launch VS Code.
3. Click on **File > Open Folder...** and select the root directory containing `package.json`.

### Step 2: Install Project Dependencies
Open the VS Code Integrated Terminal (press ``Ctrl + ` `` or click **Terminal > New Terminal**) and execute:
```bash
npm install
```
This will download and populate the `node_modules` folder with all required frontend and server libraries, including Express, Vite, `@google/genai`, React, Recharts, and Tailwind CSS.

### Step 3: Configure Environment Variables
1. In the root directory, locate the `.env.example` file.
2. Create a copy of this file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open your newly created `.env` file and replace the placeholder values with your real keys:
   ```env
   # Obtain your key from https://aistudio.google.com/
   GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"

   # URL of your local or hosted instance (used for relative links)
   APP_URL="http://localhost:3000"
   ```

---

## 💻 Running the Application

### 1. Running in Development Mode (Recommended)
To launch the frontend with Hot Module Replacement and the live Express server simultaneously, run:
```bash
npm run dev
```
* **Host Address:** `http://localhost:3000`
* **Port Mapping:** The application strictly listens on port **3000** as mapped by the backend integration.
* **Vite Integration:** In development, Express automatically mounts Vite's middleware wrapper, allowing you to edit React components under `src/` and view real-time screen updates immediately.

### 2. Building for Production
To bundle and compile the application for production deployment, execute:
```bash
npm run build
```
This performs a two-stage compilation pipeline:
1. **Frontend Compilation:** Vite compiles React + Tailwind into highly-optimized static files inside `dist/`.
2. **Server Compilation:** `esbuild` bundles the server-side TypeScript files (`server.ts` and routes) into a single production-ready CommonJS file (`dist/server.cjs`).

### 3. Starting the Production Bundle
To start the pre-built, self-contained server, run:
```bash
npm start
```
The server will boot and serve the static client asset bundle from the `dist/` directory on `http://localhost:3000`.

---

## 📂 Project Architecture Overview

```text
├── .env.example             # Template for local environment configuration
├── server.ts                # Primary production Express server entry point
├── vite.config.ts           # Configuration for Vite and Tailwind bundle engine
├── db.json                  # Local file database for persistence
├── metadata.json            # Application name and system permissions config
├── src/
│   ├── main.tsx             # Frontend entry point
│   ├── App.tsx              # Main routing and global navigation wrapper
│   ├── index.css            # Global CSS importing Tailwind utility layout
│   ├── types.ts             # Shared TypeScript models (Candidate, Audit, JobRole)
│   ├── components/          # High-fidelity React components:
│   │   ├── Sidebar.tsx           # Global navigation and responsive sidebar drawer
│   │   ├── StudentDashboard.tsx  # Dynamic candidate dashboard & parser UI
│   │   ├── StudentAnalysis.tsx   # Detailed analysis, roadmap timeline, & report export
│   │   ├── RecruiterDashboard.tsx# Recruiter dashboard, leaderboard, & purge controllers
│   │   └── CandidateProfile.tsx  # Verified CV audit, GitHub/LinkedIn scores & red flags
│   └── server/              # Server-side backend architecture:
│       ├── routes.ts             # Express API routing layer (CV parsing, deletion, purges)
│       ├── db.ts                 # Local JSON file database persistence controller
│       ├── auth.ts               # Simple mockup session/token generator
│       └── gemini.ts             # Google GenAI SDK client, prompt templates, & parser schemas
```

---

## 🛠️ Troubleshooting & Support

### "Gemini API Key is missing or invalid"
Ensure that your `.env` file is named exactly `.env` (no additional extensions) and contains `GEMINI_API_KEY="..."` with a key generated from Google AI Studio.

### "Port 3000 is already in use"
If another application is running on port 3000, you can kill the existing process or stop the active container. On Unix-based machines, run:
```bash
kill -9 $(lsof -t -i:3000)
```

### "Failed to parse PDF"
HireScan uses advanced Gemini multimodel inputs to extract structured data directly from PDF files. Ensure your uploaded resume is a valid, readable file. If the parser complains, check your internet connectivity to ensure server-side API requests to Google's server can resolve.

---

*HireScan is built on a modern stack using React, Express, Tailwind CSS, and the Google Gemini AI Platform.*
