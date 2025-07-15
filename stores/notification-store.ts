import { create } from "zustand"

interface NotificationState {
  successModal: {
    show: boolean
    type: "created" | "updated" | ""
    adType: string
    adId: string
  }
  setSuccessModal: (data: { type: "created" | "updated"; adType: string; adId: string }) => void
  clearSuccessModal: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  successModal: {
    show: false,
    type: "",
    adType: "",
    adId: "",
  },
  setSuccessModal: (data) =>
    set({
      successModal: {
        show: true,
        type: data.type,
        adType: data.adType,
        adId: data.adId,
      },
    }),
  clearSuccessModal: () =>
    set({
      successModal: {
        show: false,
        type: "",
        adType: "",
        adId: "",
      },
    }),
}))
