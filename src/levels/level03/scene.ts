import type { SceneContext, SceneModule } from "../Scene";
import { createLevel03View3D } from "./view3d";

/**
 * LEVEL 03 — Sun · Earth · Moon
 * -----------------------------
 * Órbitas y trayectorias dependientes del observador.
 *
 * - Sol: órbitas reales
 * - Tierra: órbitas aparentes
 * - Luna: epiciclo del Sol
 */
export function level03_sun_earth_moon(): SceneModule {
  const view3d = createLevel03View3D();

  return {
    name: "Level 03 · Orbits & Epicycles",

    init(ctx: SceneContext) {
      view3d.init(ctx);
    },

    update(_dt: number, t: number) {
      view3d.update(t);
    },

    dispose() {
      view3d.dispose();
    },
  };
}
