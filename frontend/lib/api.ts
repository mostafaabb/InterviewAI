const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchAPI("/auth/register", { method: "POST", body: data }),
  login: (data: { email: string; password: string }) =>
    fetchAPI("/auth/login", { method: "POST", body: data }),
  googleAuth: (credential: string) =>
    fetchAPI("/auth/google", { method: "POST", body: { credential } }),
  forgotPassword: (email: string) =>
    fetchAPI("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) =>
    fetchAPI("/auth/reset-password", { method: "POST", body: { token, password } }),
  verifyEmail: (token: string) =>
    fetchAPI("/auth/verify-email", { method: "POST", body: { token } }),
  getMe: () => fetchAPI("/auth/me"),
  updateProfile: (data: { name?: string; image?: string }) =>
    fetchAPI("/auth/profile", { method: "PUT", body: data }),
};

export const interviews = {
  start: (data: { category: string; difficulty: string; type: string; style?: string; timed?: boolean }) =>
    fetchAPI("/interviews", { method: "POST", body: data }),
  sendMessage: (id: string, answer: string) =>
    fetchAPI(`/interviews/${id}/message`, { method: "POST", body: { answer } }),
  end: (id: string) => fetchAPI(`/interviews/${id}/end`, { method: "POST" }),
  getAll: () => fetchAPI("/interviews"),
  getOne: (id: string) => fetchAPI(`/interviews/${id}`),
};

export const challenges = {
  getAll: (params?: { category?: string; difficulty?: string }) => {
    const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v != null));
    const query = new URLSearchParams(cleanParams).toString();
    return fetchAPI(`/challenges${query ? `?${query}` : ""}`);
  },
  getOne: (id: string) => fetchAPI(`/challenges/${id}`),
  submit: (id: string, code: string, language: string) =>
    fetchAPI(`/challenges/${id}/submit`, { method: "POST", body: { code, language } }),
  getSubmissions: () => fetchAPI("/challenges/submissions"),
  getSubmission: (id: string) => fetchAPI(`/challenges/submissions/${id}`),
};

export const payments = {
  createCheckoutSession: (plan: string) =>
    fetchAPI("/payments/create-checkout-session", { method: "POST", body: { plan } }),
  createPortalSession: () =>
    fetchAPI("/payments/create-portal-session", { method: "POST" }),
  getSubscription: () => fetchAPI("/payments/subscription"),
};

export const progress = {
  get: (period?: string) => fetchAPI(`/progress${period ? `?period=${period}` : ""}`),
  getStats: () => fetchAPI("/progress/stats"),
  getSkills: () => fetchAPI("/progress/skills"),
};

export const admin = {
  getDashboard: () => fetchAPI("/admin/dashboard"),
  getUsers: (page?: number) => fetchAPI(`/admin/users${page ? `?page=${page}` : ""}`),
  updateUser: (id: string, data: any) =>
    fetchAPI(`/admin/users/${id}`, { method: "PUT", body: data }),
  deleteUser: (id: string) => fetchAPI(`/admin/users/${id}`, { method: "DELETE" }),
  createChallenge: (data: any) =>
    fetchAPI("/admin/challenges", { method: "POST", body: data }),
  updateChallenge: (id: string, data: any) =>
    fetchAPI(`/admin/challenges/${id}`, { method: "PUT", body: data }),
  deleteChallenge: (id: string) =>
    fetchAPI(`/admin/challenges/${id}`, { method: "DELETE" }),
  getAnalytics: () => fetchAPI("/admin/analytics"),
};

export const resumes = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/resumes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  getAll: () => fetchAPI("/resumes"),
  getOne: (id: string) => fetchAPI(`/resumes/${id}`),
};

export const jobDescriptions = {
  analyze: (content: string) =>
    fetchAPI("/job-descriptions/analyze", { method: "POST", body: { content } }),
  getAll: () => fetchAPI("/job-descriptions"),
};

export const learningPaths = {
  generate: (data: { targetRole: string; experienceLevel: string; focusAreas?: string[] }) =>
    fetchAPI("/learning-paths/generate", { method: "POST", body: data }),
  getAll: () => fetchAPI("/learning-paths"),
};

export const whiteboards = {
  save: (data: { name: string; data: any; type: string }) =>
    fetchAPI("/whiteboards", { method: "POST", body: data }),
  getAll: () => fetchAPI("/whiteboards"),
  getOne: (id: string) => fetchAPI(`/whiteboards/${id}`),
  delete: (id: string) => fetchAPI(`/whiteboards/${id}`, { method: "DELETE" }),
};

export const peerSessions = {
  create: (data: { category: string; difficulty: string }) =>
    fetchAPI("/peer-sessions", { method: "POST", body: data }),
  findMatch: (category: string, difficulty: string) =>
    fetchAPI(`/peer-sessions/find?category=${category}&difficulty=${difficulty}`),
  join: (id: string) => fetchAPI(`/peer-sessions/${id}/join`, { method: "POST" }),
  submitFeedback: (id: string, data: { score: number; feedback: string }) =>
    fetchAPI(`/peer-sessions/${id}/feedback`, { method: "POST", body: data }),
  getMine: () => fetchAPI("/peer-sessions/mine"),
};

export const starAnswers = {
  create: (data: { situation: string; task: string; action: string; result: string; category?: string }) =>
    fetchAPI("/star-answers", { method: "POST", body: data }),
  getAll: () => fetchAPI("/star-answers"),
  getOne: (id: string) => fetchAPI(`/star-answers/${id}`),
  delete: (id: string) => fetchAPI(`/star-answers/${id}`, { method: "DELETE" }),
};

export const insights = {
  getAll: (company?: string) => fetchAPI(`/insights${company ? `?company=${company}` : ""}`),
  create: (data: any) => fetchAPI("/insights", { method: "POST", body: data }),
};

export const leaderboard = {
  get: () => fetchAPI("/leaderboard"),
  getWeekly: () => fetchAPI("/leaderboard/weekly"),
};

export const studyPlans = {
  create: (data: { targetRole: string; targetDate?: string; focusAreas?: string[] }) =>
    fetchAPI("/study-plans", { method: "POST", body: data }),
  getAll: () => fetchAPI("/study-plans"),
  update: (id: string, data: { dayIndex: number }) =>
    fetchAPI(`/study-plans/${id}`, { method: "PUT", body: data }),
};

export const resumeTemplates = {
  getAll: () => fetchAPI("/resume-templates"),
  save: (data: any) => fetchAPI("/resume-templates", { method: "POST", body: data }),
};

export const systemDesignTemplates = {
  getAll: () => fetchAPI("/system-design-templates"),
  getOne: (id: string) => fetchAPI(`/system-design-templates/${id}`),
  save: (data: any) => fetchAPI("/system-design-templates", { method: "POST", body: data }),
};
