export type PreferredTheme = "system" | "light" | "dark";

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_theme: PreferredTheme;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
