import ws from "ws"
import http from "http"
import { FPS_INTERVAL } from "@game/shared"


// ############################################
// 					CONSTANTS
// ############################################


// ############################################
// 					GAME SERVER
// ############################################

export const createGameServer = (wss: ws.Server<typeof ws, typeof http.IncomingMessage>) => {
    // ############################################
    // 					INITIALIZATION
    // ############################################
    const playerList: Connection[] = []

    // ############################################
    // 					Connection
    // ############################################

    class Connection {
        static cumulativePlayers: number = 0        //!@#!@#!@# could potentially cause issues long term with abusers
        id: number
        ws: ws.WebSocket
        constructor(ws: ws.WebSocket) {
            this.id = Connection.cumulativePlayers++
            this.ws = ws
        }
    }

    // ############################################
    // 					FUNCTIONS
    // ############################################
    function removePlayer(playerId: number) {
        console.log("BEFORE\t", playerList.map(p => p.id))
        const index = playerList.findIndex(p => p.id === playerId)
        playerList.splice(index)
        console.log("AFTER\t", playerList.map(p => p.id))
    }

    // ############################################
    // 					Handlers
    // ############################################
    const wsConnectionHandler = (ws: ws) => {
        console.log("websocket connection established")
        const player = new Connection(ws)
        playerList.push(player)

        console.log("playerList", playerList.map(player => player.id))
        ws.on("close", () => {
            removePlayer(player.id)
            console.log("websocket connection closed")
        })
        ws.onmessage = (e) => {
            console.log(" e.type,e.data", e.type, JSON.parse(e.data as string))
        }
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