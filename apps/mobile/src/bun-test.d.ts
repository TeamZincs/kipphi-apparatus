/**
 * `bun:test` 的最小类型声明。
 *
 * 仓库没装 `bun-types`（`tsc --noEmit` 只关心应用代码），但测试文件也在
 * `src` 里、会被同一个 tsconfig 扫到。这里补一份够用的声明，避免每加一个
 * 测试文件就报 `Cannot find module 'bun:test'`。
 */
declare module "bun:test" {
    export function describe(name: string, fn: () => void): void;
    export function it(name: string, fn: () => void | Promise<void>): void;
    export function test(name: string, fn: () => void | Promise<void>): void;
    export function beforeAll(fn: () => void | Promise<void>): void;
    export function afterAll(fn: () => void | Promise<void>): void;
    export function beforeEach(fn: () => void | Promise<void>): void;
    export function afterEach(fn: () => void | Promise<void>): void;

    type Matchers = {
        toBe(expected: unknown): void;
        toEqual(expected: unknown): void;
        toBeCloseTo(expected: number, digits?: number): void;
        toBeNull(): void;
        toBeTruthy(): void;
        toBeFalsy(): void;
        toContain(expected: unknown): void;
        toThrow(): void;
        not: Matchers;
    };

    export function expect(value: unknown): Matchers;
}
