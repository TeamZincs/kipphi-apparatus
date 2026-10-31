/// <reference types="vite/client" />

declare module 'grain:routes' {
    import type { RouteDef } from '@graints/runtime';

    const routes: RouteDef[];
    export default routes;
}
