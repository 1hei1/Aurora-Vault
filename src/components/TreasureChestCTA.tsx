import { useCallback } from "react";
import confetti from "canvas-confetti";

interface TreasureChestCTAProps {
  onOpen: () => void;
}

export function TreasureChestCTA({ onOpen }: TreasureChestCTAProps) {
  const launchConfetti = useCallback(() => {
    const defaults = {
      startVelocity: 32,
      spread: 360,
      ticks: 70,
      gravity: 0.9,
      origin: { y: 0.6 },
    } as const;

    void Promise.resolve().then(() => {
      confetti({ ...defaults, particleCount: 45, scalar: 1.1 });
      confetti({ ...defaults, particleCount: 30, scalar: 0.8, origin: { x: 0.2, y: 0.4 } });
      confetti({ ...defaults, particleCount: 30, scalar: 0.8, origin: { x: 0.8, y: 0.4 } });
    });
  }, []);

  const handleClick = () => {
    launchConfetti();
    onOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex items-center gap-3 rounded-2xl border border-brand-400/50 bg-gradient-to-br from-brand-500 via-brand-500/90 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-[var(--surface-body)] hover:shadow-xl"
    >
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-white/20 blur-sm transition group-hover:bg-white/30" />
        <svg
          className="relative h-6 w-6 text-white drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M20.91 7.5h-4.1l-.35-2.07a1.75 1.75 0 0 0-1.72-1.43H9.26A1.75 1.75 0 0 0 7.54 5.43L7.19 7.5H3.09A1.09 1.09 0 0 0 2 8.58v2.02a1.75 1.75 0 0 0 1.75 1.75h.25v5.36A2.29 2.29 0 0 0 6.29 20h11.42a2.29 2.29 0 0 0 2.29-2.29v-5.36h.25A1.75 1.75 0 0 0 22 10.6V8.58a1.09 1.09 0 0 0-1.09-1.08ZM9.61 5.34a.25.25 0 0 1 .25-.21h5.48a.25.25 0 0 1 .25.21l.27 1.66H9.32Zm8.39 12.37a.79.79 0 0 1-.79.79H6.29a.79.79 0 0 1-.79-.79v-5.36h12.5Zm1.75-7.61a.25.25 0 0 1-.25.25h-16a.25.25 0 0 1-.25-.25V9.1h16.5Z" />
          <path d="M12 13.23a.75.75 0 0 0-.75.75v1.69h-1.2a.75.75 0 0 0 0 1.5h3.9a.75.75 0 1 0 0-1.5h-1.2V14a.75.75 0 0 0-.75-.75Z" />
        </svg>
      </span>
      <div className="flex flex-col items-start">
        <span>开启收藏宝箱</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-white/70">
          新资源、灵感与惊喜
        </span>
      </div>
      <span className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}
