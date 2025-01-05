import { MOVEMENT_KEYS } from "./constants"

const createKeyboardHandler = () => {
	// #################################################
	//				STATE	
	// #################################################
	const state: Record<typeof MOVEMENT_KEYS[number], boolean | undefined> = {} as Record<typeof MOVEMENT_KEYS[number], boolean | undefined>

	// #################################################
	//				HANDLERS	
	// #################################################
	const keyHandler = (e: KeyboardEvent, isDown: boolean) => {
		console.log(e.key, isDown)
	}
	const keyDownHandler = (e: KeyboardEvent) => keyHandler(e, true)
	const keyUpHandler = (e: KeyboardEvent) => keyHandler(e, false)


	// #################################################
	//				LISTENERS	
	// #################################################
	window.addEventListener("keydown", keyDownHandler)
	window.addEventListener("keyup", keyUpHandler)


	// #################################################
	//				FUNCTIONS	
	// #################################################
	function cleanUp() {
		window.removeEventListener("keydown", keyDownHandler)
		window.removeEventListener("keyup", keyUpHandler)
	}


	return {
		state,
		cleanUp
	}
}

export { createKeyboardHandler }