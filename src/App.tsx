import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import AppCard from "./components/AppCard";
import PrimaryButton from "./components/PrimaryButton";
import SecondaryButton from "./components/SecondaryButton";
import SessionsPage from "./pages/SessionsPage";
import NewCheckInPage from "./pages/NewCheckInPage";

function App() {
  const [session, setSession] = useState<Session | null>(null);
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

  async function signIn() {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
                      <div className="mt-2 break-all text-base font-semibold text-white">
                        {session.user.email}
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
