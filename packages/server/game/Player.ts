import { Connection } from "./Connection"

export class Player {
    static cumulativePlayers: number = 0        //!@#!@#!@# could potentially cause issues long term with abusers
    readonly connectionId: number
    static speed: number = 10
    connection?: Connection
    position: [number, number]
    constructor(connection: Connection, x: number, y: number) {
        this.connectionId = connection.id//Player.cumulativePlayers++
        this.connection = connection
        this.position = [x, y]
    }
    update() {
        if (this.connection?.keyboardInput["a"]) this.position[0] -= Player.speed
        if (this.connection?.keyboardInput["d"]) this.position[0] += Player.speed
        if (this.connection?.keyboardInput["w"]) this.position[1] += Player.speed
        if (this.connection?.keyboardInput["s"]) this.position[1] -= Player.speed
    }
}
