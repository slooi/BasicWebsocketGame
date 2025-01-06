import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createGameClient } from './game/gameClient'


function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) throw new Error("No canvas reference found! D:")

    const gameClient = createGameClient(canvasRef.current)
    gameClient.gameLoop()
    return () => gameClient.cleanUp()
  }, [])

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default App
