import { isP2PMaintenanceActive } from "@/lib/p2p-maintenance-env"

describe("isP2PMaintenanceActive", () => {
  it("is forced on during QA", () => {
    expect(isP2PMaintenanceActive()).toBe(true)
  })
})
