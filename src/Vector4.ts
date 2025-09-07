import { Util } from "./Util.js";

export class Vector4 {
    public constructor(public x: number = 0.0,
                       public y: number = 0.0,
                       public z: number = 0.0,
                       public w: number = 1.0) {}

    public static X(): Vector4 {
        return new Vector4(1.0, 0.0, 0.0, 0.0);
    }

    public static Y(): Vector4 {
        return new Vector4(0.0, 1.0, 0.0, 0.0);
    }

    public static Z(): Vector4 {
        return new Vector4(0.0, 0.0, 1.0, 0.0);
    }

    public static W(): Vector4 {
        return new Vector4(0.0, 0.0, 0.0, 1.0);
    }

    public get r(): number {
        return this.x;
    }

    public get g(): number {
        return this.y;
    }

    public get b(): number {
        return this.z;
    }

    public get a(): number {
        return this.w;
    }

    public set r(x: number) {
        this.x = x;
    }

    public set g(y: number) {
        this.y = y;
    }

    public set b(z: number) {
        this.z = z;
    }

    public set a(w: number) {
        this.w = w;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x,
                                  this.y,
                                  this.z,
                                  this.w ]);
    }

    public isEqual(other: Vector4, eps = Util.EPSILON): boolean {
        return Util.areFloatsEqual(this.x, other.x, eps) &&
               Util.areFloatsEqual(this.y, other.y, eps) &&
               Util.areFloatsEqual(this.z, other.z, eps) &&
               Util.areFloatsEqual(this.w, other.w, eps);
    }

    public isValid(): boolean {
        return Number.isFinite(this.x) &&
               Number.isFinite(this.y) &&
               Number.isFinite(this.z) &&
               Number.isFinite(this.w);
    }

    public copy(): Vector4 {
        return new Vector4(this.x,
                           this.y,
                           this.z,
                           this.w);
    }

    public clone(other: Vector4): void {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.w = other.w;
    }

    public toString(): string {
        return `Vector4 [${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
    }

    public add(other: Vector4): Vector4 {
        return new Vector4(this.x + other.x,
                           this.y + other.y,
                           this.z + other.z,
                           this.w + other.w);
    }

    public addScalar(other: number): Vector4 {
        return new Vector4(this.x + other,
                           this.y + other,
                           this.z + other,
                           this.w + other);
    }

    public sub(other: Vector4): Vector4 {
        return new Vector4(this.x - other.x,
                           this.y - other.y,
                           this.z - other.z,
                           this.w - other.w);
    }

    public subScalar(other: number): Vector4 {
        return new Vector4(this.x - other,
                           this.y - other,
                           this.z - other,
                           this.w - other);
    }

    public mul(other: Vector4): Vector4 {
        return new Vector4(this.x * other.x,
                           this.y * other.y,
                           this.z * other.z,
                           this.w * other.w);
    }

    public mulScalar(other: number): Vector4 {
        return new Vector4(this.x * other,
                           this.y * other,
                           this.z * other,
                           this.w * other);
    }

    public div(other: Vector4): Vector4 {
        return new Vector4(this.x / other.x,
                           this.y / other.y,
                           this.z / other.z,
                           this.w / other.w);
    }

    public divScalar(other: number): Vector4 {
        return new Vector4(this.x / other,
                           this.y / other,
                           this.z / other,
                           this.w / other);
    }

    public negate(): Vector4 {
        return new Vector4(-this.x,
                           -this.y,
                           -this.z,
                           -this.w);
    }

    public invert(): Vector4 {
        return new Vector4(1.0 / this.x,
                           1.0 / this.y,
                           1.0 / this.z,
                           1.0 / this.w);
    }

    public dot(other: Vector4): number {
        return this.x * other.x +
               this.y * other.y +
               this.z * other.z +
               this.w * other.w;
    }

    public dist(other: Vector4): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        const dw = this.w - other.w;
        return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    }

    public sqrDist(other: Vector4): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        const dw = this.w - other.w;
        return dx * dx + dy * dy + dz * dz + dw * dw;
    }

    public len(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    public sqrLen(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }

    public norm(): Vector4 {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        let sqrlen = x * x + y * y + z * z + w * w;
        if (!Util.areFloatsEqual(sqrlen, 0.0)) {
            sqrlen = 1.0 / Math.sqrt(sqrlen);
            return new Vector4(x * sqrlen,
                               y * sqrlen,
                               z * sqrlen,
                               w * sqrlen);
        }
        return new Vector4(x, y, z, w);
    }

    public lerp(other: Vector4, t: number): Vector4 {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        return new Vector4(x + t * (other.x - x),
                           y + t * (other.y - y),
                           z + t * (other.z - z),
                           w + t * (other.w - w));
    }
};


