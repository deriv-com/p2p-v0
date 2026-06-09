import jest from "jest"
import { p2pFetch } from "@/services/api/p2p-fetch"
import { useP2PMaintenanceStore } from "@/stores/p2p-maintenance-store"

describe("p2pFetch maintenance blocking", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    useP2PMaintenanceStore.getState().clearMaintenance()
    delete process.env.NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE_ENABLED
    window.history.pushState({}, "", "/")
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("blocks non-exempt P2P calls during API maintenance", async () => {
    useP2PMaintenanceStore.getState().setApiMaintenanceActive(true)

    global.fetch = jest.fn()

    const response = await p2pFetch("https://api.example.com/p2p/v1/orders")

    expect(response.status).toBe(503)
    expect(global.fetch).not.toHaveBeenCalled()
    const body = (await response.json()) as { errors: Array<{ code: string }> }
    expect(body.errors[0]?.code).toBe("P2PDisabled")
  })

  it("allows /users/me from any page during API maintenance", async () => {
    useP2PMaintenanceStore.getState().setApiMaintenanceActive(true)
    window.history.pushState({}, "", "/orders")

    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const response = await p2pFetch("https://api.example.com/p2p/v1/users/me")

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(useP2PMaintenanceStore.getState().isApiMaintenanceActive).toBe(false)
  })
})
