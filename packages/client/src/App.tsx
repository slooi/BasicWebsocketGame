import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createRenderer } from './game/renderer'
import { createKeyboardHandler } from './game/keyboardHandler'

const ws = new WebSocket(`${location.origin.replace("http", "ws")}/ws`)
const inputHandler = createKeyboardHandler()

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) throw new Error("No canvas reference found! D:")

    const renderer = createRenderer(canvasRef.current)
    renderer.render()
  }, [])

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default App
