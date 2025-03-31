"use client"

import { Line, LineChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function TransferFunctionChart() {
  // Mock data for transfer functions
  const data = Array.from({ length: 50 }, (_, i) => {
    const frequency = 20 + i * 40 // 20Hz to 2000Hz
    // Create some realistic-looking transfer function data with resonances
    const magnitude =
      20 *
        Math.log10(
          1 / Math.sqrt(Math.pow(1 - Math.pow(frequency / 500, 2), 2) + Math.pow((0.1 * frequency) / 500, 2)),
        ) +
      5 * Math.sin(frequency / 100) +
      40

    const phase =
      (-Math.atan2((0.1 * frequency) / 500, 1 - Math.pow(frequency / 500, 2)) * 180) / Math.PI +
      20 * Math.sin(frequency / 200)

    return {
      frequency,
      magnitude: Math.max(-60, Math.min(60, magnitude)), // Limit to reasonable range
      phase: Math.max(-180, Math.min(180, phase)), // Limit to -180 to 180 degrees
    }
  })

  return (
    <ChartContainer
      config={{
        magnitude: {
          label: "Magnitude (dB)",
          color: "hsl(var(--chart-1))",
        },
        phase: {
          label: "Phase (degrees)",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[400px]"
    >
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="frequency"
          label={{ value: "Frequency (Hz)", position: "insideBottom", offset: -10 }}
          scale="log"
          domain={[20, 2000]}
          ticks={[20, 50, 100, 200, 500, 1000, 2000]}
        />
        <YAxis yAxisId="left" label={{ value: "Magnitude (dB)", angle: -90, position: "insideLeft" }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Phase (degrees)", angle: 90, position: "insideRight" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="magnitude"
          stroke="var(--color-magnitude)"
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="phase"
          stroke="var(--color-phase)"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

