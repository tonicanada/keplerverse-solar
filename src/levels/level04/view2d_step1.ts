import * as d3 from "d3";
import {
  EARTH_ORBIT_RADIUS,
  MOON_ORBIT_RADIUS,
  circularOrbitPoints,
  systemState,
} from "../level03/model";

type SvgSelection = any;

export function createLevel04Step1View2D() {
  let svg: SvgSelection | null = null;
  let root: SvgSelection | null = null;
  let sun: SvgSelection | null = null;
  let earth: SvgSelection | null = null;
  let moonGroup: SvgSelection | null = null;
  let moonCircle: SvgSelection | null = null;
  let moonArrow: SvgSelection | null = null;
  let earthOrbitGroup: SvgSelection | null = null;
  let moonOrbitGroup: SvgSelection | null = null;
  let label: SvgSelection | null = null;

  const SCALE = 14;
  const MOON_ARROW_LENGTH = 16;
  const MOON_ARROW_BASE_OFFSET = 4;
  const MOON_ARROW_HALF_WIDTH = 4;

  const earthOrbitPoints = circularOrbitPoints(EARTH_ORBIT_RADIUS);
  const moonOrbitPoints = circularOrbitPoints(MOON_ORBIT_RADIUS);

  type OrbitPoint = { x: number; z: number };
  const closedLine = d3.line()
    .x((p: OrbitPoint) => p.x * SCALE)
    .y((p: OrbitPoint) => p.z * SCALE)
    .curve(d3.curveLinearClosed);

  function mount(container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    root = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    root.append("rect")
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none");

    earthOrbitGroup = root.append("g");
    earthOrbitGroup.append("path")
      .attr("d", closedLine(earthOrbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#2266ff")
      .attr("stroke-width", 1.5);

    moonOrbitGroup = root.append("g");
    moonOrbitGroup.append("path")
      .attr("d", closedLine(moonOrbitPoints))
      .attr("fill", "none")
      .attr("stroke", "#aaaaaa")
      .attr("stroke-width", 1);

    sun = root.append("circle")
      .attr("r", 6)
      .attr("fill", "#ffd54a");

    earth = root.append("circle")
      .attr("r", 4)
      .attr("fill", "#4aa3ff");

    moonGroup = root.append("g");
    moonArrow = moonGroup.append("path")
      .attr("fill", "#ffaa00")
      .attr("stroke", "none");
    moonCircle = moonGroup.append("circle")
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
    if (!root) return;

    const state = systemState(simTimeSeconds);

    const sunX = state.sunPos.x * SCALE;
    const sunY = state.sunPos.z * SCALE;
    const earthX = state.earthPos.x * SCALE;
    const earthY = state.earthPos.z * SCALE;
    const moonX = state.moonPos.x * SCALE;
    const moonY = state.moonPos.z * SCALE;

    sun?.attr("cx", sunX).attr("cy", sunY);
    earth?.attr("cx", earthX).attr("cy", earthY);
    moonCircle?.attr("cx", 0).attr("cy", 0);

    earthOrbitGroup?.attr("transform", "translate(0,0)");

    moonOrbitGroup
      ?.attr("transform", `translate(${earthX},${earthY})`);

    moonGroup
      ?.attr("transform", `translate(${moonX},${moonY})`);

    if (moonArrow) {
      const dirX = (state.earthPos.x - state.moonPos.x) * SCALE;
      const dirY = (state.earthPos.z - state.moonPos.z) * SCALE;
      const len = Math.hypot(dirX, dirY) || 1;
      const ndx = dirX / len;
      const ndy = dirY / len;

      const baseCenterX = ndx * MOON_ARROW_BASE_OFFSET;
      const baseCenterY = ndy * MOON_ARROW_BASE_OFFSET;
      const perpX = -ndy;
      const perpY = ndx;

      const leftX = baseCenterX + perpX * MOON_ARROW_HALF_WIDTH;
      const leftY = baseCenterY + perpY * MOON_ARROW_HALF_WIDTH;
      const rightX = baseCenterX - perpX * MOON_ARROW_HALF_WIDTH;
      const rightY = baseCenterY - perpY * MOON_ARROW_HALF_WIDTH;
      const tipX = ndx * MOON_ARROW_LENGTH;
      const tipY = ndy * MOON_ARROW_LENGTH;

      moonArrow.attr("d", `M ${leftX} ${leftY} L ${rightX} ${rightY} L ${tipX} ${tipY} Z`);
    }

    label?.text("Level 04 · Step 1 (Sun frame)");
  }

  function dispose() {
    svg?.remove();
    svg = null;
    root = null;
    sun = null;
    earth = null;
    moonGroup = null;
    moonCircle = null;
    moonArrow = null;
    earthOrbitGroup = null;
    moonOrbitGroup = null;
    label = null;
  }

  return { mount, update, dispose };
}
