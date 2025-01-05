import ws from "ws"
import http from "http"


// ############################################
// 					CONSTANTS
// ############################################
const FPS = 30
const FPS_INTERVAL = 1000 / FPS



export const createGameServer = (wss: ws.Server<typeof ws, typeof http.IncomingMessage>) => {
    // ############################################
    // 					INITIALIZATION
    // ############################################
    const wsList: ws.WebSocket[] = []


    // ############################################
    // 					Handlers
    // ############################################
    const wsConnectionHandler = (ws: ws) => {
        console.log("websocket connection established")
        wsList.push(ws)
        ws.on("close", ws => {
            console.log("websocket connection closed")
        })
    }
    // ############################################
    // 					Listeners
    // ############################################
    wss.on("connection", ws => wsConnectionHandler(ws))

    // ############################################
    // 					GAME LOOP
    // ############################################
    const loop = () => {
        const nowTime = Date.now()
        const delta = nowTime - oldTime
        if (delta > FPS_INTERVAL) {
            oldTime = nowTime - delta % (FPS_INTERVAL) // We want the next tick to occur faster if this tick occurred later than usually. This method also prevent catasphroic correction (the game slowing down (<1x) due to high computational load before speeding up (>1x, potentially 5x speed) which would be bad in multiplayer games where users want to REACT to what's happening. The speeding up would mean they wouldn't be able to react in time or maybe using old player inputs. 
        }
        setImmediate(loop)
    }

    // LOOP
    let oldTime = Date.now()
    loop()
}