export type StoreSubscriber<T> = (state: T) => void;

export interface Store<T> {
  get(): T;
  set(partial: Partial<T>): void;
  subscribe(subscriber: StoreSubscriber<T>): () => void;
}

/**
 * Minimal reactive store to share state between views
 * without pulling in a heavier state manager.
 */
export function createStore<T extends Record<string, unknown>>(initialState: T): Store<T> {
  let state = { ...initialState };
  const subscribers = new Set<StoreSubscriber<T>>();

  function get(): T {
    return state;
  }

  function set(partial: Partial<T>) {
    state = { ...state, ...partial };
    subscribers.forEach(sub => sub(state));
  }

  function subscribe(subscriber: StoreSubscriber<T>): () => void {
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  }

  return { get, set, subscribe };
}
