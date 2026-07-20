"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const INK_SECONDARY = "#52514e";
const GRIDLINE = "#e1e0d9";
const BASELINE = "#c3c2b7";

const CATEGORICAL = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-slate-strong bg-white p-5">
      <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
  valueLabel = "total",
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border-2 border-slate-strong bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-800">{label}</p>
      <p className="text-neutral-500">
        {payload[0].value} {valueLabel}
      </p>
    </div>
  );
}

export function TrendChart({
  data,
  color,
  title,
  valueLabel,
}: {
  data: { date: string; count: number }[];
  color: "blue" | "aqua";
  title?: string;
  valueLabel?: string;
}) {
  const stroke = color === "blue" ? "#2a78d6" : "#1baf7a";
  return (
    <ChartCard title={title ?? (color === "blue" ? "Listing growth (30 days)" : "User growth (30 days)")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={GRIDLINE} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: INK_SECONDARY }}
            axisLine={{ stroke: BASELINE }}
            tickLine={false}
            interval={Math.ceil(data.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: INK_SECONDARY }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip content={<TrendTooltip valueLabel={valueLabel} />} cursor={{ stroke: BASELINE, strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function RankTooltip({
  active,
  payload,
  unit = "listings",
}: {
  active?: boolean;
  payload?: { payload: { name: string; count: number } }[];
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const { name, count } = payload[0].payload;
  return (
    <div className="rounded-lg border-2 border-slate-strong bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-800">{name}</p>
      <p className="text-neutral-500">
        {count} {unit}
      </p>
    </div>
  );
}

export function RankBarChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: { name: string; count: number }[];
  unit?: string;
}) {
  if (data.length === 0) {
    return (
      <ChartCard title={title}>
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
          No data yet.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={GRIDLINE} horizontal={false} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: INK_SECONDARY }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip content={<RankTooltip unit={unit} />} cursor={{ fill: "rgba(11,11,11,0.04)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CATEGORICAL[index % CATEGORICAL.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
