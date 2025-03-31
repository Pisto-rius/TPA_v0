import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

interface ModelStatusIndicatorProps {
  status: "complete" | "incomplete" | "in-progress" | "error"
}

export function ModelStatusIndicator({ status }: ModelStatusIndicatorProps) {
  const getStatusDetails = () => {
    switch (status) {
      case "complete":
        return {
          label: "Complete",
          icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
          variant: "success" as const,
          tooltip: "Model setup is complete and ready for analysis",
        }
      case "incomplete":
        return {
          label: "Incomplete",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          variant: "destructive" as const,
          tooltip: "Model setup is incomplete. Please complete all required fields.",
        }
      case "in-progress":
        return {
          label: "In Progress",
          icon: <Clock className="h-4 w-4 mr-1" />,
          variant: "secondary" as const,
          tooltip: "Model setup is in progress",
        }
      case "error":
        return {
          label: "Error",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          variant: "destructive" as const,
          tooltip: "There are errors in the model setup that need to be resolved",
        }
      default:
        return {
          label: "Unknown",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          variant: "outline" as const,
          tooltip: "Status unknown",
        }
    }
  }

  const statusDetails = getStatusDetails()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={statusDetails.variant} className="flex items-center gap-1 px-3 py-1">
            {statusDetails.icon}
            <span>Model Status: {statusDetails.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusDetails.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

