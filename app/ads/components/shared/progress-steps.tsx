interface ProgressStep {
  title: string
  completed: boolean
}

interface ProgressStepsProps {
  currentStep: number
  steps: ProgressStep[]
  className?: string
}

export function ProgressSteps({ currentStep, steps, className = "" }: ProgressStepsProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="w-full h-[3px] bg-gray-200 relative overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
