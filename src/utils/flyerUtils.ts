import { Tire } from '../types';

/**
 * Distributes an array of items across multiple chunks equitably,
 * ensuring no chunk exceeds maxPerChunk.
 *
 * Example:
 * 7 tires, max 6 -> [4, 3] (equitable: difference is at most 1)
 * 8 tires, max 6 -> [4, 4]
 * 9 tires, max 6 -> [5, 4]
 * 10 tires, max 6 -> [5, 5]
 * 12 tires, max 6 -> [6, 6]
 * 13 tires, max 6 -> [5, 4, 4]
 */
export function distributeTiresEquitably<T>(items: T[], maxPerChunk: number = 6): T[][] {
  const total = items.length;
  if (total === 0) return [];
  if (total <= maxPerChunk) return [items];

  const numChunks = Math.ceil(total / maxPerChunk);
  const baseSize = Math.floor(total / numChunks);
  const remainder = total % numChunks;

  const result: T[][] = [];
  let offset = 0;
  for (let i = 0; i < numChunks; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    result.push(items.slice(offset, offset + size));
    offset += size;
  }
  return result;
}

/**
 * Determines whether a tire layout inside an image should be compact.
 * User requirement: "si se pasa de las 3 gomas acomoda todo para que ocupe la mitad de espacio"
 */
export function isCompactTireLayout(countInImage: number): boolean {
  return countInImage > 3;
}
