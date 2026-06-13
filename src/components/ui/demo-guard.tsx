"use client"

import { useAuthStore } from "@/lib/store"
import { type ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function DemoGuard({ children, demoMessage = "Disabled in demo mode" }: { children: ReactNode; demoMessage?: string }) {
  const isDemo = useAuthStore((s) => s.isDemo)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={isDemo ? "pointer-events-none opacity-50" : ""}>
          {children}
        </span>
      </TooltipTrigger>
      {isDemo && (
        <TooltipContent>
          <p>{demoMessage}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
