import * as THREE from "three";
import GUI, { Controller } from "lil-gui";
import type { SceneContext } from "../Scene";
import type { Observer } from "./model";
import { referenceFrameState } from "./model";
import { level02Store } from "./state";

type View3DController = {
  init(ctx: SceneContext): void;
  update(simTimeSeconds: number): void;
  dispose(): void;
};

export function createLevel02View3D(): View3DController {
  let scene!: THREE.Scene;
  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let gui: GUI | null = null;
  let observerController: Controller | null = null;
  let unsubscribe: (() => void) | null = null;
  let observer: Observer = level02Store.get().observer;

  function init(ctx: SceneContext) {
    scene = ctx.scene;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.MeshStandardMaterial({
        emissive: 0xffff00,
        emissiveIntensity: 1,
      })
    );
    scene.add(sun);

    earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x2266ff,
      })
    );
    scene.add(earth);

    ctx.camera.position.set(0, 15, 25);
    ctx.camera.lookAt(0, 0, 0);

    const params = { observer };
    gui = new GUI({ title: "Reference Frame" });
    observerController = gui.add(params, "observer", ["Sun", "Earth"])
      .name("Observer")
      .onChange((value: Observer) => {
        level02Store.set({ observer: value });
      });

    unsubscribe = level02Store.subscribe(state => {
      observer = state.observer;
      if (params.observer !== state.observer) {
        params.observer = state.observer;
        observerController?.updateDisplay();
      }
    });
  }

  function update(simTimeSeconds: number) {
    const frame = referenceFrameState(simTimeSeconds, observer);
    sun.position.copy(frame.sunPos);
    earth.position.copy(frame.earthPos);
  }

  function dispose() {
    gui?.destroy();
    gui = null;
    observerController = null;
    unsubscribe?.();
    unsubscribe = null;
  }

  return { init, update, dispose };
}
