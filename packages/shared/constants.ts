export const CLIENT_FPS = 60
export const SERVER_FPS = 60
export const SERVER_FPS_INTERVAL = 1000 / SERVER_FPS
export const CLIENT_FPS_INTERVAL = 1000 / CLIENT_FPS
export const MOVEMENT_KEYS = ["w", "a", "s", "d"] as const
export const VALID_KEYS = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "z", "x", "m", "n", "c", "b", "v", ",", "/", "Shift", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "|", "}", "{", "O", "P", "I", "U", "Y", "T", "R", "E", "W", "Q", "A", "S", "D", "F", "G", "J", "H", "K", "L", ":", "\"", "?", ">", "<", "M", "N", "B", "V", "C", "X", "Z", "Enter", "Tab", "Meta", "Alt", " ", "ContextMenu", "Control", "Escape", "Delete", "End", "PageDown", "Insert", "Home", "PageUp", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Clear", "NumLock", "."] as const
export const CELL_SIZE = 60