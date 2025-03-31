"use client"

import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function SystemResponseChart() {
  // Mock data for system response
  const data = Array.from({ length: 100 }, (_, i) => {
    const frequency = 20 * Math.pow(10, i * 0.02) // Logarithmic scale from 20Hz to 2000Hz

    // Create a realistic-looking frequency response with resonances and anti-resonances
    const response =
      60 +
      10 * Math.sin(frequency / 50) -
      20 * Math.exp(-Math.pow((frequency - 500) / 100, 2)) + // Dip at 500Hz
      15 * Math.exp(-Math.pow((frequency - 1200) / 150, 2)) - // Peak at 1200Hz
      0.01 * frequency // General roll-off at higher frequencies

    const phase =
      (-Math.atan2((0.1 * frequency) / 500, 1 - Math.pow(frequency / 500, 2)) * 180) / Math.PI +
      20 * Math.sin(frequency / 200)

    return {
      frequency: Math.round(frequency),
      response: Math.max(0, Math.min(80, response)), // Limit to reasonable range
      phase: Math.max(-180, Math.min(180, phase)), // Limit to -180 to 180 degrees
    }
  })

  return (
    <ChartContainer
      config={{
        response: {
          label: "Response (dB)",
          color: "hsl(var(--chart-1))",
        },
        phase: {
          label: "Phase (degrees)",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full w-full min-w-[800px]"
    >
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-response)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-response)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
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
          yAxisId="left"
          label={{ value: "Response (dB)", angle: -90, position: "insideLeft" }}
          domain={[0, 80]}
          allowDataOverflow
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Phase (degrees)", angle: 90, position: "insideRight" }}
          domain={[-180, 180]}
          allowDataOverflow
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="response"
          stroke="var(--color-response)"
          fillOpacity={1}
          fill="url(#colorResponse)"
          activeDot={{ r: 6, strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="phase"
          stroke="var(--color-phase)"
          fill="none"
          activeDot={{ r: 6, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

