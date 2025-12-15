import { createStore } from "../../core/store";
import type { Observer } from "./model";

export type Level03State = {
  observer: Observer;
};

export const level03Store = createStore<Level03State>({
  observer: "Sun",
});
