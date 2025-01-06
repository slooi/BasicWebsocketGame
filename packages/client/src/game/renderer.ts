const vsShader = `#version 300 es
in vec2 a_Position;

void main(){
	gl_PointSize = 10.0;
	gl_Position = vec4(a_Position.x,a_Position.y,0.0,1.0);
}
`

const fsShader = `#version 300 es
precision highp float;

out vec4 outColor;

void main(){
	outColor = vec4(1.0,0.0,0.0,1.0);
}
`



const createRenderer = (canvas: HTMLCanvasElement) => {


	// #################################################
	//				INIT CANVAS/GL
	// #################################################
	// canvas
	canvas.width = 600
	canvas.height = 600
	canvas.style.width = `${canvas.width}px`
	canvas.style.height = `${canvas.height}px`

	// gl
	const gl = canvas.getContext("webgl2")
	if (!gl) throw new Error("ERROR: webgl2 not supported!")

	// #################################################
	//				INIT GLOBAL CONTEXT SETTINGS
	// #################################################
	gl.clearColor(0.5, .5, .5, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)


	// #################################################
	//				INIT PROGRAM SETTINGS
	// #################################################
	// program
	const program0 = createProgram(gl, vsShader, fsShader, true)

	// location
	const attributeLocations: { [key: string]: number | undefined } = {}
	for (let i = 0; i < gl.getProgramParameter(program0, gl.ACTIVE_ATTRIBUTES); i++) {
		const attribute = gl.getActiveAttrib(program0, i)
		if (!attribute?.name) throw new Error("ERROR")
		attributeLocations[attribute?.name] = gl.getAttribLocation(program0, attribute?.name)
	}
	console.log("attributeLocations", attributeLocations)

	// 
	setupProgramVAO(gl)


	// #################################################
	//				HELPER FUNCTIONS	
	// #################################################
	function setupProgramVAO(gl: WebGL2RenderingContext) {
		// Init vao
		const vao = gl.createVertexArray()
		if (!vao) throw new Error("ERROR vao is null!")

		gl.bindVertexArray(vao)


		// Buffer 
		const buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

		// Buffer's format
		const location = attributeLocations["a_Position"]//!@#!@#!@# make it more safe in the future by creating a "MODEL"
		if (location === undefined) throw new Error("ERROR: location is undefined!")
		const size = 2	// Two components per VERTEX
		const type = gl.FLOAT // component's data type
		const normalized = false
		const stride = 0
		const offset = 0
		gl.vertexAttribPointer(location, size, type, normalized, stride, offset) // vertexAttribPointer explains to the gpu how to interpret the current buffer bound to ARRAY_BUFFER. It must be called AFTER .bindBuffer


		gl.enableVertexAttribArray(location)

		return vao
	}

	function createShader(gl: WebGL2RenderingContext, source: string, type: typeof gl.VERTEX_SHADER | typeof gl.FRAGMENT_SHADER) {
		const shader = gl.createShader(type)
		if (!shader) throw new Error("ERROR: SHADER IS NULL")
		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		// Validation
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`ERROR: compiling shader. Info: ${gl.getShaderInfoLog(shader)}. Source: ${source}`)

		return shader
	}

	function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string, useImmediately: boolean) {
		const program = gl.createProgram()
		if (!program) throw new Error("ERROR: PROGRAM IS NULL")
		gl.attachShader(program, createShader(gl, vsSource, gl.VERTEX_SHADER))
		gl.attachShader(program, createShader(gl, fsSource, gl.FRAGMENT_SHADER))
		gl.linkProgram(program)
		gl.validateProgram(program)

		// Validation
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("ERROR: linking program. Info: " + gl.getProgramInfoLog(program))
		if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) throw new Error("ERROR: validate program. Info: " + gl.getProgramInfoLog(program))

		if (useImmediately) gl.useProgram(program)
		return program
	}


	// #################################################
	//				FUNCTIONS	
	// #################################################
	const render = (numberOfShapes: number) => {
		console.log("render called!")
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW)
		gl.drawArrays(gl.POINTS, 0, numberOfShapes)
	}

	// #################################################
	//				TESTING	
	// #################################################

	// #################################################
	//				API	
	// #################################################
	const api = {
		render
	}
	return api
}

export { createRenderer }