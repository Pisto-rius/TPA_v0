"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { SystemResponseChart } from "@/components/charts/system-response-chart"
import { FrequencySelector } from "@/components/frequency-selector"
import { MetricsCards } from "@/components/metrics-cards"
import { LoadingOverlay } from "@/components/loading-overlay"

export function AnalysisResults() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate API call with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setLoadingProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  return (
    <>
      <LoadingOverlay isLoading={isLoading} progress={loadingProgress} message="Loading analysis results..." />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
            <p className="text-muted-foreground">View and analyze your Transfer Path Analysis results.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-4 w-4" />
              <span>Export Results</span>
            </Button>
          </div>
        </div>

        <MetricsCards />

        <FrequencySelector />

        <Tabs defaultValue="system-response" className="space-y-4">
          <TabsList>
            <TabsTrigger value="system-response">System Response</TabsTrigger>
            <TabsTrigger value="transfer-functions">Transfer Functions</TabsTrigger>
            <TabsTrigger value="coherence">Coherence</TabsTrigger>
          </TabsList>

          <TabsContent value="system-response" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>System Response</CardTitle>
                  <CardDescription>Overall system response across frequency range</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div style={{ height: `${(300 * zoomLevel) / 100}px` }} className="min-h-[300px] w-full overflow-auto">
                  <SystemResponseChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer-functions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Functions</CardTitle>
                <CardDescription>Frequency response functions between source and receiver points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select path" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Paths</SelectItem>
                        <SelectItem value="path1">Path 1</SelectItem>
                        <SelectItem value="path2">Path 2</SelectItem>
                        <SelectItem value="path3">Path 3</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    style={{ height: `${(300 * zoomLevel) / 100}px` }}
                    className="min-h-[300px] w-full overflow-auto"
                  >
                    <SystemResponseChart />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coherence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coherence</CardTitle>
                <CardDescription>Coherence between measured signals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select measurement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Measurements</SelectItem>
                        <SelectItem value="meas1">Measurement 1</SelectItem>
                        <SelectItem value="meas2">Measurement 2</SelectItem>
                        <SelectItem value="meas3">Measurement 3</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    style={{ height: `${(300 * zoomLevel) / 100}px` }}
                    className="min-h-[300px] w-full overflow-auto"
                  >
                    <SystemResponseChart />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

