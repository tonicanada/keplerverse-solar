import * as THREE from "three";
import GUI from "lil-gui";
import type { SceneContext, SceneModule } from "./Scene";

/**
 * LEVEL 04 — Lunar Surface (Step 1)
 * --------------------------------
 * Observador situado en la superficie de la Luna.
 *
 * En este primer paso:
 *  - NO hay horizonte
 *  - NO hay suelo
 *  - SOLO colocamos la cámara sobre la Luna
 *  - La cámara rota con la Luna (día lunar)
 */
export function level04_lunar_surface_step1(): SceneModule {
  // =====================================================
  // Estado persistente (closure)
  // =====================================================

  let scene!: THREE.Scene;
  let camera!: THREE.PerspectiveCamera;

  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let moon!: THREE.Mesh;

  let gui: GUI | null = null;

  // =====================================================
  // Parámetros
  // =====================================================

  const params = {
    observer: "MoonSurface" as "MoonSurface",
  };

  // =====================================================
  // Constantes físicas (escaladas)
  // =====================================================

  const AU = 10;

  // Tierra
  const EARTH_ORBIT_RADIUS = 1 * AU;
  const EARTH_ORBIT_PERIOD = 365 * 24 * 3600;

  // Luna
  const MOON_ORBIT_RADIUS = 0.2 * AU;
  const MOON_ORBIT_PERIOD = 27.3 * 24 * 3600;

  const MOON_RADIUS = 0.15;

  // =====================================================
  // Escena
  // =====================================================

  return {
    name: "Level 04 · Lunar Surface (Step 1)",

    init(ctx: SceneContext) {
      scene = ctx.scene;
      camera = ctx.camera;

      // -----------------------------
      // Iluminación básica
      // -----------------------------

      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(5, 5, 5);
      scene.add(light);

      // -----------------------------
      // Astros (solo referencia visual)
      // -----------------------------

      sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.MeshStandardMaterial({
          emissive: 0xffff00,
          emissiveIntensity: 1,
        })
      );

      earth = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0x2266ff,
        })
      );

      moon = new THREE.Mesh(
        new THREE.SphereGeometry(MOON_RADIUS, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
        })
      );

      scene.add(sun, earth, moon);

      // -----------------------------
      // Cámara inicial (temporal)
      // -----------------------------

      camera.position.set(0, 5, 15);
      camera.lookAt(0, 0, 0);

      // -----------------------------
      // GUI
      // -----------------------------

      gui = new GUI({ title: "Lunar Surface" });
    },

    update(_dtSeconds: number, simTimeSeconds: number) {
      // =================================================
      // Física heliocéntrica (marco base)
      // =================================================

      // Tierra alrededor del Sol
      const omegaEarth = (2 * Math.PI) / EARTH_ORBIT_PERIOD;
      const thetaEarth = omegaEarth * simTimeSeconds;

      const earthPos = new THREE.Vector3(
        EARTH_ORBIT_RADIUS * Math.cos(thetaEarth),
        0,
        EARTH_ORBIT_RADIUS * Math.sin(thetaEarth)
      );

      // Luna alrededor de la Tierra
      const omegaMoon = (2 * Math.PI) / MOON_ORBIT_PERIOD;
      const thetaMoon = omegaMoon * simTimeSeconds;

      const moonRelEarth = new THREE.Vector3(
        MOON_ORBIT_RADIUS * Math.cos(thetaMoon),
        0,
        MOON_ORBIT_RADIUS * Math.sin(thetaMoon)
      );

      const sunPos = new THREE.Vector3(0, 0, 0);
      const moonPos = earthPos.clone().add(moonRelEarth);

      // Posiciones de los astros (referencia visual)
      sun.position.copy(sunPos);
      earth.position.copy(earthPos);
      moon.position.copy(moonPos);

      // =================================================
      // PASO 1 — Cámara sobre la superficie lunar
      // =================================================

      // Rotación síncrona de la Luna
      const moonRotation =
        (2 * Math.PI * simTimeSeconds) / MOON_ORBIT_PERIOD;

      // Punto del observador en la superficie lunar (ecuador)
      const observerLocal = new THREE.Vector3(
        MOON_RADIUS * Math.cos(moonRotation),
        0,
        MOON_RADIUS * Math.sin(moonRotation)
      );

      // Posición absoluta del observador
      const observerWorld = moonPos.clone().add(observerLocal);

      // Colocar la cámara en la superficie
      camera.position.copy(observerWorld);

      // Vector vertical local (normal a la superficie)
      const up = observerLocal.clone().normalize();

      // Mirar hacia el cielo (opuesto al suelo)
      const lookDir = up.clone().multiplyScalar(-1);

      camera.up.copy(up);
      camera.lookAt(observerWorld.clone().add(lookDir));
    },

    dispose() {
      gui?.destroy();
      gui = null;
    },
  };
}
