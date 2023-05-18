import { useCallback, useSyncExternalStore } from 'react';

type Listener<T> = (state: T, prevState: T) => void;

export interface CreateStoreReturnType<T> {
  setState: (fn: (state: T) => T) => void;
  getState: () => T;
  subscribe: (listener: Listener<T>) => void;
}

export const createStore = <T>(initialState: T): CreateStoreReturnType<T> => {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;
  const setState = (fn: (state: T) => T) => {
    const prevState = state;
    state = fn(state);
    listeners.forEach((listener) => listener(state, prevState));
  };
  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    getState,
    setState,
    subscribe,
  };
};

export const useStore = <T>(
  store: {
    getState: () => T;
    subscribe: (listener: Listener<T>) => () => void;
  },
  selector: (state: T) => T,
) => {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector]),
  );
};
