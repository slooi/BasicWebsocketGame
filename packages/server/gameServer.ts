import ws from "ws"
import http from "http"


// ############################################
// 					CONSTANTS
// ############################################
const FPS = 30
const FPS_INTERVAL = 1000 / FPS


// ############################################
// 					GAME SERVER
// ############################################

export const createGameServer = (wss: ws.Server<typeof ws, typeof http.IncomingMessage>) => {
    // ############################################
    // 					INITIALIZATION
    // ############################################
    const playerList: Player[] = []

    // ############################################
    // 					PLAYER
    // ############################################

    class Player {
        static cumulativePlayers: number = 0
        id: number
        ws: ws.WebSocket
        constructor(ws: ws.WebSocket) {
            this.id = Player.cumulativePlayers++
            this.ws = ws
        }
    }


    // ############################################
    // 					Handlers
    // ############################################
    const wsConnectionHandler = (ws: ws) => {
        console.log("websocket connection established")
        const player = new Player(ws)
        playerList.push(player)

        console.log("playerList", playerList)
        ws.on("close", ws => {
            console.log("websocket connection closed")
        })
    }
    // ############################################
    // 					Listeners
    // ############################################
    wss.on("connection", ws => wsConnectionHandler(ws))

    // ############################################
    // 					GAME TICK
    // ############################################

    const gameTick = () => {

    }

    // ############################################
    // 					GENERAL LOOP
    // ############################################
    const loop = () => {
        const nowTime = Date.now()
        const delta = nowTime - oldTime
        if (delta > FPS_INTERVAL) {
            oldTime = nowTime - delta % (FPS_INTERVAL) // We want the next tick to occur faster if this tick occurred later than usually. This method also prevent catasphroic correction (the game slowing down (<1x) due to high computational load before speeding up (>1x, potentially 5x speed) which would be bad in multiplayer games where users want to REACT to what's happening. The speeding up would mean they wouldn't be able to react in time or maybe using old player inputs. 
            gameTick()
        }
        setImmediate(loop)
    }

    // LOOP
    let oldTime = Date.now()
    loop()
}