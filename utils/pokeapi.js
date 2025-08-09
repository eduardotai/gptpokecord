const { cacheTtlMs, features } = require('../config');
const { warn } = require('./logger');

const cache = new Map(); // key -> { ts, data }

async function fetchJson(url) {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < cacheTtlMs) return hit.data;

  if (!features.allowPokeApi || typeof fetch !== 'function') {
    throw new Error('PokeAPI desabilitada ou fetch indisponível');
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  cache.set(url, { ts: now, data });
  return data;
}

async function getPokemonByIdOrName(identifier) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
}
async function getSpeciesById(id) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
}

function pickFlavor(species) {
  try {
    const entries = Array.isArray(species.flavor_text_entries) ? species.flavor_text_entries : [];
    const pick = entries.find(e => e.language?.name === 'pt-BR')
      || entries.find(e => e.language?.name === 'pt')
      || entries.find(e => e.language?.name === 'en')
      || entries[0];
    const raw = pick?.flavor_text || '';
    return String(raw).replace(/\f/g, ' ').replace(/\n/g, ' ').trim();
  } catch (e) {
    warn('pokeapi', 'pickFlavor failed', e?.message || e);
    return '';
  }
}

module.exports = { fetchJson, getPokemonByIdOrName, getSpeciesById, pickFlavor };
