"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SourceContributionChartProps {
  paths?: string[]
}

export function SourceContributionChart({
  paths = ["Path 1", "Path 2", "Path 3", "Path 4"],
}: SourceContributionChartProps) {
  // Mock data for source contributions across frequency
  const data = Array.from({ length: 50 }, (_, i) => {
    const frequency = 20 + i * 40 // 20Hz to 2000Hz

    // Create some realistic-looking contribution data
    return {
      frequency,
      "Path 1": Math.max(0, 30 + 15 * Math.sin(frequency / 100) - 0.01 * frequency),
      "Path 2": Math.max(0, 25 + 10 * Math.sin(frequency / 80 + 1) - 0.008 * frequency),
      "Path 3": Math.max(0, 20 + 8 * Math.sin(frequency / 120 + 2) - 0.006 * frequency),
      "Path 4": Math.max(0, 15 + 5 * Math.sin(frequency / 150 + 3) - 0.004 * frequency),
      "Path 5": Math.max(0, 10 + 4 * Math.sin(frequency / 180 + 4) - 0.003 * frequency),
      "Path 6": Math.max(0, 5 + 3 * Math.sin(frequency / 200 + 5) - 0.002 * frequency),
    }
  })

  // Create config object dynamically based on selected paths
  const config: Record<string, { label: string; color: string }> = {}
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ]

  paths.forEach((path, index) => {
    config[path] = {
      label: path,
      color: colors[index % colors.length],
    }
  })

  return (
    <ChartContainer config={config} className="h-full w-full min-w-[800px]">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        stackOffset="expand"
        barCategoryGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="frequency"
          scale="log"
          domain={[20, 2000]}
          ticks={[20, 50, 100, 200, 500, 1000, 2000]}
          label={{ value: "Frequency (Hz)", position: "insideBottom", offset: -10 }}
          allowDataOverflow
        />
        <YAxis
          label={{ value: "Contribution (%)", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="line" />}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, ""]}
        />
        <Legend />
        {paths.map((path) => (
          <Bar
            key={path}
            dataKey={path}
            stackId="a"
            fill={`var(--color-${path.replace(/\s+/g, "-").toLowerCase()})`}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

