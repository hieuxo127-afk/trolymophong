export interface Subject {
  id: string;
  name: string;
  icon: string;
  questionsCount: number;
}

export interface Question {
  id: string;
  subjectId: string;
  content: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Session {
  id: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  date: string;
}

export interface Progress {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  weakTopics: string[];
}

export interface Settings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoSave: boolean;
  apiKey?: string;
  model: string;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TeacherGuide {
  objectives: string[];
  steps: string[];
  tips: string[];
}

export interface Simulation {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  htmlCode: string;
  parameters: SimulationParameter[];
  practiceQuestions?: PracticeQuestion[];
  teacherGuide?: TeacherGuide;
  createdAt: string;
}

export interface SimulationParameter {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

export interface AppData {
  subjects: Subject[];
  questions: Question[];
  sessions: Session[];
  progress: Progress;
  settings: Settings;
  simulations: Simulation[];
}
