import * as d3 from "d3";
import type { Observer } from "./model";
import {
  EARTH_ORBIT_RADIUS,
  MOON_ORBIT_RADIUS,
  circularOrbitPoints,
  observerFrameState,
  sunEpicyclePoints,
} from "./model";
import { level03Store } from "./state";

type SvgSelection = any;

export function createLevel03View2D() {
  let svg: SvgSelection | null = null;
  let root: SvgSelection | null = null;
  let sun: SvgSelection | null = null;
  let earth: SvgSelection | null = null;
  let moon: SvgSelection | null = null;
  let sunOrbitGroup: SvgSelection | null = null;
  let earthOrbitGroup: SvgSelection | null = null;
  let earthOrbitPath: SvgSelection | null = null;
  let moonOrbitGroup: SvgSelection | null = null;
  let sunEpicycleGroup: SvgSelection | null = null;
  let label: SvgSelection | null = null;

  const SCALE = 14;

  const orbitPoints = circularOrbitPoints(EARTH_ORBIT_RADIUS);
  const moonCentricOrbitPoints = circularOrbitPoints(MOON_ORBIT_RADIUS);
  const moonOrbitPoints = circularOrbitPoints(MOON_ORBIT_RADIUS);
  const epicyclePoints = sunEpicyclePoints();

  type OrbitPoint = { x: number; z: number };
  const closedLine = d3.line()
    .x((p: OrbitPoint) => p.x * SCALE)
    .y((p: OrbitPoint) => p.z * SCALE)
    .curve(d3.curveLinearClosed);

  let observer: Observer = level03Store.get().observer;
  let lastSimTime: number | null = null;
  let unsubscribe: (() => void) | null = level03Store.subscribe(state => {
    observer = state.observer;
    if (lastSimTime !== null) update(lastSimTime);
  });

  function mount(container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    root = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Background
    root.append("rect")
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none");

    sunOrbitGroup = root.append("g");
    sunOrbitGroup.append("path")
      .attr("d", closedLine(orbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#f6c344")
      .attr("stroke-width", 1.25);

    earthOrbitGroup = root.append("g");
    earthOrbitPath = earthOrbitGroup.append("path")
      .attr("d", closedLine(orbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#2266ff")
      .attr("stroke-width", 1.5);

    moonOrbitGroup = root.append("g");
    moonOrbitGroup.append("path")
      .attr("d", closedLine(moonOrbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#aaaaaa")
      .attr("stroke-width", 1);

    sunEpicycleGroup = root.append("g");
    sunEpicycleGroup.append("path")
      .attr("d", closedLine(epicyclePoints))
      .attr("fill", "none")
      .attr("stroke", "#ffaa00")
      .attr("stroke-width", 1);

    sun = root.append("circle")
      .attr("r", 6)
      .attr("fill", "#ffd54a");

    earth = root.append("circle")
      .attr("r", 4)
      .attr("fill", "#4aa3ff");

    moon = root.append("circle")
      .attr("r", 3)
      .attr("fill", "#bbbbbb");

    label = root.append("text")
      .attr("x", -width / 2 + 12)
      .attr("y", -height / 2 + 20)
      .attr("fill", "#bbb")
      .attr("font-size", 12)
      .attr("font-family", "system-ui, sans-serif");
  }

  function update(simTimeSeconds: number) {
    lastSimTime = simTimeSeconds;
    if (!root) return;

    const frame = observerFrameState(simTimeSeconds, observer);

    sun?.attr("cx", frame.sunPos.x * SCALE)
      .attr("cy", frame.sunPos.z * SCALE);

    earth?.attr("cx", frame.earthPos.x * SCALE)
      .attr("cy", frame.earthPos.z * SCALE);

    moon?.attr("cx", frame.moonPos.x * SCALE)
      .attr("cy", frame.moonPos.z * SCALE);

    const isEarthObserver = observer === "Earth";
    const isMoonObserver = observer === "Moon";

    if (sunOrbitGroup) {
      sunOrbitGroup.attr("display", isEarthObserver ? null : "none");
    }

    if (earthOrbitGroup) {
      if (isEarthObserver) {
        earthOrbitGroup.attr("display", "none");
      } else {
        const earthOrbitPoints = isMoonObserver ? moonCentricOrbitPoints : orbitPoints;
        earthOrbitPath?.attr("d", closedLine(earthOrbitPoints));

        const translateX = isMoonObserver ? 0 : frame.sunPos.x * SCALE;
        const translateY = isMoonObserver ? 0 : frame.sunPos.z * SCALE;

        earthOrbitGroup
          .attr("display", null)
          .attr("transform", `translate(${translateX},${translateY})`);
      }
    }

    if (moonOrbitGroup) {
      moonOrbitGroup
        .attr("display", isMoonObserver ? "none" : null)
        .attr("transform", `translate(${frame.earthPos.x * SCALE},${frame.earthPos.z * SCALE})`);
    }

    sunEpicycleGroup
      ?.attr("display", isMoonObserver ? null : "none");

    label?.text(`Level 03 · 2D (${observer} frame)`);
  }

  function dispose() {
    svg?.remove();
    svg = null;
    root = null;
    sun = null;
    earth = null;
    moon = null;
    earthOrbitGroup = null;
    moonOrbitGroup = null;
    sunOrbitGroup = null;
    sunEpicycleGroup = null;
    label = null;
    unsubscribe?.();
    unsubscribe = null;
  }

  return { mount, update, dispose };
}
