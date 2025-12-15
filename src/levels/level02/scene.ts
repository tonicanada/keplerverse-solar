import type { SceneContext, SceneModule } from "../Scene";
import { createLevel02View3D } from "./view3d";

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
  const view3d = createLevel02View3D();

  return {
    name: "Level 02 · Reference Frames",

    init(ctx: SceneContext) {
      view3d.init(ctx);
    },

    update(_dtSeconds: number, simTimeSeconds: number) {
      view3d.update(simTimeSeconds);
    },

    dispose() {
      view3d.dispose();
    },
  };
}
