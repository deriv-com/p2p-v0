import { extractP2PErrorCode, handleP2PApiStatusCode } from "@/lib/api/p2p-api-status-handler"
import { useP2PMaintenanceStore } from "@/stores/p2p-maintenance-store"

describe("p2p-api-status-handler", () => {
  beforeEach(() => {
    useP2PMaintenanceStore.getState().clearMaintenance()
  })

  describe("extractP2PErrorCode", () => {
    it("returns null for non-object bodies", () => {
      expect(extractP2PErrorCode(null)).toBeNull()
      expect(extractP2PErrorCode("error")).toBeNull()
    })

    it("returns the first error code when present", () => {
      expect(
        extractP2PErrorCode({ errors: [{ code: "P2P_Disabled" }] }),
      ).toBe("P2P_Disabled")
    })
  })

  describe("handleP2PApiStatusCode", () => {
    it("latches maintenance when code is P2P_Disabled", () => {
      handleP2PApiStatusCode("P2P_Disabled")
      expect(useP2PMaintenanceStore.getState().isApiMaintenanceActive).toBe(true)
    })

    it("ignores unknown codes", () => {
      handleP2PApiStatusCode("UserTempBan")
      expect(useP2PMaintenanceStore.getState().isApiMaintenanceActive).toBe(false)
    })
  })
})
