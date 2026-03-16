import React, { useEffect, useMemo, useState } from "react";

type RetroBootLoaderProps = {
  title: string;
};

const STATUS_LINES = [
  "Booting content registry...",
  "Resolving category index...",
  "Syncing public feed...",
  "Hydrating engagement data...",
  "Finalizing render state...",
];

const MAX_PROGRESS = 94;

const RetroBootLoader: React.FC<RetroBootLoaderProps> = ({ title }) => {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= MAX_PROGRESS) {
          return MAX_PROGRESS;
        }
        const jump = 3 + Math.floor(Math.random() * 8);
        return Math.min(MAX_PROGRESS, current + jump);
      });
    }, 220);

    return () => window.clearInterval(timer);
  }, []);

  const statusLine = useMemo(() => {
    const index = Math.min(
      STATUS_LINES.length - 1,
      Math.floor((progress / MAX_PROGRESS) * STATUS_LINES.length)
    );
    return STATUS_LINES[index];
  }, [progress]);

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-indigo-300 bg-white/95 p-5 text-gray-900 shadow-[0_0_30px_rgba(79,70,229,0.15)] sm:p-7 dark:border-emerald-400 dark:bg-gray-900/95 dark:text-green-300 dark:shadow-[0_0_36px_rgba(52,211,153,0.18)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-indigo-500/90 dark:text-emerald-300/80">
        {title} startup sequence
      </p>
      <h1 className="mt-3 font-mono text-xl text-gray-900 sm:text-2xl dark:text-emerald-200">Loading content stream...</h1>
      <p className="mt-2 font-mono text-sm text-indigo-700 dark:text-emerald-300/90">{statusLine}</p>

      <div className="mt-5 rounded-md border-2 border-indigo-300/90 bg-gray-100 p-1 dark:border-emerald-400/70 dark:bg-black">
        <div
          className="h-6 rounded-sm bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-500 transition-[width] duration-200 ease-linear dark:from-emerald-500 dark:via-lime-300 dark:to-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span className="text-sm text-indigo-700 dark:text-emerald-200">{String(progress).padStart(2, "0")}%</span>
        <span className="animate-pulse text-xs uppercase tracking-[0.14em] text-indigo-500/80 dark:text-emerald-300/80">stand by_</span>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-1">
        {Array.from({ length: 36 }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-sm ${
              index <= Math.floor((progress / 100) * 36)
                ? "bg-indigo-500/90 dark:bg-emerald-400/90"
                : "bg-indigo-200/70 dark:bg-emerald-900/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RetroBootLoader;
