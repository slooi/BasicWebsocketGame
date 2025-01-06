import ws from "ws"
import http from "http"
import { FPS_INTERVAL, MOVEMENT_KEYS } from "@game/shared/constants"
import { ServerClientTickPayload } from "@game/shared/types"


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
    const playerList = new Map<number, Player>()

    // ############################################
    // 					Player
    // ############################################

    class Player {
        static cumulativePlayers: number = 0        //!@#!@#!@# could potentially cause issues long term with abusers
        readonly id: number
        static speed: number = 1
        ws: ws.WebSocket
        keyboardInput: Record<typeof MOVEMENT_KEYS[number], boolean>
        position: [number, number]
        constructor(ws: ws.WebSocket) {
            this.id = Player.cumulativePlayers++
            this.ws = ws
            this.keyboardInput = {} as Record<typeof MOVEMENT_KEYS[number], boolean>
            MOVEMENT_KEYS.forEach(key => this.keyboardInput[key] = false)
            this.position = [0, 0]
        }
        updateKeyboardInput(keyboardInput: Record<typeof MOVEMENT_KEYS[number], boolean>) {
            console.log(this.keyboardInput)
            MOVEMENT_KEYS.forEach(k => this.keyboardInput[k] = keyboardInput[k])
        }
        update() {
            if (this.keyboardInput["a"]) this.position[0] -= Player.speed
            if (this.keyboardInput["d"]) this.position[0] += Player.speed
            if (this.keyboardInput["w"]) this.position[1] -= Player.speed
            if (this.keyboardInput["s"]) this.position[1] += Player.speed
        }
    }

    // ############################################
    // 					Player
    // ############################################



    // ############################################
    // 					FUNCTIONS
    // ############################################
    function removePlayer(playerId: number) {
        playerList.delete(playerId)
    }

    // ############################################
    // 					Handlers
    // ############################################
    const wsConnectionHandler = (ws: ws) => {
        console.log("websocket connection established")
        const player = new Player(ws)
        playerList.set(player.id, player)
        ws.send(player.id)

        ws.on("close", () => {
            removePlayer(player.id)
            console.log("websocket connection closed")
        })
        ws.on("message", rawData => {
            const data = rawData.toString()
            try {
                const playerControls = JSON.parse(data) as Record<typeof MOVEMENT_KEYS[number], boolean> //!@#!@#!@#!@#!@#
                player.updateKeyboardInput(playerControls)
            } catch (err) {
                throw new Error("ERROR: UNEXPECTED JSON")
            }
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
        // Update loop
        const dataToSend: ServerClientTickPayload = []
        for (const [id, player] of playerList) {
            for (const [id, player] of playerList.entries()) {
                player.update()
            }
            dataToSend.push([player.id, ...player.position])
            console.log(id, "\t", player.position, "\t", player.keyboardInput)
        }

        // Send data
        for (const [id, player] of playerList) {
            player.ws.send(JSON.stringify(dataToSend))
        }
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