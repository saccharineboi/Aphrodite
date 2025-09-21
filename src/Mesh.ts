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

    public static GenPlane(width: number, depth: number): Mesh {
        const halfWidth = width >> 1;
        const halfDepth = depth >> 1;
        const vertices = new Float32Array([
            -halfWidth, 0.0,  halfDepth,     0.0, 1.0, 0.0,      0.0, 0.0,
             halfWidth, 0.0,  halfDepth,     0.0, 1.0, 0.0,      1.0, 0.0,
            -halfWidth, 0.0, -halfDepth,     0.0, 1.0, 0.0,      0.0, 1.0,
             halfWidth, 0.0, -halfDepth,     0.0, 1.0, 0.0,      1.0, 1.0,
        ]);
        const indices = new Uint32Array([
            0, 1, 2, 2, 1, 3
        ]);
        return new Mesh(vertices, indices);
    }

    public static GenCube(): Mesh {
        const vertices = new Float32Array([
            // front face
            -0.5, -0.5,  0.5,        0.0,  0.0,  1.0,      0.0, 0.0,
             0.5, -0.5,  0.5,        0.0,  0.0,  1.0,      1.0, 0.0,
            -0.5,  0.5,  0.5,        0.0,  0.0,  1.0,      0.0, 1.0,
             0.5,  0.5,  0.5,        0.0,  0.0,  1.0,      1.0, 1.0,

            // back face
            -0.5, -0.5, -0.5,        0.0,  0.0, -1.0,      0.0, 0.0,
             0.5, -0.5, -0.5,        0.0,  0.0, -1.0,      1.0, 0.0,
            -0.5,  0.5, -0.5,        0.0,  0.0, -1.0,      0.0, 1.0,
             0.5,  0.5, -0.5,        0.0,  0.0, -1.0,      1.0, 1.0,

            // left face
            -0.5, -0.5, -0.5,       -1.0,  0.0,  0.0,      0.0, 0.0,
            -0.5, -0.5,  0.5,       -1.0,  0.0,  0.0,      1.0, 0.0,
            -0.5,  0.5, -0.5,       -1.0,  0.0,  0.0,      0.0, 1.0,
            -0.5,  0.5,  0.5,       -1.0,  0.0,  0.0,      1.0, 1.0,

            // right face
             0.5, -0.5, -0.5,        1.0,  0.0,  0.0,      0.0, 0.0,
             0.5, -0.5,  0.5,        1.0,  0.0,  0.0,      1.0, 0.0,
             0.5,  0.5, -0.5,        1.0,  0.0,  0.0,      0.0, 1.0,
             0.5,  0.5,  0.5,        1.0,  0.0,  0.0,      1.0, 1.0,

             // top face
            -0.5,  0.5,  0.5,        0.0,  1.0,  0.0,      0.0, 0.0,
             0.5,  0.5,  0.5,        0.0,  1.0,  0.0,      1.0, 0.0,
            -0.5,  0.5, -0.5,        0.0,  1.0,  0.0,      0.0, 1.0,
             0.5,  0.5, -0.5,        0.0,  1.0,  0.0,      1.0, 1.0,

             // bottom face
            -0.5, -0.5,  0.5,        0.0, -1.0,  0.0,      0.0, 0.0,
             0.5, -0.5,  0.5,        0.0, -1.0,  0.0,      1.0, 0.0,
            -0.5, -0.5, -0.5,        0.0, -1.0,  0.0,      0.0, 1.0,
             0.5, -0.5, -0.5,        0.0, -1.0,  0.0,      1.0, 1.0,
        ]);
        const indices = new Uint32Array([
            // front face
            0, 1, 2, 2, 1, 3,

            // back face
            7, 5, 6, 6, 5, 4,

            // left face
            8, 9, 10, 10, 9, 11,

            // right face
            15, 13, 14, 14, 13, 12,

            // top face
            16, 17, 18, 18, 17, 19,

            // bottom face
            23, 21, 22, 22, 21, 20,
        ]);
        return new Mesh(vertices, indices);
    }
};
