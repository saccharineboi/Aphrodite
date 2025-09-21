import { Util } from "./Util.js";
import { Vector3 } from "./Vector3.js";
import { Vector4 } from "./Vector4.js";

export class Matrix4x4 implements Iterable<Vector4> {
    public constructor(public col0: Vector4 = Vector4.X(),
                       public col1: Vector4 = Vector4.Y(),
                       public col2: Vector4 = Vector4.Z(),
                       public col3: Vector4 = Vector4.W()) {}

    public static GenTranslation(t: Vector3): Matrix4x4 {
        return new Matrix4x4(Vector4.X(),
                             Vector4.Y(),
                             Vector4.Z(),
                             new Vector4(t.x, t.y, t.z, 1.0));
    }

    public static GenRotationX(radians: number): Matrix4x4 {
        const s = Math.sin(radians);
        const c = Math.cos(radians);

        return new Matrix4x4(new Vector4(1, 0, 0, 0),
                             new Vector4(0, c, -s, 0),
                             new Vector4(0, s, c, 0),
                             new Vector4(0, 0, 0, 1));
    }

    public static GenRotationY(radians: number): Matrix4x4 {
        const s = Math.sin(radians);
        const c = Math.cos(radians);

        return new Matrix4x4(new Vector4(c, 0, -s, 0),
                             new Vector4(0, 1, 0, 0),
                             new Vector4(s, 0, c, 0),
                             new Vector4(0, 0, 0, 1));
    }

    public static GenRotationZ(radians: number): Matrix4x4 {
        const s = Math.sin(radians);
        const c = Math.cos(radians);

        return new Matrix4x4(new Vector4(c, -s, 0, 0),
                             new Vector4(s, c, 0, 0),
                             new Vector4(0, 0, 1, 0),
                             new Vector4(0, 0, 0, 1));
    }

    public static GenRotationXYZ(rotation: Vector3): Matrix4x4 {
        const rotationX = Matrix4x4.GenRotationX(rotation.x);
        const rotationY = Matrix4x4.GenRotationY(rotation.y);
        const rotationZ = Matrix4x4.GenRotationZ(rotation.z);
        return rotationX.mul(rotationY).mul(rotationZ);
    }

    public static GenRotationZYX(rotation: Vector3): Matrix4x4 {
        const rotationX = Matrix4x4.GenRotationX(rotation.x);
        const rotationY = Matrix4x4.GenRotationY(rotation.y);
        const rotationZ = Matrix4x4.GenRotationZ(rotation.z);
        return rotationZ.mul(rotationY).mul(rotationX);
    }

    public static GenScale(s: Vector3): Matrix4x4 {
        return new Matrix4x4(new Vector4(s.x, 0.0, 0.0, 0.0),
                             new Vector4(0.0, s.y, 0.0, 0.0),
                             new Vector4(0.0, 0.0, s.z, 0.0),
                             Vector4.W());
    }

    public static GenView(position: Vector3, euler: Vector3): Matrix4x4 {
        const translation = Matrix4x4.GenTranslation(position.negate());
        const rotation = Matrix4x4.GenRotationZ(euler.z)
                    .mul(Matrix4x4.GenRotationY(euler.y))
                    .mul(Matrix4x4.GenRotationX(euler.x)).tranpose();
        return rotation.mul(translation);
    }

    public static GenPerspective(fovy: number, 
                                 aspectRatio: number,
                                 near: number,
                                 far: number): Matrix4x4 {
        const f = 1.0 / Math.tan(fovy / 2.0);
        const nf = 1.0 / (near - far);
        return new Matrix4x4(new Vector4(f / aspectRatio, 0, 0, 0),
                             new Vector4(0, f, 0, 0),
                             new Vector4(0, 0, far * nf, -1),
                             new Vector4(0, 0, far * near * nf, 0));
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([
            this.col0.x, this.col0.y, this.col0.z, this.col0.w,
            this.col1.x, this.col1.y, this.col1.z, this.col1.w,
            this.col2.x, this.col2.y, this.col2.z, this.col2.w,
            this.col3.x, this.col3.y, this.col3.z, this.col3.w,
        ]);
    }

    public *[Symbol.iterator](): Iterator<Vector4> {
        yield this.col0;
        yield this.col1;
        yield this.col2;
        yield this.col3;
    }

    public isEqual(other: Matrix4x4, eps = Util.EPSILON): boolean {
        return this.col0.isEqual(other.col0, eps) &&
               this.col1.isEqual(other.col1, eps) &&
               this.col2.isEqual(other.col2, eps) &&
               this.col3.isEqual(other.col3, eps);
    }

    public isValid(): boolean {
        return this.col0.isValid() &&
               this.col1.isValid() &&
               this.col2.isValid() &&
               this.col3.isValid();
    }

    public copy(): Matrix4x4 {
        return new Matrix4x4(this.col0.copy(),
                             this.col1.copy(),
                             this.col2.copy(),
                             this.col3.copy());
    }

    public clone(other: Matrix4x4): void {
        this.col0.clone(other.col0);
        this.col1.clone(other.col1);
        this.col2.clone(other.col2);
        this.col3.clone(other.col3);
    }

    public toString(): string {
        return this.col0.toString() + "\n" +
               this.col1.toString() + "\n" +
               this.col2.toString() + "\n" +
               this.col3.toString();
    }

    public byteLength(): number {
        return 16 * Float32Array.BYTES_PER_ELEMENT;
    }

    public add(other: Matrix4x4): Matrix4x4 {
        return new Matrix4x4(this.col0.add(other.col0),
                             this.col1.add(other.col1),
                             this.col2.add(other.col2),
                             this.col3.add(other.col3));
    }

    public addScalar(other: number): Matrix4x4 {
        return new Matrix4x4(this.col0.addScalar(other),
                             this.col1.addScalar(other),
                             this.col2.addScalar(other),
                             this.col3.addScalar(other));
    }

    public sub(other: Matrix4x4): Matrix4x4 {
        return new Matrix4x4(this.col0.sub(other.col0),
                             this.col1.sub(other.col1),
                             this.col2.sub(other.col2),
                             this.col3.sub(other.col3));
    }

    public subScalar(other: number): Matrix4x4 {
        return new Matrix4x4(this.col0.subScalar(other),
                             this.col1.subScalar(other),
                             this.col2.subScalar(other),
                             this.col3.subScalar(other));
    }

    public mul(other: Matrix4x4): Matrix4x4 {
        const rx = new Vector4(this.col0.x, this.col1.x, this.col2.x, this.col3.x);
        const ry = new Vector4(this.col0.y, this.col1.y, this.col2.y, this.col3.y);
        const rz = new Vector4(this.col0.z, this.col1.z, this.col2.z, this.col3.z);
        const rw = new Vector4(this.col0.w, this.col1.w, this.col2.w, this.col3.w);

        const c0 = new Vector4(
            rx.dot(other.col0),
            ry.dot(other.col0),
            rz.dot(other.col0),
            rw.dot(other.col0)
        );

        const c1 = new Vector4(
            rx.dot(other.col1),
            ry.dot(other.col1),
            rz.dot(other.col1),
            rw.dot(other.col1)
        );

        const c2 = new Vector4(
            rx.dot(other.col2),
            ry.dot(other.col2),
            rz.dot(other.col2),
            rw.dot(other.col2)
        );

        const c3 = new Vector4(
            rx.dot(other.col3),
            ry.dot(other.col3),
            rz.dot(other.col3),
            rw.dot(other.col3)
        );

        return new Matrix4x4(c0, c1, c2, c3);
    }

    public mulScalar(other: number): Matrix4x4 {
        return new Matrix4x4(this.col0.mulScalar(other),
                             this.col1.mulScalar(other),
                             this.col2.mulScalar(other),
                             this.col3.mulScalar(other));
    }

    public div(other: Matrix4x4): Matrix4x4 {
        return new Matrix4x4(this.col0.div(other.col0),
                             this.col1.div(other.col1),
                             this.col2.div(other.col2),
                             this.col3.div(other.col3));
    }

    public divScalar(other: number): Matrix4x4 {
        return new Matrix4x4(this.col0.divScalar(other),
                             this.col1.divScalar(other),
                             this.col2.divScalar(other),
                             this.col3.divScalar(other));
    }

    public negate(): Matrix4x4 {
        return new Matrix4x4(this.col0.negate(),
                             this.col1.negate(),
                             this.col2.negate(),
                             this.col3.negate());
    }

    public tranpose(): Matrix4x4 {
        return new Matrix4x4(new Vector4(this.col0.x,
                                         this.col1.x,
                                         this.col2.x,
                                         this.col3.x),
                             new Vector4(this.col0.y,
                                         this.col1.y,
                                         this.col2.y,
                                         this.col3.y),
                             new Vector4(this.col0.z,
                                         this.col1.z,
                                         this.col2.z,
                                         this.col3.z),
                             new Vector4(this.col0.w,
                                         this.col1.w,
                                         this.col2.w,
                                         this.col3.w));
    }
};


