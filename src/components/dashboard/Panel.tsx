import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  icon: Icon,
  children,
  className,
  action,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("panel flex min-w-0 flex-col p-4", className)}>
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        {action}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "kpi-1" | "kpi-2" | "kpi-3" | "kpi-4" | string;
}) {
  return (
    <div className="panel flex items-center justify-between p-4 transition-all">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
    </div>
  );
}
