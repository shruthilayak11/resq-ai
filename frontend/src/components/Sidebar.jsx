import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, PackageSearch, FilePlus2, SlidersHorizontal,
  BarChart3, Info, ShieldHalf,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Command Center", Icon: LayoutDashboard },
  { to: "/report", label: "Report Emergency", Icon: FilePlus2 },
  { to: "/volunteers", label: "Volunteers", Icon: Users },
  { to: "/resources", label: "Resources", Icon: PackageSearch },
  { to: "/simulation", label: "Simulation Console", Icon: SlidersHorizontal },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/settings", label: "System Info", Icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[var(--color-border)]">
        <ShieldHalf size={20} className="text-[var(--color-system)]" />
        <span className="font-semibold tracking-tight">RESQ-AI</span>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-system-dim)] text-[var(--color-system)] font-medium"
                  : "text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-[var(--color-border)] text-[10px] text-[var(--color-dim)] leading-relaxed">
        Hackathon Prototype
        <br />
        v1.0.0
      </div>
    </aside>
  );
}
