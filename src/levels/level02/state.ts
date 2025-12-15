import { createStore } from "../../core/store";
import type { Observer } from "./model";

export type Level02State = {
  observer: Observer;
};

export const level02Store = createStore<Level02State>({
  observer: "Sun",
});
