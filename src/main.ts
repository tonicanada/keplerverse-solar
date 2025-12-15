import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";

import { createRenderer, resizeToDisplaySize } from "./core/renderer";
import { SimClock } from "./core/time";
import type { SceneModule } from "./scenes/Scene";

import { level01_sun_earth } from "./scenes/level01_sun_earth";
import { level02_reference_frames } from "./scenes/level02_reference_frames";
import { level03_sun_earth_moon } from "./scenes/level03_sun_earth_moon";
import { level04_lunar_surface_step1 } from "./scenes/level04_lunar_surface_step1";
import { level04_lunar_surface_step2 } from "./scenes/level04_lunar_surface_step2";

// 2D overlay (Level 02)
import { createLevel02_2D } from "./d3/level02_2d";

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

const level02_2d = createLevel02_2D();
let level02_2d_active = false;

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
  .onChange(v => (clock.paused = v));

gui.add(timeControls, "reverse").name("Reverse")
  .onChange(v => (clock.reverse = v));

gui.add(timeControls, "yearsPerSecond", 0, 1, 0.001)
  .name("Years / second")
  .onChange(v => {
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
    if (level02_2d_active) {
      level02_2d.dispose();
      panel2D.style.display = "none";
      level02_2d_active = false;
    }

    // limpiar escena 3D
    active.dispose();
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }

    // activar nueva escena
    active = scenes.find(s => s.name === name)!;
    active.init({ renderer, camera, scene, canvas });

    // activar panel 2D solo en Level 02
    if (active.name.startsWith("Level 02")) {
      panel2D.style.display = "block";
      level02_2d.mount(panel2D);
      level02_2d_active = true;
    }
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

  if (level02_2d_active) {
    level02_2d.update(clock.simTimeSeconds);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
