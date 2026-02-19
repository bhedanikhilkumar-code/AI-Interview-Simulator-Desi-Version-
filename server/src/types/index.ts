export type RoleTrack = "Frontend" | "Backend" | "Fullstack" | "Data" | "HR" | "Fresher";

export type InterviewConfig = {
  track: RoleTrack;
  experience: "Fresher" | "0-2" | "2-5" | "5+";
  languageStyle: "Hinglish" | "English" | "Hindi";
  difficulty: "Easy" | "Medium" | "Hard";
  companyVibe: "Startup" | "MNC" | "Product-based" | "Service-based";
  timeLimit: 10 | 20 | 30;
  resumeText?: string;
  skills?: string[];
};

export type ReportPayload = {
  overallScore: number;
  subscores: {
    communication: number;
    technical: number;
    problemSolving: number;
    confidence: number;
    structure: number;
  };
  strengths: string[];
  improvements: string[];
  weakAnswers: Array<{ question: string; yourAnswer: string; betterAnswer: string }>;
  roadmap7Days: string[];
  roadmap30Days: string[];
  summary: string;
};
