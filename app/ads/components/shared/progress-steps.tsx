interface ProgressStep {
  title: string
  completed: boolean
}

interface ProgressStepsProps {
  currentStep: number
  steps: ProgressStep[]
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center mb-6 md:mb-12 max-w-xl mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center relative flex-1">
          {index > 0 && (
            <div 
              className={`absolute top-3 h-[2px] ${
                index <= currentStep ? "bg-black" : "bg-gray-300"
              }`} 
              style={{ right: "50%", left: "-50%" }}
            ></div>
          )}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
              index < currentStep
                ? "bg-black border-black"
                : index === currentStep
                ? "bg-white border-black"
                : "border-gray-300"
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
          <span
            className={`text-sm mt-2 text-center hidden md:block font-bold ${
              index <= currentStep ? "text-black" : "text-gray-400"
            }`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  )
}
