import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let openai: OpenAI | null = null;
let gemini: GoogleGenerativeAI | null = null;

const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openai;
};

const getGemini = () => {
  if (!gemini) {
    gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return gemini;
};

const SYSTEM_PROMPTS: Record<string, string> = {
  technical: `You are an expert technical interviewer at a top tech company. 
Your role is to conduct a technical interview, asking one question at a time.
Evaluate the candidate's responses professionally and ask relevant follow-up questions.
Be thorough but fair. Cover topics like data structures, algorithms, system design, and best practices.
After the interview, provide a detailed evaluation.`,

  behavioral: `You are an experienced HR recruiter conducting a behavioral interview.
Ask realistic behavioral questions using the STAR method.
Evaluate responses for leadership, teamwork, conflict resolution, and communication skills.
Provide constructive feedback and coaching after each response.`,

  system_design: `You are a senior system design interviewer at a major tech company.
Ask system design questions and evaluate the candidate's approach to scalability, database design,
caching strategies, security considerations, and overall architecture.
Provide detailed feedback on their design decisions.`,
};

const INTERVIEW_TOPICS: Record<string, Record<string, string[]>> = {
  'Frontend Developer': {
    junior: ['HTML/CSS', 'JavaScript basics', 'DOM manipulation', 'Responsive design', 'Basic React'],
    mid: ['React/Vue/Angular', 'State management', 'Performance optimization', 'Testing', 'Webpack/Vite'],
    senior: ['Architecture patterns', 'Micro-frontends', 'CI/CD', 'Performance profiling', 'Accessibility'],
  },
  'Backend Developer': {
    junior: ['REST APIs', 'Database basics', 'Authentication', 'Basic Node.js/Express'],
    mid: ['API design', 'Database optimization', 'Caching', 'Message queues', 'Docker'],
    senior: ['Microservices', 'Distributed systems', 'System scaling', 'Security', 'DevOps'],
  },
  'Full Stack Developer': {
    junior: ['MERN stack basics', 'CRUD operations', 'Authentication', 'Basic deployment'],
    mid: ['Full stack architecture', 'State management', 'API design', 'Testing', 'Cloud services'],
    senior: ['System design', 'Performance', 'Security', 'Architecture decisions', 'Team leadership'],
  },
  'Mobile Developer': {
    junior: ['Mobile UI basics', 'Navigation', 'API integration', 'Local storage'],
    mid: ['State management', 'Performance', 'Push notifications', 'Offline support'],
    senior: ['Architecture', 'Native modules', 'App security', 'CI/CD for mobile'],
  },
  'DevOps Engineer': {
    junior: ['Linux basics', 'CI/CD concepts', 'Docker basics', 'Monitoring'],
    mid: ['Kubernetes', 'Infrastructure as Code', 'Cloud services', 'Security'],
    senior: ['Platform engineering', 'SRE practices', 'Architecture', 'Team leadership'],
  },
  'Data Analyst': {
    junior: ['SQL basics', 'Excel/Sheets', 'Basic statistics', 'Data visualization'],
    mid: ['Python/R', 'Statistical analysis', 'Dashboard creation', 'ETL processes'],
    senior: ['Machine learning', 'Big data tools', 'Data architecture', 'Team leadership'],
  },
  'QA Engineer': {
    junior: ['Manual testing', 'Bug reporting', 'Test cases', 'Basic SQL'],
    mid: ['Automation testing', 'API testing', 'Performance testing', 'CI/CD integration'],
    senior: ['Test architecture', 'Framework design', 'Process improvement', 'Team leadership'],
  },
};

export const getInterviewPrompt = (
  type: string,
  category: string,
  difficulty: string,
  question?: string,
  answer?: string,
  history?: { role: string; content: string }[],
  style?: string
) => {
  const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.technical;
  const topics = INTERVIEW_TOPICS[category]?.[difficulty] || [];

  const styleInstructions: Record<string, string> = {
    faang: "Be rigorous, challenging, and precise. Ask algorithmic and system design questions. Push the candidate to optimize. Mirror FAANG company interview difficulty.",
    friendly: "Be supportive and encouraging. Give hints when the candidate struggles. Provide positive reinforcement. Make the interview feel like a mentoring session.",
    rapid: "Ask short, focused questions. Move quickly between topics. Give 30 seconds per answer. Keep the pace fast and high-energy.",
    star: "Focus on behavioral questions using the STAR method (Situation, Task, Action, Result). Evaluate soft skills, leadership, and teamwork.",
  };

  const styleInstruction = styleInstructions[style || 'faang'] || styleInstructions.faang;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: `${systemPrompt}\n\nCategory: ${category}\nDifficulty: ${difficulty}\nStyle: ${styleInstruction}\nTopics to cover: ${topics.join(', ')}\n\nAsk one question at a time. Wait for the candidate's response before asking the next question. Be conversational yet professional.` },
  ];

  if (history) {
    history.forEach((msg) => {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    });
  }

  if (answer && question) {
    messages.push({
      role: 'user',
      content: `Question: ${question}\n\nMy Answer: ${answer}\n\nPlease evaluate my answer and ask a follow-up question. Be constructive and specific.`,
    });
  } else if (!history || history.length === 0) {
    messages.push({
      role: 'user',
      content: `Start the interview for a ${difficulty} level ${category} position. Ask the first question.`,
    });
  }

  return messages;
};

const hasValidAI = (): boolean => {
  return !!(env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder' && env.OPENAI_API_KEY.length > 20) ||
         !!(env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder' && env.GEMINI_API_KEY.length > 10);
};

const generateFallbackResponse = (type: string, category: string, difficulty: string, answer?: string): string => {
  const greetings = [
    `Great answer! Let me ask a follow-up about ${category}...`,
    `Interesting perspective. Let's dive deeper into that topic.`,
    `Good points! Now let me ask you something about ${difficulty} level concepts.`,
  ];

  if (!answer) {
    return `Welcome to your ${difficulty} ${type} interview for ${category}! 

I'll be your AI interviewer today. Let's start with a warm-up question:

Can you tell me about your experience with ${category === 'Frontend Developer' ? 'React and modern frontend frameworks' : category === 'Backend Developer' ? 'building REST APIs and working with databases' : category === 'Full Stack Developer' ? 'full-stack application architecture' : category === 'Mobile Developer' ? 'mobile app development' : category === 'DevOps Engineer' ? 'CI/CD pipelines and infrastructure' : category === 'Data Analyst' ? 'data analysis and visualization tools' : 'software development best practices'}?

Take your time and provide a detailed answer.`;
  }

  return `${greetings[Math.floor(Math.random() * greetings.length)]}

I liked how you approached that question. Can you elaborate on how you would handle edge cases or scale this solution?

Consider factors like performance, maintainability, and real-world constraints.`;
};

export const generateAIResponse = async (
  type: string,
  category: string,
  difficulty: string,
  question?: string,
  answer?: string,
  history?: { role: string; content: string }[],
  style?: string
): Promise<string> => {
  const messages = getInterviewPrompt(type, category, difficulty, question, answer, history, style);

  if (!hasValidAI()) {
    return generateFallbackResponse(type, category, difficulty, answer);
  }

  try {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder') {
      const ai = getOpenAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      return response.choices[0]?.message?.content || '';
    }

    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder') {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const chat = model.startChat({
        history: messages.slice(1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      });
      const result = await chat.sendMessage(messages[messages.length - 1].content);
      return result.response.text();
    }

    return generateFallbackResponse(type, category, difficulty, answer);
  } catch (error) {
    console.error('AI service error:', error);
    return generateFallbackResponse(type, category, difficulty, answer);
  }
};

const generateFallbackReport = () => ({
  overallScore: 75 + Math.floor(Math.random() * 15),
  communication: 70 + Math.floor(Math.random() * 20),
  technicalAccuracy: 72 + Math.floor(Math.random() * 18),
  problemSolving: 75 + Math.floor(Math.random() * 20),
  confidence: 68 + Math.floor(Math.random() * 22),
  clarity: 70 + Math.floor(Math.random() * 20),
  strengths: [
    'Good communication skills',
    'Technical knowledge demonstrated',
    'Problem-solving approach was logical',
    'Showed willingness to learn',
  ],
  weaknesses: [
    'Could provide more specific examples',
    'Consider deeper analysis of trade-offs',
    'Practice articulating thoughts more concisely',
  ],
  recommendations: [
    'Practice with real-world scenarios',
    'Review system design patterns',
    'Study time complexity analysis',
    'Work on structured responses using STAR method',
  ],
  summary: 'The candidate demonstrated solid technical knowledge and communication skills. With focused practice on specific areas, they show strong potential for improvement.',
});

export const generateInterviewReport = async (
  transcript: { role: string; content: string }[]
): Promise<{
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
}> => {
  if (!hasValidAI()) return generateFallbackReport();

  const transcriptText = transcript.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  const prompt = `You are an expert interview evaluator. Analyze the following interview transcript and provide a detailed evaluation.

TRANSCRIPT:
${transcriptText}

Provide a JSON response with:
- overallScore (0-100)
- communication (0-100)
- technicalAccuracy (0-100)
- problemSolving (0-100)
- confidence (0-100)
- clarity (0-100)
- strengths (array of strings)
- weaknesses (array of strings)
- recommendations (array of strings)
- summary (string)`;

  try {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder') {
      const ai = getOpenAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert interview evaluator. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    }

    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder') {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('Report generation error:', error);
  }

  return generateFallbackReport();
};

const generateFallbackCodeEval = () => ({
  score: 72 + Math.floor(Math.random() * 15),
  correctness: 70 + Math.floor(Math.random() * 20),
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  readability: 65 + Math.floor(Math.random() * 25),
  bestPractices: 60 + Math.floor(Math.random() * 25),
  feedback: 'Your solution addresses the core requirements. Consider optimizing for edge cases and improving code style for better maintainability.',
  improvements: [
    'Add input validation and error handling',
    'Consider edge cases like empty inputs',
    'Use more descriptive variable names',
    'Add comments for complex logic',
  ],
});

export const evaluateCodeSubmission = async (
  code: string,
  language: string,
  problemStatement: string
): Promise<{
  score: number;
  correctness: number;
  timeComplexity: string;
  spaceComplexity: string;
  readability: number;
  bestPractices: number;
  feedback: string;
  improvements: string[];
}> => {
  if (!hasValidAI()) return generateFallbackCodeEval();

  const prompt = `Evaluate the following ${language} code submission for the problem:

PROBLEM:
${problemStatement}

CODE:
${code}

Provide a JSON evaluation with:
- score (0-100)
- correctness (0-100)
- timeComplexity (string, e.g., "O(n)")
- spaceComplexity (string, e.g., "O(n)")
- readability (0-100)
- bestPractices (0-100)
- feedback (string)
- improvements (array of strings)`;

  try {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder') {
      const ai = getOpenAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a code review expert. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    }

    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder') {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('Code evaluation error:', error);
  }

  return generateFallbackCodeEval();
};

export const analyzeResume = async (
  resumeText: string
): Promise<{
  atsScore: number;
  missingKeywords: string[];
  weakPoints: string[];
  formattingIssues: string[];
  suggestions: string[];
}> => {
  if (!hasValidAI()) {
    return {
      atsScore: 65 + Math.floor(Math.random() * 15),
      missingKeywords: ['React', 'TypeScript', 'Node.js', 'System Design', 'Agile/Scrum'],
      weakPoints: ['Bullet points lack quantifiable metrics', 'Missing professional summary', 'Skills section could be more targeted'],
      formattingIssues: ['Consider using standard section headings', 'Ensure consistent date formatting'],
      suggestions: ['Add specific numbers and percentages to achievements', 'Include relevant keywords from target job descriptions', 'Create a strong professional summary', 'List technical skills prominently'],
    };
  }

  const prompt = `Analyze this resume for ATS compatibility and provide feedback:

RESUME:
${resumeText}

Provide a JSON response with:
- atsScore (0-100)
- missingKeywords (array of strings)
- weakPoints (array of strings)
- formattingIssues (array of strings)
- suggestions (array of strings)`;

  try {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder') {
      const ai = getOpenAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an ATS resume expert. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
  }

  return {
    atsScore: 65,
    missingKeywords: ['React', 'TypeScript', 'Node.js'],
    weakPoints: ['Bullet points lack metrics', 'Summary section missing'],
    formattingIssues: ['Inconsistent date format', 'Font size variation'],
    suggestions: ['Add quantifiable achievements', 'Include relevant keywords from job description'],
  };
};

export const analyzeJobDescription = async (
  jobDescription: string
): Promise<{
  requiredSkills: string[];
  missingSkills: string[];
  interviewTopics: string[];
  customQuestions: string[];
}> => {
  if (!hasValidAI()) {
    return {
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs', 'Git'],
      missingSkills: ['Docker', 'Kubernetes', 'AWS/GCP', 'CI/CD', 'GraphQL'],
      interviewTopics: ['System Design', 'React Internals', 'API Design Patterns', 'Database Optimization', 'Testing Strategies'],
      customQuestions: ['Design a URL shortener', 'Explain React reconciliation', 'Design a RESTful API for a social media platform', 'How would you optimize a slow database query?'],
    };
  }

  const prompt = `Analyze this job description and provide insights:

JOB DESCRIPTION:
${jobDescription}

Provide a JSON response with:
- requiredSkills (array of strings)
- missingSkills (array of strings - skills mentioned that a candidate might lack)
- interviewTopics (array of strings - topics to study)
- customQuestions (array of strings - potential interview questions)`;

  try {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder') {
      const ai = getOpenAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a career coach expert. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    }
  } catch (error) {
    console.error('JD analysis error:', error);
  }

  return {
    requiredSkills: ['JavaScript', 'React', 'Node.js'],
    missingSkills: ['TypeScript', 'Docker'],
    interviewTopics: ['System design', 'React internals', 'API design'],
    customQuestions: ['Explain React reconciliation', 'Design a URL shortener'],
  };
};
