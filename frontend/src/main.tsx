import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'

// Configure global axios base URL with fallback to the deployed Render backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://ai-ops-copilot-backend.onrender.com';


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
