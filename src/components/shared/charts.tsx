"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INK_SECONDARY = "#52514e";
const GRIDLINE = "#e1e0d9";
const SERIES_BLUE = "#2a78d6";

export function EnrollmentTrendChart({ data }: { data: { month: string; enrollments: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRIDLINE} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: INK_SECONDARY, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: INK_SECONDARY, fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(42,120,214,0.08)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 12 }}
              />
              <Bar dataKey="enrollments" fill={SERIES_BLUE} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryDistribution({ data }: { data: { name: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollments by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No enrollment data yet</p>
        ) : (
          <ul className="space-y-3">
            {data.map((d) => (
              <li key={d.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="tabular-nums text-slate-500">{d.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${(d.value / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
