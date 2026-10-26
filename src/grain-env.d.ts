/// <reference types="vite/client" />

declare module 'grain:routes' {
    import type { RouteDef } from '@graints/runtime';

    const routes: RouteDef[];
    export default routes;
}

declare const __APP_VERSION: string;
declare const __PLAYER_VERSION: string;
declare const __CANVAS_EDITOR_VERSION: string;
declare const __KIPPHI_VERSION: string;
declare const __DEPENDENCIES: string;
