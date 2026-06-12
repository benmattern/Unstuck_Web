import { useState } from "react";
import AppCard from "../components/AppCard";
import PrimaryButton from "../components/PrimaryButton";
import { createShortCheckIn } from "../services/sessionService";

type Props = {
  onCreated: () => void;
};

const blockerOptions = [
  "Unclear next step",
  "Low energy",
  "Avoidance",
  "Too many options",
  "External constraint",
];

export default function NewCheckInPage({ onCreated }: Props) {
  const [currentFocus, setCurrentFocus] = useState("");
  const [stuckLevel, setStuckLevel] = useState(5);
  const [mainBlocker, setMainBlocker] = useState(blockerOptions[0]);
  const [nextAction, setNextAction] = useState("");
  const [tenMinuteAction, setTenMinuteAction] = useState("Yes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    if (!currentFocus.trim() || !nextAction.trim()) {
      setError("Please complete the focus and action fields.");
      return;
    }

    setLoading(true);
    const answersJson = [
      {
        prompt: "What are you trying to move forward?",
        answer: currentFocus.trim(),
      },
      {
        prompt: "How stuck do you feel right now?",
        answer: String(stuckLevel),
      },
      {
        prompt: "What is the main blocker?",
        answer: mainBlocker,
      },
      {
        prompt: "What is the next small action?",
        answer: nextAction.trim(),
      },
      {
        prompt: "Can you do that in the next 10 minutes?",
        answer: tenMinuteAction,
      },
    ];

    const { error } = await createShortCheckIn(answersJson);
    setLoading(false);

    if (error) {
      setError(error.message || String(error));
      return;
    }

    setCurrentFocus("");
    setStuckLevel(5);
    setMainBlocker(blockerOptions[0]);
    setNextAction("");
    setTenMinuteAction("Yes");
    setSuccess("Check-in saved. Your new session is now available in history.");
    onCreated();
  }

  return (
    <div className="space-y-6">
      <AppCard className="p-5 sm:p-7">
        <div className="space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                New Short Check-In
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Capture what matters right now, then save it to your session history.
              </p>
            </div>
            <div className="w-fit rounded-full border border-violet-200/10 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-100">
              Focused
            </div>
          </div>

          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                What are you trying to move forward?
              </span>
              <textarea
                className="min-h-36 w-full resize-y rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base leading-7 text-white placeholder:text-slate-500 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                rows={4}
                value={currentFocus}
                onChange={(e) => setCurrentFocus(e.target.value)}
                placeholder="Describe the progress you want to make"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                How stuck do you feel right now?
              </span>
              <div className="rounded-2xl border border-white/[0.12] bg-slate-950/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Level</span>
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-sm font-semibold text-white">
                    {stuckLevel}/10
                  </span>
                </div>
                <input
                  className="mt-4 w-full accent-blue-400"
                  type="range"
                  min={1}
                  max={10}
                  value={stuckLevel}
                  onChange={(e) => setStuckLevel(Number(e.target.value))}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Clear</span>
                  <span>Stuck</span>
                </div>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                What is the main blocker?
              </span>
              <select
                className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                value={mainBlocker}
                onChange={(e) => setMainBlocker(e.target.value)}
              >
                {blockerOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                What is the next small action?
              </span>
              <input
                className="min-h-12 w-full rounded-2xl border border-white/[0.12] bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/10"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="Describe the next step"
              />
            </label>

            <div>
              <div className="mb-2 text-sm font-medium text-slate-300">
                Can you do that in the next 10 minutes?
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Yes", "Not yet"].map((option) => {
                  const checked = tenMinuteAction === option;
                  return (
                    <label
                      key={option}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-base transition ${
                        checked
                          ? "border-blue-300/50 bg-blue-400/15 text-white"
                          : "border-white/[0.12] bg-slate-950/70 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tenMinuteAction"
                        value={option}
                        checked={checked}
                        onChange={(e) => setTenMinuteAction(e.target.value)}
                        className="h-4 w-4 accent-blue-400"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <PrimaryButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Check-In"}
          </PrimaryButton>
        </div>
      </AppCard>
    </div>
  );
}
