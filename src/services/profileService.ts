import { supabase } from "../lib/supabaseClient";
import type { PreferredTheme, Profile } from "../types/profile";

type ProfileUpdate = {
  display_name?: string | null;
  preferred_theme?: PreferredTheme;
};

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error };
  }

  if (!user) {
    return { user: null, error: new Error("Not authenticated") };
  }

  return { user, error: null };
}

export async function getProfile(): Promise<{ data: Profile | null; error: any }> {
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data: (data as Profile) ?? null, error };
}

export async function updateProfile(
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: any }> {
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .single();

  return { data: (data as Profile) ?? null, error };
}
