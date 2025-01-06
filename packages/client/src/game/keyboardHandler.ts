import { VALID_KEYS } from "@game/shared/constants";

const createKeyboardHandler = <
	T extends readonly (typeof VALID_KEYS[number])[]>(
		KEYS: T
	) => {
	// #################################################
	//				STATE	
	// #################################################
	const state: Record<T[number], boolean> = {} as Record<T[number], boolean>
	KEYS.forEach(key => state[key as T[number]] = false)

	let onChangeCallback: undefined | ((key: T[number], isDown: boolean) => any);
	// #################################################
	//				HANDLERS	
	// #################################################


	const onChange = (key: T[number], isDown: boolean) => {
		onChangeCallback && onChangeCallback(key, isDown)
	}
	const keyHandler = (e: KeyboardEvent, isDown: boolean) => {
		if (isMovementKey(e.key)) {
			const changeHasOccurred = state[e.key] !== isDown
			state[e.key] = isDown
			if (changeHasOccurred) onChange(e.key, isDown)
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
		return state[key]
	}
	function getState() {
		return state
	}
	function setOnChangeCallback(cb: typeof onChangeCallback) {
		onChangeCallback = cb
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
		getState,
		cleanUp,
		isKeyDown,
		setOnChangeCallback
	}
}

export { createKeyboardHandler }