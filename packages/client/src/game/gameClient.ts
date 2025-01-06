
import { createKeyboardHandler } from './keyboardHandler'
import { MOVEMENT_KEYS } from './constants'
import { createRenderer } from './renderer'
import { FPS_INTERVAL } from '@game/shared/constants'

export const createGameClient = (canvas: HTMLCanvasElement) => {
	// ############################################
	// 					INIT
	// ############################################
	const renderer = createRenderer(canvas)

	const ws = new WebSocket(`${location.origin.replace("http", "ws")}/ws`)
	const inputHandler = createKeyboardHandler(MOVEMENT_KEYS)
	inputHandler.setOnChangeCallback((key, isDown) => {
		const data = JSON.stringify(inputHandler.getState())
		console.log("data", data)
		ws.send(data)
	})


	// ############################################
	// 					FUNCTIONS
	// ############################################
	function cleanUp() {
		inputHandler.cleanUp()
		inputHandler.setOnChangeCallback(undefined) //!@#!@# important
	}

	// ############################################
	// 					MAIN LOOP
	// ############################################
	function actualGameLoop() {
		renderer.render(1)
	}

	let lastDate = Date.now()
	function gameLoop() {
		const nowDate = Date.now()
		const delta = nowDate - lastDate
		if (delta > FPS_INTERVAL) {
			lastDate = nowDate - delta % FPS_INTERVAL
			actualGameLoop()
		}
		requestAnimationFrame(gameLoop)
	}

	// ############################################
	// 					API
	// ############################################
	return {
		cleanUp,
		gameLoop
	}
}