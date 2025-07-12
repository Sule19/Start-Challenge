import { validateMockJson, isConditionalResponse } from "../jsonValidator"

describe("jsonValidator", () => {
  describe("validateMockJson", () => {
    test("validates simple mock structure", () => {
      const mockData = {
        ruta: "/api/test",
        metodo: "GET",
        contenido_respuesta: { message: "test" },
        codigo_estado: 200,
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test("validates conditional mock structure", () => {
      const mockData = {
        ruta: "/api/conditional",
        metodo: "POST",
        contenido_respuesta: {
          condiciones: [
            {
              si: { user: "admin" },
              respuesta: { message: "Admin access" },
            },
          ],
          default: { message: "Default response" },
        },
        codigo_estado: 200,
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toContain("Using conditional response structure")
    })

    test("rejects missing required fields", () => {
      const mockData = {
        metodo: "GET",
        // Missing ruta and contenido_respuesta
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Missing required field: 'ruta' or 'route'")
      expect(result.errors).toContain("Missing required field: 'contenido_respuesta', 'response', or 'responseBody'")
    })

    test("rejects invalid HTTP method", () => {
      const mockData = {
        ruta: "/api/test",
        metodo: "INVALID",
        contenido_respuesta: { message: "test" },
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Invalid HTTP method: INVALID")
    })

    test("rejects invalid status code", () => {
      const mockData = {
        ruta: "/api/test",
        metodo: "GET",
        contenido_respuesta: { message: "test" },
        codigo_estado: 999,
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Invalid status code: 999. Must be between 100-599")
    })

    test("warns about route without leading slash", () => {
      const mockData = {
        ruta: "api/test", // Missing leading slash
        metodo: "GET",
        contenido_respuesta: { message: "test" },
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain("Route should start with '/' - will be auto-corrected")
    })

    test("validates conditional structure with invalid conditions", () => {
      const mockData = {
        ruta: "/api/test",
        metodo: "GET",
        contenido_respuesta: {
          condiciones: [
            {
              // Missing 'si' field
              respuesta: { message: "test" },
            },
          ],
        },
      }

      const result = validateMockJson(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Condition 1: 'si' field is required and must be an object")
    })
  })

  describe("isConditionalResponse", () => {
    test("identifies conditional response", () => {
      const conditionalResponse = {
        condiciones: [{ si: { user: "admin" }, respuesta: { message: "Admin" } }],
        default: { message: "Default" },
      }

      expect(isConditionalResponse(conditionalResponse)).toBe(true)
    })

    test("identifies simple response", () => {
      const simpleResponse = {
        message: "Simple response",
      }

      expect(isConditionalResponse(simpleResponse)).toBe(false)
    })

    test("handles null/undefined", () => {
      expect(isConditionalResponse(null)).toBe(false)
      expect(isConditionalResponse(undefined)).toBe(false)
    })
  })
})
