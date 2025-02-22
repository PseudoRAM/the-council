export interface Question {
  id: string; // UUID from database
  type: 'text' | 'longtext' | 'radio' | 'checkbox' | 'select';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  categoryId: string; // UUID of question category
}

export interface Answer {
  questionId: string;
  value: string | string[];
  lastModified: Date;
}

export interface SurveyProgress {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, Answer>;
  completed: boolean;
  lastSaved: Date;
} 