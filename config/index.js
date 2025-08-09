const dotenv = require('dotenv');
const path = require('path');

// Load .env or config.env
try {
  dotenv.config();
} catch (_) {}
try {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
} catch (_) {}

const num = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const bool = (v, d) => {
  if (v === undefined) return d;
  const s = String(v).toLowerCase();
  if (['1', 'true', 'yes', 'y'].includes(s)) return true;
  if (['0', 'false', 'no', 'n'].includes(s)) return false;
  return d;
};

module.exports = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  masterUserId: process.env.MASTER_USER_ID,
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'database.sqlite'),

  // Spawn configuration
  spawn: {
    chance: Number(process.env.SPAWN_CHANCE) || 0.35, // 35%
    cooldownMs: num(process.env.SPAWN_COOLDOWN_MS, 5 * 60 * 1000), // 5 min
    checkIntervalMs: num(process.env.SPAWN_CHECK_INTERVAL_MS, 30 * 1000),
  },

  // API cache
  cacheTtlMs: num(process.env.API_CACHE_TTL_MS, 60 * 60 * 1000), // 1h

  // Feature flags
  features: {
    allowPokeApi: bool(process.env.ALLOW_POKEAPI, true),
  },
};
