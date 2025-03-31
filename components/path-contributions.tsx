"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { SourceContributionChart } from "@/components/charts/source-contribution-chart"
import { FrequencySelector } from "@/components/frequency-selector"
import { Badge } from "@/components/ui/badge"

export function PathContributions() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedPaths, setSelectedPaths] = useState<string[]>(["Path 1", "Path 2", "Path 3", "Path 4"])

  const togglePath = (path: string) => {
    if (selectedPaths.includes(path)) {
      setSelectedPaths(selectedPaths.filter((p) => p !== path))
    } else {
      setSelectedPaths([...selectedPaths, path])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Path Contributions</h2>
          <p className="text-muted-foreground">Analyze the contribution of each path to the overall response.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </Button>
        </div>
      </div>

      <FrequencySelector />

      <Tabs defaultValue="contribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contribution">Contribution</TabsTrigger>
          <TabsTrigger value="path-specific">Path Specific</TabsTrigger>
          <TabsTrigger value="time-domain">Time Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="contribution" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Source Contributions</CardTitle>
                <CardDescription>Contribution of each source to the overall response</CardDescription>
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
              <div className="flex flex-wrap gap-2 mb-4">
                {["Path 1", "Path 2", "Path 3", "Path 4", "Path 5", "Path 6"].map((path) => (
                  <Badge
                    key={path}
                    variant={selectedPaths.includes(path) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePath(path)}
                  >
                    {path}
                  </Badge>
                ))}
              </div>

              <div style={{ height: `${(400 * zoomLevel) / 100}px` }} className="min-h-[400px] w-full overflow-auto">
                <SourceContributionChart paths={selectedPaths} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="path-specific" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Path Specific Analysis</CardTitle>
              <CardDescription>Detailed analysis of specific transfer paths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <Select defaultValue="path1">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select path" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div style={{ height: `${(400 * zoomLevel) / 100}px` }} className="min-h-[400px] w-full overflow-auto">
                  <SourceContributionChart paths={["Path 1"]} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Domain Analysis</CardTitle>
              <CardDescription>Time domain representation of transfer path contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Full Range</SelectItem>
                      <SelectItem value="range1">0-10 seconds</SelectItem>
                      <SelectItem value="range2">10-20 seconds</SelectItem>
                      <SelectItem value="range3">20-30 seconds</SelectItem>
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

                <div style={{ height: `${(400 * zoomLevel) / 100}px` }} className="min-h-[400px] w-full overflow-auto">
                  <SourceContributionChart paths={selectedPaths} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

