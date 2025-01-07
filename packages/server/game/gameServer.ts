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

class Connection {
    ws: ws.WebSocket
    id: number

    keyboardInput: Record<typeof MOVEMENT_KEYS[number], boolean>
    constructor(ws: ws.WebSocket, id: number) {
        this.ws = ws
        this.id = id
        this.keyboardInput = {} as Record<typeof MOVEMENT_KEYS[number], boolean>
        MOVEMENT_KEYS.forEach(key => this.keyboardInput[key] = false)
    }
    updateKeyboardInput(keyboardInput: Record<typeof MOVEMENT_KEYS[number], boolean>) {
        console.log(this.keyboardInput)
        MOVEMENT_KEYS.forEach(k => this.keyboardInput[k] = keyboardInput[k])
    }
}

class NetworkManager {
    static cumulativeConnections: number = 0
    connections: Map<number, Connection>
    onConnectionCallback: ((connection: Connection) => any) | undefined
    onCloseCallback: ((connection: Connection) => any) | undefined
    onMessageCallback: ((connection: Connection, stringifiedData: string) => any) | undefined
    constructor() {
        this.connections = new Map()
        this.onConnectionCallback = undefined
        this.onCloseCallback = undefined
        this.onMessageCallback = undefined
    }

    // 
    createConnection(ws: ws.WebSocket) {
        const connectionId = NetworkManager.cumulativeConnections++
        const connection = new Connection(ws, connectionId)
        this.connections.set(connectionId, connection)
        console.log("ADDED CONNECTION this.connections", this.connections)
        this.onConnectionCallback && this.onConnectionCallback(connection)
        return connectionId
    }
    removeConnection(id: number) {
        console.log("`1` this.connections", this.connections)
        const connection = this.connections.get(id)
        console.log("`1` id", id)
        console.log("`1` connection", connection)
        if (!connection) throw new Error("Somehow connection is undefined!!!")

        this.connections.delete(id)
        console.log(
            "connection", connection
        )// !@#!@#!@# test
        this.onCloseCallback && this.onCloseCallback(connection)
    }
    forwardMessage(id: number, rawData: ws.RawData) {
        console.log("this.connections", this.connections)
        const connection = this.connections.get(id)
        console.log("id", id)
        console.log("connection", connection)
        if (!connection) throw new Error("Somehow connection is undefined!!!")

        const stringifiedData = rawData.toString()
        this.onMessageCallback && this.onMessageCallback(connection, stringifiedData)
    }

    /*  */
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

        this.networkManager.setConnectionCallback(connection => {
            const player = new Player(connection)
            this.addPlayer(player)
        })
        this.networkManager.setCloseCallback(connection => {
            for (const [playerId, player] of this.playerList.entries()) {
                if (player.connection === connection) {
                    delete player.connection
                    this.playerList.delete(playerId)
                }
            }
        })
        this.networkManager.setMessageCallback((connection, stringifiedData) => {
            try {
                const playerControls = JSON.parse(stringifiedData) as Record<typeof MOVEMENT_KEYS[number], boolean> //!@#!@#!@#!@#!@#
                connection.updateKeyboardInput(playerControls)
            } catch (err) {
                throw new Error("ERROR: UNEXPECTED JSON")
            }
        })
    }

    private _gameTick() {
        // Update loop
        for (const [id, player] of this.playerList) {
            player.update()
            console.log(id, "\t", player.position, "\t", player.connection?.keyboardInput)
        }

        // Gather data
        const dataToSend: ServerClientTickPayload = []
        for (const [id, player] of this.playerList) {
            dataToSend.push([player.connectionId, ...player.position])
        }

        // Send data
        const stringifiedDataToSend = JSON.stringify(dataToSend)
        for (const [id, player] of this.playerList) {
            player.connection?.ws.send(stringifiedDataToSend)
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
        this.playerList.set(player.connectionId, player) //!@#!@# change this
    }

    removePlayer(player: Player) {
        this.playerList.delete(player.connectionId)
    }
}

// ############################################
// 					Player
// ############################################

class Player {
    static cumulativePlayers: number = 0        //!@#!@#!@# could potentially cause issues long term with abusers
    readonly connectionId: number
    static speed: number = 10
    connection?: Connection
    position: [number, number]
    constructor(connection: Connection) {
        this.connectionId = connection.id//Player.cumulativePlayers++
        this.connection = connection
        this.position = [0, 0]
    }
    update() {
        if (this.connection?.keyboardInput["a"]) this.position[0] -= Player.speed
        if (this.connection?.keyboardInput["d"]) this.position[0] += Player.speed
        if (this.connection?.keyboardInput["w"]) this.position[1] += Player.speed
        if (this.connection?.keyboardInput["s"]) this.position[1] -= Player.speed
    }
}

class CollisionManager {

}