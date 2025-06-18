/**
 * A simple seedable pseudo-random number generator
 * @param {number} seed Optional seed for the random generator
 * @returns {function} A function that returns random numbers between 0 and 1
 */
export function randomGenerator(seed) {
  // If no seed provided, use current time as seed
  let s = seed || Math.floor(Date.now() * Math.random());
  
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

/**
 * Generate a random string ID
 * @returns {string} A random string ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * Pick a random element from an array
 * @param {Array} array The array to pick from
 * @returns {*} A random element from the array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random floating point number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float between min and max
 */
export function getRandomFloat(min, max) {
  return min + (Math.random() * (max - min));
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random boolean with the given probability of being true
 * @param {number} probability - Probability of returning true (0-1)
 * @returns {boolean} Random boolean
 */
export function getRandomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Returns a random item from an array
 * @param {Array} array - Array to select from
 * @returns {*} Random item from the array
 */
export function getRandomArrayItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random color in hex format
 * @param {boolean} includeAlpha - Whether to include alpha channel
 * @returns {string} Random color in hex format
 */
export function getRandomColor(includeAlpha = false) {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
  }
  
  if (includeAlpha) {
    color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

/**
 * Generates a random ID string
 * @param {number} length - Length of the ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Random ID
 */
export function getRandomId(length = 8, prefix = '') {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

/**
 * Creates a seeded random number generator
 * @param {number} seed - Seed for the random number generator
 * @returns {Function} Seeded random number generator
 */
export function createSeededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
} 