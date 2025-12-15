import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";

import { createRenderer, resizeToDisplaySize } from "./core/renderer";
import { SimClock } from "./core/time";
import type { SceneModule } from "./levels/Scene";

import { level01_sun_earth } from "./levels/level01/scene";
import { level02_reference_frames } from "./levels/level02/scene";
import { level03_sun_earth_moon } from "./levels/level03/scene";
import { level04_lunar_surface_step1 } from "./levels/level04/scene_step1";
import { level04_lunar_surface_step2 } from "./levels/level04/scene_step2";
import { createLevel02_2D } from "./levels/level02/view2d";
import { createLevel03View2D } from "./levels/level03/view2d";
import { createLevel04Step1View2D } from "./levels/level04/view2d_step1";
import { createLevel04Step2View2D } from "./levels/level04/view2d_step2";

type OverlayView = {
  mount(container: HTMLElement): void;
  update(simTimeSeconds: number): void;
  dispose(): void;
};

// =====================================================
// Canvas & Renderer
// =====================================================

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.style.width = "100%";
canvas.style.height = "100%";

const renderer = createRenderer(canvas);

// =====================================================
// Scene & Camera
// =====================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, 2, 0.01, 1e6);

// =====================================================
// 2D Panel (bottom-right)
// =====================================================

const panel2D = document.getElementById("panel-2d")!;
panel2D.style.display = "none";

const overlays = new Map<string, OverlayView>([
  ["Level 02 · Reference Frames", createLevel02_2D()],
  ["Level 03 · Orbits & Epicycles", createLevel03View2D()],
  ["Level 04 · Lunar Surface (Step 1)", createLevel04Step1View2D()],
  ["Level 04 · Lunar Surface (Step 2)", createLevel04Step2View2D()],
]);

let activeOverlay: OverlayView | null = null;

function detachOverlay() {
  if (!activeOverlay) return;
  activeOverlay.dispose();
  activeOverlay = null;
  panel2D.style.display = "none";
}

function attachOverlay(sceneName: string) {
  const overlay = overlays.get(sceneName);
  if (!overlay) return;
  panel2D.style.display = "block";
  overlay.mount(panel2D);
  activeOverlay = overlay;
}

// =====================================================
// Simulation Clock
// =====================================================

const clock = new SimClock();

// =====================================================
// Scenes
// =====================================================

const scenes: SceneModule[] = [
  level01_sun_earth(),
  level02_reference_frames(),
  level03_sun_earth_moon(),
  level04_lunar_surface_step1(),
  level04_lunar_surface_step2(),
];

let active = scenes[0];
active.init({ renderer, camera, scene, canvas });
attachOverlay(active.name);

// =====================================================
// GUI — Time controls
// =====================================================

const gui = new GUI();

const SECONDS_PER_YEAR = 365 * 24 * 3600;

const timeControls = {
  paused: false,
  reverse: false,
  yearsPerSecond: 0.001,
};

clock.paused = timeControls.paused;
clock.reverse = timeControls.reverse;
clock.speed = timeControls.yearsPerSecond * SECONDS_PER_YEAR;

gui.add(timeControls, "paused").name("Pause")
  .onChange((v: boolean) => {
    clock.paused = v;
  });

gui.add(timeControls, "reverse").name("Reverse")
  .onChange((v: boolean) => {
    clock.reverse = v;
  });

gui.add(timeControls, "yearsPerSecond", 0, 1, 0.001)
  .name("Years / second")
  .onChange((v: number) => {
    clock.speed = v * SECONDS_PER_YEAR;
  });

// =====================================================
// Scene selector
// =====================================================

const sceneParams = { scene: active.name };

gui
  .add(sceneParams, "scene", scenes.map(s => s.name))
  .name("Level")
  .onChange((name: string) => {
    // limpiar 2D
    detachOverlay();

    // limpiar escena 3D
    active.dispose();
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }

    // activar nueva escena
    active = scenes.find(s => s.name === name)!;
    active.init({ renderer, camera, scene, canvas });

    attachOverlay(active.name);
  });

// =====================================================
// Animation loop
// =====================================================

let last = performance.now();

function animate(now: number) {
  const realDt = (now - last) / 1000;
  last = now;

  clock.step(realDt);

  resizeToDisplaySize(renderer, camera);

  active.update(realDt, clock.simTimeSeconds);

  activeOverlay?.update(clock.simTimeSeconds);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
