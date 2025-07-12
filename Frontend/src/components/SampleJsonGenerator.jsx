"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import "./SampleJsonGenerator.css"

const SampleJsonGenerator = () => {
  const [showSample, setShowSample] = useState(false)
  const [sampleType, setSampleType] = useState("simple")

  const simpleSample = {
    ruta: "/api/ejemplo",
    metodo: "GET",
    parametros_url: {},
    parametros_body: {},
    headers: {},
    codigo_estado: 200,
    contenido_respuesta: {
      mensaje: "Texto de respuesta",
    },
    content_type: "application/json",
  }

  const conditionalSample = {
    ruta: "/api/usuarios",
    metodo: "POST",
    parametros_url: {},
    parametros_body: {},
    headers: {},
    codigo_estado: 200,
    contenido_respuesta: {
      condiciones: [
        {
          si: { usuario: "admin" },
          respuesta: { mensaje: "Bienvenido, administrador" },
        },
        {
          si: { usuario: "invitado" },
          respuesta: { mensaje: "Acceso limitado" },
        },
      ],
      default: {
        mensaje: "Usuario no reconocido",
      },
    },
    content_type: "application/json",
  }

  const currentSample = sampleType === "simple" ? simpleSample : conditionalSample

  const handleDownloadSample = () => {
    const blob = new Blob([JSON.stringify(currentSample, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sample-mock-${sampleType}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Sample ${sampleType} JSON downloaded!`)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(currentSample, null, 2))
    toast.success(`Sample ${sampleType} JSON copied to clipboard!`)
  }

  return (
    <div className="sample-json-generator">
      <button onClick={() => setShowSample(!showSample)} className="sample-toggle-btn">
        {showSample ? "Hide" : "Show"} Sample JSON Format
      </button>

      {showSample && (
        <div className="sample-content">
          <div className="sample-header">
            <div className="sample-type-selector">
              <button
                onClick={() => setSampleType("simple")}
                className={`sample-type-btn ${sampleType === "simple" ? "active" : ""}`}
              >
                Simple Response
              </button>
              <button
                onClick={() => setSampleType("conditional")}
                className={`sample-type-btn ${sampleType === "conditional" ? "active" : ""}`}
              >
                Conditional Response
              </button>
            </div>

            <div className="sample-actions">
              <button onClick={handleDownloadSample} className="sample-action-btn">
                Download Sample
              </button>
              <button onClick={handleCopyToClipboard} className="sample-action-btn">
                Copy to Clipboard
              </button>
            </div>
          </div>

          <div className="sample-description">
            {sampleType === "simple" ? (
              <p>Simple structure with direct response content</p>
            ) : (
              <p>
                Conditional structure that returns different responses based on request parameters, body, or headers
              </p>
            )}
          </div>

          <pre className="sample-json">{JSON.stringify(currentSample, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default SampleJsonGenerator
