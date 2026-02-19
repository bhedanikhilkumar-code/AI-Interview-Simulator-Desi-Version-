export type InterviewConfig = {
  track: "Frontend" | "Backend" | "Fullstack" | "Data" | "HR" | "Fresher";
  experience: "Fresher" | "0-2" | "2-5" | "5+";
  languageStyle: "Hinglish" | "English" | "Hindi";
  difficulty: "Easy" | "Medium" | "Hard";
  companyVibe: "Startup" | "MNC" | "Product-based" | "Service-based";
  timeLimit: 10 | 20 | 30;
  resumeText?: string;
  skills?: string[];
};

export type ChatMessage = { id: string; role: "interviewer" | "candidate"; content: string; createdAt?: string };
