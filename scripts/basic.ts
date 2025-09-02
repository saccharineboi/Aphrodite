function calcMipLevelCount(width: number, height: number): number {
    return Math.ceil(Math.log2(Math.max(width, height)));
}

function genDeltaTimeComputer() {
    let lastTime = 0.0;
    return () => {
        const currentTime = performance.now();
        const deltaTime = lastTime ? currentTime - lastTime : 0.0;
        lastTime = currentTime;
        return deltaTime;
    };
};

async function downloadText(url: string) : Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const text = await response.text();
    return text;
};

async function downloadImage(url: string) : Promise<ImageBitmap> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const blob = await response.blob();
    const imgBitmap = await createImageBitmap(blob);
    return imgBitmap;
};

async function downloadImageWithMipmaps(src: string,
                                        ext: string = "png",
                                        mipmapExt: string = "_mip") {
    const rootBitmap = await downloadImage(`${src}.${ext}`);
    const mipmapCnt = calcMipLevelCount(rootBitmap.width, rootBitmap.height);

    const sources = [ `${src}.${ext}` ];
    for (let i = 1; i <= mipmapCnt; ++i) {
        sources.push(`${src}${mipmapExt}${i}.${ext}`)
    }
    const promises = sources.map(url => downloadImage(url));
    return Promise.all(promises);
}

function resizeCanvas(canvas: HTMLCanvasElement,
                      callback?: (width: number, height: number) => void) {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        callback && callback(canvas.width, canvas.height);
    }
};

const EPSILON = 1e-6;

function areFloatsEqual(x: number, y: number, eps = EPSILON): boolean {
    if (x === y) {
        return true;
    }
    else if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return false;
    }
    return Math.abs(x - y) <= eps * Math.max(1.0, Math.max(Math.abs(x), Math.abs(y)));
}

function ASSERT(condition: boolean, msg: string) {
    if (!condition) {
        throw new Error(`ASSERT FAILED: ${msg}`);
    }
}

class Vector2 {
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

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x,
                                  this.y ]);
    }

    public isEqual(other: Vector2, eps = EPSILON): boolean {
        return areFloatsEqual(this.x, other.x, eps) &&
               areFloatsEqual(this.y, other.y, eps);
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
        if (!areFloatsEqual(sqrlen, 0.0)) {
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

class Vector3 {
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

    public isEqual(other: Vector3, eps = EPSILON): boolean {
        return areFloatsEqual(this.x, other.x, eps) &&
               areFloatsEqual(this.y, other.y, eps) &&
               areFloatsEqual(this.z, other.z, eps);
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
        if (!areFloatsEqual(sqrlen, 0.0)) {
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

class Vector4 {
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

    public isEqual(other: Vector4, eps = EPSILON): boolean {
        return areFloatsEqual(this.x, other.x, eps) &&
               areFloatsEqual(this.y, other.y, eps) &&
               areFloatsEqual(this.z, other.z, eps) &&
               areFloatsEqual(this.w, other.w, eps);
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
        if (!areFloatsEqual(sqrlen, 0.0)) {
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

class Matrix4x4 {
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

    public isEqual(other: Matrix4x4, eps = EPSILON): boolean {
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

interface AddVec3FolderParams {
    parentFolder: dat.GUI,
    folderName: string,
    vec3: Vector3,
    min: number,
    max: number,
    step: number
};

const addVec3ToGUIFolder = (params: AddVec3FolderParams): dat.GUI => {
    const newFolder = params.parentFolder.addFolder(params.folderName);
    newFolder.add(params.vec3, "x", params.min, params.max, params.step);
    newFolder.add(params.vec3, "y", params.min, params.max, params.step);
    newFolder.add(params.vec3, "z", params.min, params.max, params.step);
    return newFolder;
};


async function main() {
    ASSERT(!!navigator.gpu, "WebGPU is not available");

    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
    ASSERT(!!adapter, "Failed to request an adapter");

    const deviceDescriptor: GPUDeviceDescriptor = {
        requiredFeatures: [
            "timestamp-query"
        ]
    };
    const device = await adapter.requestDevice(deviceDescriptor) as GPUDevice;
    ASSERT(!!device, "Failed to request a device");

    const canvas = document.querySelector("#aphrodite-canvas") as HTMLCanvasElement;
    ASSERT(!!canvas, "Canvas couldn't be found");
    resizeCanvas(canvas);

    const ctx = canvas.getContext("webgpu") as GPUCanvasContext;
    ASSERT(!!ctx, "getContext() failed");

    const canvasConfig: GPUCanvasConfiguration = {
        device: device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: "opaque"
    };
    ctx.configure(canvasConfig);

    const basicShaderSource = await downloadText("../shaders/basic.wgsl");
    const basicShaderDesc: GPUShaderModuleDescriptor = { code: basicShaderSource };
    const basicShaderModule = device.createShaderModule(basicShaderDesc)

    const colorState: GPUColorTargetState = {
        format: "bgra8unorm"
    };

    const aPosAttribDesc: GPUVertexAttribute = {
        shaderLocation: 0,
        offset: 0,
        format: "float32x3"
    };

    const aNormAttribDesc: GPUVertexAttribute = {
        shaderLocation: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3,
        format: "float32x3"
    };

    const aTexCoordAttribDesc: GPUVertexAttribute = {
        shaderLocation: 2,
        offset: Float32Array.BYTES_PER_ELEMENT * 6,
        format: "float32x2"
    };

    const vertexBufferLayoutDesc: GPUVertexBufferLayout = {
        attributes: [aPosAttribDesc, aNormAttribDesc, aTexCoordAttribDesc],
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 8,
        stepMode: "vertex"
    };

    const vertexData = new Float32Array([
        -0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      -0.5, -0.5,
        -0.5,  0.5, 0.0,        0.0, 0.0, 1.0,      -0.5,  0.5,
         0.5,  0.5, 0.0,        0.0, 0.0, 1.0,       0.5,  0.5,
         0.5, -0.5, 0.0,        0.0, 0.0, 1.0,       0.5, -0.5
    ]);

    const vertexBufferDesc: GPUBufferDescriptor = {
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    };

    const vertexBuffer = device.createBuffer(vertexBufferDesc);
    let writeArray = new Float32Array(vertexBuffer.getMappedRange());
    writeArray.set(vertexData);
    vertexBuffer.unmap();

    const indexData = new Uint32Array([ 0, 2, 1, 0, 3, 2 ]);

    const indexBufferDesc: GPUBufferDescriptor = {
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    };

    const indexBuffer = device.createBuffer(indexBufferDesc);
    const writeArrayU32 = new Uint32Array(indexBuffer.getMappedRange());
    writeArrayU32.set(indexData);
    indexBuffer.unmap();

    const transformBufferGPUDesc: GPUBufferDescriptor = {
        size: 512,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false,
    };
    const transformBufferGPU = device.createBuffer(transformBufferGPUDesc);

    const wallTextureData = await downloadImageWithMipmaps("../textures/wall");

    const wallTextureDescriptor: GPUTextureDescriptor = {
        size: [ wallTextureData[0].width, wallTextureData[1].height ],
        mipLevelCount: wallTextureData.length,
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    };
    const wallTexture = device.createTexture(wallTextureDescriptor);
    for (let i = 0; i < wallTextureData.length; ++i) {
        let newWidth = (wallTextureDescriptor.size as Array<number>)[0] >> i;
        let newHeight = (wallTextureDescriptor.size as Array<number>)[1] >> i;

        if (!newWidth) {
            newWidth = 1;
        }
        if (!newHeight) {
            newHeight = 1;
        }
        device.queue.copyExternalImageToTexture({source: wallTextureData[i]},
                                                {texture: wallTexture, mipLevel: i},
                                                [ newWidth, newHeight ]);
    }

    const wallTextureSamplerDesc: GPUSamplerDescriptor = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
        maxAnisotropy: 4
    };
    const wallTextureSampler = device.createSampler(wallTextureSamplerDesc);

    const uniformGroup0LayoutDesc: GPUBindGroupLayoutDescriptor = {
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {}
        }, {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 3,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {}
        }]
    };
    const uniformGroup0Layout = device.createBindGroupLayout(uniformGroup0LayoutDesc);
    const uniformGroup0 = device.createBindGroup({
        layout: uniformGroup0Layout,
        entries: [{
            binding: 0,
            resource: {
                offset: 0,
                buffer: transformBufferGPU
            }
        }, {
            binding: 1,
            resource: wallTexture.createView()
        }, {
            binding: 2,
            resource: wallTextureSampler
        }, {
            binding: 3,
            resource: {
                offset: 256,
                buffer: transformBufferGPU
            }
        }]
    });

    const msaaTextureDesc: GPUTextureDescriptor = {
        size: [ canvas.width, canvas.height],
        sampleCount: 4,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };
    let msaaTexture = device.createTexture(msaaTextureDesc);
    let msaaTextureView = msaaTexture.createView();

    const depthTextureDesc: GPUTextureDescriptor = {
        size: [ canvas.width, canvas.height, 1 ],
        sampleCount: 4,
        dimension: "2d",
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };

    let depthTexture = device.createTexture(depthTextureDesc);
    let depthTextureView = depthTexture.createView();

    const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
        bindGroupLayouts: [uniformGroup0Layout],
    };
    const pipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);

    const pipelineDesc: GPURenderPipelineDescriptor = {
        layout: pipelineLayout,
        vertex: {
            module: basicShaderModule,
            entryPoint: "vs_main",
            buffers: [vertexBufferLayoutDesc]
        },
        fragment: {
            module: basicShaderModule,
            entryPoint: "fs_main",
            targets: [colorState]
        },
        primitive: {
            topology: "triangle-list",
            frontFace: "ccw",
            cullMode: "back"
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: "greater-equal",
            format: "depth32float",
        },
        multisample: {
            count: 4
        }
    };

    const pipeline = await device.createRenderPipelineAsync(pipelineDesc);

    const gui = new dat.GUI({ autoPlace: false });
    const guiElem = document.querySelector("#gui") as HTMLElement;
    ASSERT(!!guiElem, "#gui doesn't exist");
    guiElem.append(gui.domElement);

    const engineFolder = gui.addFolder("Engine");
    const engineState = {
        clearColor: [10, 10, 20]
    };
    engineFolder.addColor(engineState, "clearColor")
    engineFolder.open();

    const performanceFolder = gui.addFolder("Performance");
    const performanceState = {
        ms: 0,
        fps: 0,
        totalTimePassed: 0,
        delay: 1000,
        frameCount: 0,
        totalRenderpass: 0,
        renderpass: 0,
        update: function(dt: number) {
            this.frameCount += 1;
            this.totalTimePassed += dt;
            if (this.totalTimePassed >= this.delay) {
                this.ms = this.totalTimePassed / this.frameCount;
                this.fps = 1000.0 / this.ms;
                this.renderpass = this.totalRenderpass / this.frameCount;

                this.totalTimePassed = 0;
                this.totalRenderpass = 0;
                this.frameCount = 0;
            }
        }
    };
    performanceFolder.add(performanceState, "ms").step(0.00001).listen();
    performanceFolder.add(performanceState, "fps").step(0.00001).listen();
    performanceFolder.add(performanceState, "renderpass").step(0.00001).listen();
    performanceFolder.add(performanceState, "delay");
    performanceFolder.open();

    const cameraFolder = gui.addFolder("Camera");
    const cameraState = {
        position: new Vector3(0.0, 0.0, 2.0),
        rotation: new Vector3(0.0, 0.0, 0.0),
        fovy: Math.PI / 2,
    };

    addVec3ToGUIFolder({
        parentFolder: cameraFolder,
        folderName: "Position",
        vec3: cameraState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });

    addVec3ToGUIFolder({
        parentFolder: cameraFolder,
        folderName: "Rotation",
        vec3: cameraState.rotation,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01
    });
    cameraFolder.add(cameraState, "fovy", Math.PI / 10, Math.PI, 0.01);
    cameraFolder.open();

    const modelFolder = gui.addFolder("Model");
    const modelState = {
        position: new Vector3(0, -3, 0),
        rotation: new Vector3(Math.PI / 2, 0, 0),
        scale: new Vector3(100.0, 100.0, 100.0),
        texcoordMultiplierFactor: 20,
    };
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Position",
        vec3: modelState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Rotation",
        vec3: modelState.rotation,
        min: 0.0,
        max: Math.PI * 2.0,
        step: 0.01
    });
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Scale",
        vec3: modelState.scale,
        min: 0.0,
        max: 10.0,
        step: 0.01
    });
    modelFolder.add(modelState, "texcoordMultiplierFactor", 1.0, 50.0, 0.01);
    modelFolder.open();

    const querySetDesc: GPUQuerySetDescriptor = {
        type: "timestamp",
        count: 2
    };
    const querySet = device.createQuerySet(querySetDesc);

    const queryResolveBufferDesc: GPUBufferDescriptor = {
        size: 2 * Float64Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
    };
    const queryResolveBuffer = device.createBuffer(queryResolveBufferDesc);

    const queryResultBufferDesc: GPUBufferDescriptor = {
        size: 2 * Float64Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    };
    const queryResultBuffer = device.createBuffer(queryResultBufferDesc);

    const dt = genDeltaTimeComputer();
    const render = async () => {
        resizeCanvas(canvas, (width: number, height: number) => {
            depthTexture.destroy();
            depthTextureDesc.size = [ width, height, 1 ];
            depthTexture = device.createTexture(depthTextureDesc);
            depthTextureView = depthTexture.createView();

            msaaTexture.destroy();
            msaaTextureDesc.size = [ width, height ];
            msaaTexture = device.createTexture(msaaTextureDesc);
            msaaTextureView = msaaTexture.createView();
        });

        performanceState.update(dt());

        const projectionMatrix = Matrix4x4.GenPerspective(cameraState.fovy,
                                                          canvas.width / canvas.height,
                                                          1.0, 0.0);

        const viewMatrix = Matrix4x4.GenView(cameraState.position,
                                             cameraState.rotation);

        const translationMatrix = Matrix4x4.GenTranslation(modelState.position);
        const rotationMatrix = Matrix4x4.GenRotationXYZ(modelState.rotation);
        const scaleMatrix = Matrix4x4.GenScale(modelState.scale);

        const pvmMatrix = projectionMatrix.mul(viewMatrix)
                                          .mul(translationMatrix)
                                          .mul(rotationMatrix)
                                          .mul(scaleMatrix);

        const texcoordMultiplierFactor = modelState.texcoordMultiplierFactor;
        const texcoordMultiplier = new Vector2(texcoordMultiplierFactor,
                                               texcoordMultiplierFactor);

        device.queue.writeBuffer(transformBufferGPU,
                                 0,
                                 pvmMatrix.toFloat32Array() as GPUAllowSharedBufferSource);
        device.queue.writeBuffer(transformBufferGPU,
                                 256,
                                 texcoordMultiplier.toFloat32Array() as GPUAllowSharedBufferSource);

        const colorTexture = ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: msaaTextureView,
            resolveTarget: colorTextureView,
            clearValue: { r: engineState.clearColor[0] / 255.0,
                          g: engineState.clearColor[1] / 255.0,
                          b: engineState.clearColor[2] / 255.0,
                          a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: depthTextureView,
            depthClearValue: 0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
        };

        const renderpassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment,
            timestampWrites: {
                querySet: querySet,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1 
            }
        };

        const commandEncoder = device.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, canvas.width, canvas.height, 0.0, 1.0);
        renderpass.setPipeline(pipeline);
        renderpass.setBindGroup(0, uniformGroup0);
        renderpass.setVertexBuffer(0, vertexBuffer);
        renderpass.setIndexBuffer(indexBuffer, "uint32");
        renderpass.drawIndexed(indexData.length);
        renderpass.end();
        commandEncoder.resolveQuerySet(querySet,
                                       0,
                                       querySet.count,
                                       queryResolveBuffer,
                                       0);
        if (queryResultBuffer.mapState === "unmapped") {
            commandEncoder.copyBufferToBuffer(queryResolveBuffer, queryResultBuffer);
        }

        device.queue.submit([commandEncoder.finish()]);
        if (queryResultBuffer.mapState === "unmapped") {
            queryResultBuffer.mapAsync(GPUMapMode.READ).then(() => {
                const result = new BigInt64Array(queryResultBuffer.getMappedRange());
                performanceState.totalRenderpass += Number(result[1] - result[0]) * 1e-6;
                queryResultBuffer.unmap();
            });
        }

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

main();
