interface ProgressStep {
  title: string
  completed: boolean
}

interface ProgressStepsProps {
  currentStep: number
  steps: ProgressStep[]
  className?: string
  title?: {
    label: string
    stepTitle: string
  }
}

export function ProgressSteps({ currentStep, steps, className = "", title }: ProgressStepsProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={`md:w-full ${className}`}>
      <div className="w-full h-[3px] bg-gray-200 relative overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      {title && (
        <div className="mt-6">
          <div className="text-base font-normal text-slate-1200">{title.label}</div>
          <div className="text-[32px] font-bold text-black mt-1">{title.stepTitle}</div>
        </div>
      )}
    </div>
  )
}
