export type QuestionType = 'text' | 'textarea' | 'number' | 'scale' | 'select';

export interface CheckInSection {
  id:          string;
  title:       string;
  order_index: number;
}

export interface CheckInQuestion {
  id:            string;
  section_id:    string;
  question_text: string;
  helper_text:   string | null;
  type:          QuestionType;
  options:       Array<{ value: string; label: string }> | null;
  order_index:   number;
  is_required:   boolean;
}

export interface CheckInAnswer {
  question_id:  string;
  answer_text:  string | null;
  answer_json:  unknown;
}

export interface CheckInSubmission {
  id:           string;
  period_year:  number;
  period_month: number;
  submitted_at: string;
}
