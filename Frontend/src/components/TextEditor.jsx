"use client"
import "./TextEditor.css"

const TextEditor = ({ value, onChange, placeholder, language = "json", height = "100px" }) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="text-editor">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="editor-textarea"
        style={{ height }}
        spellCheck={false}
      />
    </div>
  )
}

export default TextEditor
