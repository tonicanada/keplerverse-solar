declare module "three" {
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    clone(): Vector3;
    normalize(): this;
    length(): number;
    lengthSq(): number;
    multiplyScalar(s: number): this;
    cross(v: Vector3): this;
    copy(v: Vector3): this;
  }

  export class Scene {
    children: any[];
    add(...objects: any[]): void;
    remove(object: any): void;
    background?: Color;
  }

  export class PerspectiveCamera {
    position: Vector3;
    up: Vector3;
    aspect: number;
    constructor(fov: number, aspect: number, near: number, far: number);
    lookAt(vector: Vector3): void;
    lookAt(x: number, y: number, z: number): void;
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    localClippingEnabled: boolean;
    constructor(params?: Record<string, unknown>);
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
  }

  export class Mesh {
    position: Vector3;
    quaternion: Quaternion;
    constructor(geometry: any, material: any);
  }

  export class Line {
    position: Vector3;
    visible: boolean;
    constructor(geometry: any, material: any);
  }

  export class LineLoop extends Line {
    constructor(geometry: any, material: any);
  }

  export class MeshStandardMaterial {
    clippingPlanes?: Plane[];
    clipIntersection?: boolean;
    needsUpdate?: boolean;
    constructor(params?: Record<string, unknown>);
  }

  export class MeshBasicMaterial {
    constructor(params?: Record<string, unknown>);
  }

  export class SphereGeometry {
    constructor(radius: number, widthSegments?: number, heightSegments?: number);
  }

  export class PlaneGeometry {
    constructor(width: number, height: number);
  }

  export class BufferGeometry {
    constructor();
    setFromPoints(points: Vector3[]): this;
  }

  export class LineBasicMaterial {
    constructor(params?: Record<string, unknown>);
  }

  export class AmbientLight {
    constructor(color?: number, intensity?: number);
  }

  export class DirectionalLight {
    position: Vector3;
    constructor(color?: number, intensity?: number);
  }

  export class MeshStandardMaterialParameters {}

  export class Quaternion {
    setFromUnitVectors(vFrom: Vector3, vTo: Vector3): this;
    copy(quaternion: Quaternion): this;
  }

  export class Plane {
    setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): this;
  }

  export namespace MathUtils {
    function degToRad(degrees: number): number;
  }

  export const DoubleSide: number;

  export class Color {
    constructor(hex?: number);
  }
}

declare module "d3" {
  const d3: any;
  export = d3;
}
