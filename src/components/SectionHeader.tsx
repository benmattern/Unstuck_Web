type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="text-2xl font-semibold tracking-tight text-white">{title}</div>
      {subtitle && <p className="text-sm leading-6 text-slate-400">{subtitle}</p>}
    </div>
  );
}
