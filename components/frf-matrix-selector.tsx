"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Search,
  Save,
  Grid,
  TableIcon,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  RefreshCw,
  ArrowRight,
} from "lucide-react"

// Types for our FRF data
interface FrfData {
  referenceId: string
  responseId: string
  available: boolean
  selected: boolean
  quality?: number // 0-100 quality indicator
  filename?: string
}

// Mock data generator for demo purposes
const generateMockFrfData = (refCount: number, respCount: number): FrfData[] => {
  const data: FrfData[] = []

  for (let i = 1; i <= refCount; i++) {
    const refType = i <= 10 ? "TRE-fre" : i <= 20 ? "TRE-rele" : "TRE-ren"
    const direction = i % 3 === 0 ? "Z" : i % 3 === 1 ? "X" : "Y"
    const refId = `${refType}-${direction}[${i}]`

    for (let j = 1; j <= respCount; j++) {
      const respType = j <= 10 ? "MIC-DRR" : j <= 20 ? "ACC-SUSP" : "ACC-BODY"
      const respId = `${respType}-${j}`

      // Create some patterns in availability
      const isAvailable = (i + j) % 7 !== 0

      data.push({
        referenceId: refId,
        responseId: respId,
        available: isAvailable,
        selected: false,
        quality: isAvailable ? Math.floor(70 + Math.random() * 30) : 0,
      })
    }
  }

  return data
}

export function FrfMatrixSelector() {
  // State for the FRF data
  const [frfData, setFrfData] = useState<FrfData[]>(generateMockFrfData(30, 25))

  // State for unique reference and response IDs
  const [referenceIds, setReferenceIds] = useState<string[]>([])
  const [responseIds, setResponseIds] = useState<string[]>([])

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [referenceFilter, setReferenceFilter] = useState<string[]>([])
  const [responseFilter, setResponseFilter] = useState<string[]>([])
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<"matrix" | "table">("matrix")

  // State for matrix visualization
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectionMode, setSelectionMode] = useState<"single" | "rectangle">("single")
  const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  // Refs for matrix interaction
  const matrixRef = useRef<HTMLDivElement>(null)

  // Extract unique reference and response IDs on data load
  useEffect(() => {
    const refIds = Array.from(new Set(frfData.map((item) => item.referenceId)))
    const respIds = Array.from(new Set(frfData.map((item) => item.responseId)))

    setReferenceIds(refIds)
    setResponseIds(respIds)
  }, [frfData])

  // Filter the FRF data based on search and filters
  const filteredFrfData = frfData.filter((item) => {
    // Apply search term
    if (
      searchTerm &&
      !item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.responseId.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Apply reference filter
    if (referenceFilter.length > 0 && !referenceFilter.includes(item.referenceId)) {
      return false
    }

    // Apply response filter
    if (responseFilter.length > 0 && !responseFilter.includes(item.responseId)) {
      return false
    }

    // Filter by availability
    if (showOnlyAvailable && !item.available) {
      return false
    }

    // Filter by selection
    if (showOnlySelected && !item.selected) {
      return false
    }

    return true
  })

  // Get the current page of data for table view
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredFrfData.slice(indexOfFirstItem, indexOfLastItem)

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFrfData.length / itemsPerPage)

  // Handle cell click in matrix view
  const handleCellClick = (refId: string, respId: string, ctrlKey: boolean) => {
    setFrfData((prevData) =>
      prevData.map((item) => {
        if (item.referenceId === refId && item.responseId === respId && item.available) {
          return { ...item, selected: !item.selected }
        } else if (!ctrlKey && selectionMode === "single") {
          // If not holding Ctrl and in single selection mode, deselect others
          return { ...item, selected: false }
        }
        return item
      }),
    )
  }

  // Handle rectangle selection start
  const handleSelectionStart = (rowIndex: number, colIndex: number) => {
    if (selectionMode === "rectangle") {
      setSelectionStart({ row: rowIndex, col: colIndex })
      setIsSelecting(true)
    }
  }

  // Handle rectangle selection end
  const handleSelectionEnd = (rowIndex: number, colIndex: number) => {
    if (selectionMode === "rectangle" && selectionStart && isSelecting) {
      const startRow = Math.min(selectionStart.row, rowIndex)
      const endRow = Math.max(selectionStart.row, rowIndex)
      const startCol = Math.min(selectionStart.col, colIndex)
      const endCol = Math.max(selectionStart.col, colIndex)

      // Get the reference and response IDs in the selection rectangle
      const selectedRefIds = referenceIds.slice(startRow, endRow + 1)
      const selectedRespIds = responseIds.slice(startCol, endCol + 1)

      // Update the selection state
      setFrfData((prevData) =>
        prevData.map((item) => {
          if (
            selectedRefIds.includes(item.referenceId) &&
            selectedRespIds.includes(item.responseId) &&
            item.available
          ) {
            return { ...item, selected: true }
          }
          return item
        }),
      )

      setSelectionStart(null)
      setIsSelecting(false)
    }
  }

  // Handle mouse move during selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectionMode === "rectangle" && isSelecting && matrixRef.current) {
      // Implementation would track current cell under mouse
      // This is a simplified version
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Here you would process the uploaded file
    // For demo purposes, we'll just show a success message
    alert(`File "${file.name}" uploaded successfully. In a real implementation, this would parse the FRF data.`)
  }

  // Select all available FRFs
  const selectAllAvailable = () => {
    setFrfData((prevData) =>
      prevData.map((item) => {
        if (item.available) {
          return { ...item, selected: true }
        }
        return item
      }),
    )
  }

  // Clear all selections
  const clearSelection = () => {
    setFrfData((prevData) => prevData.map((item) => ({ ...item, selected: false })))
  }

  // Count selected FRFs
  const selectedCount = frfData.filter((item) => item.selected).length
  const availableCount = frfData.filter((item) => item.available).length

  // Generate pagination controls
  const paginationControls = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>,
      )
    }

    return (
      <div className="flex items-center gap-1 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="w-8 h-8 p-0"
        >
          &laquo;
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 p-0"
        >
          &lsaquo;
        </Button>

        {pages}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 p-0"
        >
          &rsaquo;
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 p-0"
        >
          &raquo;
        </Button>

        <span className="text-sm text-muted-foreground ml-2">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    )
  }

  // Render the matrix view
  const renderMatrixView = () => {
    // Calculate cell size based on zoom level
    const cellSize = Math.max(20, Math.floor((30 * zoomLevel) / 100))

    return (
      <div className="mt-4">
        <div
          className="relative border rounded-md overflow-hidden"
          ref={matrixRef}
          onMouseUp={() => setIsSelecting(false)}
          onMouseLeave={() => setIsSelecting(false)}
        >
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="flex">
              <div
                className="shrink-0 border-r border-b bg-muted/50 flex items-center justify-center font-medium"
                style={{ width: 180, height: cellSize }}
              >
                Reference ↓ Response →
              </div>
              <ScrollArea className="h-full" orientation="horizontal">
                <div className="flex">
                  {responseIds.map((respId, colIndex) => (
                    <div
                      key={respId}
                      className="shrink-0 border-r last:border-r-0 border-b bg-muted/50 flex items-center justify-center font-medium text-xs"
                      style={{ width: cellSize, height: cellSize }}
                      title={respId}
                    >
                      {respId.split("-")[1] || respId}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex">
            <div className="shrink-0 border-r">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {referenceIds.map((refId, rowIndex) => (
                  <div
                    key={refId}
                    className="border-b last:border-b-0 bg-muted/50 flex items-center font-medium text-xs px-2"
                    style={{ height: cellSize }}
                    title={refId}
                  >
                    {refId}
                  </div>
                ))}
              </ScrollArea>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]" orientation="horizontal">
              <div>
                {referenceIds.map((refId, rowIndex) => (
                  <div key={refId} className="flex border-b last:border-b-0">
                    {responseIds.map((respId, colIndex) => {
                      const frfItem = frfData.find((item) => item.referenceId === refId && item.responseId === respId)

                      if (!frfItem) return null

                      // Determine cell color based on availability and selection
                      let bgColor = "bg-red-100 border-red-500"
                      if (frfItem.available) {
                        bgColor = frfItem.selected ? "bg-blue-100 border-blue-500" : "bg-green-100 border-green-500"
                      }

                      return (
                        <div
                          key={`${refId}-${respId}`}
                          className={`
                            shrink-0 border-r last:border-r-0 border flex items-center justify-center
                            ${bgColor}
                            ${frfItem.available ? "cursor-pointer hover:opacity-80" : "opacity-60 cursor-not-allowed"}
                          `}
                          style={{ width: cellSize, height: cellSize }}
                          onClick={(e) => frfItem.available && handleCellClick(refId, respId, e.ctrlKey)}
                          onMouseDown={() => frfItem.available && handleSelectionStart(rowIndex, colIndex)}
                          onMouseUp={() => frfItem.available && handleSelectionEnd(rowIndex, colIndex)}
                          title={`${refId} → ${respId} (${frfItem.available ? "Available" : "Missing"})`}
                        >
                          {frfItem.quality && frfItem.available ? (
                            <span className="text-[8px] font-mono">{frfItem.quality}</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{referenceIds.length}</span> reference DOFs ×
            <span className="font-medium"> {responseIds.length}</span> response DOFs =
            <span className="font-medium"> {frfData.length}</span> total FRFs (
            <span className="text-green-600 font-medium">{availableCount}</span> available,
            <span className="text-blue-600 font-medium"> {selectedCount}</span> selected)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoomLevel}%</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              title="Reset Zoom"
              onClick={() => setZoomLevel(100)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render the table view
  const renderTableView = () => {
    return (
      <div className="mt-4">
        <div className="border rounded-md">
          <div className="bg-muted/50 p-3 border-b">
            <div className="grid grid-cols-12 gap-4 font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Reference DOF</div>
              <div className="col-span-4">Response DOF</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Select</div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-450px)]">
            <div className="p-2">
              {currentItems.map((item, index) => (
                <div
                  key={`${item.referenceId}-${item.responseId}`}
                  className={`
                    grid grid-cols-12 gap-4 p-2 rounded-md items-center
                    ${index % 2 === 0 ? "bg-muted/20" : ""}
                    ${item.selected ? "bg-blue-50 border-blue-200" : ""}
                  `}
                >
                  <div className="col-span-1 text-sm text-muted-foreground">{indexOfFirstItem + index + 1}</div>
                  <div className="col-span-4 font-mono text-sm">{item.referenceId}</div>
                  <div className="col-span-4 font-mono text-sm">{item.responseId}</div>
                  <div className="col-span-2">
                    {item.available ? (
                      <Badge variant="outline" className="gap-1 bg-green-50">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-red-50">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Missing
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={(checked) => {
                        if (item.available) {
                          setFrfData((prevData) =>
                            prevData.map((frf) =>
                              frf.referenceId === item.referenceId && frf.responseId === item.responseId
                                ? { ...frf, selected: checked === true }
                                : frf,
                            ),
                          )
                        }
                      }}
                      disabled={!item.available}
                    />
                  </div>
                </div>
              ))}

              {currentItems.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No FRF data matches your filters</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFrfData.length)} of{" "}
              {filteredFrfData.length} items
            </span>
          </div>

          {paginationControls()}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FRF Matrix Selection</h2>
          <p className="text-muted-foreground">Select frequency response functions for your analysis</p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import FRFs</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import FRF data from file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save Selection</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save current FRF selection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-frfs" className="mb-2 block">
                Search FRFs
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-frfs"
                  placeholder="Search by reference or response ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1">
              <Label htmlFor="frf-file" className="mb-2 block">
                Load FRF Data
              </Label>
              <div className="flex gap-2">
                <Input id="frf-file" type="file" className="flex-1" onChange={handleFileUpload} />
                <Button size="sm" className="h-10">
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-available"
                checked={showOnlyAvailable}
                onCheckedChange={(checked) => setShowOnlyAvailable(checked === true)}
              />
              <Label htmlFor="show-available" className="text-sm">
                Show only available FRFs
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-selected"
                checked={showOnlySelected}
                onCheckedChange={(checked) => setShowOnlySelected(checked === true)}
              />
              <Label htmlFor="show-selected" className="text-sm">
                Show only selected FRFs
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-sm">Selection Mode:</Label>
              <Select
                value={selectionMode}
                onValueChange={(value) => setSelectionMode(value as "single" | "rectangle")}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Selection mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Cell</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-sm">View Mode:</Label>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "matrix" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none h-8 px-3"
                  onClick={() => setViewMode("matrix")}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Matrix
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none h-8 px-3"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">Legend:</span>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Available
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Missing
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Selected
            </Badge>
          </div>

          {/* Matrix or Table View */}
          {viewMode === "matrix" ? renderMatrixView() : renderTableView()}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{selectedCount}</span> FRFs selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllAvailable}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Select All Available
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <Square className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Selected
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected FRFs Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Selected FRFs</h3>

        <div className="border rounded-md">
          <div className="bg-muted/50 p-3 border-b">
            <div className="grid grid-cols-12 gap-4 font-medium">
              <div className="col-span-5">Reference DOF</div>
              <div className="col-span-5">Response DOF</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <ScrollArea className="h-[200px]">
            <div className="p-2">
              {frfData
                .filter((item) => item.selected)
                .map((item, index) => (
                  <div
                    key={`selected-${item.referenceId}-${item.responseId}`}
                    className="grid grid-cols-12 gap-4 p-2 rounded-md items-center"
                  >
                    <div className="col-span-5 font-mono text-sm">{item.referenceId}</div>
                    <div className="col-span-5 font-mono text-sm">{item.responseId}</div>
                    <div className="col-span-1">
                      <Badge variant="outline" className="gap-1 bg-green-50">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Available
                      </Badge>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setFrfData((prevData) =>
                            prevData.map((frf) =>
                              frf.referenceId === item.referenceId && frf.responseId === item.responseId
                                ? { ...frf, selected: false }
                                : frf,
                            ),
                          )
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {frfData.filter((item) => item.selected).length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No FRFs selected</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end mt-4">
          <Button>
            Continue to Operational Data
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

