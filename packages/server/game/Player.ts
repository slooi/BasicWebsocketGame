import { VALID_KEYS } from "@game/shared/constants";

export class Player<T extends readonly (typeof VALID_KEYS[number])[]>{
	state: Record<T[number], boolean> = {} as Record<T[number], boolean>
}