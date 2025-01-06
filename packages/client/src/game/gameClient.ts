
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

	})


	// ############################################
	// 					FUNCTIONS
	// ############################################
	function cleanUp() {
		inputHandler.cleanUp()
	}
	// ############################################
	// 					PLAYER
	// ############################################
	return {
		cleanUp
	}
}