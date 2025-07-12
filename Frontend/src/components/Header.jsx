import "./Header.css"

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#4A7B9D" />
              <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="#FAFFD8" />
            </svg>
          </div>
          <h1 className="logo-text">Mock API Dashboard</h1>
        </div>
        <div className="header-info">
          <span className="version-badge">v1.0.0</span>
        </div>
      </div>
    </header>
  )
}

export default Header
