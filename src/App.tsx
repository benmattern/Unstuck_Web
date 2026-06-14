import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import AppCard from "./components/AppCard";
import PrimaryButton from "./components/PrimaryButton";
import SecondaryButton from "./components/SecondaryButton";
import SessionsPage from "./pages/SessionsPage";
import NewCheckInPage from "./pages/NewCheckInPage";
import { getProfile, updateProfile } from "./services/profileService";
import type { PreferredTheme, Profile } from "./types/profile";

const supportedThemes: PreferredTheme[] = ["system", "light", "dark"];

function normalizePreferredTheme(value: string | null | undefined): PreferredTheme {
  return supportedThemes.includes(value as PreferredTheme) ? (value as PreferredTheme) : "system";
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [preferredTheme, setPreferredTheme] = useState<PreferredTheme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("usera@test.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"sessions" | "checkin">("sessions");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function resolveTheme() {
      const nextResolvedTheme =
        preferredTheme === "system" ? (mediaQuery.matches ? "dark" : "light") : preferredTheme;

      setResolvedTheme(nextResolvedTheme);
      document.documentElement.dataset.theme = nextResolvedTheme;
      document.documentElement.style.colorScheme = nextResolvedTheme;
    }

    resolveTheme();
    mediaQuery.addEventListener("change", resolveTheme);

    return () => mediaQuery.removeEventListener("change", resolveTheme);
  }, [preferredTheme]);

  useEffect(() => {
    let isMounted = true;

    if (!session) {
      setProfile(null);
      setProfileName("");
      setPreferredTheme("system");
      setProfileError(null);
      setProfileSuccess(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    getProfile()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          setProfile(null);
          setProfileName("");
          setProfileError(error.message || String(error));
          return;
        }

        setProfile(data);
        setProfileName(data?.display_name ?? "");
        setPreferredTheme(normalizePreferredTheme(data?.preferred_theme));
      })
      .catch((err) => {
        if (!isMounted) return;
        setProfile(null);
        setProfileName("");
        setPreferredTheme("system");
        setProfileError(String(err));
      })
      .finally(() => {
        if (isMounted) setProfileLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  async function signIn() {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    const { data, error } = await updateProfile({
      display_name: profileName.trim() || null,
    });

    setProfileSaving(false);

    if (error) {
      setProfileError(error.message || String(error));
      return;
    }

    setProfile(data);
    setProfileName(data?.display_name ?? "");
    if (data?.preferred_theme) {
      setPreferredTheme(normalizePreferredTheme(data.preferred_theme));
    }
    setProfileSuccess("Profile saved.");
  }

  async function saveTheme(nextTheme: PreferredTheme) {
    setPreferredTheme(nextTheme);
    setThemeSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    const { data, error } = await updateProfile({
      preferred_theme: nextTheme,
    });

    setThemeSaving(false);

    if (error) {
      setProfileError(error.message || String(error));
      setPreferredTheme(normalizePreferredTheme(profile?.preferred_theme));
      return;
    }

    setProfile(data);
    setPreferredTheme(normalizePreferredTheme(data?.preferred_theme));
    setProfileSuccess("Theme saved.");
  }

  const signedInEmail = session?.user.email ?? "";
  const fallbackDisplayName = signedInEmail.split("@")[0] || "Signed in user";
  const displayName = profile?.display_name?.trim() || fallbackDisplayName;

  return (
    <div
      className={`min-h-screen ${
        resolvedTheme === "light" ? "bg-slate-100 text-slate-950" : "bg-slate-950 text-slate-100"
      }`}
    >
      <div className="min-h-screen bg-[linear-gradient(145deg,rgba(37,99,235,0.18)_0%,rgba(124,58,237,0.13)_38%,rgba(2,6,23,0)_72%)]">
        <div className="px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/[0.12] bg-slate-950/70 shadow-soft backdrop-blur-2xl">
              <div className="bg-gradient-to-br from-indigo-500/[0.16] via-blue-500/10 to-violet-500/[0.16] px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-5 inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-blue-100/85">
                      Web companion
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      Unstuck Web
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                      Review recent sessions and capture a focused check-in from the browser, with the same calm rhythm as the iOS app.
                    </p>
                  </div>

                  {session && (
                    <div className="rounded-2xl border border-white/[0.12] bg-slate-950/45 p-4 text-sm text-slate-200 shadow-[0_18px_48px_rgba(2,6,23,0.22)] sm:min-w-72">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Signed in
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">
                        {profileLoading ? "Loading profile..." : displayName}
                      </div>
                      <div className="mt-1 break-all text-sm text-slate-400">
                        {signedInEmail}
                      </div>
                      <div className="mt-4">
                        <SecondaryButton onClick={signOut}>Sign Out</SecondaryButton>
                      </div>
                    </div>
                  )}
                </div>

                {session && (
                  <div className="mt-7 flex w-full rounded-2xl border border-white/10 bg-slate-950/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:inline-flex sm:w-auto">
                    <button
                      type="button"
                      className={`min-h-11 flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
                        activeTab === "sessions"
                          ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(2,6,23,0.22)]"
                          : "text-slate-300 hover:bg-white/[0.08]"
                      }`}
                      onClick={() => setActiveTab("sessions")}
                    >
                      Sessions
                    </button>
                    <button
                      type="button"
                      className={`min-h-11 flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
                        activeTab === "checkin"
                          ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(2,6,23,0.22)]"
                          : "text-slate-300 hover:bg-white/[0.08]"
                      }`}
                      onClick={() => setActiveTab("checkin")}
                    >
                      New Check-In
                    </button>
                  </div>
                )}
              </div>
            </section>

            {!session && (
              <div className="mx-auto max-w-xl">
                <AppCard className="p-5 sm:p-7">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        Sign in to continue
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                        Access your sessions and add a short check-in from the web companion.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
                        <input
                          className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          type="email"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
                        <input
                          className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          type="password"
                        />
                      </label>

                      <PrimaryButton onClick={signIn}>Sign In</PrimaryButton>
                      {error && (
                        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </AppCard>
              </div>
            )}

            {session && (
              <div className="space-y-6">
                <AppCard className="p-5 sm:p-6">
                  <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold tracking-tight text-white">Profile</div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Set the name shown in your Unstuck web companion.
                      </p>
                      <label className="mt-4 block">
                        <span className="mb-2 block text-sm font-medium text-slate-300">
                          Display name
                        </span>
                        <input
                          className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                          value={profileName}
                          onChange={(event) => {
                            setProfileName(event.target.value);
                            setProfileSuccess(null);
                          }}
                          placeholder={fallbackDisplayName}
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Theme</span>
                      <select
                        className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                        value={preferredTheme}
                        onChange={(event) => saveTheme(event.target.value as PreferredTheme)}
                        disabled={profileLoading || themeSaving}
                      >
                        <option value="system" className="bg-slate-950 text-white">
                          System
                        </option>
                        <option value="light" className="bg-slate-950 text-white">
                          Light
                        </option>
                        <option value="dark" className="bg-slate-950 text-white">
                          Dark
                        </option>
                      </select>
                    </label>
                    <div className="lg:w-40">
                      <PrimaryButton onClick={saveProfile} disabled={profileLoading || profileSaving}>
                        {profileSaving ? "Saving..." : "Save"}
                      </PrimaryButton>
                    </div>
                  </div>
                  {profileError && (
                    <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      {profileSuccess}
                    </div>
                  )}
                </AppCard>

                {activeTab === "sessions" ? (
                  <SessionsPage key={refreshKey} refreshKey={refreshKey} />
                ) : (
                  <NewCheckInPage
                    onCreated={() => {
                      setRefreshKey((value) => value + 1);
                      setActiveTab("sessions");
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
