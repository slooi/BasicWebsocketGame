
import { createKeyboardHandler } from './keyboardHandler'
import { createRenderer } from './renderer'
import { CELL_SIZE, CLIENT_FPS_INTERVAL, MOVEMENT_KEYS } from '@game/shared/constants'
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
	const renderData: number[] = []

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

	const wsMessageHandler = (e: MessageEvent<any>) => {
		// console.log("message", e.data)
		const data = JSON.parse(e.data, reviver)
		if (hasReceivedFirstMessage) {
			serverClientTickPayload = data
			actualGameLoop()
			// console.log("serverClientTickPayload", serverClientTickPayload)
			// console.log("serverClientTickPayload", serverClientTickPayload)
		} else {
			hasReceivedFirstMessage = true
			console.log("data", data)
			playerId = data
			// console.log("playerId", playerId)
		}
	}
	ws.addEventListener("message", wsMessageHandler)

	// ############################################
	// 					FUNCTIONS
	// ############################################
	function cleanUp() {
		ws.removeEventListener("message", wsMessageHandler) //not sure if this one is necessary
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
		renderData.length = 0
		serverClientTickPayload.forEach(playerRenderData => {
			if (playerRenderData[0] === "wall") {
				renderData.push(playerRenderData[1], playerRenderData[2])
			} else {
				renderData.push(playerRenderData[1], playerRenderData[2])
			}
		})
		// console.log("renderData", renderData)
		renderer.renderWithoutClear(renderData)
	}

	let lastDate = performance.now()
	function gameLoop() {
		const nowDate = performance.now()
		const delta = nowDate - lastDate
		if (delta > CLIENT_FPS_INTERVAL) {
			lastDate = nowDate - delta % CLIENT_FPS_INTERVAL
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
				// requestAnimationFrameId = requestAnimationFrame(gameLoop)
			} else {
				throw new Error("requestAnimationFrameId is not undefined for some reason!")
			}
		}
	}
}
function reviver(key: any, value: any) {
	if (typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}
	return value;
}
