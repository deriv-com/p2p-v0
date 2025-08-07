interface ProgressStepsProps {
  currentStep: number
  steps: {
    title: string
    completed: boolean
  }[]
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center relative flex-1">
          {/* Connect lines between steps */}
          {index > 0 && (
            <div
              className={`absolute top-5 right-full h-[2px] ${
                index <= currentStep ? "bg-black" : "bg-gray-300"
              }`}
              style={{ right: "50%", width: "100%" }}
            ></div>
          )}

          {/* Step circle */}
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${
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
                width="16"
                height="16"
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

          {/* Step title */}
          <span
            className={`text-base mt-2 text-center ${
              index <= currentStep ? "text-black font-medium" : "text-gray-400"
            }`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  )
}
