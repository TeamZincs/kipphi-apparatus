import { type Matrix33 } from "kipphi-player"; // 为一个类型导入一个包（

export class Coordinate {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) {}
    mul(matrix: Matrix33) {
        const { x, y } = this;
        return new Coordinate(
            x * matrix.a + y * matrix.c + matrix.e,
            x * matrix.b + y * matrix.d + matrix.f,
        );
    }
    static from([x, y]: [number, number]) {
        return new Coordinate(x, y);
    }
}
