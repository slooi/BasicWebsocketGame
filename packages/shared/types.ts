export type ServerClientTickPayload = ([PlayerId, number, number] | ["wall", number, number])[]
interface PlayerId extends Number { }