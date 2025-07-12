"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import Header from "./components/Header"
import MockConfigPanel from "./components/MockConfigPanel"
import RegisteredMocksPanel from "./components/RegisteredMocksPanel"
import RequestSimulator from "./components/RequestSimulator"
import "./App.css"


function App() {
  const [mocks, setMocks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMocks = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8000/configure-mock")
      const data = await response.json()
      if (data.success) {
        setMocks(data.settings)
      }
    } catch (error) {
      console.error("Error fetching mocks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMocks()
  }, [])

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="dashboard-grid">
          <div className="config-section">
            <MockConfigPanel onMockCreated={fetchMocks} />
          </div>
          <div className="mocks-section">
            <RegisteredMocksPanel mocks={mocks} loading={loading} onMockDeleted={fetchMocks} onClearAll={fetchMocks} />
          </div>
          <div className="simulator-section">
            <RequestSimulator />
          </div>
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#54577C",
            color: "#FAFFD8",
          },
        }}
      />
    </div>

    
  )
}


export default App
