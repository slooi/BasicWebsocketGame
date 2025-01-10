import { MOVEMENT_KEYS } from "@game/shared/constants"
import ws from "ws"
export class Connection {
    /* 
    This class handles information related to the connection to the player
    */
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
