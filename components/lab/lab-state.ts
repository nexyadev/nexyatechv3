"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared state of the /lab prototype.
 * - `live` is mutated every frame (scroll, pointer, opening) and never triggers React renders.
 * - The small store below drives the loader and the scene lifecycle.
 */
export const SCENES = ["hero", "manifesto", "solutions", "product", "portfolio", "calm"] as const;
export type SceneName = (typeof SCENES)[number];

export const live = {
  /** Target scene index (float) from ScrollTrigger, and its inertial follower used by the shader. */
  sceneTarget: 0,
  scene: 0,
  /** Scroll velocity in px/s from ScrollTrigger, and its damped value. */
  velocityTarget: 0,
  velocity: 0,
  /** Pointer in normalised device coordinates (−1…1), target and spring-follower. */
  pointerTarget: { x: 0, y: 0, active: false },
  /** 0 = every ribbon collapsed into the loader line; 1 = ribbons fully open. */
  openTarget: 1,
  open: 1,
};

export type LoaderStatus = "pending" | "playing" | "exiting" | "done" | "none";
type LabStore = { loader: LoaderStatus; sceneReady: boolean; sceneFailed: boolean; paused: boolean };

let store: LabStore = { loader: "pending", sceneReady: false, sceneFailed: false, paused: false };
const listeners = new Set<() => void>();

export function setLab(patch: Partial<LabStore>) {
  store = { ...store, ...patch };
  listeners.forEach((listener) => listener());
}

export const getLab = () => store;

const serverStore: LabStore = { loader: "pending", sceneReady: false, sceneFailed: false, paused: false };

export function useLab<T>(select: (value: LabStore) => T): T {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => select(store),
    () => select(serverStore),
  );
}

export const LAB_SESSION_KEY = "nexya:lab-loader-seen";
/** Phones and touch screens: the WebGL bundle loads on the first interaction, never with the first paint. */
export const TOUCH_QUERY = "(max-width: 767px), (pointer: coarse)";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const damp = (current: number, target: number, lambda: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));
