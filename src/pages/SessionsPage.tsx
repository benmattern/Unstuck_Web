import { useEffect, useState } from "react";
import { fetchSessions } from "../services/sessionService";
import type { SupabaseSession } from "../types/session";
import AppCard from "../components/AppCard";
import SectionHeader from "../components/SectionHeader";

const formTypeLabel: Record<string, string> = {
  short_check_in: "Short Check-In",
  main_form: "Main Form",
};

function formatFormType(value: string) {
  return (
    formTypeLabel[value] ??
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatSessionDate(value: string) {
  const date = new Date(value);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${dateLabel} at ${timeLabel}`;
}

function normalizeAnswerPairs(data: unknown): Array<{ question: string; answer: string }> {
  if (data == null) return [];

  if (Array.isArray(data)) {
    return data
      .flatMap((item) => normalizeAnswerPairs(item))
      .filter((pair) => pair.question && pair.answer);
  }

  if (typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const pairs: Array<{ question: string; answer: string }> = [];

  if ("prompt" in record && ("answer" in record || "value" in record)) {
    const question = String(record.prompt ?? "Question");
    const answer = String(record.answer ?? record.value ?? "");
    return [{ question, answer }];
  }

  for (const key of Object.keys(record)) {
    const value = record[key];

    if (
      value == null ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      pairs.push({ question: key.replace(/_/g, " "), answer: String(value) });
      continue;
    }

    if (Array.isArray(value)) {
      const nested = normalizeAnswerPairs(value);
      if (nested.length > 0) {
        pairs.push(...nested);
        continue;
      }
    }

    if (typeof value === "object") {
      const nested = normalizeAnswerPairs(value);
      if (nested.length > 0) {
        pairs.push(...nested);
        continue;
      }
      pairs.push({ question: key.replace(/_/g, " "), answer: JSON.stringify(value) });
    }
  }

  return pairs;
}

function renderAnswerPreview(data: unknown) {
  const pairs = normalizeAnswerPairs(data);
  if (pairs.length === 0) {
    if (data && typeof data === "object") {
      return (
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }

    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-400">
        No readable details available.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {pairs.map((item, index) => (
        <div
          key={`${item.question}-${index}`}
          className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {item.question}
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-200">{item.answer}</div>
        </div>
      ))}
    </div>
  );
}

type SessionsPageProps = {
  refreshKey: number;
};

export default function SessionsPage({ refreshKey }: SessionsPageProps) {
  const [sessions, setSessions] = useState<SupabaseSession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSessions()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || String(error));
        } else {
          setSessions(data ?? []);
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-soft backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <SectionHeader title="Sessions" subtitle="Recent check-ins and reflection history" />
        <div className="inline-flex w-fit rounded-full border border-blue-200/10 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
          History
        </div>
      </div>

      {loading && (
        <AppCard className="p-5">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,0.8)]" />
            Loading sessions...
          </div>
        </AppCard>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Error: {error}
        </div>
      )}

      {!loading && !error && sessions && sessions.length === 0 && (
        <AppCard className="p-6 text-center sm:p-8">
          <div className="mx-auto max-w-md space-y-3">
            <div className="text-base font-semibold text-white">No sessions yet</div>
            <div className="text-sm leading-6 text-slate-400">
              Complete a check-in on iPhone or create one here, and it will appear in this history.
            </div>
          </div>
        </AppCard>
      )}

      <div className="grid gap-4">
        {sessions &&
          sessions.map((s) => (
            <AppCard key={s.id} className="space-y-5 p-5 transition hover:border-white/20 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="text-lg font-semibold tracking-tight text-white">
                    {formatFormType(s.form_type)}
                  </div>
                  <div className="text-sm text-slate-400">{formatSessionDate(s.created_at)}</div>
                </div>
                <div className="w-fit rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {s.form_type === "short_check_in" ? "Quick" : "Full"}
                </div>
              </div>
              {renderAnswerPreview(s.answers_json)}
            </AppCard>
          ))}
      </div>
    </div>
  );
}
