import * as d3 from "d3";

/**
 * Level 02 — 2D view
 * ------------------
 * Representación plana del sistema Sol–Tierra
 * (modelo circular uniforme).
 *
 * Se monta dentro de un contenedor rectangular (panel).
 */
export function createLevel02_2D() {
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let earth: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let vector: d3.Selection<SVGLineElement, unknown, null, undefined>;

  // Escala visual
  const SCALE = 18;

  // Parámetros físicos (idénticos al 3D)
  const EARTH_ORBIT_RADIUS = 10;
  const EARTH_ORBIT_PERIOD = 365 * 24 * 3600; // segundos

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
    g.append("circle")
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
    g.append("text")
      .text("Level 02 · 2D (heliocentric)")
      .attr("x", -width / 2 + 12)
      .attr("y", -height / 2 + 20)
      .attr("fill", "#bbb")
      .attr("font-size", 12)
      .attr("font-family", "system-ui, sans-serif");
  }

  function update(simTimeSeconds: number) {
    const theta =
      (2 * Math.PI * simTimeSeconds) / EARTH_ORBIT_PERIOD;

    const x = EARTH_ORBIT_RADIUS * Math.cos(theta);
    const y = EARTH_ORBIT_RADIUS * Math.sin(theta);

    earth
      .attr("cx", x * SCALE)
      .attr("cy", y * SCALE);

    vector
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x * SCALE)
      .attr("y2", y * SCALE);
  }

  function dispose() {
    svg?.remove();
  }

  return { mount, update, dispose };
}
