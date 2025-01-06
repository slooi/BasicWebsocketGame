
import { createKeyboardHandler } from './keyboardHandler'
import { MOVEMENT_KEYS } from './constants'
import { createRenderer } from './renderer'

export const createGameClient = (canvas: HTMLCanvasElement) => {
	// ############################################
	// 					INIT
	// ############################################
	const renderer = createRenderer(canvas)
	renderer.render()

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
		inputHandler.setOnChangeCallback(undefined)
	}
	// ############################################
	// 					PLAYER
	// ############################################
	return {
		cleanUp
	}
}