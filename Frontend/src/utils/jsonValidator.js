export const validateMockJson = (jsonData) => {
  const errors = []
  const warnings = []

  // Required fields check
  if (!jsonData.ruta && !jsonData.route) {
    errors.push("Missing required field: 'ruta' or 'route'")
  }

  if (!jsonData.metodo && !jsonData.method) {
    errors.push("Missing required field: 'metodo' or 'method'")
  }

  if (!jsonData.contenido_respuesta && !jsonData.response && !jsonData.responseBody) {
    errors.push("Missing required field: 'contenido_respuesta', 'response', or 'responseBody'")
  }

  // Validation checks
  if (jsonData.metodo || jsonData.method) {
    const method = (jsonData.metodo || jsonData.method).toUpperCase()
    const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]
    if (!validMethods.includes(method)) {
      errors.push(`Invalid HTTP method: ${method}`)
    }
  }

  if (jsonData.codigo_estado || jsonData.statusCode || jsonData.status) {
    const status = jsonData.codigo_estado || jsonData.statusCode || jsonData.status
    if (status < 100 || status > 599) {
      errors.push(`Invalid status code: ${status}. Must be between 100-599`)
    }
  }

  // Route validation
  if (jsonData.ruta || jsonData.route) {
    const route = jsonData.ruta || jsonData.route
    if (!route.startsWith("/")) {
      warnings.push("Route should start with '/' - will be auto-corrected")
    }
  }

  // Validate contenido_respuesta structure
  const responseContent = jsonData.contenido_respuesta || jsonData.response || jsonData.responseBody
  if (responseContent && typeof responseContent === "object") {
    // Check if it's a conditional response structure
    if (responseContent.condiciones) {
      if (!Array.isArray(responseContent.condiciones)) {
        errors.push("'condiciones' must be an array")
      } else {
        // Validate each condition
        responseContent.condiciones.forEach((condicion, index) => {
          if (!condicion.si || typeof condicion.si !== "object") {
            errors.push(`Condition ${index + 1}: 'si' field is required and must be an object`)
          }
          if (!condicion.respuesta || typeof condicion.respuesta !== "object") {
            errors.push(`Condition ${index + 1}: 'respuesta' field is required and must be an object`)
          }
        })
      }

      // Default response is optional but should be an object if present
      if (responseContent.default && typeof responseContent.default !== "object") {
        errors.push("'default' response must be an object")
      }

      warnings.push("Using conditional response structure")
    } else {
      // Simple response structure
      warnings.push("Using simple response structure")
    }
  }

  return { errors, warnings, isValid: errors.length === 0 }
}

export const formatJsonSafely = (obj, indent = 2) => {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    return String(obj)
  }
}

export const isConditionalResponse = (responseContent) => {
  return (
    responseContent &&
    typeof responseContent === "object" &&
    responseContent.condiciones &&
    Array.isArray(responseContent.condiciones)
  )
}
