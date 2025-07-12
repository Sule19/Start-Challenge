import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test, vi } from "vitest"
import RegisteredMocksPanel from "../RegisteredMocksPanel"
import '@testing-library/jest-dom'

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

describe("RegisteredMocksPanel", () => {
  const mockOnMockDeleted = vi.fn()
  const mockOnClearAll = vi.fn()

  const sampleMocks = [
    {
      id: 1,
      ruta: "/api/test1",
      metodo: "GET",
      codigo_estado: 200,
      content_type: "application/json",
    },
    {
      id: 2,
      ruta: "/api/test2",
      metodo: "POST",
      codigo_estado: 201,
      content_type: "application/json",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as any).mockClear()
  })

  test("renders empty state when no mocks", () => {
    render(
      <RegisteredMocksPanel mocks={[]} loading={false} onMockDeleted={mockOnMockDeleted} onClearAll={mockOnClearAll} />,
    )

    expect(screen.getByText("Registered Mocks (0)")).toBeInTheDocument()
    expect(screen.getByText("No mocks registered yet")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /clear all mocks/i })).toBeDisabled()
  })

  test("renders loading state", () => {
    render(
      <RegisteredMocksPanel mocks={[]} loading={true} onMockDeleted={mockOnMockDeleted} onClearAll={mockOnClearAll} />,
    )

    expect(screen.getByText("Loading mocks...")).toBeInTheDocument()
  })

  test("renders mocks table with data", () => {
    render(
      <RegisteredMocksPanel
        mocks={sampleMocks}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    expect(screen.getByText("Registered Mocks (2)")).toBeInTheDocument()
    expect(screen.getByText("/api/test1")).toBeInTheDocument()
    expect(screen.getByText("/api/test2")).toBeInTheDocument()
    expect(screen.getByText("GET")).toBeInTheDocument()
    expect(screen.getByText("POST")).toBeInTheDocument()

    // Should not have Try buttons
    expect(screen.queryByText("Try")).not.toBeInTheDocument()

    // Should have Delete buttons
    const deleteButtons = screen.getAllByText("Delete")
    expect(deleteButtons).toHaveLength(2)
  })

  test("deletes a mock successfully", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Mock with ID 1 deleted.",
      }),
    })

    render(
      <RegisteredMocksPanel
        mocks={sampleMocks}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    const deleteButtons = screen.getAllByText("Delete")
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:8000/configure-mock/1", {
        method: "DELETE",
      })
    })

    expect(toast.default.success).toHaveBeenCalledWith("Mock deleted successfully!")
    expect(mockOnMockDeleted).toHaveBeenCalled()
  })

  test("handles delete error", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: "Mock not found",
      }),
    })

    render(
      <RegisteredMocksPanel
        mocks={sampleMocks}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    const deleteButtons = screen.getAllByText("Delete")
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Failed to delete mock")
    })
  })

  test("clears all mocks with confirmation", async () => {
    const user = userEvent.setup()
    const toast = await import("react-hot-toast")
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Cleared 2 mock settings from memory and file",
        total_settings: 0,
      }),
    })

    render(
      <RegisteredMocksPanel
        mocks={sampleMocks}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    // Click Clear All button
    const clearAllButton = screen.getByRole("button", { name: /clear all mocks/i })
    await user.click(clearAllButton)

    // Modal should appear
    expect(screen.getByText("Clear All Mocks")).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete all registered mocks/i)).toBeInTheDocument()

    // Confirm deletion
    const confirmButton = screen.getByRole("button", { name: /clear all/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:8000/configure-mock", {
        method: "DELETE",
      })
    })

    expect(toast.default.success).toHaveBeenCalledWith("All mocks cleared successfully!")
    expect(mockOnClearAll).toHaveBeenCalled()
  })

  test("cancels clear all operation", async () => {
    const user = userEvent.setup()

    render(
      <RegisteredMocksPanel
        mocks={sampleMocks}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    // Click Clear All button
    const clearAllButton = screen.getByRole("button", { name: /clear all mocks/i })
    await user.click(clearAllButton)

    // Cancel operation
    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    // Modal should disappear
    expect(screen.queryByText("Clear All Mocks")).not.toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  test("displays correct method badges", () => {
    const mocksWithDifferentMethods = [
      { id: 1, ruta: "/api/get", metodo: "GET", codigo_estado: 200, content_type: "application/json" },
      { id: 2, ruta: "/api/post", metodo: "POST", codigo_estado: 201, content_type: "application/json" },
      { id: 3, ruta: "/api/put", metodo: "PUT", codigo_estado: 200, content_type: "application/json" },
      { id: 4, ruta: "/api/delete", metodo: "DELETE", codigo_estado: 204, content_type: "application/json" },
    ]

    render(
      <RegisteredMocksPanel
        mocks={mocksWithDifferentMethods}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    // Use more flexible class checking
    const getElement = screen.getByText("GET")
    const postElement = screen.getByText("POST")
    const putElement = screen.getByText("PUT")
    const deleteElement = screen.getByText("DELETE")

    expect(getElement).toHaveClass("method-get")
    expect(postElement).toHaveClass("method-post")
    expect(putElement).toHaveClass("method-put")
    expect(deleteElement).toHaveClass("method-delete")
  })

  test("displays correct status badges", () => {
    const mocksWithDifferentStatuses = [
      { id: 1, ruta: "/api/200", metodo: "GET", codigo_estado: 200, content_type: "application/json" },
      { id: 2, ruta: "/api/301", metodo: "GET", codigo_estado: 301, content_type: "application/json" },
      { id: 3, ruta: "/api/404", metodo: "GET", codigo_estado: 404, content_type: "application/json" },
      { id: 4, ruta: "/api/500", metodo: "GET", codigo_estado: 500, content_type: "application/json" },
    ]

    render(
      <RegisteredMocksPanel
        mocks={mocksWithDifferentStatuses}
        loading={false}
        onMockDeleted={mockOnMockDeleted}
        onClearAll={mockOnClearAll}
      />,
    )

    // Use more flexible status checking
    const status200 = screen.getByText("200")
    const status301 = screen.getByText("301")
    const status404 = screen.getByText("404")
    const status500 = screen.getByText("500")

    expect(status200).toHaveClass("status-2xx")
    expect(status301).toHaveClass("status-3xx")
    expect(status404).toHaveClass("status-4xx")
    expect(status500).toHaveClass("status-5xx")
  })
})
