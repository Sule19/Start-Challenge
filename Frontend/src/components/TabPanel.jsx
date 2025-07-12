"use client"

import { useState } from "react"
import "./TabPanel.css"

const TabPanel = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "")

  return (
    <div className="tab-panel">
      <div className="tab-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  )
}

export default TabPanel
