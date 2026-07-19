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

  return <div></div>;
};

export default EmotionChart;
