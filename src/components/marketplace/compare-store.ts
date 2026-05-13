"use client";

import { useEffect, useSyncExternalStore } from "react";

const KEY = "llave:compare";
const MAX = 4;

type Listener = () => void;

class Store {
  private ids: string[] = [];
  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) this.ids = JSON.parse(raw);
      } catch {}
      window.addEventListener("storage", (e) => {
        if (e.key === KEY && e.newValue) {
          try {
            this.ids = JSON.parse(e.newValue);
            this.emit();
          } catch {}
        }
      });
    }
  }

  get() {
    return this.ids;
  }

  toggle(id: string) {
    if (this.ids.includes(id)) {
      this.ids = this.ids.filter((x) => x !== id);
    } else {
      if (this.ids.length >= MAX) this.ids = [...this.ids.slice(1), id];
      else this.ids = [...this.ids, id];
    }
    this.persist();
    this.emit();
  }

  clear() {
    this.ids = [];
    this.persist();
    this.emit();
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.ids));
      } catch {}
    }
  }

  private emit() {
    for (const l of this.listeners) l();
  }
}

let _store: Store | null = null;
function getStore() {
  if (!_store) _store = new Store();
  return _store;
}

export function useCompareIds() {
  const subscribe = (l: Listener) => getStore().subscribe(l);
  const getSnapshot = () => getStore().get();
  const getServerSnapshot = () => [] as string[];
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ids;
}

export function useCompareActions() {
  // ensure store initialized on client
  useEffect(() => { getStore(); }, []);
  return {
    toggle: (id: string) => getStore().toggle(id),
    clear: () => getStore().clear(),
  };
}
