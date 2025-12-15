import * as THREE from "three";
import type { SceneContext, SceneModule } from "../Scene";

/**
 * LEVEL 01 — Sun + Earth
 * ----------------------
 * Modelo heliocéntrico mínimo.
 *
 * Suposiciones:
 *  - Sol fijo en el origen
 *  - Órbita circular
 *  - Plano orbital XZ
 *  - Movimiento circular uniforme
 *
 * Física:
 *   θ(t) = ω t
 *   ω = 2π / T
 *   r(t) = (R cos θ, 0, R sin θ)
 */
export function level01_sun_earth(): SceneModule {
  // =====================================================
  // Estado persistente de la escena (closure)
  // =====================================================

  let scene!: THREE.Scene;
  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let orbitLine!: THREE.Line;

  // =====================================================
  // Constantes físicas y visuales
  // =====================================================

  // Escala: 1 AU = 10 unidades Three.js
  const AU = 10;

  // Radio orbital de la Tierra
  const EARTH_ORBIT_RADIUS = 1 * AU;

  // Período orbital real de la Tierra (segundos)
  const EARTH_ORBIT_PERIOD = 365 * 24 * 3600;

  // =====================================================
  // Utilidades
  // =====================================================

  function createOrbitLine(radius: number, segments = 256): THREE.Line {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * 2 * Math.PI;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(a),
          0,
          radius * Math.sin(a)
        )
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x444444 });

    return new THREE.LineLoop(geometry, material);
  }

  // =====================================================
  // Escena
  // =====================================================

  return {
    name: "Level 01 · Sun + Earth (circular orbit)",

    /**
     * Inicialización (una sola vez)
     */
    init(ctx: SceneContext) {
      scene = ctx.scene;

      // -----------------------------
      // Iluminación
      // -----------------------------

      const sunlight = new THREE.DirectionalLight(0xffffff, 2);
      sunlight.position.set(5, 5, 5);
      scene.add(sunlight);

      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

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
      // Órbita (referencia visual)
      // -----------------------------

      orbitLine = createOrbitLine(EARTH_ORBIT_RADIUS);
      scene.add(orbitLine);

      // -----------------------------
      // Cámara
      // -----------------------------

      ctx.camera.position.set(0, 15, 25);
      ctx.camera.lookAt(0, 0, 0);
    },

    /**
     * Actualización por frame
     */
    update(_dtSeconds: number, simTimeSeconds: number) {
      // Velocidad angular ω
      const omega = (2 * Math.PI) / EARTH_ORBIT_PERIOD;

      // Ángulo orbital θ(t)
      const theta = omega * simTimeSeconds;


      earth.position.x += 0.05;

      // Posición de la Tierra
      earth.position.set(
        EARTH_ORBIT_RADIUS * Math.cos(theta),
        0,
        EARTH_ORBIT_RADIUS * Math.sin(theta)
      );


    },
    

    /**
     * Limpieza al salir del nivel
     */
    dispose() {
      // (más adelante liberaremos geometrías/materiales)
    },
  };
}
