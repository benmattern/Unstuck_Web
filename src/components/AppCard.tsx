import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AppCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-3xl border border-white/[0.12] bg-white/[0.07] p-6 shadow-soft backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}
