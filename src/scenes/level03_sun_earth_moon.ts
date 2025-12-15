import * as THREE from "three";
import GUI from "lil-gui";
import type { SceneContext, SceneModule } from "./Scene";

/**
 * LEVEL 03 — Sun · Earth · Moon
 * -----------------------------
 * Órbitas y trayectorias dependientes del observador.
 *
 * - Sol: órbitas reales
 * - Tierra: órbitas aparentes
 * - Luna: epiciclo del Sol
 */
export function level03_sun_earth_moon(): SceneModule {
  // =====================================================
  // Estado
  // =====================================================

  let scene!: THREE.Scene;
  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let moon!: THREE.Mesh;

  let earthOrbit!: THREE.Line;
  let moonOrbit!: THREE.Line;
  let sunEpiciclo!: THREE.Line;

  let gui: GUI | null = null;

  const params = {
    observer: "Sun" as "Sun" | "Earth" | "Moon",
  };

  // =====================================================
  // Constantes
  // =====================================================

  const AU = 10;

  const R_E = 1 * AU;
  const T_E = 365 * 24 * 3600;

  const R_M = 0.2 * AU;
  const T_M = 27.3 * 24 * 3600;

  const SEGMENTS = 512;

  // =====================================================
  // Utilidades
  // =====================================================

  function createLine(points: THREE.Vector3[], color: number) {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geo, mat);
  }

  function circularOrbit(radius: number): THREE.Vector3[] {
    return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const a = (i / SEGMENTS) * 2 * Math.PI;
      return new THREE.Vector3(
        radius * Math.cos(a),
        0,
        radius * Math.sin(a)
      );
    });
  }

  function sunEpicicloPoints(): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = (i / SEGMENTS) * 2 * Math.PI;

      const earth = new THREE.Vector3(
        R_E * Math.cos(t),
        0,
        R_E * Math.sin(t)
      );

      const moon = new THREE.Vector3(
        R_M * Math.cos((T_E / T_M) * t),
        0,
        R_M * Math.sin((T_E / T_M) * t)
      );

      // Sol visto desde la Luna
      pts.push(earth.clone().add(moon).multiplyScalar(-1));
    }

    return pts;
  }

  // =====================================================
  // Escena
  // =====================================================

  return {
    name: "Level 03 · Orbits & Epicycles",

    init(ctx: SceneContext) {
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

      earthOrbit = createLine(circularOrbit(R_E), 0x2266ff);
      moonOrbit = createLine(circularOrbit(R_M), 0xaaaaaa);
      sunEpiciclo = createLine(sunEpicicloPoints(), 0xffaa00);

      scene.add(earthOrbit, moonOrbit, sunEpiciclo);

      ctx.camera.position.set(0, 18, 30);
      ctx.camera.lookAt(0, 0, 0);

      gui = new GUI({ title: "Observer" });
      gui.add(params, "observer", ["Sun", "Earth", "Moon"]);
    },

    update(_dt: number, t: number) {
      const θE = (2 * Math.PI * t) / T_E;
      const θM = (2 * Math.PI * t) / T_M;

      const earthPos = new THREE.Vector3(
        R_E * Math.cos(θE),
        0,
        R_E * Math.sin(θE)
      );

      const moonPos = earthPos.clone().add(
        new THREE.Vector3(
          R_M * Math.cos(θM),
          0,
          R_M * Math.sin(θM)
        )
      );

      const sunPos = new THREE.Vector3(0, 0, 0);

      let origin = sunPos;
      if (params.observer === "Earth") origin = earthPos;
      if (params.observer === "Moon") origin = moonPos;

      sun.position.copy(sunPos.clone().sub(origin));
      earth.position.copy(earthPos.clone().sub(origin));
      moon.position.copy(moonPos.clone().sub(origin));

      earthOrbit.visible = params.observer === "Sun";
      moonOrbit.visible = params.observer !== "Moon";
      sunEpiciclo.visible = params.observer === "Moon";

      earthOrbit.position.copy(sunPos.clone().sub(origin));
      moonOrbit.position.copy(earthPos.clone().sub(origin));
      sunEpiciclo.position.set(0, 0, 0);
    },

    dispose() {
      gui?.destroy();
      gui = null;
    },
  };
}
