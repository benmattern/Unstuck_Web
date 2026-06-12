import { supabase } from "../lib/supabaseClient";
import type { SupabaseSession } from "../types/session";

export async function fetchSessions(): Promise<{ data: SupabaseSession[] | null; error: any }> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as SupabaseSession[]) ?? null, error };
}

export async function createShortCheckIn(answers_json: unknown): Promise<{ error: any }> {
  const { error } = await supabase
    .from("sessions")
    .insert([
      {
        form_type: "short_check_in",
        answers_json,
      },
    ]);

  return { error };
}
