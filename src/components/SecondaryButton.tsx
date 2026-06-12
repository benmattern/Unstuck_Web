import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function SecondaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-indigo-300/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
