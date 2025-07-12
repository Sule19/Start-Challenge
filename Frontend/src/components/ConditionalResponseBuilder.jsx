"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import "./ConditionalResponseBuilder.css"

const ConditionalResponseBuilder = ({ value, onChange }) => {
  const [isConditional, setIsConditional] = useState(false)
  const [conditions, setConditions] = useState([])
  const [defaultResponse, setDefaultResponse] = useState('{"mensaje": "Default response"}')

  // Parse existing value to determine if it's conditional
  useState(() => {
    try {
      const parsed = JSON.parse(value)
      if (parsed.condiciones && Array.isArray(parsed.condiciones)) {
        setIsConditional(true)
        setConditions(
          parsed.condiciones.map((cond) => ({
            condition: JSON.stringify(cond.si, null, 2),
            response: JSON.stringify(cond.respuesta, null, 2),
          })),
        )
        if (parsed.default) {
          setDefaultResponse(JSON.stringify(parsed.default, null, 2))
        }
      }
    } catch (error) {
      // Not conditional or invalid JSON
    }
  }, [value])

  const handleToggleConditional = () => {
    const newIsConditional = !isConditional
    setIsConditional(newIsConditional)

    if (newIsConditional) {
      // Switch to conditional
      const conditionalStructure = {
        condiciones:
          conditions.length > 0
            ? conditions.map((cond) => ({
                si: JSON.parse(cond.condition || "{}"),
                respuesta: JSON.parse(cond.response || "{}"),
              }))
            : [
                {
                  si: { usuario: "admin" },
                  respuesta: { mensaje: "Admin response" },
                },
              ],
        default: JSON.parse(defaultResponse),
      }
      onChange(JSON.stringify(conditionalStructure, null, 2))
    } else {
      // Switch to simple
      try {
        const parsed = JSON.parse(defaultResponse)
        onChange(JSON.stringify(parsed, null, 2))
      } catch {
        onChange('{"mensaje": "Simple response"}')
      }
    }
  }

  const addCondition = () => {
    const newConditions = [
      ...conditions,
      {
        condition: '{"key": "value"}',
        response: '{"mensaje": "Response for condition"}',
      },
    ]
    setConditions(newConditions)
    updateConditionalValue(newConditions, defaultResponse)
  }

  const removeCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    setConditions(newConditions)
    updateConditionalValue(newConditions, defaultResponse)
  }

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value
    setConditions(newConditions)
    updateConditionalValue(newConditions, defaultResponse)
  }

  const updateDefaultResponse = (value) => {
    setDefaultResponse(value)
    updateConditionalValue(conditions, value)
  }

  const updateConditionalValue = (conditionsArray, defaultResp) => {
    try {
      const conditionalStructure = {
        condiciones: conditionsArray.map((cond) => ({
          si: JSON.parse(cond.condition || "{}"),
          respuesta: JSON.parse(cond.response || "{}"),
        })),
        default: JSON.parse(defaultResp || "{}"),
      }
      onChange(JSON.stringify(conditionalStructure, null, 2))
    } catch (error) {
      toast.error("Invalid JSON in conditional structure")
    }
  }

  if (!isConditional) {
    return (
      <div className="conditional-builder">
        <div className="builder-header">
          <button onClick={handleToggleConditional} className="toggle-conditional-btn">
            Switch to Conditional Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="conditional-builder">
      <div className="builder-header">
        <h4>Conditional Response Builder</h4>
        <button onClick={handleToggleConditional} className="toggle-conditional-btn">
          Switch to Simple Response
        </button>
      </div>

      <div className="conditions-section">
        <div className="section-header">
          <h5>Conditions</h5>
          <button onClick={addCondition} className="add-condition-btn">
            Add Condition
          </button>
        </div>

        {conditions.map((condition, index) => (
          <div key={index} className="condition-item">
            <div className="condition-header">
              <span>Condition {index + 1}</span>
              <button onClick={() => removeCondition(index)} className="remove-condition-btn">
                Remove
              </button>
            </div>

            <div className="condition-fields">
              <div className="field-group">
                <label>If (JSON condition):</label>
                <textarea
                  value={condition.condition}
                  onChange={(e) => updateCondition(index, "condition", e.target.value)}
                  placeholder='{"usuario": "admin"}'
                  className="condition-textarea"
                  rows="2"
                />
              </div>

              <div className="field-group">
                <label>Then respond with:</label>
                <textarea
                  value={condition.response}
                  onChange={(e) => updateCondition(index, "response", e.target.value)}
                  placeholder='{"mensaje": "Welcome admin"}'
                  className="condition-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="default-section">
        <h5>Default Response</h5>
        <textarea
          value={defaultResponse}
          onChange={(e) => updateDefaultResponse(e.target.value)}
          placeholder='{"mensaje": "Default response"}'
          className="default-textarea"
          rows="3"
        />
      </div>
    </div>
  )
}

export default ConditionalResponseBuilder
