"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Volume2, Vibrate, Zap } from "lucide-react"

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sound Pressure Level</CardTitle>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78.5 dB</div>
          <div className="flex items-center pt-1">
            <span className="text-xs text-emerald-500 inline-flex items-center">
              <ArrowDown className="mr-1 h-3 w-3" />
              2.5%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from previous measurement</span>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vibration Amplitude</CardTitle>
          <Vibrate className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.42 mm/s</div>
          <div className="flex items-center pt-1">
            <span className="text-xs text-rose-500 inline-flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              12.3%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from previous measurement</span>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Energy Contribution</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.24 kW</div>
          <div className="flex items-center pt-1">
            <span className="text-xs text-emerald-500 inline-flex items-center">
              <ArrowDown className="mr-1 h-3 w-3" />
              4.7%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from previous measurement</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

