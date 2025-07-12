"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import Modal from "./Modal"
import "./RegisteredMocksPanel.css"

const RegisteredMocksPanel = ({ mocks, loading, onMockDeleted, onClearAll }) => {
  const [showClearModal, setShowClearModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (mockId) => {
    try {
      setDeletingId(mockId)
      const response = await fetch(`http://localhost:8000/configure-mock/${mockId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Mock deleted successfully!")
        onMockDeleted()
      } else {
        toast.error("Failed to delete mock")
      }
    } catch (error) {
      toast.error("Error deleting mock")
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAll = async () => {
    try {
      const response = await fetch("http://localhost:8000/configure-mock", {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("All mocks cleared successfully!")
        onClearAll()
        setShowClearModal(false)
      } else {
        toast.error("Failed to clear mocks")
      }
    } catch (error) {
      toast.error("Error clearing mocks")
    }
  }

  return (
    <div className="registered-mocks-panel">
      <div className="panel-header">
        <h2>Registered Mocks ({mocks.length})</h2>
        <button onClick={() => setShowClearModal(true)} className="clear-all-btn" disabled={mocks.length === 0}>
          Clear All Mocks
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading mocks...</div>
      ) : mocks.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9AA899" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p>No mocks registered yet</p>
        </div>
      ) : (
        <div className="mocks-table-container">
          <table className="mocks-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Method</th>
                <th>Status</th>
                <th>Content-Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mocks.map((mock) => (
                <tr key={mock.id}>
                  <td className="route-cell">{mock.ruta}</td>
                  <td>
                    <span className={`method-badge method-${mock.metodo.toLowerCase()}`}>{mock.metodo}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${Math.floor(mock.codigo_estado / 100)}xx`}>
                      {mock.codigo_estado}
                    </span>
                  </td>
                  <td className="content-type-cell">{mock.content_type}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleDelete(mock.id)}
                        disabled={deletingId === mock.id}
                        className="action-btn delete-btn"
                        title="Delete this mock"
                      >
                        {deletingId === mock.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Mocks">
        <p>Are you sure you want to delete all registered mocks? This action cannot be undone.</p>
        <div className="modal-actions">
          <button onClick={() => setShowClearModal(false)} className="modal-btn cancel-btn">
            Cancel
          </button>
          <button onClick={handleClearAll} className="modal-btn confirm-btn">
            Clear All
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default RegisteredMocksPanel
