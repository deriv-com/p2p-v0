"use client"

import { cn } from "@/lib/utils"

interface Step {
  title: string
  completed: boolean
}

interface ProgressStepsProps {
  currentStep: number
  steps: Step[]
  className?: string
}

export function ProgressSteps({ currentStep, steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      {steps.map((step, index) => (
        <div key={index} className={cn"flex items-center flex-1",
          step > currentStep ? "opacity-48": "opacity-100"
        )}>
          <div className="flex flex-col items-center">
            <div className="border border-[2px] border-black rounded-full w-[24px] h-[24px]"></div>
            <div className={"text-slate-1200 mt-2 text-xs text-center max-w-[80px]"}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4",
                index < currentStep ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
