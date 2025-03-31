"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SourceContributionChartProps {
  simplified?: boolean
}

export function SourceContributionChart({ simplified = false }: SourceContributionChartProps) {
  // Mock data for source contributions
  const data = [
    { name: "Engine", contribution: 42, phase: 180 },
    { name: "Exhaust", contribution: 28, phase: 90 },
    { name: "Transmission", contribution: 18, phase: 270 },
    { name: "Road", contribution: 12, phase: 0 },
    { name: "Wind", contribution: 8, phase: 45 },
    { name: "Suspension", contribution: 6, phase: 135 },
  ]

  // For simplified view, only show top contributors
  const chartData = simplified ? data.slice(0, 4) : data

  return (
    <ChartContainer
      config={{
        contribution: {
          label: "Contribution (dB)",
          color: "hsl(var(--chart-1))",
        },
        phase: {
          label: "Phase (degrees)",
          color: "hsl(var(--chart-2))",
        },
      }}
      className={simplified ? "h-[250px]" : "h-[400px]"}
    >
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        layout={simplified ? "vertical" : "horizontal"}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {simplified ? (
          <>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
            <YAxis />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="contribution" fill="var(--color-contribution)" radius={[4, 4, 0, 0]} />
        {!simplified && <Bar dataKey="phase" fill="var(--color-phase)" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ChartContainer>
  )
}

