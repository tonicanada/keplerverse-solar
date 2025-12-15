import * as THREE from "three";
import GUI, { Controller } from "lil-gui";
import type { SceneContext } from "../Scene";
import type { Observer } from "./model";
import {
  circularOrbitPoints,
  observerFrameState,
  sunEpicyclePoints,
} from "./model";
import { EARTH_ORBIT_RADIUS, MOON_ORBIT_RADIUS } from "./model";
import { level03Store } from "./state";

type Level03View3D = {
  init(ctx: SceneContext): void;
  update(simTimeSeconds: number): void;
  dispose(): void;
};

export function createLevel03View3D(): Level03View3D {
  let scene!: THREE.Scene;
  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let moon!: THREE.Mesh;
  let sunOrbit!: THREE.Line;
  let earthOrbitSunFrame!: THREE.Line;
  let earthOrbitMoonFrame!: THREE.Line;
  let moonOrbit!: THREE.Line;
  let sunEpicycle!: THREE.Line;

  let gui: GUI | null = null;
  let controller: Controller | null = null;
  let unsubscribe: (() => void) | null = null;
  let observer: Observer = level03Store.get().observer;

  function createLine(points: THREE.Vector3[], color: number) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }

  function init(ctx: SceneContext) {
    scene = ctx.scene;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.MeshStandardMaterial({ emissive: 0xffff00 })
    );
    earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x2266ff })
    );
    moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );

    scene.add(sun, earth, moon);

    sunOrbit = createLine(circularOrbitPoints(EARTH_ORBIT_RADIUS), 0xf6c344);
    earthOrbitSunFrame = createLine(circularOrbitPoints(EARTH_ORBIT_RADIUS), 0x2266ff);
    earthOrbitMoonFrame = createLine(circularOrbitPoints(MOON_ORBIT_RADIUS), 0x2266ff);
    moonOrbit = createLine(circularOrbitPoints(MOON_ORBIT_RADIUS), 0xaaaaaa);
    sunEpicycle = createLine(sunEpicyclePoints(), 0xffaa00);

    scene.add(sunOrbit, earthOrbitSunFrame, earthOrbitMoonFrame, moonOrbit, sunEpicycle);

    ctx.camera.position.set(0, 18, 30);
    ctx.camera.lookAt(0, 0, 0);

    const params = { observer };
    gui = new GUI({ title: "Observer" });
    controller = gui
      .add(params, "observer", ["Sun", "Earth", "Moon"])
      .onChange((value: Observer) => {
        level03Store.set({ observer: value });
      });

    unsubscribe = level03Store.subscribe(state => {
      observer = state.observer;
      if (params.observer !== state.observer) {
        params.observer = state.observer;
        controller?.updateDisplay();
      }
    });
  }

  function update(simTimeSeconds: number) {
    const frame = observerFrameState(simTimeSeconds, observer);

    const isEarthObserver = observer === "Earth";
    const isMoonObserver = observer === "Moon";

    sun.position.copy(frame.sunPos);
    earth.position.copy(frame.earthPos);
    moon.position.copy(frame.moonPos);

    sunOrbit.visible = isEarthObserver;
    earthOrbitSunFrame.visible = observer === "Sun";
    earthOrbitMoonFrame.visible = isMoonObserver;
    moonOrbit.visible = !isMoonObserver;
    sunEpicycle.visible = isMoonObserver;

    earthOrbitSunFrame.position.copy(frame.sunPos);
    earthOrbitMoonFrame.position.set(0, 0, 0);
    moonOrbit.position.copy(frame.earthPos);
    sunOrbit.position.set(0, 0, 0);
    sunEpicycle.position.set(0, 0, 0);
  }

  function dispose() {
    gui?.destroy();
    gui = null;
    controller = null;
    unsubscribe?.();
    unsubscribe = null;
  }

  return { init, update, dispose };
}
