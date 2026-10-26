/// <reference types="vite/client" />

declare module 'grain:routes' {
    import type { RouteDef } from '@graints/runtime';

    const routes: RouteDef[];
    export default routes;
}

// `__APP_VERSION` / `__DEPENDENCIES` 这些全局常量由 `src/routes/about/patch.ts`
// 用 `declare global` 声明（那里还把 `__DEPENDENCIES` 标成了 Dependency[]），
// 这里不要再声明一遍，否则会撞成 "Cannot redeclare block-scoped variable"。
