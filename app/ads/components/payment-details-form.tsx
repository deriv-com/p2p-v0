"use client"

import type React from "react"

interface PaymentDetailsFormProps {
  formData: any // Replace 'any' with a more specific type if possible
  setFormData: (data: any) => void // Replace 'any' with a more specific type if possible
}

const PaymentDetailsForm: React.FC<PaymentDetailsFormProps> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 text-black text-sm font-normal leading-5">Account Name</label>
        <input
          type="text"
          name="accountName"
          value={formData?.accountName || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-black text-sm font-normal leading-5">Account Number</label>
        <input
          type="text"
          name="accountNumber"
          value={formData?.accountNumber || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-black text-sm font-normal leading-5">Bank Name</label>
        <input
          type="text"
          name="bankName"
          value={formData?.bankName || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-black text-sm font-normal leading-5">Swift Code</label>
        <input
          type="text"
          name="swiftCode"
          value={formData?.swiftCode || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-black text-sm font-normal leading-5">
          {formData?.type === "sell" ? "Advertisers' instructions and contact details" : "Instructions (Optional)"}
        </label>
        <textarea
          name="instructions"
          value={formData?.instructions || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
    </div>
  )
}

export default PaymentDetailsForm
