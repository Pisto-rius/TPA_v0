"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileSpreadsheet, HelpCircle, Save, Settings, Upload, User } from "lucide-react"

export function MobileNav() {
  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
      <div className="flex flex-col space-y-3">
        <Link href="#" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        <Link href="#" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <Link href="#" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Link>
      </div>
      <div className="flex flex-col gap-2 mt-6">
        <Button variant="outline" size="sm" className="justify-start">
          <Upload className="h-4 w-4 mr-2" />
          <span>Import Data</span>
        </Button>
        <Button variant="outline" size="sm" className="justify-start">
          <Download className="h-4 w-4 mr-2" />
          <span>Export Results</span>
        </Button>
        <Button variant="outline" size="sm" className="justify-start">
          <Save className="h-4 w-4 mr-2" />
          <span>Save Project</span>
        </Button>
        <Button variant="outline" size="sm" className="justify-start">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span>Generate Report</span>
        </Button>
      </div>
    </ScrollArea>
  )
}

