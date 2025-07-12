import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import MockConfigPanel from "../MockConfigPanel"

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock fetch
window.fetch = vi.fn() as any

describe("MockConfigPanel", () => {
  const mockOnMockCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear fetch mock properly
    ;(fetch as any).mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("renders mock configuration form", () => {
    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    expect(screen.getByText("Mock Configuration")).toBeInTheDocument()
    expect(screen.getByLabelText("HTTP Method")).toBeInTheDocument()
    expect(screen.getByLabelText("Route")).toBeInTheDocument()
    expect(screen.getByLabelText("Status Code")).toBeInTheDocument()
    expect(screen.getByLabelText("Content Type")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send configuration/i })).toBeInTheDocument()
  })

  test("shows error when route is empty", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    const sendButton = screen.getByRole("button", { name: /send configuration/i })
    await user.click(sendButton)

    expect(toast.default.error).toHaveBeenCalledWith("Route is required")
  })

  test("successfully creates a mock", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Mock settings saved successfully",
        settings_id: 1,
        total_settings: 1,
      }),
    })

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    // Fill in the form
    const routeInput = screen.getByLabelText("Route")
    await user.type(routeInput, "/api/test")

    const methodSelect = screen.getByLabelText("HTTP Method")
    await user.selectOptions(methodSelect, "POST")

    const sendButton = screen.getByRole("button", { name: /send configuration/i })
    await user.click(sendButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:8000/configure-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("/api/test"),
      })
    })

    expect(toast.default.success).toHaveBeenCalledWith("Mock configuration saved successfully!")
    expect(mockOnMockCreated).toHaveBeenCalled()
  })

  test("handles duplicate mock error", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        detail: "Mock with this rute and method already exist",
      }),
    })

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    // Fill in the form
    const routeInput = screen.getByLabelText("Route")
    await user.type(routeInput, "/api/duplicate")

    const sendButton = screen.getByRole("button", { name: /send configuration/i })
    await user.click(sendButton)

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate mock: A mock with route "/api/duplicate" and method "GET" already exists'),
      )
    })
  })

  test("handles network error", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockRejectedValueOnce(new Error("Network error"))

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    const routeInput = screen.getByLabelText("Route")
    await user.type(routeInput, "/api/test")

    const sendButton = screen.getByRole("button", { name: /send configuration/i })
    await user.click(sendButton)

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Error saving configuration: Network error")
    })
  })

  test("validates and loads JSON file", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")

    const mockFile = new File(
      [
        JSON.stringify({
          ruta: "/api/from-file",
          metodo: "POST",
          headers: { Authorization: "Bearer token" },
          parametros_body: { key: "value" },
          codigo_estado: 201,
          contenido_respuesta: { message: "From file" },
          content_type: "application/json",
        }),
      ],
      "mock.json",
      { type: "application/json" },
    )

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    // Find the file input more reliably
    const fileInput =
      screen.getByLabelText(/upload json file/i) || (document.querySelector('input[type="file"]') as HTMLInputElement)

    // Simulate file upload
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByDisplayValue("/api/from-file")).toBeInTheDocument()
      expect(screen.getByDisplayValue("POST")).toBeInTheDocument()
      expect(toast.default.success).toHaveBeenCalledWith("Configuration loaded and validated successfully!")
    })
  })

  test("handles invalid JSON file", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")

    const mockFile = new File(["invalid json"], "invalid.json", { type: "application/json" })

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(hiddenInput, mockFile)

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(expect.stringContaining("Error processing file"))
    })
  })

  test("rejects non-JSON files", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")

    const mockFile = new File(["text content"], "file.txt", { type: "text/plain" })

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(hiddenInput, mockFile)

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Please select a JSON file")
    })
  })

  test("updates form fields correctly", async () => {
    const user = userEvent.setup()

    render(<MockConfigPanel onMockCreated={mockOnMockCreated} />)

    // Test route input
    const routeInput = screen.getByLabelText("Route") as HTMLInputElement
    await user.type(routeInput, "/api/test")
    expect(routeInput.value).toBe("/api/test")

    // Test method select
    const methodSelect = screen.getByLabelText("HTTP Method") as HTMLSelectElement
    await user.selectOptions(methodSelect, "PUT")
    expect(methodSelect.value).toBe("PUT")

    // Test status code
    const statusInput = screen.getByLabelText("Status Code") as HTMLInputElement
    await user.clear(statusInput)
    await user.type(statusInput, "201")
    expect(statusInput.value).toBe("201")

    // Test content type
    const contentTypeInput = screen.getByLabelText("Content Type") as HTMLInputElement
    await user.clear(contentTypeInput)
    await user.type(contentTypeInput, "text/plain")
    expect(contentTypeInput.value).toBe("text/plain")
  })
})
