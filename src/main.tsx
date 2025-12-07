import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Playground } from './pages/Playground'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Playground />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

