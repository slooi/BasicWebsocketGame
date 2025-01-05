import express from "Express"
import ws from "ws"
import http from "http"
import { createGameServer } from "./gameServer"


// ############################################
// 					CONSTANTS
// ############################################
const PORT = 8085

// ############################################
// 					SETUP
// ############################################
const app = express()
const server = http.createServer(app)


const wss = new ws.Server({ server })

// ############################################
// 					HTTP/APP SERVER
// ############################################

app.get("/", (req, res) => {
	res.send("<h1>hi</h1>")
})

server.listen(PORT, () => {
	console.log("listening on port " + PORT)
})

// ############################################
// 					GAME SERVER
// ############################################
createGameServer(wss)