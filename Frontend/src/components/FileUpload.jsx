"use client"

import toast from "react-hot-toast"
import "./FileUpload.css"

const FileUpload = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith(".json")) {
      toast.error("Please select a JSON file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        onFileUpload(content)
      } catch (error) {
        toast.error("Error reading file")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="file-upload">

      <input
        id="upload-mock"
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <label htmlFor="upload-mock" className="upload-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Upload JSON File
      </label>
    </div>
  )
}

export default FileUpload
