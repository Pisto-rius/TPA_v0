"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, Check, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ModelStatusIndicator } from "@/components/model-status-indicator"
import type React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { FrfMatrixSelector } from "@/components/frf-matrix-selector"

export function ModelSetup() {
  const [mode, setMode] = useState<"standard" | "advanced">("standard")
  const [selectedPoints, setSelectedPoints] = useState<string[]>([])
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false)
  const [targets, setTargets] = useState<string[]>([])
  const [paths, setPaths] = useState<string[]>([])
  const [indicators, setIndicators] = useState<string[]>([])

  // Mock data for available points
  const availablePoints = [
    { id: "P1", type: "Accelerometer", location: "Engine Mount", directions: ["X", "Y", "Z"] },
    { id: "P2", type: "Microphone", location: "Interior", directions: ["Omni"] },
    { id: "P3", type: "Accelerometer", location: "Chassis", directions: ["X", "Y", "Z"] },
    { id: "P4", type: "Microphone", location: "Driver Ear", directions: ["Omni"] },
    { id: "P5", type: "Accelerometer", location: "Suspension", directions: ["X", "Y", "Z"] },
    { id: "P6", type: "Accelerometer", location: "Body", directions: ["X", "Y", "Z"] },
    { id: "P7", type: "Microphone", location: "Passenger Ear", directions: ["Omni"] },
    { id: "P8", type: "Accelerometer", location: "Exhaust Mount", directions: ["X", "Y", "Z"] },
  ]

  const handlePointSelection = (pointId: string, ctrlKey = false) => {
    if (multiSelectEnabled || ctrlKey) {
      // Multiple selection mode
      if (selectedPoints.includes(pointId)) {
        setSelectedPoints(selectedPoints.filter((id) => id !== pointId))
      } else {
        setSelectedPoints([...selectedPoints, pointId])
      }
    } else {
      // Single selection mode
      if (selectedPoints.includes(pointId) && selectedPoints.length === 1) {
        setSelectedPoints([])
      } else {
        setSelectedPoints([pointId])
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, pointId: string) => {
    if (!selectedPoints.includes(pointId)) {
      setSelectedPoints([pointId])
    }
    e.dataTransfer.setData("text/plain", JSON.stringify(selectedPoints))
  }

  const handleDrop = (e: React.DragEvent, targetType: "target" | "path" | "indicator") => {
    e.preventDefault()
    try {
      const droppedPoints = JSON.parse(e.dataTransfer.getData("text/plain")) as string[]

      if (droppedPoints.length === 0) return

      // Add points to the appropriate list
      switch (targetType) {
        case "target":
          setTargets([...targets, ...droppedPoints.filter((p) => !targets.includes(p))])
          break
        case "path":
          setPaths([...paths, ...droppedPoints.filter((p) => !paths.includes(p))])
          break
        case "indicator":
          setIndicators([...indicators, ...droppedPoints.filter((p) => !indicators.includes(p))])
          break
      }

      // Clear selection after drop
      setSelectedPoints([])
    } catch (error) {
      console.error("Error parsing dropped data:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removePoint = (pointId: string, listType: "target" | "path" | "indicator") => {
    switch (listType) {
      case "target":
        setTargets(targets.filter((id) => id !== pointId))
        break
      case "path":
        setPaths(paths.filter((id) => id !== pointId))
        break
      case "indicator":
        setIndicators(indicators.filter((id) => id !== pointId))
        break
    }
  }

  const getPointLabel = (pointId: string) => {
    // For standard mode or base points
    if (!pointId.includes("-")) {
      const point = availablePoints.find((p) => p.id === pointId)
      return point ? pointId : pointId
    }

    // For advanced mode with directions
    const [baseId, direction] = pointId.split("-")
    return `${baseId} (${direction})`
  }

  const getPointType = (pointId: string) => {
    const baseId = pointId.split("-")[0]
    const point = availablePoints.find((p) => p.id === baseId)
    return point ? point.type : "Unknown"
  }

  const getQuantityAndUnit = (pointId: string) => {
    const type = getPointType(pointId)

    if (targets.includes(pointId)) {
      return { quantity: type === "Microphone" ? "SPL" : "Displacement", unit: type === "Microphone" ? "dB" : "mm" }
    } else if (paths.includes(pointId)) {
      return { quantity: "Force", unit: "N" }
    } else if (indicators.includes(pointId)) {
      return {
        quantity: type === "Microphone" ? "Sound Pressure" : "Acceleration",
        unit: type === "Microphone" ? "Pa" : "m/s²",
      }
    }

    return { quantity: "", unit: "" }
  }

  const selectAllPoints = () => {
    if (mode === "standard") {
      setSelectedPoints(availablePoints.map((p) => p.id))
    } else {
      const allPointsWithDirections: string[] = []
      availablePoints.forEach((point) => {
        point.directions.forEach((dir) => {
          allPointsWithDirections.push(`${point.id}-${dir}`)
        })
      })
      setSelectedPoints(allPointsWithDirections)
    }
  }

  const selectAllOfType = (type: string) => {
    if (mode === "standard") {
      setSelectedPoints(availablePoints.filter((p) => p.type === type).map((p) => p.id))
    } else {
      const pointsOfType: string[] = []
      availablePoints
        .filter((p) => p.type === type)
        .forEach((point) => {
          point.directions.forEach((dir) => {
            pointsOfType.push(`${point.id}-${dir}`)
          })
        })
      setSelectedPoints(pointsOfType)
    }
  }

  const selectAllOfDirection = (direction: string) => {
    if (mode === "advanced") {
      const pointsWithDirection: string[] = []
      availablePoints.forEach((point) => {
        if (point.directions.includes(direction)) {
          pointsWithDirection.push(`${point.id}-${direction}`)
        }
      })
      setSelectedPoints(pointsWithDirection)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Model Setup</h2>
          <p className="text-muted-foreground">Configure your Transfer Path Analysis model parameters.</p>
        </div>
        <div className="flex items-center gap-2">
          <ModelStatusIndicator status="incomplete" />
        </div>
      </div>

      <Tabs defaultValue="definition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="definition">Definition</TabsTrigger>
          <TabsTrigger value="frf-selection">FRF Selection</TabsTrigger>
          <TabsTrigger value="operational-data">Operational Data</TabsTrigger>
        </TabsList>

        <TabsContent value="definition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Targets, Paths and Indicators</CardTitle>
              <CardDescription>Define the measurement points and paths for your analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="load-model">Load Model</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multi-select"
                          checked={multiSelectEnabled}
                          onCheckedChange={(checked) => setMultiSelectEnabled(checked === true)}
                        />
                        <Label htmlFor="multi-select" className="text-sm">
                          Multi-select
                        </Label>
                      </div>
                      <Select value={mode} onValueChange={(value) => setMode(value as "standard" | "advanced")}>
                        <SelectTrigger id="load-model" className="w-[180px]">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Available Points</Label>
                      <Badge variant="outline" className="font-mono">
                        {selectedPoints.length} selected
                      </Badge>
                    </div>
                    <Card className="border-dashed">
                      <ScrollArea className="h-[400px] w-full rounded-md">
                        <div className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Point ID</TableHead>
                                <TableHead>Type</TableHead>
                                {mode === "standard" && <TableHead>Assignment</TableHead>}
                                {mode === "advanced" && <TableHead>Direction</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mode === "standard"
                                ? // Standard mode - show points without directions
                                  availablePoints.map((point, index) => {
                                    const isTarget = targets.includes(point.id)
                                    const isPath = paths.includes(point.id)
                                    const isIndicator = indicators.includes(point.id)

                                    let assignment = ""
                                    if (isTarget) assignment = "Target"
                                    else if (isPath) assignment = "Path"
                                    else if (isIndicator) assignment = "Indicator"

                                    return (
                                      <TableRow
                                        key={point.id}
                                        className={`cursor-pointer hover:bg-muted/50 ${selectedPoints.includes(point.id) ? "bg-muted/70" : ""}`}
                                        onClick={(e) => handlePointSelection(point.id, e.ctrlKey)}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, point.id)}
                                      >
                                        <TableCell className="p-2">
                                          <div className="flex items-center justify-center">
                                            {selectedPoints.includes(point.id) && (
                                              <Check className="h-4 w-4 text-primary" />
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{point.id}</TableCell>
                                        <TableCell>{point.type}</TableCell>
                                        <TableCell>
                                          {assignment ? (
                                            <Badge variant={isTarget ? "default" : isPath ? "secondary" : "outline"}>
                                              {assignment}
                                            </Badge>
                                          ) : (
                                            <Select defaultValue="">
                                              <SelectTrigger className="h-8 w-full">
                                                <SelectValue placeholder="Assign" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="not-assigned">Not assigned</SelectItem>
                                                <SelectItem value="target">Target</SelectItem>
                                                <SelectItem value="path">Path</SelectItem>
                                                <SelectItem value="indicator">Indicator</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                : // Advanced mode - show points with directions
                                  availablePoints.flatMap((point) =>
                                    point.directions.map((direction) => {
                                      const pointId = `${point.id}-${direction}`
                                      const isTarget = targets.includes(pointId)
                                      const isPath = paths.includes(pointId)
                                      const isIndicator = indicators.includes(pointId)

                                      return (
                                        <TableRow
                                          key={pointId}
                                          className={`cursor-pointer hover:bg-muted/50 ${selectedPoints.includes(pointId) ? "bg-muted/70" : ""}`}
                                          onClick={(e) => handlePointSelection(pointId, e.ctrlKey)}
                                          draggable
                                          onDragStart={(e) => handleDragStart(e, pointId)}
                                        >
                                          <TableCell className="p-2">
                                            <div className="flex items-center justify-center">
                                              {selectedPoints.includes(pointId) && (
                                                <Check className="h-4 w-4 text-primary" />
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className="font-medium">{point.id}</TableCell>
                                          <TableCell>{point.type}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                              {direction}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    }),
                                  )}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                    </Card>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={selectAllPoints}>
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => selectAllOfType("Accelerometer")}
                      >
                        Select Accelerometers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => selectAllOfType("Microphone")}
                      >
                        Select Microphones
                      </Button>
                      {mode === "advanced" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => selectAllOfDirection("X")}
                          >
                            Select All X
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => selectAllOfDirection("Y")}
                          >
                            Select All Y
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => selectAllOfDirection("Z")}
                          >
                            Select All Z
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        Selected Targets
                        <Badge variant="secondary" className="ml-2">
                          {targets.length}
                        </Badge>
                      </Label>
                      <Button variant="outline" size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Selected
                      </Button>
                    </div>
                    <Card
                      className="border-dashed border-primary/50"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "target")}
                    >
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Point ID</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {targets.map((pointId, i) => {
                              const { quantity, unit } = getQuantityAndUnit(pointId)
                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{getPointLabel(pointId)}</TableCell>
                                  <TableCell>{quantity}</TableCell>
                                  <TableCell>{unit}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removePoint(pointId, "target")}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {targets.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                  <div className="flex flex-col items-center gap-2">
                                    <p>No targets selected</p>
                                    <p className="text-xs text-muted-foreground">
                                      Drag points here or use the Add Selected button
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        Selected Paths
                        <Badge variant="secondary" className="ml-2">
                          {paths.length}
                        </Badge>
                      </Label>
                      <Button variant="outline" size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Selected
                      </Button>
                    </div>
                    <Card
                      className="border-dashed border-secondary/50"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "path")}
                    >
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Point ID</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paths.map((pointId, i) => {
                              const { quantity, unit } = getQuantityAndUnit(pointId)
                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{getPointLabel(pointId)}</TableCell>
                                  <TableCell>{quantity}</TableCell>
                                  <TableCell>{unit}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removePoint(pointId, "path")}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {paths.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                  <div className="flex flex-col items-center gap-2">
                                    <p>No paths selected</p>
                                    <p className="text-xs text-muted-foreground">
                                      Drag points here or use the Add Selected button
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        Selected Indicators
                        <Badge variant="secondary" className="ml-2">
                          {indicators.length}
                        </Badge>
                      </Label>
                      <Button variant="outline" size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Selected
                      </Button>
                    </div>
                    <Card
                      className="border-dashed border-muted/50"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "indicator")}
                    >
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Point ID</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {indicators.map((pointId, i) => {
                              const { quantity, unit } = getQuantityAndUnit(pointId)
                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{getPointLabel(pointId)}</TableCell>
                                  <TableCell>{quantity}</TableCell>
                                  <TableCell>{unit}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removePoint(pointId, "indicator")}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {indicators.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                  <div className="flex flex-col items-center gap-2">
                                    <p>No indicators selected</p>
                                    <p className="text-xs text-muted-foreground">
                                      Drag points here or use the Add Selected button
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-2">
                      Indicators are used for matrix inversion to compute loads in the TPA analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button>
                  Continue to FRF Selection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frf-selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequency Response Function Selection</CardTitle>
              <CardDescription>Select and configure the frequency response functions for your analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <FrfMatrixSelector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Data Selection</CardTitle>
              <CardDescription>Select and configure the operational data for your analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="data-type">Operational Data Type</Label>
                    <Select defaultValue="order">
                      <SelectTrigger id="data-type" className="w-full mt-1">
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="spectrum">Spectrum</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="case-selection">Case Selection</Label>
                    <Select defaultValue="order-number">
                      <SelectTrigger id="case-selection" className="w-full mt-1">
                        <SelectValue placeholder="Select case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order-number">Order number</SelectItem>
                        <SelectItem value="rpm-range">RPM Range</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">Available Cases</Label>
                    <Card className="border-dashed">
                      <ScrollArea className="h-[300px] w-full rounded-md">
                        <div className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Case Name</TableHead>
                                <TableHead>Range</TableHead>
                                <TableHead>Criteria</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i} className="cursor-pointer hover:bg-muted/50">
                                  <TableCell className="font-medium">Case_{i + 1}</TableCell>
                                  <TableCell>{1000 + i * 500} RPM</TableCell>
                                  <TableCell>{i % 2 === 0 ? "Steady" : "Sweep"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>

                  <div>
                    <Label className="mb-2 block">Selected Cases</Label>
                    <Card className="border-dashed">
                      <ScrollArea className="h-[300px] w-full rounded-md">
                        <div className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Case Name</TableHead>
                                <TableHead>Range</TableHead>
                                <TableHead>Criteria</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">Case_{i * 2 + 1}</TableCell>
                                  <TableCell>{1000 + i * 1000} RPM</TableCell>
                                  <TableCell>{i % 2 === 0 ? "Steady" : "Sweep"}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Back to FRF Selection</Button>
                  <Button>
                    Run Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

