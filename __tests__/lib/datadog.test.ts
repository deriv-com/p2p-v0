import { initDatadog, setDatadogUser, addDatadogContext, trackDatadogAction, trackDatadogError } from "@/lib/datadog"
import { datadogRum } from "@datadog/browser-rum"
import jest from "jest" // Declare the jest variable

// Mock the Datadog RUM SDK
jest.mock("@datadog/browser-rum", () => ({
  datadogRum: {
    init: jest.fn(),
    startSessionReplayRecording: jest.fn(),
    setUser: jest.fn(),
    addRumGlobalContext: jest.fn(),
    addAction: jest.fn(),
    addError: jest.fn(),
    getInternalContext: jest.fn(),
  },
}))

describe("Datadog RUM Utilities", () => {
  const originalEnv = process.env
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation()
  const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation()
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    // Mock window object
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
    mockConsoleWarn.mockRestore()
    mockConsoleError.mockRestore()
  })

  describe("initDatadog", () => {
    it("should not initialize in server environment", () => {
      // @ts-ignore
      delete global.window

      initDatadog()

      expect(datadogRum.init).not.toHaveBeenCalled()
    })

    it("should warn and skip initialization when required env vars are missing", () => {
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = undefined
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = undefined

      initDatadog()

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Datadog RUM] Missing required environment variables. Skipping initialization.",
      )
      expect(datadogRum.init).not.toHaveBeenCalled()
    })

    it("should not initialize if already initialized", () => {
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = "test-app-id"
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = "test-client-token"
      ;(datadogRum.getInternalContext as jest.Mock).mockReturnValue({ some: "context" })

      initDatadog()

      expect(datadogRum.init).not.toHaveBeenCalled()
    })

    it("should initialize with required environment variables", () => {
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = "test-app-id"
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = "test-client-token"
      ;(datadogRum.getInternalContext as jest.Mock).mockReturnValue(null)

      initDatadog()

      expect(datadogRum.init).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationId: "test-app-id",
          clientToken: "test-client-token",
          site: "datadoghq.com",
          service: "p2p-v2",
          env: "development",
        }),
      )
      expect(datadogRum.startSessionReplayRecording).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith("[Datadog RUM] Successfully initialized")
    })

    it("should use custom environment variables when provided", () => {
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = "test-app-id"
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = "test-client-token"
      process.env.NEXT_PUBLIC_DATADOG_SITE = "datadoghq.eu"
      process.env.NEXT_PUBLIC_DATADOG_SERVICE = "custom-service"
      process.env.NEXT_PUBLIC_DATADOG_ENV = "production"
      ;(datadogRum.getInternalContext as jest.Mock).mockReturnValue(null)

      initDatadog()

      expect(datadogRum.init).toHaveBeenCalledWith(
        expect.objectContaining({
          site: "datadoghq.eu",
          service: "custom-service",
          env: "production",
        }),
      )
    })

    it("should handle initialization errors gracefully", () => {
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = "test-app-id"
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = "test-client-token"
      ;(datadogRum.getInternalContext as jest.Mock).mockReturnValue(null)
      ;(datadogRum.init as jest.Mock).mockImplementation(() => {
        throw new Error("Init failed")
      })

      initDatadog()

      expect(mockConsoleError).toHaveBeenCalledWith("[Datadog RUM] Initialization failed:", expect.any(Error))
    })
  })

  describe("setDatadogUser", () => {
    it("should not set user in server environment", () => {
      // @ts-ignore
      delete global.window

      setDatadogUser("user-123")

      expect(datadogRum.setUser).not.toHaveBeenCalled()
    })

    it("should set user with all parameters", () => {
      setDatadogUser("user-123", "user@example.com", "John Doe")

      expect(datadogRum.setUser).toHaveBeenCalledWith({
        id: "user-123",
        email: "user@example.com",
        name: "John Doe",
      })
    })

    it("should handle errors when setting user", () => {
      ;(datadogRum.setUser as jest.Mock).mockImplementation(() => {
        throw new Error("Set user failed")
      })

      setDatadogUser("user-123")

      expect(mockConsoleError).toHaveBeenCalledWith("[Datadog RUM] Failed to set user:", expect.any(Error))
    })
  })

  describe("addDatadogContext", () => {
    it("should not add context in server environment", () => {
      // @ts-ignore
      delete global.window

      addDatadogContext("key", "value")

      expect(datadogRum.addRumGlobalContext).not.toHaveBeenCalled()
    })

    it("should add global context", () => {
      addDatadogContext("feature", "p2p-trading")

      expect(datadogRum.addRumGlobalContext).toHaveBeenCalledWith("feature", "p2p-trading")
    })

    it("should handle errors when adding context", () => {
      ;(datadogRum.addRumGlobalContext as jest.Mock).mockImplementation(() => {
        throw new Error("Add context failed")
      })

      addDatadogContext("key", "value")

      expect(mockConsoleError).toHaveBeenCalledWith("[Datadog RUM] Failed to add context:", expect.any(Error))
    })
  })

  describe("trackDatadogAction", () => {
    it("should not track action in server environment", () => {
      // @ts-ignore
      delete global.window

      trackDatadogAction("button-click")

      expect(datadogRum.addAction).not.toHaveBeenCalled()
    })

    it("should track action without context", () => {
      trackDatadogAction("button-click")

      expect(datadogRum.addAction).toHaveBeenCalledWith("button-click", undefined)
    })

    it("should track action with context", () => {
      const context = { buttonId: "submit-order" }
      trackDatadogAction("button-click", context)

      expect(datadogRum.addAction).toHaveBeenCalledWith("button-click", context)
    })

    it("should handle errors when tracking action", () => {
      ;(datadogRum.addAction as jest.Mock).mockImplementation(() => {
        throw new Error("Track action failed")
      })

      trackDatadogAction("button-click")

      expect(mockConsoleError).toHaveBeenCalledWith("[Datadog RUM] Failed to track action:", expect.any(Error))
    })
  })

  describe("trackDatadogError", () => {
    it("should not track error in server environment", () => {
      // @ts-ignore
      delete global.window

      trackDatadogError(new Error("Test error"))

      expect(datadogRum.addError).not.toHaveBeenCalled()
    })

    it("should track error without context", () => {
      const error = new Error("Test error")
      trackDatadogError(error)

      expect(datadogRum.addError).toHaveBeenCalledWith(error, undefined)
    })

    it("should track error with context", () => {
      const error = new Error("Test error")
      const context = { component: "OrderSidebar" }
      trackDatadogError(error, context)

      expect(datadogRum.addError).toHaveBeenCalledWith(error, context)
    })

    it("should handle errors when tracking error", () => {
      ;(datadogRum.addError as jest.Mock).mockImplementation(() => {
        throw new Error("Track error failed")
      })

      trackDatadogError(new Error("Test error"))

      expect(mockConsoleError).toHaveBeenCalledWith("[Datadog RUM] Failed to track error:", expect.any(Error))
    })
  })
})
