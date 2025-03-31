"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
} from "lucide-react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  getAnalysis,
  getRmsComparison,
  getPerformanceIndicators,
  getSystemResponse,
  getPathContributions,
  type RmsComparisonItem,
  type PerformanceIndicators,
} from "@/services/api"

interface ResultsDashboardProps {
  analysisId: number
}

export function ResultsDashboard({ analysisId }: ResultsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [rmsComparison, setRmsComparison] = useState<RmsComparisonItem[]>([])
  const [performanceIndicators, setPerformanceIndicators] = useState<PerformanceIndicators | null>(null)
  const [systemResponse, setSystemResponse] = useState<any[]>([])
  const [pathContributions, setPathContributions] = useState<any[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState<number>(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activeTab, setActiveTab] = useState("overview")

  // Colors for charts
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ]

  // Add a function to check if data is valid
  const isValidData = (data: any[]): boolean => {
    return Array.isArray(data) && data.length > 0
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch analysis details
        const analysisData = await getAnalysis(analysisId)
        setAnalysis(analysisData)

        // Only fetch results if analysis is completed
        if (analysisData.status === "completed" && analysisData.results) {
          // Fetch RMS comparison data
          const rmsData = await getRmsComparison(analysisId)
          setRmsComparison(rmsData)

          // Fetch performance indicators
          const indicators = await getPerformanceIndicators(analysisId)
          setPerformanceIndicators(indicators)

          // Fetch system response
          const responseData = await getSystemResponse(analysisId)
          setSystemResponse(responseData)

          // Set default selected frequency to middle of range
          if (responseData.length > 0) {
            setSelectedFrequency(responseData[Math.floor(responseData.length / 2)].frequency)
          }

          // Fetch path contributions
          const contributionsData = await getPathContributions(analysisId)
          setPathContributions(contributionsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [analysisId])

  const handleFrequencyChange = (value: string) => {
    setSelectedFrequency(Number.parseFloat(value))
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch analysis details
      const analysisData = await getAnalysis(analysisId)
      setAnalysis(analysisData)

      // Only fetch results if analysis is completed
      if (analysisData.status === "completed" && analysisData.results) {
        // Fetch RMS comparison data
        const rmsData = await getRmsComparison(analysisId)
        setRmsComparison(rmsData)

        // Fetch performance indicators
        const indicators = await getPerformanceIndicators(analysisId)
        setPerformanceIndicators(indicators)

        // Fetch system response
        const responseData = await getSystemResponse(analysisId)
        setSystemResponse(responseData)

        // Fetch path contributions
        const contributionsData = await getPathContributions(analysisId)
        setPathContributions(contributionsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while refreshing data")
    } finally {
      setLoading(false)
    }
  }

  // Find the contribution data for the selected frequency
  const getContributionsAtFrequency = () => {
    if (!pathContributions.length) return null

    // Find the closest frequency
    const closest = pathContributions.reduce((prev, curr) => {
      return Math.abs(curr.frequency - selectedFrequency) < Math.abs(prev.frequency - selectedFrequency) ? curr : prev
    })

    return closest
  }

  // Format contribution data for pie chart
  const formatContributionsForPieChart = () => {
    const contributionData = getContributionsAtFrequency()
    if (!contributionData) return []

    return Object.entries(contributionData.contributions).map(([name, value]) => ({
      name,
      value: (value as number) * 100, // Convert to percentage
    }))
  }

  // Format RMS comparison data for bar chart
  const formatRmsComparisonForBarChart = () => {
    return rmsComparison.map((item) => ({
      name: item.target_name,
      measured: item.measured_rms,
      predicted: item.predicted_rms,
      error: item.relative_error,
    }))
  }

  // Format performance indicators for radar chart
  const formatPerformanceIndicatorsForRadarChart = () => {
    if (!performanceIndicators) return []

    return [
      { subject: "Overall Accuracy", A: performanceIndicators.overall_accuracy, fullMark: 100 },
      { subject: "Frequency Coverage", A: performanceIndicators.frequency_range_coverage, fullMark: 100 },
      { subject: "Path Confidence", A: performanceIndicators.path_contribution_confidence, fullMark: 100 },
      { subject: "Coherence", A: performanceIndicators.coherence_average * 100, fullMark: 100 },
    ]
  }

  // Format measured vs predicted for scatter plot
  const formatMeasuredVsPredictedForScatterPlot = () => {
    return rmsComparison.map((item) => ({
      x: item.measured_rms,
      y: item.predicted_rms,
      name: item.target_name,
    }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No analysis data found for the specified ID.</AlertDescription>
      </Alert>
    )
  }

  // If analysis is not completed yet
  if (analysis.status !== "completed" || !analysis.results) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
          <Badge
            variant={
              analysis.status === "pending"
                ? "outline"
                : analysis.status === "running"
                  ? "secondary"
                  : analysis.status === "failed"
                    ? "destructive"
                    : "default"
            }
          >
            {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
          </Badge>
        </div>

        {analysis.status === "running" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analysis in progress...</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        )}

        {analysis.status === "failed" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>
              {analysis.error_message || "An unknown error occurred during analysis."}
            </AlertDescription>
          </Alert>
        )}

        {analysis.status === "pending" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Pending</AlertTitle>
            <AlertDescription>The analysis is queued and will start soon.</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>
    )
  }

  // Render the dashboard with results
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
          <p className="text-muted-foreground">Detailed results for analysis: {analysis.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rms-comparison">RMS Comparison</TabsTrigger>
          <TabsTrigger value="path-contributions">Path Contributions</TabsTrigger>
          <TabsTrigger value="system-response">System Response</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
                <Badge>{analysis.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(analysis.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceIndicators?.overall_accuracy.toFixed(1)}%</div>
                <Progress value={performanceIndicators?.overall_accuracy} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Path Confidence</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceIndicators?.path_contribution_confidence.toFixed(1)}%
                </div>
                <Progress value={performanceIndicators?.path_contribution_confidence} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coherence Average</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceIndicators?.coherence_average.toFixed(2)}</div>
                <Progress value={performanceIndicators?.coherence_average * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* RMS Comparison Overview */}
            <Card>
              <CardHeader>
                <CardTitle>RMS Comparison</CardTitle>
                <CardDescription>Measured vs. Predicted Target Values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={formatRmsComparisonForBarChart()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="measured" name="Measured" fill="#8884d8" />
                      <Bar dataKey="predicted" name="Predicted" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Path Contributions Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Path Contributions</CardTitle>
                <CardDescription>At {selectedFrequency.toFixed(1)} Hz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={formatContributionsForPieChart()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatContributionsForPieChart().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Indicators</CardTitle>
              <CardDescription>Key metrics for analysis quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Indicator Values</h3>
                  <div className="space-y-4">
                    {performanceIndicators &&
                      Object.entries(performanceIndicators).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                            <span className="text-sm font-medium">
                              {typeof value === "number"
                                ? key.includes("coherence")
                                  ? value.toFixed(2)
                                  : `${value.toFixed(1)}%`
                                : value}
                            </span>
                          </div>
                          {typeof value === "number" && (
                            <Progress value={key.includes("coherence") ? value * 100 : value} className="h-2" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Measured vs. Predicted</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name="Measured"
                          label={{ value: "Measured (dB)", position: "bottom" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name="Predicted"
                          label={{ value: "Predicted (dB)", angle: -90, position: "left" }}
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Scatter name="Targets" data={formatMeasuredVsPredictedForScatterPlot()} fill="#8884d8" />
                        {/* Ideal line (x=y) */}
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke="#ff7300"
                          dot={false}
                          activeDot={false}
                          legendType="none"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RMS Comparison Tab */}
        <TabsContent value="rms-comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RMS Comparison</CardTitle>
              <CardDescription>Detailed comparison of measured vs. predicted target values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={formatRmsComparisonForBarChart()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="measured" name="Measured (dB)" fill="#8884d8" />
                      <Bar dataKey="predicted" name="Predicted (dB)" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Target</th>
                        <th className="text-left p-2">Measured (dB)</th>
                        <th className="text-left p-2">Predicted (dB)</th>
                        <th className="text-left p-2">Absolute Error (dB)</th>
                        <th className="text-left p-2">Relative Error (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rmsComparison.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{item.target_name}</td>
                          <td className="p-2">{item.measured_rms.toFixed(1)}</td>
                          <td className="p-2">{item.predicted_rms.toFixed(1)}</td>
                          <td className="p-2">{item.absolute_error.toFixed(1)}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                item.relative_error < 5
                                  ? "default"
                                  : item.relative_error < 10
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {item.relative_error.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Path Contributions Tab */}
        <TabsContent value="path-contributions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Path Contributions</CardTitle>
                <CardDescription>Contribution of each path to the overall response</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedFrequency.toString()} onValueChange={handleFrequencyChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemResponse.map((item, index) => (
                      <SelectItem key={index} value={item.frequency.toString()}>
                        {item.frequency.toFixed(1)} Hz
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Contribution Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={formatContributionsForPieChart()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {formatContributionsForPieChart().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Contribution Values</h3>
                  <div className="space-y-4">
                    {getContributionsAtFrequency()?.contributions &&
                      Object.entries(getContributionsAtFrequency()?.contributions || {})
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([name, value], index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{name}</span>
                              <span className="text-sm font-medium">{((value as number) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress
                              value={(value as number) * 100}
                              className="h-2"
                              style={{ backgroundColor: colors[index % colors.length] + "40" }}
                              color={colors[index % colors.length]}
                            />
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Response Tab */}
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
              {isValidData(systemResponse) ? (
                <div style={{ height: `${(400 * zoomLevel) / 100}px` }} className="min-h-[400px] w-full overflow-auto">
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
                    <RechartsLineChart data={systemResponse} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="frequency"
                        scale="log"
                        domain={["auto", "auto"]}
                        type="number"
                        label={{ value: "Frequency (Hz)", position: "insideBottom", offset: -10 }}
                        allowDataOverflow
                      />
                      <YAxis
                        yAxisId="left"
                        label={{ value: "Response (dB)", angle: -90, position: "insideLeft" }}
                        domain={[0, "auto"]}
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
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="response"
                        stroke="var(--color-response)"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="phase"
                        stroke="var(--color-phase)"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
                  <div className="text-center">
                    <p className="text-muted-foreground">No system response data available</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

