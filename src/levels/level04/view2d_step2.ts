import * as d3 from "d3";
import * as THREE from "three";
import {
  EARTH_ORBIT_RADIUS,
  MOON_ORBIT_RADIUS,
  circularOrbitPoints,
  systemState,
} from "../level03/model";
import { level04Step2Store } from "./state_step2";

type SvgSelection = any;

const SCALE = 14;
const MOON_RADIUS = 0.15;
const PANEL_GAP = 16;
const OVERVIEW_PADDING = 0.85;
const DETAIL_SCALE_RATIO = 0.65;
const OBSERVER_MARKER_RADIUS = 0.01;
const CAMERA_MARKER_RADIUS = 0.012;
const HEIGHT_ARROW_WIDTH_PX = 3;
const LOOK_ARROW_LENGTH_PX = 55;
const LOOK_ARROW_BASE_OFFSET_PX = 10;
const LOOK_ARROW_HALF_WIDTH_PX = 6;

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export function createLevel04Step2View2D() {
  let svg: SvgSelection | null = null;

  let overviewRoot: SvgSelection | null = null;
  let overviewLabel: SvgSelection | null = null;
  let sun: SvgSelection | null = null;
  let earth: SvgSelection | null = null;
  let moonMarker: SvgSelection | null = null;
  let moonOrbitGroup: SvgSelection | null = null;

  let detailRoot: SvgSelection | null = null;
  let moonDetailCircle: SvgSelection | null = null;
  let observerMarker: SvgSelection | null = null;
  let cameraMarker: SvgSelection | null = null;
  let heightConnector: SvgSelection | null = null;
  let lookArrowPath: SvgSelection | null = null;

  let latitudeZeroPoint: SvgSelection | null = null;
  let earthArrow: SvgSelection | null = null;

  const earthOrbitPoints = circularOrbitPoints(EARTH_ORBIT_RADIUS);
  const moonOrbitPoints = circularOrbitPoints(MOON_ORBIT_RADIUS);

  type OrbitPoint = { x: number; z: number };
  const closedLine = d3
    .line()
    .x((p: OrbitPoint) => p.x * SCALE)
    .y((p: OrbitPoint) => p.z * SCALE)
    .curve(d3.curveLinearClosed);

  let panelSize = 0;
  let detailScale = 1;

  function mount(container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();
    const availableHeight = Math.max(height, 1);
    panelSize = Math.min(width, (availableHeight - PANEL_GAP) / 2);
    const actualHeight = panelSize * 2 + PANEL_GAP;

    svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", actualHeight);

    const centerX = width / 2;
    const topCenterY = panelSize / 2;
    const bottomCenterY = panelSize + PANEL_GAP + panelSize / 2;

    const overviewScale = Math.min(
      1,
      (panelSize * OVERVIEW_PADDING) / (EARTH_ORBIT_RADIUS * 2 * SCALE)
    );
    detailScale = (panelSize * DETAIL_SCALE_RATIO) / (MOON_RADIUS * 2);

    const detailPanel = svg
      .append("g")
      .attr("transform", `translate(${centerX},${topCenterY})`);

    detailPanel
      .append("rect")
      .attr("x", -panelSize / 2)
      .attr("y", -panelSize / 2)
      .attr("width", panelSize)
      .attr("height", panelSize)
      .attr("fill", "none");

    detailPanel
      .append("text")
      .attr("x", -panelSize / 2 + 12)
      .attr("y", -panelSize / 2 + 20)
      .attr("fill", "#999")
      .attr("font-size", 11)
      .attr("font-family", "system-ui, sans-serif")
      .text("Moon surface · zoom");

    detailRoot = detailPanel
      .append("g")
      .attr("transform", `scale(${detailScale})`);

    moonDetailCircle = detailRoot
      .append("circle")
      .attr("fill", "#333")
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .attr("vector-effect", "non-scaling-stroke");

    heightConnector = detailRoot
      .append("line")
      .attr("stroke", "#ffaa33")
      .attr("stroke-width", HEIGHT_ARROW_WIDTH_PX)
      .attr("vector-effect", "non-scaling-stroke");

    observerMarker = detailRoot
      .append("circle")
      .attr("fill", "#ffaa33")
      .attr("r", OBSERVER_MARKER_RADIUS);

    cameraMarker = detailRoot
      .append("circle")
      .attr("fill", "#ffd54a")
      .attr("r", CAMERA_MARKER_RADIUS);

    lookArrowPath = detailRoot
      .append("path")
      .attr("fill", "#ffaa33")
      .attr("stroke", "none");

    latitudeZeroPoint = detailRoot
      .append("circle")
      .attr("r", 0.01)
      .attr("fill", "#ffffff");

    // 🔴 Flecha delgada hacia la Tierra (PASO 4)
    earthArrow = detailRoot
      .append("path")
      .attr("fill", "#ffffff")
      .attr("opacity", 0.85);

    const overviewPanel = svg
      .append("g")
      .attr("transform", `translate(${centerX},${bottomCenterY})`);

    overviewPanel
      .append("rect")
      .attr("x", -panelSize / 2)
      .attr("y", -panelSize / 2)
      .attr("width", panelSize)
      .attr("height", panelSize)
      .attr("fill", "none");

    overviewLabel = overviewPanel
      .append("text")
      .attr("x", -panelSize / 2 + 12)
      .attr("y", -panelSize / 2 + 20)
      .attr("fill", "#bbb")
      .attr("font-size", 12)
      .attr("font-family", "system-ui, sans-serif");

    overviewRoot = overviewPanel
      .append("g")
      .attr("transform", `scale(${overviewScale})`);

    overviewRoot
      .append("path")
      .attr("d", closedLine(earthOrbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#2266ff")
      .attr("stroke-width", 1.25);

    moonOrbitGroup = overviewRoot.append("g");
    moonOrbitGroup
      .append("path")
      .attr("d", closedLine(moonOrbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#aaaaaa")
      .attr("stroke-width", 1);

    sun = overviewRoot.append("circle").attr("r", 6).attr("fill", "#ffd54a");

    earth = overviewRoot.append("circle").attr("r", 4).attr("fill", "#4aa3ff");

    moonMarker = overviewRoot
      .append("circle")
      .attr("r", 4)
      .attr("fill", "#bbbbbb");
  }

  function update(simTimeSeconds: number) {
    if (!overviewRoot || !detailRoot) return;

    const params = level04Step2Store.get();
    const state = systemState(simTimeSeconds);

    const sunX = state.sunPos.x * SCALE;
    const sunY = state.sunPos.z * SCALE;
    const earthX = state.earthPos.x * SCALE;
    const earthY = state.earthPos.z * SCALE;
    const moonX = state.moonPos.x * SCALE;
    const moonY = state.moonPos.z * SCALE;

    sun?.attr("cx", sunX).attr("cy", sunY);
    earth?.attr("cx", earthX).attr("cy", earthY);
    moonMarker?.attr("cx", moonX).attr("cy", moonY);

    moonOrbitGroup?.attr("transform", `translate(${earthX},${earthY})`);

    const toEarthFromMoon = state.earthPos.clone().sub(state.moonPos);
    const toEarthDir = safeNormalize(
      toEarthFromMoon.clone(),
      new THREE.Vector3(1, 0, 0)
    );

    const east = safeNormalize(
      WORLD_UP.clone().cross(toEarthDir),
      new THREE.Vector3(0, 0, 1)
    );
    const lon = THREE.MathUtils.degToRad(params.longitudeDeg);

    const observerLocal = toEarthDir
      .clone()
      .multiplyScalar(Math.cos(lon))
      .addScaledVector(east, Math.sin(lon))
      .multiplyScalar(MOON_RADIUS);

    const observerWorld = state.moonPos.clone().add(observerLocal);
    const up = safeNormalize(observerLocal.clone(), new THREE.Vector3(1, 0, 0));

    const cameraPos = observerWorld
      .clone()
      .addScaledVector(up, params.eyeHeight);

    const toEarth = safeNormalize(
      state.earthPos.clone().sub(cameraPos),
      toEarthDir.clone()
    );
    const toSun = safeNormalize(
      state.sunPos.clone().sub(cameraPos),
      new THREE.Vector3(-1, 0, 0)
    );

    const lookDir = new THREE.Vector3();
    if (params.lookAt === "Earth") {
      lookDir.copy(toEarth);
    } else if (params.lookAt === "Sun") {
      lookDir.copy(toSun);
    } else if (params.lookAt === "Zenith") {
      lookDir.copy(up);
    } else {
      lookDir
        .copy(east)
        .multiplyScalar(1 - params.earthBias)
        .addScaledVector(toEarth, params.earthBias)
        .normalize();
    }
    lookDir.addScaledVector(up, params.tiltUp).normalize();

    moonDetailCircle?.attr("r", MOON_RADIUS);

    const observerPoint = { x: observerLocal.x, y: observerLocal.z };
    const cameraRadius = MOON_RADIUS + params.eyeHeight;
    const cameraPoint = { x: up.x * cameraRadius, y: up.z * cameraRadius };

    observerMarker?.attr("cx", observerPoint.x).attr("cy", observerPoint.y);

    cameraMarker?.attr("cx", cameraPoint.x).attr("cy", cameraPoint.y);

    heightConnector
      ?.attr("x1", observerPoint.x)
      .attr("y1", observerPoint.y)
      .attr("x2", cameraPoint.x)
      .attr("y2", cameraPoint.y);

    const lookDirFlat = new THREE.Vector3(lookDir.x, 0, lookDir.z);
    safeNormalize(lookDirFlat, new THREE.Vector3(1, 0, 0));

    const arrowLength = LOOK_ARROW_LENGTH_PX / detailScale;
    const arrowBaseOffset = LOOK_ARROW_BASE_OFFSET_PX / detailScale;
    const arrowHalfWidth = LOOK_ARROW_HALF_WIDTH_PX / detailScale;

    const tip = {
      x: cameraPoint.x + lookDirFlat.x * arrowLength,
      y: cameraPoint.y + lookDirFlat.z * arrowLength,
    };

    const baseCenter = {
      x: cameraPoint.x + lookDirFlat.x * arrowBaseOffset,
      y: cameraPoint.y + lookDirFlat.z * arrowBaseOffset,
    };

    const perp = { x: -lookDirFlat.z, y: lookDirFlat.x };

    const left = {
      x: baseCenter.x + perp.x * arrowHalfWidth,
      y: baseCenter.y + perp.y * arrowHalfWidth,
    };

    const right = {
      x: baseCenter.x - perp.x * arrowHalfWidth,
      y: baseCenter.y - perp.y * arrowHalfWidth,
    };

    const earthSurfacePoint = toEarthDir.clone().multiplyScalar(MOON_RADIUS);

    latitudeZeroPoint?.attr("cx", earthSurfacePoint.x).attr("cy", earthSurfacePoint.z);

    // --------------------------------------------------
    // Flecha fina desde el punto sub-Tierra hacia la Tierra
    // --------------------------------------------------

    const ARROW_LENGTH = 0.05; // corta
    const ARROW_HALF_WIDTH = 0.006; // muy fina

    // Dirección 2D (plano XZ)
    const earthDir2D = {
      x: toEarthDir.x,
      y: toEarthDir.z,
    };

    // Punta de la flecha
    const earthTip = {
      x: earthSurfacePoint.x + earthDir2D.x * ARROW_LENGTH,
      y: earthSurfacePoint.z + earthDir2D.y * ARROW_LENGTH,
    };

    // Perpendicular en el plano
    const earthPerp = {
      x: -earthDir2D.y,
      y: earthDir2D.x,
    };

    // Base de la flecha (dos puntos)
    const earthLeft = {
      x: earthSurfacePoint.x + earthPerp.x * ARROW_HALF_WIDTH,
      y: earthSurfacePoint.z + earthPerp.y * ARROW_HALF_WIDTH,
    };

    const earthRight = {
      x: earthSurfacePoint.x - earthPerp.x * ARROW_HALF_WIDTH,
      y: earthSurfacePoint.z - earthPerp.y * ARROW_HALF_WIDTH,
    };

    earthArrow?.attr(
      "d",
      `M ${earthLeft.x} ${earthLeft.y}
   L ${earthRight.x} ${earthRight.y}
   L ${earthTip.x} ${earthTip.y} Z`
    );

    lookArrowPath?.attr(
      "d",
      `M ${left.x} ${left.y} L ${right.x} ${right.y} L ${tip.x} ${tip.y} Z`
    );

    overviewLabel?.text("Level 04 · Step 2 (Sun frame)");
  }

  function dispose() {
    svg?.remove();
    svg = null;
    overviewRoot = null;
    overviewLabel = null;
    sun = null;
    earth = null;
    moonMarker = null;
    moonOrbitGroup = null;
    detailRoot = null;
    moonDetailCircle = null;
    observerMarker = null;
    cameraMarker = null;
    heightConnector = null;
    lookArrowPath = null;
    earthArrow = null
  }

  return { mount, update, dispose };
}

function safeNormalize(vec: THREE.Vector3, fallback: THREE.Vector3) {
  if (vec.lengthSq() < 1e-10) {
    return vec.copy(fallback).normalize();
  }
  return vec.normalize();
}
