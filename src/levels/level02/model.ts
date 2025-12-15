import * as THREE from "three";

export type Observer = "Sun" | "Earth";

export const AU = 10;
export const EARTH_ORBIT_RADIUS = AU;
export const EARTH_ORBIT_PERIOD = 365 * 24 * 3600; // s

export type FrameState = {
  sunPos: THREE.Vector3;
  earthPos: THREE.Vector3;
};

export function heliocentricState(simTimeSeconds: number): FrameState {
  const omega = (2 * Math.PI) / EARTH_ORBIT_PERIOD;
  const theta = omega * simTimeSeconds;

  return {
    sunPos: new THREE.Vector3(0, 0, 0),
    earthPos: new THREE.Vector3(
      EARTH_ORBIT_RADIUS * Math.cos(theta),
      0,
      EARTH_ORBIT_RADIUS * Math.sin(theta)
    ),
  };
}

/** Cambio de referencia: r' = r - r_observer */
export function toObserverFrame(state: FrameState, observer: Observer): FrameState {
  const origin = observer === "Sun" ? state.sunPos : state.earthPos;

  return {
    sunPos: state.sunPos.clone().sub(origin),
    earthPos: state.earthPos.clone().sub(origin),
  };
}

export function referenceFrameState(simTimeSeconds: number, observer: Observer): FrameState {
  const heliocentric = heliocentricState(simTimeSeconds);
  return toObserverFrame(heliocentric, observer);
}
