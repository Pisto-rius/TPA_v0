"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelSetup } from "@/components/model-setup"
import { AnalysisResults } from "@/components/analysis-results"
import { PathContributions } from "@/components/path-contributions"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, Clock, FileSpreadsheet, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getAnalyses, type AnalysisResponse } from "@/services/api"

export default function TpaToolPage() {
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAnalyses()
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching analyses")
    } finally {
      setLoading(false)
    }
  }

  const renderAnalysesList = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))
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

    if (analyses.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Analyses Found</CardTitle>
            <CardDescription>
              You haven't created any analyses yet. Use the Model Setup tab to create your first analysis.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={fetchAnalyses} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return analyses.map((analysis) => (
      <Card key={analysis.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{analysis.name}</CardTitle>
              <CardDescription>{analysis.description || "No description provided"}</CardDescription>
            </div>
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
              {analysis.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-4 w-4" />
              <span>Created: {new Date(analysis.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span>Files: {analysis.file_ids.length}</span>
              {analysis.parameters && (
                <span className="ml-4">Paths: {analysis.parameters.selected_paths?.length || 0}</span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tpa-tool/analysis/${analysis.id}`}>
              View Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            Export
          </Button>
        </CardFooter>
      </Card>
    ))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6">
          <Tabs defaultValue="model-setup" className="space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 border-b">
              <div className="container mx-auto">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="model-setup" className="text-sm sm:text-base">
                    Model Setup
                  </TabsTrigger>
                  <TabsTrigger value="analysis-results" className="text-sm sm:text-base">
                    Analysis Results
                  </TabsTrigger>
                  <TabsTrigger value="path-contributions" className="text-sm sm:text-base">
                    Path Contributions
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="model-setup" className="space-y-6 mt-6">
              <ModelSetup />
            </TabsContent>

            <TabsContent value="analysis-results" className="space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
                  <p className="text-muted-foreground">View and manage your TPA analyses</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchAnalyses} className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">{renderAnalysesList()}</div>

              <AnalysisResults />
            </TabsContent>

            <TabsContent value="path-contributions" className="space-y-6 mt-6">
              <PathContributions />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

