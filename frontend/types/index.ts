export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "CANDIDATE" | "ADMIN";
  plan: "FREE" | "PRO" | "PREMIUM";
  createdAt: string;
};

export type Interview = {
  id: string;
  userId: string;
  category: string;
  difficulty: string;
  type: string;
  score: number | null;
  status: "IN_PROGRESS" | "COMPLETED";
  messages: InterviewMessage[];
  report: InterviewReport | null;
  createdAt: string;
};

export type InterviewMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type InterviewReport = {
  id: string;
  overallScore: number;
  communication: number;
  technicalAccuracy: number;
  problemSolving: number;
  confidence: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
};

export type CodingChallenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints: string | null;
  examples: { input: string; output: string }[] | null;
  testCases: any[] | null;
  boilerplate: any | null;
  languageSupport: any | null;
};

export type Submission = {
  id: string;
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  score: number | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  readability: number | null;
  bestPractices: number | null;
  feedback: string | null;
  challenge?: CodingChallenge;
  createdAt: string;
};

export type Subscription = {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
};

export type Progress = {
  id: string;
  date: string;
  interviewsCompleted: number;
  challengesSolved: number;
  score: number | null;
  type: string;
};

export type SkillLevel = {
  name: string;
  level: number;
  interviewsCount: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  earnedAt?: string;
};

export type Resume = {
  id: string;
  fileUrl: string;
  fileName: string;
  atsScore: number | null;
  missingKeywords: string[];
  weakPoints: string[];
  formattingIssues: string[];
  suggestions: string[];
  createdAt: string;
};

export type JobAnalysis = {
  requiredSkills: string[];
  missingSkills: string[];
  interviewTopics: string[];
  customQuestions: string[];
};

export const INTERVIEW_CATEGORIES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
];

export const INTERVIEW_DIFFICULTIES = ["Junior", "Mid-Level", "Senior"];
export const INTERVIEW_TYPES = ["Technical", "Behavioral", "System Design"];
export const INTERVIEW_STYLES = [
  { value: "faang", label: "FAANG Style", desc: "Rigorous, algorithmic focus like Google/Meta interviews" },
  { value: "friendly", label: "Friendly", desc: "Supportive with hints and encouragement" },
  { value: "rapid", label: "Rapid Fire", desc: "Quick questions, short time per answer" },
  { value: "star", label: "STAR Coach", desc: "Behavioral-focused using Situation-Task-Action-Result" },
];

export const COMPANIES = [
  { name: "Google", color: "from-blue-500 to-green-500", icon: "G" },
  { name: "Meta", color: "from-blue-600 to-indigo-600", icon: "M" },
  { name: "Amazon", color: "from-yellow-500 to-orange-500", icon: "A" },
  { name: "Microsoft", color: "from-blue-400 to-blue-700", icon: "M" },
  { name: "Apple", color: "from-gray-500 to-gray-800", icon: "A" },
  { name: "Netflix", color: "from-red-500 to-red-700", icon: "N" },
];

export const CHALLENGE_CATEGORIES = [
  "Frontend", "Backend", "React", "Node.js", "JavaScript",
  "TypeScript", "Flutter", "Laravel", "SQL", "Algorithms", "Data Structures",
];

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export const SUPPORTED_LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "PHP"];
