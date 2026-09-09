const STAGES = ["REPORTED", "ANALYSED", "PRIORITISED", "ASSIGNED", "DISPATCHED", "RESOLVED"];

export default function StatusTimeline({ status }) {
  const currentIdx = STAGES.indexOf(status);
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 ${
                  done ? "bg-[var(--color-system)] border-[var(--color-system)]" : "border-[var(--color-dim)] bg-transparent"
                }`}
              />
              <span className={`text-[9px] whitespace-nowrap ${done ? "text-[var(--color-text)]" : "text-[var(--color-dim)]"}`}>
                {s}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? "bg-[var(--color-system)]" : "bg-[var(--color-border)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
