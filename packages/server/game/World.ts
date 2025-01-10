// ############################################
// 					World
// ############################################

import { MOVEMENT_KEYS, SERVER_FPS_INTERVAL } from "@game/shared/constants"
import { NetworkManager } from "./NetworkManager"
import { Player } from "./Player"
import { ServerClientTickPayload } from "@game/shared/types"

export class World {
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
        this.oldTime = performance.now()

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

        // Check collisions

        // Resolve collisions

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
        const nowTime = performance.now()
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
        this.oldTime = performance.now()
        this._loop()
    }

    addPlayer(player: Player) {
        this.playerList.set(player.connectionId, player) //!@#!@# change this
    }

    removePlayer(player: Player) {
        this.playerList.delete(player.connectionId)
    }
}