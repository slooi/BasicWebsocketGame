const createKeyboardHandler = <T extends readonly string[]>(KEYS: T) => {
	// #################################################
	//				STATE	
	// #################################################
	const state: Record<typeof KEYS[number], boolean | undefined> = {} as Record<typeof KEYS[number], boolean | undefined>

	// #################################################
	//				HANDLERS	
	// #################################################
	const keyHandler = (e: KeyboardEvent, isDown: boolean) => {
		if (isMovementKey(e.key)) state[e.key] = isDown

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
	//				MAIN FUNCTIONS	
	// #################################################
	function isKeyDown(key: typeof KEYS[number]) {
		return !!state[key]
	}


	// #################################################
	//				HELPER FUNCTIONS	
	// #################################################
	const isMovementKey = (key: string): key is typeof KEYS[number] => KEYS.includes(key as any)
	function cleanUp() {
		window.removeEventListener("keydown", keyDownHandler)
		window.removeEventListener("keyup", keyUpHandler)
	}


	return {
		state,
		cleanUp,
		isKeyDown
	}
}

export { createKeyboardHandler }