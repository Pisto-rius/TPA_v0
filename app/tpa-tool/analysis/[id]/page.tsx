"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ResultsDashboard } from "@/components/results-dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getAnalysis } from "@/services/api"

export default function AnalysisResultsPage() {
  const params = useParams()
  const analysisId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAnalysis(analysisId)
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching analysis data")
      } finally {
        setLoading(false)
      }
    }

    if (!isNaN(analysisId)) {
      fetchAnalysis()
    } else {
      setError("Invalid analysis ID")
      setLoading(false)
    }
  }, [analysisId])

  return (
    <DashboardShell>
      <DashboardHeader
        heading={loading ? "Loading..." : error ? "Error" : `Analysis: ${analysis?.name || ""}`}
        text={loading ? "Please wait..." : error ? error : `Detailed results and visualizations`}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/tpa-tool">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </DashboardHeader>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <ResultsDashboard analysisId={analysisId} />
      )}
    </DashboardShell>
  )
}

