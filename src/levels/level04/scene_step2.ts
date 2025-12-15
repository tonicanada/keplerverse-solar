import * as THREE from "three";
import GUI from "lil-gui";
import type { SceneContext, SceneModule } from "../Scene";
import type { Level04Step2LookAt, Level04Step2State } from "./state_step2";
import { level04Step2Store } from "./state_step2";

/**
 * LEVEL 04 — Lunar Surface (Step 2)
 * --------------------------------
 * Observador en la superficie lunar + suelo (plano tangente).
 *
 * Arreglo clave:
 * - El observador se define respecto a la dirección hacia la Tierra,
 *   no con el mismo ángulo orbital.
 *
 * MEJORA VISUAL:
 * - Clipping plane: la Tierra se "corta" por el plano del horizonte local,
 *   así queda detrás del suelo y no se ve "montada" delante.
 */
export function level04_lunar_surface_step2(): SceneModule {
  let scene!: THREE.Scene;
  let camera!: THREE.PerspectiveCamera;
  let renderer!: THREE.WebGLRenderer;

  let sun!: THREE.Mesh;
  let earth!: THREE.Mesh;
  let moon!: THREE.Mesh;
  let ground!: THREE.Mesh;

  let gui: GUI | null = null;

  // Escalas / periodos (modelo didáctico circular)
  const AU = 10;

  const EARTH_ORBIT_RADIUS = 1 * AU;
  const EARTH_ORBIT_PERIOD = 365 * 24 * 3600;

  const MOON_ORBIT_RADIUS = 0.2 * AU;
  const MOON_ORBIT_PERIOD = 27.3 * 24 * 3600;

  const MOON_RADIUS = 0.15;

  // ✅ Defaults como tu captura
  const params: Level04Step2State = { ...level04Step2Store.get() };

  // Vectores reutilizados
  const sunPos = new THREE.Vector3();
  const earthPos = new THREE.Vector3();
  const moonPos = new THREE.Vector3();
  const moonRelEarth = new THREE.Vector3();

  const toEarthFromMoon = new THREE.Vector3();
  const east = new THREE.Vector3();
  const north = new THREE.Vector3();

  const observerLocal = new THREE.Vector3();
  const observerWorld = new THREE.Vector3();
  const up = new THREE.Vector3();

  const cameraPos = new THREE.Vector3();
  const toEarth = new THREE.Vector3();
  const toSun = new THREE.Vector3();

  const lookDir = new THREE.Vector3();
  const quat = new THREE.Quaternion();

  const WORLD_UP = new THREE.Vector3(0, 1, 0);

  // --- Clipping para que la Tierra quede detrás del horizonte ---
  const horizonPlane = new THREE.Plane();        // plano (normal=up) pasando por el suelo local
  const planePoint = new THREE.Vector3();        // punto coplanar reutilizable
  let earthMat!: THREE.MeshStandardMaterial;     // material de la Tierra

  function safeNormalize(v: THREE.Vector3, fallback: THREE.Vector3) {
    const len = v.length();
    if (len < 1e-9) return v.copy(fallback);
    return v.multiplyScalar(1 / len);
  }

  return {
    name: "Level 04 · Lunar Surface (Step 2)",

    init(ctx: SceneContext) {
      scene = ctx.scene;
      camera = ctx.camera;
      renderer = ctx.renderer;

      // ✅ necesario para que funcionen clippingPlanes
      renderer.localClippingEnabled = true;

      // Iluminación para los astros (el suelo no usa luces)
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));
      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(5, 5, 5);
      scene.add(light);

      // Astros (tamaños "grandes" como te gustan)
      sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.MeshStandardMaterial({
          emissive: 0xffff00,
          emissiveIntensity: 1,
        })
      );

      earthMat = new THREE.MeshStandardMaterial({ color: 0x2266ff });
      // ✅ clipping: corta la Tierra por el plano del horizonte local
      earthMat.clippingPlanes = [horizonPlane];
      earthMat.clipIntersection = false;
      earthMat.needsUpdate = true;

      earth = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        earthMat
      );

      moon = new THREE.Mesh(
        new THREE.SphereGeometry(MOON_RADIUS, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
      );

      scene.add(sun, earth, moon);

      // Suelo sin degradados (ignora luces)
      ground = new THREE.Mesh(
        new THREE.PlaneGeometry(params.groundSize, params.groundSize),
        new THREE.MeshBasicMaterial({
          color: 0x666666,
          side: THREE.DoubleSide,
        })
      );
      scene.add(ground);

      // GUI (con defaults ya fijados)
      gui = new GUI({ title: "Lunar Surface · Step 2" });
      gui.add(params, "lookAt", ["Horizon", "Earth", "Sun", "Zenith"])
        .name("Look at")
        .onChange((value: Level04Step2LookAt) => level04Step2Store.set({ lookAt: value }));
      gui.add(params, "tiltUp", 0, 0.8, 0.01)
        .name("Tilt up")
        .onChange((value: number) => level04Step2Store.set({ tiltUp: value }));
      gui.add(params, "earthBias", 0, 1, 0.01)
        .name("Earth bias")
        .onChange((value: number) => level04Step2Store.set({ earthBias: value }));
      gui.add(params, "eyeHeight", 0.0, 0.2, 0.001)
        .name("Eye height")
        .onChange((value: number) => level04Step2Store.set({ eyeHeight: value }));
      gui.add(params, "longitudeDeg", 0, 360, 1)
        .name("Longitude °")
        .onChange((value: number) => level04Step2Store.set({ longitudeDeg: value }));

      level04Step2Store.set(params);

      camera.position.set(0, 5, 15);
      camera.lookAt(0, 0, 0);
    },

    update(_dtSeconds: number, simTimeSeconds: number) {
      // ---------------------------
      // Órbitas (modelo circular)
      // ---------------------------
      sunPos.set(0, 0, 0);

      const thetaEarth = (2 * Math.PI * simTimeSeconds) / EARTH_ORBIT_PERIOD;
      earthPos.set(
        EARTH_ORBIT_RADIUS * Math.cos(thetaEarth),
        0,
        EARTH_ORBIT_RADIUS * Math.sin(thetaEarth)
      );

      const thetaMoon = (2 * Math.PI * simTimeSeconds) / MOON_ORBIT_PERIOD;
      moonRelEarth.set(
        MOON_ORBIT_RADIUS * Math.cos(thetaMoon),
        0,
        MOON_ORBIT_RADIUS * Math.sin(thetaMoon)
      );

      moonPos.copy(earthPos).add(moonRelEarth);

      sun.position.copy(sunPos);
      earth.position.copy(earthPos);
      moon.position.copy(moonPos);

      // ---------------------------
      // Base local en la Luna
      // ---------------------------
      toEarthFromMoon.copy(earthPos).sub(moonPos);
      safeNormalize(toEarthFromMoon, new THREE.Vector3(1, 0, 0));

      east.copy(WORLD_UP).cross(toEarthFromMoon);
      safeNormalize(east, new THREE.Vector3(0, 0, 1));

      north.copy(toEarthFromMoon).cross(east);
      safeNormalize(north, new THREE.Vector3(0, 1, 0));

      // ---------------------------
      // Observador en superficie lunar
      // observerLocal = R*(cos lon * toEarthFromMoon + sin lon * east)
      // ---------------------------
      const lon = THREE.MathUtils.degToRad(params.longitudeDeg);

      observerLocal
        .copy(toEarthFromMoon)
        .multiplyScalar(Math.cos(lon))
        .addScaledVector(east, Math.sin(lon))
        .multiplyScalar(MOON_RADIUS);

      observerWorld.copy(moonPos).add(observerLocal);
      up.copy(observerLocal).normalize();

      // ---------------------------
      // Suelo (plano tangente)
      // ---------------------------
      ground.position.copy(observerWorld).addScaledVector(up, -params.eyeHeight);
      quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), up);
      ground.quaternion.copy(quat);

      // ---------------------------
      // ✅ Clipping plane del horizonte local
      // Plano con normal = up y pasando por el suelo local
      // Todo lo que quede "bajo" este plano se recorta (incluida la Tierra)
      // ---------------------------
      planePoint.copy(ground.position);
      horizonPlane.setFromNormalAndCoplanarPoint(up, planePoint);

      // ---------------------------
      // Cámara
      // ---------------------------
      cameraPos.copy(observerWorld).addScaledVector(up, params.eyeHeight);
      camera.position.copy(cameraPos);
      camera.up.copy(up);

      toEarth.copy(earthPos).sub(cameraPos).normalize();
      toSun.copy(sunPos).sub(cameraPos).normalize();

      if (params.lookAt === "Earth") {
        lookDir.copy(toEarth);
      } else if (params.lookAt === "Sun") {
        lookDir.copy(toSun);
      } else if (params.lookAt === "Zenith") {
        lookDir.copy(up);
      } else {
        // "Horizon": usamos east como dirección base y mezclamos hacia Tierra
        lookDir.copy(east);

        lookDir
          .multiplyScalar(1 - params.earthBias)
          .addScaledVector(toEarth, params.earthBias)
          .normalize();
      }

      // levantar un poco por encima del horizonte
      lookDir.addScaledVector(up, params.tiltUp).normalize();

      camera.lookAt(cameraPos.clone().add(lookDir));
    },

    dispose() {
      gui?.destroy();
      gui = null;
    },
  };
}
