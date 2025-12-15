import * as THREE from "three";

export type Observer = "Sun" | "Earth" | "Moon";

export const AU = 10;

export const EARTH_ORBIT_RADIUS = 1 * AU;
export const EARTH_ORBIT_PERIOD = 365 * 24 * 3600;

export const MOON_ORBIT_RADIUS = 0.2 * AU;
export const MOON_ORBIT_PERIOD = 27.3 * 24 * 3600;

export type SystemState = {
  sunPos: THREE.Vector3;
  earthPos: THREE.Vector3;
  moonPos: THREE.Vector3;
};

export function systemState(simTimeSeconds: number): SystemState {
  const thetaEarth = (2 * Math.PI * simTimeSeconds) / EARTH_ORBIT_PERIOD;
  const thetaMoon = (2 * Math.PI * simTimeSeconds) / MOON_ORBIT_PERIOD;

  const sunPos = new THREE.Vector3(0, 0, 0);
  const earthPos = new THREE.Vector3(
    EARTH_ORBIT_RADIUS * Math.cos(thetaEarth),
    0,
    EARTH_ORBIT_RADIUS * Math.sin(thetaEarth)
  );

  const moonOffset = new THREE.Vector3(
    MOON_ORBIT_RADIUS * Math.cos(thetaMoon),
    0,
    MOON_ORBIT_RADIUS * Math.sin(thetaMoon)
  );

  const moonPos = earthPos.clone().add(moonOffset);

  return { sunPos, earthPos, moonPos };
}

export function toObserverFrame(state: SystemState, observer: Observer): SystemState {
  let origin = state.sunPos;
  if (observer === "Earth") origin = state.earthPos;
  if (observer === "Moon") origin = state.moonPos;

  return {
    sunPos: state.sunPos.clone().sub(origin),
    earthPos: state.earthPos.clone().sub(origin),
    moonPos: state.moonPos.clone().sub(origin),
  };
}

export function observerFrameState(simTimeSeconds: number, observer: Observer): SystemState {
  return toObserverFrame(systemState(simTimeSeconds), observer);
}

export function circularOrbitPoints(radius: number, segments = 512): THREE.Vector3[] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * 2 * Math.PI;
    return new THREE.Vector3(
      radius * Math.cos(angle),
      0,
      radius * Math.sin(angle)
    );
  });
}

export function sunEpicyclePoints(segments = 512): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI;

    const earth = new THREE.Vector3(
      EARTH_ORBIT_RADIUS * Math.cos(t),
      0,
      EARTH_ORBIT_RADIUS * Math.sin(t)
    );

    const moon = new THREE.Vector3(
      MOON_ORBIT_RADIUS * Math.cos((EARTH_ORBIT_PERIOD / MOON_ORBIT_PERIOD) * t),
      0,
      MOON_ORBIT_RADIUS * Math.sin((EARTH_ORBIT_PERIOD / MOON_ORBIT_PERIOD) * t)
    );

    points.push(earth.clone().add(moon).multiplyScalar(-1));
  }

  return points;
}
