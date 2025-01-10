import { Connection } from "./Connection"
import ws from "ws"


export class NetworkManager {
    /* This is a high level class which manages everything related to networking such as websocket events and Connections */
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