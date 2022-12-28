import * as random from "random-js";

export function generateRemoteToken(): string {
    return window.crypto.randomUUID();
}
