"use client"

import { Button } from "@/components/ui/button"
import { ComplaintForm } from "./complaint-form"
import { useComplaint } from "@/hooks/use-complaint"
import { toast } from "@/components/ui/use-toast"

interface ComplaintExampleProps {
  orderId: string
}

export function ComplaintExample({ orderId }: ComplaintExampleProps) {
  const { isComplaintOpen, openComplaint, closeComplaint, submitComplaint } = useComplaint(orderId)

  const handleSubmitComplaint = async (option: string) => {
    try {
      await submitComplaint(option)
      toast({
        title: "Complaint submitted",
        description: "Your complaint has been submitted successfully. We'll review it shortly.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Could not submit your complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button onClick={openComplaint} variant="outline">
        Submit Complaint
      </Button>

      <ComplaintForm
        isOpen={isComplaintOpen}
        onClose={closeComplaint}
        onSubmit={handleSubmitComplaint}
        orderId={orderId}
      />
    </>
  )
}
