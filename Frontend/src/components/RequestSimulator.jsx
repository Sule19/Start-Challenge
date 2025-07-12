"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import "./RequestSimulator.css"

const RequestSimulator = () => {
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [headers, setHeaders] = useState("{}")
  const [body, setBody] = useState("{}")
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]

  const handleSendRequest = async () => {
    if (!url.trim()) {
      toast.error("URL is required")
      return
    }

    try {
      setLoading(true)
      setResponse(null)

      const parsedHeaders = JSON.parse(headers || "{}")
      const requestUrl = url.startsWith("http") ? url : `http://localhost:8000${url.startsWith("/") ? url : "/" + url}`

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
      }

      if (method !== "GET" && method !== "HEAD" && body.trim()) {
        options.body = body
      }

      const startTime = Date.now()
      const res = await fetch(requestUrl, options)
      const endTime = Date.now()

      const responseText = await res.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        time: endTime - startTime,
      })

      toast.success(`Request completed in ${endTime - startTime}ms`)
    } catch (error) {
      toast.error("Request failed: " + error.message)
      setResponse({
        error: error.message,
        time: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="request-simulator">
      <div className="panel-header">
        <h2>Request Simulator</h2>
      </div>

      <div className="simulator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sim-method">Method</label>
            <select id="sim-method" value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
              {httpMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="sim-url">URL</label>
            <input
              id="sim-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/example or full URL"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sim-headers">Headers (JSON)</label>
          <textarea
            id="sim-headers"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token"}'
            className="form-textarea"
            rows="3"
          />
        </div>

        {method !== "GET" && method !== "HEAD" && (
          <div className="form-group">
            <label htmlFor="sim-body">Request Body</label>
            <textarea
              id="sim-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="form-textarea"
              rows="4"
            />
          </div>
        )}

        <button onClick={handleSendRequest} disabled={loading} className="send-request-btn">
          {loading ? "Sending..." : "Send Request"}
        </button>
      </div>

      {response && (
        <div className="response-section">
          <h3>Response</h3>

          <div className="response-meta">
            {response.error ? (
              <div className="response-error">
                <span className="error-badge">ERROR</span>
                <span>{response.error}</span>
              </div>
            ) : (
              <div className="response-info">
                <span className={`status-badge status-${Math.floor(response.status / 100)}xx`}>
                  {response.status} {response.statusText}
                </span>
                <span className="time-badge">{response.time}ms</span>
              </div>
            )}
          </div>

          {response.headers && (
            <div className="response-headers">
              <h4>Headers</h4>
              <pre className="response-content">{JSON.stringify(response.headers, null, 2)}</pre>
            </div>
          )}

          {response.data && (
            <div className="response-body">
              <h4>Body</h4>
              <pre className="response-content">
                {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RequestSimulator
