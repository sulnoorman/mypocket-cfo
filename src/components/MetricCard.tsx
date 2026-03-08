import React, { ComponentType } from 'react'

function MetricCard({
  title,
  value,
  valueClassName,
  tone,
  icon: Icon
}: {
  title: string
  value: string
  valueClassName?: string
  tone: "positive" | "negative" | "neutral"
  icon: ComponentType<{ className?: string }>
}) {

  const colorClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-rose-400"
        : "text-sky-400"
        
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs text-mutedForeground">{title}</span>
          <span className={["text-lg font-semibold truncate", valueClassName ?? ""].join(" ")}>
            {value}
          </span>
        </div>
        <div className="rounded-md bg-background/60 p-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>
    </div>
  )
}

export default MetricCard
