import ws from "ws"
import http from "http"
import { SERVER_FPS_INTERVAL, MOVEMENT_KEYS } from "@game/shared/constants"
import { ServerClientTickPayload } from "@game/shared/types"


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
        const player = new Player(ws)
        world.addPlayer(player)

        ws.on("close", () => {
            world.removePlayer(player)
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

    world.startLoop()
}

class NetworkManager {
    onConnectionCallback: ((ws: ws.WebSocket) => any) | undefined
    onCloseCallback: ((ws: ws.WebSocket) => any) | undefined
    onMessageCallback: ((ws: ws.WebSocket, rawData: ws.RawData) => any) | undefined
    constructor() {
        this.onConnectionCallback = undefined
        this.onCloseCallback = undefined
        this.onMessageCallback = undefined
    }
    onConnection = (...args: Parameters<NonNullable<typeof this.onConnectionCallback>>) => {
        this.onCloseCallback && this.onCloseCallback(...args)
    }
    onClose = (...args: Parameters<NonNullable<typeof this.onCloseCallback>>) => {
        this.onCloseCallback && this.onCloseCallback(...args)
    }
    onMessage = (...args: Parameters<NonNullable<typeof this.onMessageCallback>>) => {
        this.onMessageCallback && this.onMessageCallback(...args)
    }
    setConnectionCallback(cb: typeof this.onConnectionCallback) { this.onConnectionCallback = cb }
    setCloseCallback(cb: typeof this.onCloseCallback) { this.onCloseCallback = cb }
    setMessageCallback(cb: typeof this.onMessageCallback) { this.onMessageCallback = cb }
}
// ############################################
// 					World
// ############################################

class World {
    /* 
    grid
    walls
    */
    width: number
    height: number
    playerList: Map<number, Player>
    oldTime: number
    networkManager: NetworkManager
    constructor(networkManager: NetworkManager, width: number, height: number) {
        this.networkManager = networkManager
        this.width = width
        this.height = height
        // this.grid=[]
        this.playerList = new Map<number, Player>()
        this.oldTime = Date.now()
    }

    private _gameTick() {
        console.log("asd")
        // Update loop
        for (const [id, player] of this.playerList) {
            player.update()
            console.log(id, "\t", player.position, "\t", player.keyboardInput)
        }

        // Gather data
        const dataToSend: ServerClientTickPayload = []
        for (const [id, player] of this.playerList) {
            dataToSend.push([player.id, ...player.position])
        }

        // Send data
        const stringifiedDataToSend = JSON.stringify(dataToSend)
        for (const [id, player] of this.playerList) {
            player.ws.send(stringifiedDataToSend)
        }
    }

    private _loop = () => {
        const nowTime = Date.now()
        const delta = nowTime - this.oldTime
        if (delta > SERVER_FPS_INTERVAL) {
            this._gameTick()
            this.oldTime = nowTime - delta % (SERVER_FPS_INTERVAL) // We want the next tick to occur faster if this tick occurred later than usually. This method also prevent catasphroic correction (the game slowing down (<1x) due to high computational load before speeding up (>1x, potentially 5x speed) which would be bad in multiplayer games where users want to REACT to what's happening. The speeding up would mean they wouldn't be able to react in time or maybe using old player inputs. 
        }
        setImmediate(this._loop)
    }

    // ############################################
    // 					API
    startLoop() {
        this.oldTime = Date.now()
        this._loop()
    }

    addPlayer(player: Player) {
        this.playerList.set(player.id, player) //!@#!@# change this
    }

    removePlayer(player: Player) {
        this.playerList.delete(player.id)
    }
}

// ############################################
// 					Player
// ############################################

class Player {
    static cumulativePlayers: number = 0        //!@#!@#!@# could potentially cause issues long term with abusers
    readonly id: number
    static speed: number = 10
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
        if (this.keyboardInput["w"]) this.position[1] += Player.speed
        if (this.keyboardInput["s"]) this.position[1] -= Player.speed
    }
}

class CollisionManager {

}