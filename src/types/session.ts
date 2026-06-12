export interface SupabaseSession {
  id: string;
  user_id: string;
  form_type: string;
  answers_json: unknown;
  created_at: string;
}
