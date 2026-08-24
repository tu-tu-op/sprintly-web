"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityChartProps = {
  data: Array<{ day: string; hours: number; edits: number }>;
};

export function ActivityChart({ data }: ActivityChartProps) {
  const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(Math.round(value));

  return <div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="sprintly-activity-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ededed" stopOpacity={0.2} /><stop offset="100%" stopColor="#ededed" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#2b2b2b" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777777", fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#777777", fontSize: 10 }} width={32} tickFormatter={(value) => String(value) + "h"} /><Tooltip cursor={{ stroke: "#555555", strokeDasharray: "4 4" }} contentStyle={{ border: "1px solid #414141", borderRadius: 12, background: "#121212", color: "#f4f4f4", fontSize: 11, boxShadow: "0 18px 48px rgba(0,0,0,.34)" }} formatter={(value, name) => { const numericValue = Number(value ?? 0); const metric = String(name); return [metric === "hours" ? String(numericValue.toFixed(1)) + "h" : formatNumber(numericValue), metric === "hours" ? "Coding time" : "Edits"]; }} /><Area type="monotone" dataKey="hours" stroke="#ededed" strokeWidth={2.5} fill="url(#sprintly-activity-fill)" activeDot={{ r: 4, fill: "#ededed", stroke: "#121212", strokeWidth: 2 }} /><Area type="monotone" dataKey="edits" stroke="transparent" fill="transparent" /></AreaChart></ResponsiveContainer></div>;
}

type CodingMixProps = {
  values: Array<{ name: string; value: number; color: string }>;
};

export function CodingMix({ values }: CodingMixProps) {
  const hasData = values.some((item) => item.value > 0);
  const chartValues = hasData ? values : [{ name: "No sessions", value: 100, color: "#303030" }];

  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center"><div className="h-[190px] w-[190px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartValues} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={hasData ? 3 : 0} stroke="none" startAngle={90} endAngle={-270}>{chartValues.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ border: "1px solid #414141", borderRadius: 12, background: "#121212", color: "#f4f4f4", fontSize: 11 }} /></PieChart></ResponsiveContainer></div><div className="w-full space-y-4">{values.map((item) => <div key={item.name} className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-xs text-[#929292]"><span className="size-2 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="mono text-xs font-semibold text-[#c8c8c8]">{Math.round(item.value)}%</span></div>)}<div className="rounded-lg bg-[#1a1a1a] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#747474]">AI balance</p><p className="mt-1 text-xs text-[#929292]">{hasData ? "Your record keeps assistance visible without losing the human signal." : "Import a session to see your coding mix."}</p></div></div></div>;
}
