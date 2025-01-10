import ws from "ws"
import http from "http"
import { NetworkManager } from "./NetworkManager"
import { World } from "./World"


// ############################################
// 					GAME SERVER
// ############################################
export class GameServer {
    networkManager: NetworkManager
    world: World
    constructor(wss: ws.Server<typeof ws, typeof http.IncomingMessage>) {
        // ############################################
        // 					INITIALIZATION
        // ############################################
        this.networkManager = new NetworkManager()
        this.world = new World(this.networkManager, 1, 1)

        // ############################################
        // 					Handlers
        // ############################################
        const wsConnectionHandler = (ws: ws) => {
            console.log("websocket connection established")
            const connectionId = this.networkManager.createConnection(ws)

            ws.on("close", () => {
                console.log("websocket connection closed")
                this.networkManager.removeConnection(connectionId)
            })
            ws.on("message", rawData => {
                console.log("websocket message")
                this.networkManager.forwardMessage(connectionId, rawData)
            })
        }
        // ############################################
        // 					Listeners
        // ############################################
        wss.on("connection", ws => wsConnectionHandler(ws))

        // ############################################
        // 					START
        // ############################################
        this.world.startLoop()
    }
}
