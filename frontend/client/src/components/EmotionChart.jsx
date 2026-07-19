import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EmotionChart = ({ history }) => {
  if (!history || history.length === 0) return null;

  const data = [...history].reverse().map((item, index) => ({
    name: index + 1,
    Stress: item.stress,
    Focus: item.focus,
    Energia: item.energy,
    time: new Date(item.created_at).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = data[label - 1];
      return (
        <div
          style={{
            background: "rgba(17,17,17,0.95)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "0.8rem",
          }}
        >
          <p style={{ color: "#6b7280", marginBottom: "8px" }}>{item?.time}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color, margin: "3px 0" }}>
              {entry.name}: <strong>{entry.value}%</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        style={{
          background: "rgba(17,17,17,0.6)",
          borderRadius: "16px",
          border: "1px solid rgba(0,212,255,0.08)",
          padding: "20px",
          marginTop: "10px",
        }}
      >
        <h3
          style={{
            color: "#9ca3af",
            fontSize: "0.85rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          📈 Andamento emotivo
        </h3>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: "0.8rem",
                color: "#6b7280",
                paddingTop: "10px",
              }}
            />
            <Line
              type="monotone"
              dataKey="Stress"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Focus"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={{ fill: "#22d3ee", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Energia"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ fill: "#34d399", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default EmotionChart;
