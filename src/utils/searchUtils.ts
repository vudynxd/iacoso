/**
 * Smart contextual search and filtering utilities for automotive tire catalog.
 * Handles flexible matching for tire sizes, brands, models, and numbers:
 * e.g., "205 55 16", "205/55R16", "205 55", "fate 205", "r16 205 55",
 * ignoring accents, punctuation differences, spaces, and token order.
 */

import { Tire } from '../types';

/**
 * Strips accents and diacritics, converts to lowercase, and normalizes spaces.
 */
export const normalizeSearchText = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Strips all non-alphanumeric characters for compact comparisons
 * (e.g. "205/55R16" -> "20555r16", "31X10.50R15" -> "31x1050r15").
 */
export const compactSearchText = (str: string): string => {
  return normalizeSearchText(str).replace(/[^a-z0-9]/g, '');
};

/**
 * Splits a search query into meaningful tokens (words/numbers).
 * Splitting on whitespace and common delimiters like slash or dash,
 * while preserving compound tokens when useful.
 */
export const extractSearchTokens = (query: string): string[] => {
  const norm = normalizeSearchText(query);
  if (!norm) return [];

  // Split on spaces, commas, slashes, dashes, dots (except within numbers like 10.5 or 7.50)
  const tokens = norm
    .split(/[\s,/_\\-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return tokens;
};

/**
 * Contextual match for a single text value (e.g. inside ExcelColumnFilter).
 * Returns true if all tokens of the search query are represented in the target text.
 * Also handles compact dimension comparisons (e.g. searching "205 55" matches "205/55R16").
 */
export const contextualTextMatch = (target: string, query: string): boolean => {
  if (!query || !query.trim()) return true;
  if (!target && target !== '0') return false;

  const normTarget = normalizeSearchText(target);
  const compactTarget = compactSearchText(target);
  const normQuery = normalizeSearchText(query);
  const compactQuery = compactSearchText(query);

  // Quick direct substring check
  if (normTarget.includes(normQuery) || compactTarget.includes(compactQuery)) {
    return true;
  }

  // Token-based matching: ALL tokens in the query must match something in the target
  const tokens = extractSearchTokens(query);
  if (tokens.length === 0) return true;

  return tokens.every((token) => {
    // Direct token in normalized target
    if (normTarget.includes(token)) return true;

    // Compact token in compact target (e.g. "r16" in "20555r16")
    const compactToken = compactSearchText(token);
    if (compactToken && compactTarget.includes(compactToken)) return true;

    // Handle "r" prefix/suffix variations (e.g. "16" matching "r16" or "r16" matching "16")
    if (/^\d{2}$/.test(token) && normTarget.includes(`r${token}`)) {
      return true;
    }
    if (/^r\d{2}$/.test(token) && normTarget.includes(token.slice(1))) {
      return true;
    }

    return false;
  });
};

/**
 * Contextual match for a Tire object against a multi-term global search query.
 * Matches across marca, modelo, dimensiones, rodado, categoria, indice, codigo, precios.
 * Allows searching by:
 * - "205 55 16"
 * - "fate 205"
 * - "pirelli 16"
 * - "scorpion 265"
 * - "camion 295"
 * - "175/70"
 * Every query token must match at least one attribute of the tire.
 */
export const contextualTireMatch = (tire: Tire, query: string): boolean => {
  if (!query || !query.trim()) return true;

  const tokens = extractSearchTokens(query);
  if (tokens.length === 0) return true;

  // Build searchable target string and compact representations
  const marca = normalizeSearchText(tire.marca);
  const modelo = normalizeSearchText(tire.modelo);
  const dimensiones = normalizeSearchText(tire.dimensiones);
  const compactDim = compactSearchText(tire.dimensiones);
  const rodado = normalizeSearchText(tire.rodado);
  const categoria = normalizeSearchText(tire.categoria);
  const indice = normalizeSearchText(tire.indice || '');
  const codigo = normalizeSearchText(tire.codigo || '');
  const precio = String(tire.precioContado);
  const cuota4 = String(tire.precioCuota4);
  const cuota20 = String(tire.precioCuota20);
  const total4 = String(tire.precioCuota4 * 4);
  const total20 = String(tire.precioCuota20 * 20);

  // Combined text representations for full contextual evaluation
  const combined = `${marca} ${modelo} ${dimensiones} ${rodado} ${categoria} ${indice} ${codigo} ${precio} ${cuota4} ${cuota20} ${total4} ${total20}`;
  const compactCombined = `${compactSearchText(marca)}${compactSearchText(modelo)}${compactDim}${rodado}`;

  const compactQuery = compactSearchText(query);
  if (compactQuery.length >= 3 && compactCombined.includes(compactQuery)) {
    return true;
  }

  // Every token must match somewhere in this tire's data
  return tokens.every((token) => {
    // Direct match in combined string
    if (combined.includes(token)) return true;

    // Compact token match in dimension (e.g. token "20555" in compactDim "20555r16")
    const compactToken = compactSearchText(token);
    if (compactToken && (compactDim.includes(compactToken) || compactCombined.includes(compactToken))) {
      return true;
    }

    // "16" matching "R16" or rodado
    if (/^\d{2}$/.test(token)) {
      if (rodado === token || rodado === `r${token}` || dimensiones.includes(`r${token}`)) {
        return true;
      }
    }
    // "r16" matching rodado "16"
    if (/^r\d{2}$/.test(token)) {
      const num = token.slice(1);
      if (rodado === num || rodado === token || dimensiones.includes(token)) {
        return true;
      }
    }

    return false;
  });
};
