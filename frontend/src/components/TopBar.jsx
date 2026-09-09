import { useEffect, useState } from "react";
import { Radio, Cpu } from "lucide-react";

export default function TopBar({ title, aiMode }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-[var(--color-border)] bg-[var(--color-panel)]">
      <h1 className="text-sm font-semibold text-[var(--color-text)]">{title}</h1>
      <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted)]">
        {aiMode && (
          <div className="flex items-center gap-1.5" title="AI analysis mode">
            <Cpu size={13} className={aiMode === "REAL" ? "text-[var(--color-system)]" : "text-[var(--color-dim)]"} />
            <span className="font-mono">AI {aiMode === "REAL" ? "ANALYSIS" : "SIMULATION MODE"}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Radio size={13} className="text-green-400 pulse-dot" />
          <span className="font-medium text-green-400">SYSTEM OPERATIONAL</span>
        </div>
        <span className="font-mono">{now.toLocaleTimeString("en-IN", { hour12: false })}</span>
      </div>
    </header>
  );
}
