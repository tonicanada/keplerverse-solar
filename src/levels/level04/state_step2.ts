import { createStore } from "../../core/store";

export type Level04Step2LookAt = "Horizon" | "Earth" | "Sun" | "Zenith";

export type Level04Step2State = {
  lookAt: Level04Step2LookAt;
  eyeHeight: number;
  groundSize: number;
  tiltUp: number;
  earthBias: number;
  longitudeDeg: number;
};

export const level04Step2Store = createStore<Level04Step2State>({
  lookAt: "Horizon",
  eyeHeight: 0.001,
  groundSize: 200,
  tiltUp: 0.12,
  earthBias: 0.68,
  longitudeDeg: 94,
});
