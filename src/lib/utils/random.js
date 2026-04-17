/**
 * Seeded pseudo-random number generation for Geomockery.
 *
 * The module keeps a single active RNG behind a private variable. Callers
 * that need reproducibility call `setSeed(seed)` once at the start of a
 * generation run; every subsequent call to `getRandomFloat`,
 * `getRandomInt`, `getRandomArrayItem`, etc. draws from that seeded
 * sequence. With no seed set, the module seeds itself from `Date.now()`
 * at import time so behaviour before v0.2 (non-reproducible) is
 * preserved as a fallback.
 *
 * We use mulberry32 because it is tiny, well-distributed for 32-bit
 * state, and produces a consistent sequence across browsers.
 */

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string into a 32-bit unsigned integer, so a user who types a
 * memorable seed like "portland-2026" still gets a deterministic run.
 */
function hashStringToUint32(input) {
  let hash = 2166136261 >>> 0; // FNV-1a 32-bit offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Coerce anything the UI might hand us into a 32-bit unsigned int. */
export function coerceSeed(seed) {
  if (seed === null || seed === undefined || seed === '') return null;
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.floor(Math.abs(seed)) >>> 0;
  }
  const asString = String(seed).trim();
  if (asString.length === 0) return null;
  if (/^\d+$/.test(asString)) {
    return Number(asString) >>> 0;
  }
  return hashStringToUint32(asString);
}

/** Return a fresh random 32-bit seed suitable for display in the UI. */
export function generateSeed() {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

let activeSeed = generateSeed();
let rng = mulberry32(activeSeed);

/**
 * Reset the module RNG to a specific seed. Callers typically do this
 * once per generation run, before any `getRandom*` call.
 * Returns the numeric seed that ended up active.
 */
export function setSeed(seed) {
  const coerced = coerceSeed(seed);
  activeSeed = coerced === null ? generateSeed() : coerced;
  rng = mulberry32(activeSeed);
  return activeSeed;
}

/** Read the seed currently driving the module RNG. */
export function getActiveSeed() {
  return activeSeed;
}

/** Raw 0..1 draw from the active seeded RNG. */
export function nextRandom() {
  return rng();
}

export function randomGenerator(seed) {
  const localState = coerceSeed(seed);
  return mulberry32(localState === null ? generateSeed() : localState);
}

export function createSeededRandom(seed) {
  return randomGenerator(seed);
}

export function generateId() {
  return rng().toString(36).substring(2, 12);
}

export function randomChoice(array) {
  if (!array || array.length === 0) return undefined;
  return array[Math.floor(rng() * array.length)];
}

export function getRandomFloat(min, max) {
  return min + rng() * (max - min);
}

export function getRandomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

export function getRandomBoolean(probability = 0.5) {
  return rng() < probability;
}

export function getRandomArrayItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(rng() * array.length)];
}

export function getRandomColor(includeAlpha = false) {
  const hex = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += hex[Math.floor(rng() * 16)];
  }
  if (includeAlpha) {
    color += hex[Math.floor(rng() * 16)];
    color += hex[Math.floor(rng() * 16)];
  }
  return color;
}

export function getRandomId(length = 8, prefix = '') {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(rng() * chars.length));
  }
  return id;
}
