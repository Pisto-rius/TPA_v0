"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import {
  ArrowRight,
  FileUp,
  Upload,
  Info,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Wand2,
} from "lucide-react"

export function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  // Process the files
  const handleFiles = (files: File[]) => {
    // Filter for acceptable file types
    const acceptedFiles = files.filter(
      (file) =>
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".mat") ||
        file.name.endsWith(".h5"),
    )

    if (acceptedFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles])

      // Upload each file to the backend
      acceptedFiles.forEach(async (file) => {
        try {
          setUploadStatus("uploading")
          setUploadProgress(0)

          // Create FormData
          const formData = new FormData()
          formData.append("file", file)

          // Upload file with progress tracking
          const xhr = new XMLHttpRequest()
          xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/files/upload/`)

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              setUploadProgress(progress)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadStatus("success")
            } else {
              setUploadStatus("error")
              console.error("Upload failed:", xhr.responseText)
            }
          }

          xhr.onerror = () => {
            setUploadStatus("error")
            console.error("Upload failed")
          }

          xhr.send(formData)
        } catch (error) {
          setUploadStatus("error")
          console.error("Upload error:", error)
        }
      })
    } else {
      setUploadStatus("error")
    }
  }

  // Start analysis with uploaded files
  const startAnalysis = () => {
    // In a real app, you would process the files here
    // For now, we'll just navigate to the TPA tool page
    router.push("/tpa-tool")
  }

  // Remove a file from the uploaded files list
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (uploadedFiles.length <= 1) {
      setUploadStatus("idle")
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />

      <main className="flex-1 container py-10 mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          <div className="space-y-6">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Transfer Path Analysis Tool</h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Analyze and visualize noise and vibration transfer paths with our advanced TPA tool.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Data-Driven Analysis</h3>
                  <p className="text-muted-foreground">
                    Upload your measurement data and let our tool handle the complex calculations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Interactive Visualization</h3>
                  <p className="text-muted-foreground">
                    Explore your results with interactive charts and customizable views.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Comprehensive Reporting</h3>
                  <p className="text-muted-foreground">
                    Generate detailed reports and export your findings in various formats.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={() => setActiveTab("upload")} size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload Data
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/tpa-tool")}>
                Try Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Get Started with Your Analysis</CardTitle>
                <CardDescription>Upload your measurement data to begin analyzing transfer paths</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="format">Data Format</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 pt-4">
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center
                        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                        transition-colors duration-200
                      `}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-4">
                          <FileUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Drag and drop your files here</h3>
                        <p className="text-muted-foreground max-w-md">
                          Upload your measurement data files (.csv, .xlsx, .mat, .h5) to begin your analysis
                        </p>

                        <div className="mt-4">
                          <label htmlFor="file-upload">
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => document.getElementById("file-upload")?.click()}
                            >
                              <Upload className="h-4 w-4" />
                              Browse Files
                            </Button>
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              accept=".csv,.xlsx,.mat,.h5"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {uploadStatus === "error" && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Upload Error</AlertTitle>
                        <AlertDescription>
                          Please upload files in a supported format (.csv, .xlsx, .mat, .h5)
                        </AlertDescription>
                      </Alert>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="font-medium">Uploaded Files</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-primary" />
                                <span className="font-medium">{file.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(file.size / 1024).toFixed(0)} KB
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-7 w-7 p-0"
                              >
                                &times;
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadStatus === "success" && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Upload Complete</AlertTitle>
                        <AlertDescription>
                          Your files have been uploaded successfully. You can now proceed with your analysis.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="format" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Supported File Formats</AlertTitle>
                        <AlertDescription>
                          The TPA Tool supports the following file formats for your measurement data.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">CSV Files (.csv)</h4>
                          <p className="text-sm text-muted-foreground">
                            Comma-separated values with headers. Each column should represent a measurement channel.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium">Excel Files (.xlsx)</h4>
                          <p className="text-sm text-muted-foreground">
                            Spreadsheets with measurement data. The first sheet will be used by default.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium">MATLAB Files (.mat)</h4>
                          <p className="text-sm text-muted-foreground">
                            MATLAB data files containing FRF matrices and measurement data.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium">HDF5 Files (.h5)</h4>
                          <p className="text-sm text-muted-foreground">
                            Hierarchical Data Format files for large datasets.
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Data Structure Requirements</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                          <li>Time or frequency domain data must be clearly labeled</li>
                          <li>Channel information should include measurement type and location</li>
                          <li>Reference and response channels must be identified</li>
                          <li>Units should be specified for all measurements</li>
                          <li>Sampling rate or frequency resolution must be included</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Info className="h-4 w-4" />
                          View Full Documentation
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={() => setActiveTab(activeTab === "upload" ? "format" : "upload")}>
                  {activeTab === "upload" ? "View Format Guide" : "Back to Upload"}
                </Button>
                <Button onClick={startAnalysis} disabled={uploadedFiles.length === 0 || uploadStatus === "uploading"}>
                  Start Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="mt-20 border-t pt-10">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Upload Your Data</CardTitle>
                <CardDescription>Import your measurement data from various file formats</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload your FRF measurements, operational data, and other relevant information. The tool supports
                  various file formats including CSV, Excel, MATLAB, and HDF5.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Configure Your Model</CardTitle>
                <CardDescription>Set up your analysis parameters and select paths</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Define your targets, paths, and indicators. Select the appropriate FRFs and operational data for your
                  analysis. Configure frequency ranges and other parameters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Analyze Results</CardTitle>
                <CardDescription>Visualize and interpret your transfer path analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore interactive visualizations of your results. Identify dominant transfer paths, analyze
                  frequency responses, and generate comprehensive reports for your findings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/40 mt-auto">
        <div className="container py-10 mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">TPA Tool</h3>
              <p className="text-sm text-muted-foreground">
                Advanced transfer path analysis for noise and vibration engineering.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 TPA Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

