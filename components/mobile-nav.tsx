"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, HelpCircle, Home, Save, Settings, Upload, User } from "lucide-react"

export function MobileNav() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Navigation</h3>
        <Link href="/" passHref>
          <Button variant="ghost" size="sm" className="justify-start gap-2">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Actions</h3>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <Upload className="h-4 w-4" />
          <span>Import</span>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Report</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Account</h3>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Button>
      </div>
    </div>
  )
}


