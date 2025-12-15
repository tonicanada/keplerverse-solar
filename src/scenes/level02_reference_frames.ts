import * as THREE from "three";
import GUI from "lil-gui";
import type { SceneContext, SceneModule } from "./Scene";

/**
 * LEVEL 02 — Reference Frames
 * ---------------------------
 * Mismo sistema Sol–Tierra, distintos observadores.
 *
 * Observadores:
 *  - Sun   → sistema heliocéntrico
 *  - Earth → sistema geocéntrico
 *
 * Cambio de referencia:
 *   r' = r - r_observer
 */
export function level02_reference_frames(): SceneModule {
  // =====================================================
  // Estado persistente
  // =====================================================

  let scene!: THREE.Scene;
  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;

  // GUI local
  let gui: GUI | null = null;

  // Observador actual
  const params = {
    observer: "Sun" as "Sun" | "Earth",
  };

  // =====================================================
  // Constantes físicas
  // =====================================================

  const AU = 10;
  const EARTH_ORBIT_RADIUS = AU;
  const EARTH_ORBIT_PERIOD = 365 * 24 * 3600;

  // =====================================================
  // Escena
  // =====================================================

  return {
    name: "Level 02 · Reference Frames",

    init(ctx: SceneContext) {
      scene = ctx.scene;

      // -----------------------------
      // Iluminación
      // -----------------------------

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));

      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(5, 5, 5);
      scene.add(light);

      // -----------------------------
      // Sol
      // -----------------------------

      sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.MeshStandardMaterial({
          emissive: 0xffff00,
          emissiveIntensity: 1,
        })
      );
      scene.add(sun);

      // -----------------------------
      // Tierra
      // -----------------------------

      earth = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0x2266ff,
        })
      );
      scene.add(earth);

      // -----------------------------
      // Cámara
      // -----------------------------

      ctx.camera.position.set(0, 15, 25);
      ctx.camera.lookAt(0, 0, 0);

      // -----------------------------
      // GUI local (lil-gui)
      // -----------------------------

      gui = new GUI({ title: "Reference Frame" });

      gui.add(params, "observer", ["Sun", "Earth"])
        .name("Observer");
    },

    update(_dtSeconds: number, simTimeSeconds: number) {
      // -----------------------------
      // Física heliocéntrica
      // -----------------------------

      const omega = (2 * Math.PI) / EARTH_ORBIT_PERIOD;
      const theta = omega * simTimeSeconds;

      const earthPos = new THREE.Vector3(
        EARTH_ORBIT_RADIUS * Math.cos(theta),
        0,
        EARTH_ORBIT_RADIUS * Math.sin(theta)
      );

      const sunPos = new THREE.Vector3(0, 0, 0);

      // -----------------------------
      // Cambio de sistema de referencia
      // -----------------------------

      if (params.observer === "Sun") {
        // Sistema heliocéntrico
        sun.position.copy(sunPos);
        earth.position.copy(earthPos);
      } else {
        // Sistema geocéntrico
        sun.position.copy(sunPos.clone().sub(earthPos));
        earth.position.set(0, 0, 0);
      }
    },

    dispose() {
      gui?.destroy();
      gui = null;
    },
  };
}
