import { useEffect, useState } from "react";
import { fetchSessions } from "../services/sessionService";
import type { SupabaseSession } from "../types/session";
import AppCard from "../components/AppCard";
import SectionHeader from "../components/SectionHeader";

const formTypeLabel: Record<string, string> = {
  short_check_in: "Short Check-In",
  main_form: "Main Form",
};

const knownQuestionPrompts: Record<string, string> = {
  current_focus: "What are you trying to move forward?",
  currentFocus: "What are you trying to move forward?",
  stuck_level: "How stuck do you feel right now?",
  stuckLevel: "How stuck do you feel right now?",
  main_blocker: "What is the main blocker?",
  mainBlocker: "What is the main blocker?",
  next_action: "What is the next small action?",
  nextAction: "What is the next small action?",
  ten_minute_action: "Can you do that in the next 10 minutes?",
  tenMinuteAction: "Can you do that in the next 10 minutes?",
};

type AnswerPair = {
  question: string;
  answer: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toAnswerText(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (isRecord(value)) {
    return toAnswerText(value.value ?? value.answer ?? value.text ?? value.label);
  }
  return "";
}

function parseJsonString(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getQuestionText(record: Record<string, unknown>) {
  const directQuestion =
    record.prompt ??
    record.questionText ??
    record.questionPrompt ??
    record.question_prompt ??
    record.text ??
    record.title ??
    record.label;

  if (typeof directQuestion === "string") {
    return directQuestion;
  }

  if (isRecord(record.question)) {
    const nestedQuestion =
      record.question.prompt ??
      record.question.questionText ??
      record.question.questionPrompt ??
      record.question.question_prompt ??
      record.question.text ??
      record.question.title ??
      record.question.label;

    if (typeof nestedQuestion === "string") {
      return nestedQuestion;
    }
  }

  const questionId =
    record.questionId ??
    record.question_id ??
    (isRecord(record.question) ? record.question.id ?? record.question.questionId : undefined);

  if (typeof questionId === "string") {
    return knownQuestionPrompts[questionId] ?? humanizeKey(questionId);
  }

  return "";
}

function getAnswerValue(record: Record<string, unknown>) {
  if ("answer" in record) return record.answer;
  if ("value" in record) return record.value;
  if ("answerValue" in record) return record.answerValue;
  if ("answer_value" in record) return record.answer_value;
  if (isRecord(record.response)) return record.response.value ?? record.response.answer;
  return undefined;
}

function normalizeAnswerItem(item: unknown): AnswerPair[] {
  if (typeof item === "string") {
    return normalizeAnswerItem(parseJsonString(item));
  }

  if (!isRecord(item)) {
    return [];
  }

  const question = getQuestionText(item);
  const answerValue = getAnswerValue(item);

  if (question && answerValue !== undefined) {
    return [
      {
        question,
        answer: toAnswerText(answerValue),
      },
    ];
  }

  return normalizeAnswerDictionary(item);
}

function normalizeAnswerDictionary(record: Record<string, unknown>): AnswerPair[] {
  return Object.entries(record)
    .flatMap(([key, value]) => {
      if (isRecord(value)) {
        const question = getQuestionText(value) || knownQuestionPrompts[key] || humanizeKey(key);
        const answerValue = getAnswerValue(value);

        if (answerValue !== undefined) {
          return [
            {
              question,
              answer: toAnswerText(answerValue),
            },
          ];
        }

        return [];
      }

      if (value == null || ["string", "number", "boolean"].includes(typeof value)) {
        return [
          {
            question: knownQuestionPrompts[key] ?? humanizeKey(key),
            answer: toAnswerText(value),
          },
        ];
      }

      return [];
    })
    .filter((pair) => pair.question);
}

function normalizeAnswers(data: unknown): AnswerPair[] {
  if (data == null) return [];

  if (typeof data === "string") {
    return normalizeAnswers(parseJsonString(data));
  }

  if (Array.isArray(data)) {
    return data
      .flatMap((item) => normalizeAnswerItem(item))
      .filter((pair) => pair.question);
  }

  if (isRecord(data)) {
    const nestedAnswers =
      data.answers ??
      data.answerResponses ??
      data.answer_responses ??
      data.responses ??
      data.items ??
      data.values;

    if (nestedAnswers !== undefined) {
      const pairs = normalizeAnswers(nestedAnswers);
      if (pairs.length > 0) return pairs;
    }

    return normalizeAnswerDictionary(data);
  }

  return [];
}

function renderAnswerPreview(data: unknown) {
  const pairs = normalizeAnswers(data);
  if (pairs.length === 0) {
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
          <div className="mt-2 text-sm leading-6 text-slate-200">
            {item.answer || "No answer provided."}
          </div>
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
