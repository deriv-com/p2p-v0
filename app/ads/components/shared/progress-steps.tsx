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
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div 
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                index < currentStep
                  ? "bg-black border-black"
                  : index === currentStep
                  ? "bg-white border-black"
                  : "bg-gray-300 border-gray-300"
              }`}
            >
              {index < currentStep && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <div className={`text-slate-1200 mt-2 text-sm text-center ${
              index <= currentStep ? "text-black font-medium" : "text-gray-400"
            }`}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4",
                index < currentStep ? "bg-black" : "bg-gray-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
