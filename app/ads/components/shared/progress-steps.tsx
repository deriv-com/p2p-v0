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
    <div className={cn("flex items-center justify-between mb-8 px-6", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-xs text-center max-w-[80px]">
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4",
                index < currentStep ? "bg-primary" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
