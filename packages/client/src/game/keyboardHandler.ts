const createKeyboardHandler = <T extends readonly string[]>(KEYS: T) => {
	// #################################################
	//				STATE	
	// #################################################
	const state: Record<T[number], boolean | undefined> = {} as Record<T[number], boolean | undefined>
	let onChangeCallback: ((key: T[number], isDown: boolean) => any) | undefined;
	// #################################################
	//				HANDLERS	
	// #################################################


	const onChange = (key: T[number], isDown: boolean) => {
		onChangeCallback && onChangeCallback(key, isDown)
	}
	const keyHandler = (e: KeyboardEvent, isDown: boolean) => {
		if (isMovementKey(e.key)) {
			if (state[e.key] !== isDown) onChange(e.key, isDown)
			state[e.key] = isDown
		}
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
	function isKeyDown(key: T[number]) {
		return !!state[key]
	}


	// #################################################
	//				HELPER FUNCTIONS	
	// #################################################
	const isMovementKey = (key: string): key is T[number] => KEYS.includes(key as any)
	function cleanUp() {
		window.removeEventListener("keydown", keyDownHandler)
		window.removeEventListener("keyup", keyUpHandler)
	}


	return {
		state,
		cleanUp,
		isKeyDown,
		setOnChangeCallback: (cb: (key: T[number], isDown: boolean) => any) => {
			onChangeCallback = cb
		}
	}
}

export { createKeyboardHandler }