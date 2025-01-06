
import { createKeyboardHandler } from './keyboardHandler'
import { createRenderer } from './renderer'
import { FPS_INTERVAL, MOVEMENT_KEYS } from '@game/shared/constants'

export const createGameClient = (canvas: HTMLCanvasElement) => {
	// ############################################
	// 					INIT
	// ############################################
	const renderer = createRenderer(canvas)
	let requestAnimationFrameId: number | undefined = undefined

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
		requestAnimationFrameId && cancelAnimationFrame(requestAnimationFrameId)
		inputHandler.cleanUp()
		inputHandler.setOnChangeCallback(undefined) //!@#!@# important
	}

	// ############################################
	// 					MAIN LOOP
	// ############################################
	function actualGameLoop() {
		renderer.clear()
		renderer.renderWithoutClear(1)
	}

	let lastDate = Date.now()
	function gameLoop() {
		const nowDate = Date.now()
		const delta = nowDate - lastDate
		if (delta > FPS_INTERVAL) {
			lastDate = nowDate - delta % FPS_INTERVAL
			actualGameLoop()
		}
		requestAnimationFrameId = requestAnimationFrame(gameLoop) // !@#!@#!@# REMEMBER TO UPDATE ID
	}

	// ############################################
	// 					API
	// ############################################
	return {
		cleanUp,
		gameLoop: () => {
			if (requestAnimationFrameId === undefined) {
				requestAnimationFrameId = requestAnimationFrame(gameLoop)
			} else {
				throw new Error("requestAnimationFrameId is not undefined for some reason!")
			}
		}
	}
}