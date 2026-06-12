import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function PrimaryButton({
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
      className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
