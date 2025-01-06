
import { createKeyboardHandler } from './keyboardHandler'
import { createRenderer } from './renderer'
import { FPS_INTERVAL, MOVEMENT_KEYS } from '@game/shared/constants'
import { ServerClientTickPayload } from "@game/shared/types"

export const createGameClient = (canvas: HTMLCanvasElement) => {
	// ############################################
	// 					INIT
	// ############################################
	// basic
	let requestAnimationFrameId: number | undefined = undefined
	let serverClientTickPayload: ServerClientTickPayload = []
	let playerId: number | undefined = undefined
	let hasReceivedFirstMessage = false

	// Objects
	const renderer = createRenderer(canvas)
	const ws = new WebSocket(`${location.origin.replace("http", "ws")}/ws`)
	const inputHandler = createKeyboardHandler(MOVEMENT_KEYS)

	// ############################################
	// 					CALLBACKS
	// ############################################
	inputHandler.setOnChangeCallback(() => ws.send(JSON.stringify(inputHandler.getState())))

	// ############################################
	// 					WEBSOCKET HANDLER
	// ############################################
	ws.addEventListener("message", e => {
		console.log("message", e.data)
		const data = JSON.parse(e.data)
		if (hasReceivedFirstMessage) {
			serverClientTickPayload = data
			console.log("serverClientTickPayload", serverClientTickPayload)
		} else {
			hasReceivedFirstMessage = true
			playerId = data
		}
	})

	// ############################################
	// 					FUNCTIONS
	// ############################################
	function cleanUp() {
		ws.close()
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