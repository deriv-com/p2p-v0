import { p2pMaintenanceRedirectFor } from "@/lib/p2p-maintenance-route-guard"

describe("p2pMaintenanceRedirectFor", () => {
  it("returns null for allowed tab roots", () => {
    expect(p2pMaintenanceRedirectFor("/")).toBeNull()
    expect(p2pMaintenanceRedirectFor("/orders")).toBeNull()
    expect(p2pMaintenanceRedirectFor("/ads")).toBeNull()
    expect(p2pMaintenanceRedirectFor("/wallet")).toBeNull()
    expect(p2pMaintenanceRedirectFor("/profile")).toBeNull()
  })

  it("redirects sub-routes to nearest tab root", () => {
    expect(p2pMaintenanceRedirectFor("/advertiser/123")).toBe("/")
    expect(p2pMaintenanceRedirectFor("/orders/456")).toBe("/orders")
    expect(p2pMaintenanceRedirectFor("/ads/create")).toBe("/ads")
    expect(p2pMaintenanceRedirectFor("/wallet/transfer")).toBe("/wallet")
    expect(p2pMaintenanceRedirectFor("/profile/settings")).toBe("/profile")
  })

  it("falls back to markets for unknown paths", () => {
    expect(p2pMaintenanceRedirectFor("/unknown")).toBe("/")
  })
})
