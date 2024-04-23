import React from 'react'
import ReactDOM from 'react-dom/client'
import ChessGame from './ChessGame.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChessGame />
  </React.StrictMode>,
)
