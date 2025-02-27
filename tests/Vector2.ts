import * as Aphrodite from "../build/src/renderer.js";
import assert from "assert";

describe("Aphrodite.Vector2", () => {
    describe("Zero()", () => {
        it("should return a zero vector", () => {
            const v = Aphrodite.Vector2.Zero();
            assert.strictEqual(v.x, 0.0);
            assert.strictEqual(v.y, 0.0);
        });
    });
    describe("X()", () => {
        it("should return x-axis vector", () => {
            const v = Aphrodite.Vector2.X();
            assert.strictEqual(v.x, 1.0);
            assert.strictEqual(v.y, 0.0);
        });
    });
    describe("Y()", () => {
        it("should return y-axis vector", () => {
            const v = Aphrodite.Vector2.Y();
            assert.strictEqual(v.x, 0.0);
            assert.strictEqual(v.y, 1.0);
        });
    });
    describe("FromVector3()", () => {
        it("should create Vector2 from Vector3", () => {
            const p = new Aphrodite.Vector3(1.0, 2.0, 3.0);
            const q = Aphrodite.Vector2.FromVector3(p);
            assert.strictEqual(q.x, 1.0);
            assert.strictEqual(q.y, 2.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector3(1.0, 2.0, 3.0);
            const q = Aphrodite.Vector2.FromVector3(p);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
            assert.strictEqual(p.z, 3.0);
        });
    });
    describe("FromVector4()", () => {
        it("should create Vector2 from Vector4", () => {
            const p = new Aphrodite.Vector4(5.0, 6.0, 7.0, 8.0);
            const q = Aphrodite.Vector2.FromVector4(p);
            assert.strictEqual(q.x, 5.0);
            assert.strictEqual(q.y, 6.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector4(5.0, 6.0, 7.0, 8.0);
            const q = Aphrodite.Vector2.FromVector4(p);
            assert.strictEqual(p.x, 5.0);
            assert.strictEqual(p.y, 6.0);
            assert.strictEqual(p.z, 7.0);
            assert.strictEqual(p.w, 8.0);
        });
    });
    describe("ctor()", () => {
        it("should create a new Vector2", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.x, 3.0);
            assert.strictEqual(p.y, 4.0);
        });
    });
    describe("copy()", () => {
        it("should create a copy of Vector2", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = p.copy();
            assert.strictEqual(q.x, 1.0);
            assert.strictEqual(q.y, 2.0);
        });
        it("should not modify the source Vector2", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = p.copy();
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
        });
    });
    describe("clone()", () => {
        it("should clone another Vector2", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(0.0, 0.0);
            q.clone(p);
            assert.strictEqual(q.x, 1.0);
            assert.strictEqual(q.y, 2.0);
        });
        it("should not modify the source Vector2", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(0.0, 0.0);
            q.clone(p);
            assert.strictEqual(q.x, 1.0);
            assert.strictEqual(q.y, 2.0);
        });
    });
    describe("add()", () => {
        it("should add two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.add(q);
            assert.strictEqual(r.x, 4.0);
            assert.strictEqual(r.y, 6.0);
        });
        it("should not modify the source vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.add(q);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
            assert.strictEqual(q.x, 3.0);
            assert.strictEqual(q.y, 4.0);
        });
    });
    describe("sub()", () => {
        it("should subtract two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.sub(q);
            assert.strictEqual(r.x, -2.0);
            assert.strictEqual(r.y, -2.0);
        });
        it("should not modify the source vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.sub(q);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
            assert.strictEqual(q.x, 3.0);
            assert.strictEqual(q.y, 4.0);
        });
    });
    describe("mul()", () => {
        it("should component-wise multiply two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.mul(q);
            assert.strictEqual(r.x, 3.0);
            assert.strictEqual(r.y, 8.0);
        });
        it("should not modify the source vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.mul(q);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
            assert.strictEqual(q.x, 3.0);
            assert.strictEqual(q.y, 4.0);
        });
    });
    describe("div()", () => {
        it("should component-wise divide two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.div(q);
            assert.strictEqual(r.x, 1.0 / 3.0);
            assert.strictEqual(r.y, 0.5);
        });
        it("should not modify the source vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            const r = p.div(q);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
            assert.strictEqual(q.x, 3.0);
            assert.strictEqual(q.y, 4.0);
        });
    });
    describe("addScalar()", () => {
        it("should add a vector and a scalar", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.addScalar(s);
            assert.strictEqual(r.x, 4.0);
            assert.strictEqual(r.y, 5.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.addScalar(s);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
        });
    });
    describe("subScalar()", () => {
        it("should subtract a scalar from a vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.subScalar(s);
            assert.strictEqual(r.x, -2.0);
            assert.strictEqual(r.y, -1.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.subScalar(s);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
        });
    });
    describe("mulScalar()", () => {
        it("should multiply a scalar with a vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.mulScalar(s);
            assert.strictEqual(r.x, 3.0);
            assert.strictEqual(r.y, 6.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.mulScalar(s);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
        });
    });
    describe("divScalar()", () => {
        it("should divide a vector by a scalar", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.divScalar(s);
            assert.strictEqual(r.x, 1.0 / 3.0);
            assert.strictEqual(r.y, 2.0 / 3.0);
        });
        it("should not modify the source vector", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const s = 3.0;
            const r = p.divScalar(s);
            assert.strictEqual(p.x, 1.0);
            assert.strictEqual(p.y, 2.0);
        });
    });
    describe("dot()", () => {
        it("should compute a dot product between two basis vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 0.0);
            const q = new Aphrodite.Vector2(0.0, 1.0);
            assert.strictEqual(p.dot(q), 0.0);
        });
        it("should compute a dot product between two given vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.dot(q), 11.0);
        });
    });
    describe("squareDist()", () => {
        it("should compute squared distance between two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.squaredDist(q), 8.0);
        });
        it("should compute squared distance between two negative vectors", () => {
            const p = new Aphrodite.Vector2(-1.0, -2.0);
            const q = new Aphrodite.Vector2(-3.0, -4.0);
            assert.strictEqual(p.squaredDist(q), 8.0);
        });
    });
    describe("dist()", () => {
        it("should compute distance between two vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.dist(q), Math.sqrt(8.0));
        });
        it("should compute distance between two negative vectors", () => {
            const p = new Aphrodite.Vector2(-1.0, -2.0);
            const q = new Aphrodite.Vector2(-3.0, -4.0);
            assert.strictEqual(p.dist(q), Math.sqrt(8.0));
        });
    });
    describe("squaredLen()", () => {
        it("should compute the squared length of a zero vector", () => {
            const p = new Aphrodite.Vector2(0.0, 0.0);
            assert.strictEqual(p.squaredLen(), 0.0);
        });
        it("should compute the squared length of a given vector", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.squaredLen(), 25.0);
        });
    });
    describe("len()", () => {
        it("should compute the length of a zero vector", () => {
            const p = new Aphrodite.Vector2(0.0, 0.0);
            assert.strictEqual(p.len(), 0.0);
        });
        it("should compute the length of a given vector", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            assert.strictEqual(p.len(), 5.0);
        });
    });
    describe("norm()", () => {
        it("should normalize a zero vector", () => {
            const p = Aphrodite.Vector2.Zero();
            const q = p.norm();
            assert.strictEqual(q.x, 0.0);
            assert.strictEqual(q.y, 0.0);
        });
        it("should normalize a given vector", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            const q = p.norm();
            assert.strictEqual(q.x, 3.0 / 5.0);
            assert.strictEqual(q.y, 4.0 / 5.0);
        });
    });
    describe("equals()", () => {
        it("should return true for two approximately equal vectors", () => {
            const p = new Aphrodite.Vector2(1.0 / 3.0, 2.0 / 3.0);
            const q = new Aphrodite.Vector2(0.333333, 0.666666);
            assert.strictEqual(p.equals(q), true);
        });
        it("should return false for two different vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(2.0, 2.0);
            assert.strictEqual(p.equals(q), false);
        });
    });
    describe("equalsExact()", () => {
        it("should return false for two approximately equal vectors", () => {
            const p = new Aphrodite.Vector2(1.0 / 3.0, 2.0 / 3.0);
            const q = new Aphrodite.Vector2(0.333333, 0.666666);
            assert.strictEqual(p.equalsExact(q), false);
        });
        it("should return false for two different vectors", () => {
            const p = new Aphrodite.Vector2(1.0, 2.0);
            const q = new Aphrodite.Vector2(2.0, 2.0);
            assert.strictEqual(p.equalsExact(q), false);
        });
        it("should return true for two precisely equal vectors", () => {
            const p = new Aphrodite.Vector2(-2.0, 4.0);
            const q = new Aphrodite.Vector2(-2.0, 4.0);
            assert.strictEqual(p.equalsExact(q), true);
        });
    });
    describe("toFloat32Array()", () => {
        it("should return an instance of Float32Array", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            const f = p.toFloat32Array();
            assert.strictEqual(f instanceof Float32Array, true);
        });
        it("should return an instance of Float32Array containing the same values", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            const f = p.toFloat32Array();
            assert.strictEqual(f[0], p.x);
            assert.strictEqual(f[1], p.y);
        });
    });
    describe("toString()", () => {
        it("should return the string representation of a vector", () => {
            const p = new Aphrodite.Vector2(3.0, 4.0);
            const s = p.toString();
            assert.strictEqual(s, "(3, 4)^T");
        });
        it("should return the string representation of a vector", () => {
            const p = new Aphrodite.Vector2(3.1, 4.2);
            const s = p.toString();
            assert.strictEqual(s, "(3.1, 4.2)^T");
        });
    });
});
