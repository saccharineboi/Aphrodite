import { Util } from "./Util.js";

export class Vector3 {
    public constructor(public x: number = 0.0,
                       public y: number = 0.0,
                       public z: number = 0.0) {}

    public static X(): Vector3 {
        return new Vector3(1.0, 0.0, 0.0);
    }

    public static Y(): Vector3 {
        return new Vector3(0.0, 1.0, 0.0);
    }

    public static Z(): Vector3 {
        return new Vector3(0.0, 0.0, 1.0);
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

    public set r(x: number) {
        this.x = x;
    }

    public set g(y: number) {
        this.y = y;
    }

    public set b(z: number) {
        this.z = z;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x,
                                  this.y,
                                  this.z ]);
    }

    public isEqual(other: Vector3, eps = Util.EPSILON): boolean {
        return Util.areFloatsEqual(this.x, other.x, eps) &&
               Util.areFloatsEqual(this.y, other.y, eps) &&
               Util.areFloatsEqual(this.z, other.z, eps);
    }

    public isValid(): boolean {
        return Number.isFinite(this.x) &&
               Number.isFinite(this.y) &&
               Number.isFinite(this.z);
    }

    public copy(): Vector3 {
        return new Vector3(this.x,
                           this.y,
                           this.z);
    }

    public clone(other: Vector3): void {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }

    public toString(): string {
        return `Vector3 [${this.x}, ${this.y}, ${this.z}]`;
    }

    public add(other: Vector3): Vector3 {
        return new Vector3(this.x + other.x,
                           this.y + other.y,
                           this.z + other.z);
    }

    public addScalar(other: number): Vector3 {
        return new Vector3(this.x + other,
                           this.y + other,
                           this.z + other);
    }

    public sub(other: Vector3): Vector3 {
        return new Vector3(this.x - other.x,
                           this.y - other.y,
                           this.z - other.z);
    }

    public subScalar(other: number): Vector3 {
        return new Vector3(this.x - other,
                           this.y - other,
                           this.z - other);
    }

    public mul(other: Vector3): Vector3 {
        return new Vector3(this.x * other.x,
                           this.y * other.y,
                           this.z * other.z);
    }

    public mulScalar(other: number): Vector3 {
        return new Vector3(this.x * other,
                           this.y * other,
                           this.z * other);
    }

    public div(other: Vector3): Vector3 {
        return new Vector3(this.x / other.x,
                           this.y / other.y,
                           this.z / other.z);
    }

    public divScalar(other: number): Vector3 {
        return new Vector3(this.x / other,
                           this.y / other,
                           this.z / other);
    }

    public negate(): Vector3 {
        return new Vector3(-this.x,
                           -this.y,
                           -this.z);
    }

    public invert(): Vector3 {
        return new Vector3(1.0 / this.x,
                           1.0 / this.y,
                           1.0 / this.z);
    }

    public dot(other: Vector3): number {
        return this.x * other.x +
               this.y * other.y +
               this.z * other.z;
    }

    public cross(other: Vector3): Vector3 {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        const ox = other.x;
        const oy = other.y;
        const oz = other.z;

        return new Vector3(y * oz - z * oy,
                           z * ox - x * oz,
                           x * oy - y * ox);
    }

    public dist(other: Vector3): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public sqrDist(other: Vector3): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return dx * dx + dy * dy + dz * dz;
    }

    public len(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    public sqrLen(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }

    public norm(): Vector3 {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        let sqrlen = x * x + y * y + z * z;
        if (!Util.areFloatsEqual(sqrlen, 0.0)) {
            sqrlen = 1.0 / Math.sqrt(sqrlen);
            return new Vector3(x * sqrlen,
                               y * sqrlen,
                               z * sqrlen);
        }
        return new Vector3(x, y, z);
    }

    public lerp(other: Vector3, t: number): Vector3 {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        return new Vector3(x + t * (other.x - x),
                           y + t * (other.y - y),
                           z + t * (other.z - z));
    }
};
