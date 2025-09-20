export class Mesh {
    public constructor(public vertices: Float32Array,
                       public indices: Uint32Array) { }

    public static GenTriangle(): Mesh {
        const vertices = new Float32Array([
            -0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      0.0, 0.0,
             0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      1.0, 0.0,
             0.0,  0.5, 0.0,        0.0, 0.0, 1.0,      0.5, 1.0
        ]);
        const indices = new Uint32Array([
            0, 1, 2
        ]);
        return new Mesh(vertices, indices);
    }

    public static GenQuad(): Mesh {
        const vertices = new Float32Array([
            -0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      0.0, 0.0,
            -0.5,  0.5, 0.0,        0.0, 0.0, 1.0,      0.0, 1.0,
             0.5,  0.5, 0.0,        0.0, 0.0, 1.0,      1.0, 1.0,
             0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      1.0, 0.0
        ]);
        const indices = new Uint32Array([
            0, 3, 1, 1, 3, 2
        ]);
        return new Mesh(vertices, indices);
    }
};
