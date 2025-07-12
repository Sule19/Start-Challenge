"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import FileUpload from "./FileUpload"
import TextEditor from "./TextEditor"
import TabPanel from "./TabPanel"
import "./MockConfigPanel.css"
import SampleJsonGenerator from "./SampleJsonGenerator"
import { validateMockJson, isConditionalResponse } from "../utils/jsonValidator"
import ConditionalResponseBuilder from "./ConditionalResponseBuilder"

const MockConfigPanel = ({ onMockCreated }) => {
  const [route, setRoute] = useState("")
  const [method, setMethod] = useState("GET")
  const [headers, setHeaders] = useState("{}")
  const [body, setBody] = useState("{}")
  const [statusCode, setStatusCode] = useState(200)
  const [responseContent, setResponseContent] = useState('{"message": "Hello from mock"}')
  const [contentType, setContentType] = useState("application/json")
  const [loading, setLoading] = useState(false)

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]

  const handleFileUpload = (content) => {
    try {
      console.log("Processing file content:", content)
      const parsed = JSON.parse(content)
      console.log("Parsed JSON:", parsed)

      // Handle array of mocks
      let mockData = parsed
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockData = parsed[0]
        toast.success(`Loaded first mock from array of ${parsed.length} mocks`)
      }

      // Validate the mock data
      const validation = validateMockJson(mockData)

      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors)
        toast.error(`Invalid JSON structure: ${validation.errors.join(", ")}`)
        return
      }

      if (validation.warnings.length > 0) {
        console.warn("Validation warnings:", validation.warnings)
        validation.warnings.forEach((warning) => toast(warning, { icon: "⚠️" }))
      }

      // Map fields with fallbacks and validation
      if (mockData.ruta || mockData.route) {
        const route = mockData.ruta || mockData.route
        setRoute(route.startsWith("/") ? route : `/${route}`)
      }

      if (mockData.metodo || mockData.method) {
        const method = (mockData.metodo || mockData.method).toUpperCase()
        if (httpMethods.includes(method)) {
          setMethod(method)
        }
      }

      if (mockData.headers) {
        setHeaders(JSON.stringify(mockData.headers, null, 2))
      }

      if (mockData.parametros_body || mockData.body || mockData.requestBody) {
        const bodyData = mockData.parametros_body || mockData.body || mockData.requestBody
        setBody(JSON.stringify(bodyData, null, 2))
      }

      if (mockData.codigo_estado || mockData.statusCode || mockData.status) {
        const status = mockData.codigo_estado || mockData.statusCode || mockData.status
        if (status >= 100 && status <= 599) {
          setStatusCode(status)
        }
      }

      if (mockData.contenido_respuesta || mockData.response || mockData.responseBody) {
        const response = mockData.contenido_respuesta || mockData.response || mockData.responseBody
        setResponseContent(JSON.stringify(response, null, 2))

        // Check if it's conditional and show appropriate message
        if (isConditionalResponse(response)) {
          toast.success("Loaded conditional response structure!")
        }
      }

      if (mockData.content_type || mockData.contentType) {
        setContentType(mockData.content_type || mockData.contentType)
      }

      toast.success("Configuration loaded and validated successfully!")
    } catch (error) {
      console.error("Error processing file:", error)
      toast.error("Error processing file: " + error.message)
    }
  }

  const handleSendConfiguration = async () => {
    if (!route.trim()) {
      toast.error("Route is required")
      return
    }

    try {
      setLoading(true)

      const parsedHeaders = JSON.parse(headers || "{}")
      const parsedBody = JSON.parse(body || "{}")
      const parsedResponse = JSON.parse(responseContent)

      const mockConfig = {
        ruta: route.startsWith("/") ? route : `/${route}`,
        metodo: method,
        parametros_url: {},
        parametros_body: parsedBody,
        headers: parsedHeaders,
        codigo_estado: statusCode,
        contenido_respuesta: parsedResponse,
        content_type: contentType,
      }

      const response = await fetch("http://localhost:8000/configure-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockConfig),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Mock configuration saved successfully!")
        onMockCreated()
        // Reset form
        setRoute("")
        setHeaders("{}")
        setBody("{}")
        setResponseContent('{"message": "Hello from mock"}')
      } else {
        // Handle specific duplicate error
        if (response.status === 400 && result.detail?.includes("already exist")) {
          toast.error(`Duplicate mock: A mock with route "${route}" and method "${method}" already exists`)
        } else {
          toast.error(result.detail || "Failed to save configuration")
        }
      }
    } catch (error) {
      toast.error("Error saving configuration: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabData = [
    {
      id: "headers",
      label: "Headers",
      content: (
        <TextEditor
          value={headers}
          onChange={setHeaders}
          placeholder='{"Content-Type": "application/json"}'
          language="json"
        />
      ),
    },
    {
      id: "body",
      label: "Body",
      content: <TextEditor value={body} onChange={setBody} placeholder='{"key": "value"}' language="json" />,
    },
  ]

  return (
    <div className="mock-config-panel">
      <div className="panel-header">
        <h2>Mock Configuration</h2>
      </div>

      <div className="config-form">
        <FileUpload onFileUpload={handleFileUpload} />
        <SampleJsonGenerator />

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="method">HTTP Method</label>
            <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
              {httpMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="route">Route</label>
            <input
              id="route"
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="/api/example"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status Code</label>
            <input
              id="status"
              type="number"
              value={statusCode}
              onChange={(e) => setStatusCode(Number.parseInt(e.target.value))}
              min="100"
              max="599"
              className="form-input"
            />
          </div>

          <div className="form-group flex-1">
            <label htmlFor="contentType">Content Type</label>
            <input
              id="contentType"
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              placeholder="application/json"
              className="form-input"
            />
          </div>
        </div>

        <TabPanel tabs={tabData} />

        <div className="form-group">
          <label htmlFor="response">Response Content</label>
          <div className="response-editor-container">
            <ConditionalResponseBuilder value={responseContent} onChange={setResponseContent} />
            <div className="manual-editor">
              <TextEditor
                value={responseContent}
                onChange={setResponseContent}
                placeholder='{"message": "Hello from mock"}'
                language="json"
                height="120px"
              />
            </div>
          </div>
        </div>

        <button onClick={handleSendConfiguration} disabled={loading} className="send-config-btn">
          {loading ? "Sending..." : "Send Configuration"}
        </button>
      </div>
    </div>
  )
}

export default MockConfigPanel
