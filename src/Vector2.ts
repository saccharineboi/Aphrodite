import { Util } from "./Util.js";

export class Vector2 implements Iterable<number> {
    public constructor(public x: number = 0.0,
                       public y: number = 0.0) {}

    public static X(): Vector2 {
        return new Vector2(1.0, 0.0);
    }

    public static Y(): Vector2 {
        return new Vector2(0.0, 1.0);
    }

    public get r(): number {
        return this.x;
    }

    public get g(): number {
        return this.y;
    }

    public set r(x: number) {
        this.x = x;
    }

    public set g(y: number) {
        this.y = y;
    }

    public get width(): number {
        return this.x;
    }

    public get height(): number {
        return this.y;
    }

    public set width(w: number) {
        this.x = w;
    }

    public set height(h: number) {
        this.y = h;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x,
                                  this.y ]);
    }

    public *[Symbol.iterator](): Iterator<number> {
        yield this.x;
        yield this.y;
    }

    public isEqual(other: Vector2, eps = Util.EPSILON): boolean {
        return Util.areFloatsEqual(this.x, other.x, eps) &&
               Util.areFloatsEqual(this.y, other.y, eps);
    }

    public isValid(): boolean {
        return Number.isFinite(this.x) &&
               Number.isFinite(this.y);
    }

    public copy(): Vector2 {
        return new Vector2(this.x,
                           this.y);
    }

    public clone(other: Vector2): void {
        this.x = other.x;
        this.y = other.y;
    }

    public toString(): string {
        return `Vector2 [${this.x}, ${this.y}]`;
    }

    public add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x,
                           this.y + other.y);
    }

    public addScalar(other: number): Vector2 {
        return new Vector2(this.x + other,
                           this.y + other);
    }

    public sub(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x,
                           this.y - other.y);
    }

    public subScalar(other: number): Vector2 {
        return new Vector2(this.x - other,
                           this.y - other);
    }

    public mul(other: Vector2): Vector2 {
        return new Vector2(this.x * other.x,
                           this.y * other.y);
    }

    public mulScalar(other: number): Vector2 {
        return new Vector2(this.x * other,
                           this.y * other);
    }

    public div(other: Vector2): Vector2 {
        return new Vector2(this.x / other.x,
                           this.y / other.y);
    }

    public divScalar(other: number): Vector2 {
        return new Vector2(this.x / other,
                           this.y / other);
    }

    public negate(): Vector2 {
        return new Vector2(-this.x,
                           -this.y);
    }

    public invert(): Vector2 {
        return new Vector2(1.0 / this.x,
                           1.0 / this.y);
    }

    public dot(other: Vector2): number {
        return this.x * other.x +
               this.y * other.y;
    }

    public dist(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public sqrDist(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    public len(): number {
        const x = this.x;
        const y = this.y;
        return Math.sqrt(x * x + y * y);
    }

    public sqrLen(): number {
        const x = this.x;
        const y = this.y;
        return x * x + y * y;
    }

    public norm(): Vector2 {
        const x = this.x;
        const y = this.y;

        let sqrlen = x * x + y * y;
        if (!Util.areFloatsEqual(sqrlen, 0.0)) {
            sqrlen = 1.0 / Math.sqrt(sqrlen);
            return new Vector2(x * sqrlen,
                               y * sqrlen);
        }
        return new Vector2(x, y);
    }

    public lerp(other: Vector2, t: number): Vector2 {
        const x = this.x;
        const y = this.y;

        return new Vector2(x + t * (other.x - x),
                           y + t * (other.y - y));
    }
};


