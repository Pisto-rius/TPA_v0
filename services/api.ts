// services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Log the API URL for debugging
console.log("Using API URL:", API_URL)

export interface FileUploadResponse {
  id: number
  filename: string
  filetype: string
  filesize: number
  metadata: any
  created_at: string
  updated_at: string | null
}

export interface AnalysisResponse {
  id: number
  name: string
  description: string | null
  parameters: any
  file_ids: number[]
  status: "pending" | "running" | "completed" | "failed"
  results: any | null
  error_message: string | null
  created_at: string
  updated_at: string | null
}

export interface RmsComparisonItem {
  target_name: string
  measured_rms: number
  predicted_rms: number
  absolute_error: number
  relative_error: number
}

export interface PerformanceIndicators {
  overall_accuracy: number
  frequency_range_coverage: number
  path_contribution_confidence: number
  matrix_condition_number: number
  coherence_average: number
}

// File upload API
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_URL}/api/files/upload/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || "Failed to upload file")
  }

  return response.json()
}

export const getFiles = async (): Promise<FileUploadResponse[]> => {
  const response = await fetch(`${API_URL}/api/files/`)

  if (!response.ok) {
    throw new Error("Failed to fetch files")
  }

  return response.json()
}

export const deleteFile = async (fileId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/files/${fileId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete file")
  }
}

// Analysis API
export const createAnalysis = async (analysisData: {
  name: string
  description?: string
  parameters: any
  file_ids: number[]
}): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_URL}/api/analysis/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(analysisData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || "Failed to create analysis")
  }

  return response.json()
}

export const getAnalyses = async (): Promise<AnalysisResponse[]> => {
  const response = await fetch(`${API_URL}/api/analysis/`)

  if (!response.ok) {
    throw new Error("Failed to fetch analyses")
  }

  return response.json()
}

export const getAnalysis = async (analysisId: number): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_URL}/api/analysis/${analysisId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch analysis")
  }

  return response.json()
}

// Results API
export const getAnalysisSummary = async (analysisId: number): Promise<any> => {
  const response = await fetch(`${API_URL}/api/results/${analysisId}/summary`)

  if (!response.ok) {
    throw new Error("Failed to fetch analysis summary")
  }

  return response.json()
}

export const getPathContributions = async (analysisId: number, frequency?: number): Promise<any> => {
  let url = `${API_URL}/api/results/${analysisId}/contributions`
  if (frequency) {
    url += `?frequency=${frequency}`
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch path contributions")
  }

  return response.json()
}

export const getTransferFunctions = async (analysisId: number, pathId?: number): Promise<any> => {
  let url = `${API_URL}/api/results/${analysisId}/transfer-functions`
  if (pathId !== undefined) {
    url += `?path_id=${pathId}`
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch transfer functions")
  }

  return response.json()
}

export const getSystemResponse = async (analysisId: number): Promise<any> => {
  const response = await fetch(`${API_URL}/api/results/${analysisId}/system-response`)

  if (!response.ok) {
    throw new Error("Failed to fetch system response")
  }

  return response.json()
}

export const getRmsComparison = async (analysisId: number): Promise<RmsComparisonItem[]> => {
  const response = await fetch(`${API_URL}/api/results/${analysisId}/rms-comparison`)

  if (!response.ok) {
    throw new Error("Failed to fetch RMS comparison")
  }

  return response.json()
}

export const getPerformanceIndicators = async (analysisId: number): Promise<PerformanceIndicators> => {
  const response = await fetch(`${API_URL}/api/results/${analysisId}/performance-indicators`)

  if (!response.ok) {
    throw new Error("Failed to fetch performance indicators")
  }

  return response.json()
}

