// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Load Tailwind CDN
const tailwindScript = document.createElement('script')
tailwindScript.src = "https://cdn.tailwindcss.com"
document.head.appendChild(tailwindScript)//

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)//
