export type ServiceType = 'cleaning' | 'gardening' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'maintenance' | 'car_wash';

export interface LearningModule {
  id: string;
  service_type: ServiceType;
  title: string;
  description?: string;
  youtube_url?: string;
  notes?: string;
  notes_pdf_url?: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  question_order: number;
  created_at: string;
}

export interface CreateModuleRequest {
  service_type: ServiceType;
  title: string;
  description?: string;
  youtube_url?: string;
  notes?: string;
  notes_pdf_url?: string;
  is_published?: boolean;
  display_order?: number;
}

export interface CreateQuestionRequest {
  module_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  question_order?: number;
}

// New interfaces for provider learning flow
export interface ProviderLearningProgress {
  id: string;
  provider_id: string;
  module_id: string;
  service_type: ServiceType;
  completed_at?: string;
  quiz_score: number;
  quiz_attempts: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderCertificate {
  id: string;
  provider_id: string;
  service_type: ServiceType;
  certificate_id: string;
  issued_at: string;
  pdf_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  provider_id: string;
  module_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  attempt_number: number;
  answered_at: string;
}

export interface QuizSubmission {
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
}

export interface ModuleWithProgress extends LearningModule {
  progress?: ProviderLearningProgress;
  questions?: QuizQuestion[];
}
