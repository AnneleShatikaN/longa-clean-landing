
export type ServiceType = 'cleaning' | 'gardening' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'maintenance';

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
