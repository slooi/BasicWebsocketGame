const createInputHandler = () => {
	const keyDownHandler = (e: KeyboardEvent) => {
		console.log("asd", e.key)
	}
	const keyUpHandler = (e: KeyboardEvent) => {
		console.log("asd", e.key)
	}

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
		cleanUp
	}
}

export { createInputHandler }