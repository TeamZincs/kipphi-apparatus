import type { Dependency } from "../../../dependency";

declare global {
    var __APP_VERSION: string;
    var __KIPPHI_VERSION: string;
    var __PLAYER_VERSION: string;
    var __CANVAS_EDITOR_VERSION: string;
    var __DEPENDENCIES: Dependency[]
}

export {}