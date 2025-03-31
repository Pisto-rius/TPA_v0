"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"

export function FrequencySelector() {
  const [frequency, setFrequency] = useState(250)

  const handleSliderChange = (value: number[]) => {
    setFrequency(value[0])
  }

  const decreaseFrequency = () => {
    setFrequency((prev) => Math.max(20, prev - 25))
  }

  const increaseFrequency = () => {
    setFrequency((prev) => Math.min(2000, prev + 25))
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="frequency" className="text-sm font-medium">
            Frequency Selection
          </Label>
          <span className="text-sm font-semibold">{frequency} Hz</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={decreaseFrequency}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Slider
            id="frequency"
            min={20}
            max={2000}
            step={1}
            value={[frequency]}
            onValueChange={handleSliderChange}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={increaseFrequency}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>20 Hz</span>
          <span>500 Hz</span>
          <span>1000 Hz</span>
          <span>2000 Hz</span>
        </div>
      </div>
    </Card>
  )
}

