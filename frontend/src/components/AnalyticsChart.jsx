import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const PALETTE = ["#4C8DFF", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#A855F7", "#14B8A6"];
const AXIS_STYLE = { fontSize: 11, fill: "#8592A6" };
const TOOLTIP_STYLE = { background: "#161D28", border: "1px solid #232B37", borderRadius: 4, fontSize: 12 };

export function ChartCard({ title, children }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3 flex flex-col">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">{title}</h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

export function AnalyticsBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A212C" vertical={false} />
        <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={{ stroke: "#232B37" }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={{ stroke: "#232B37" }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#1A212C" }} />
        <Bar dataKey="value" fill="#4C8DFF" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0A0E14" />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8592A6" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsLine({ data, xKey, yKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A212C" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={{ stroke: "#232B37" }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={{ stroke: "#232B37" }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line type="monotone" dataKey={yKey} stroke="#4C8DFF" strokeWidth={2} dot={{ r: 3, fill: "#4C8DFF" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
