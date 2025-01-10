import ws from "ws"
import http from "http"
import { NetworkManager } from "./NetworkManager"
import { World } from "./World"


// ############################################
// 					GAME SERVER
// ############################################

export const createGameServer = (wss: ws.Server<typeof ws, typeof http.IncomingMessage>) => {
    // ############################################
    // 					INITIALIZATION
    // ############################################
    const networkManager = new NetworkManager()
    const world = new World(networkManager, 0, 0)

    // ############################################
    // 					Handlers
    // ############################################
    const wsConnectionHandler = (ws: ws) => {
        console.log("websocket connection established")
        const connectionId = networkManager.createConnection(ws)

        ws.on("close", () => {
            console.log("websocket connection closed")
            networkManager.removeConnection(connectionId)
        })
        ws.on("message", rawData => {
            console.log("websocket message")
            networkManager.forwardMessage(connectionId, rawData)
        })
    }
    // ############################################
    // 					Listeners
    // ############################################
    wss.on("connection", ws => wsConnectionHandler(ws))

    world.startLoop()
}

