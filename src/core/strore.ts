export type Unsubscribe = () => void;

export function createStore<T extends object>(initial: T) {
  let state = { ...initial };
  const listeners = new Set<(s: T) => void>();

  return {
    getState: () => state,
    setState: (patch: Partial<T>) => {
      state = { ...state, ...patch };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn: (s: T) => void): Unsubscribe => {
      listeners.add(fn);
      fn(state); // opcional: emitir estado inicial
      return () => listeners.delete(fn);
    },
  };
}
