import * as THREE from "three";

export type SceneContext = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
};

export interface SceneModule {
  name: string;
  init(ctx: SceneContext): void;
  update(dtSeconds: number, simTimeSeconds: number): void;
  dispose(): void;
}
