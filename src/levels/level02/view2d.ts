import * as d3 from "d3";
import type { Observer } from "./model";
import { EARTH_ORBIT_RADIUS, referenceFrameState } from "./model";
import { level02Store } from "./state";

/**
 * Level 02 — 2D view
 * ------------------
 * Representación plana del sistema Sol–Tierra
 * (modelo circular uniforme).
 *
 * Se monta dentro de un contenedor rectangular (panel).
 */
export function createLevel02_2D() {
  let svg: any;
  let g: any;
  let sun: any;
  let earth: any;
  let vector: any;
  let label: any;

  // Escala visual
  const SCALE = 18;

  let observer: Observer = level02Store.get().observer;
  let unsubscribe: (() => void) | null = null;

  unsubscribe = level02Store.subscribe(state => {
    observer = state.observer;
  });

  function mount(container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Fondo (opcional, sutil)
    g.append("rect")
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none");

    // Órbita
    g.append("circle")
      .attr("r", EARTH_ORBIT_RADIUS * SCALE)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    // Sol
    sun = g.append("circle")
      .attr("r", 6)
      .attr("fill", "#ffd54a");

    // Tierra
    earth = g.append("circle")
      .attr("r", 4)
      .attr("fill", "#4aa3ff");

    // Vector posición r(t)
    vector = g.append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1);

    // Etiqueta
    label = g.append("text")
      .text("Level 02 · 2D")
      .attr("x", -width / 2 + 12)
      .attr("y", -height / 2 + 20)
      .attr("fill", "#bbb")
      .attr("font-size", 12)
      .attr("font-family", "system-ui, sans-serif");
  }

  function update(simTimeSeconds: number) {
    const frame = referenceFrameState(simTimeSeconds, observer);
    const sunPos = frame.sunPos;
    const earthPos = frame.earthPos;

    const sunX = sunPos.x * SCALE;
    const sunY = sunPos.z * SCALE;
    const earthX = earthPos.x * SCALE;
    const earthY = earthPos.z * SCALE;

    sun?.attr("cx", sunX).attr("cy", sunY);
    earth?.attr("cx", earthX).attr("cy", earthY);

    const origin = observer === "Sun" ? sunPos : earthPos;
    const target = observer === "Sun" ? earthPos : sunPos;

    vector
      .attr("x1", origin.x * SCALE)
      .attr("y1", origin.z * SCALE)
      .attr("x2", target.x * SCALE)
      .attr("y2", target.z * SCALE);

    label?.text(`Level 02 · 2D (${observer} frame)`);
  }

  function dispose() {
    svg?.remove();
    unsubscribe?.();
    unsubscribe = null;
  }

  return { mount, update, dispose };
}
