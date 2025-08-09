const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { moveData, pokemonData } = require('./pokemonData');
const config = require('../config');
const { pickFlavor, getSpeciesById, getPokemonByIdOrName } = require('../utils/pokeapi');

class SpawnSystem {
  constructor() {
    this.activeSpawnsByChannel = new Map(); // channelId -> { opponent, imageUrl, createdAt, expiresAt }
    this.defaultExpireMs = 1000 * 60 * 5; // 5 minutos
    this.lastSpawnAtByChannel = new Map(); // channelId -> timestamp
    this.nextTimeoutByChannel = new Map(); // channelId -> timeoutId
    this.checkIntervalMs = config.spawn.checkIntervalMs; // verifica a cada Xs
    this.randomSpawnChance = config.spawn.chance; // chance por verificação (se cooldown ok e sem spawn ativo)
  }

  getSpawn(channelId) {
    const spawn = this.activeSpawnsByChannel.get(channelId);
    if (!spawn) return null;
    if (spawn.expiresAt && Date.now() > spawn.expiresAt) {
      this.activeSpawnsByChannel.delete(channelId);
      return null;
    }
    return spawn;
  }

  consumeSpawn(channelId) {
    const spawn = this.getSpawn(channelId);
    if (spawn) this.activeSpawnsByChannel.delete(channelId);
    return spawn;
  }

  async spawnRandomEncounterInChannel(client, channelId, options = {}) {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return null;

    // evitar múltiplos spawns simultâneos no mesmo canal
    if (this.getSpawn(channelId)) return null;

    const minLevel = options.level ?? options.minLevel ?? 3;
    const maxLevel = options.level ?? options.maxLevel ?? 20;

    const encounter = await this.buildEncounterFromData(options.id, minLevel, maxLevel);
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${encounter.id}.png`;

    // Tentar enriquecer com flavor text da PokeAPI (opcional, sem quebrar fluxo)
    let flavor = '';
    try {
      const species = await getSpeciesById(encounter.id);
      flavor = pickFlavor(species);
    } catch (_) { /* ignora falhas externas */ }

    // Indicador simples de raridade baseado no catchRate (quanto menor, mais raro)
    const cr = typeof encounter.catchRate === 'number' ? encounter.catchRate : 45;
    const stars = cr >= 150 ? '★' : cr >= 90 ? '★★' : cr >= 45 ? '★★★' : cr >= 25 ? '★★★★' : '★★★★★';

    const embed = new EmbedBuilder()
      .setColor('#74c69d')
      .setTitle(`Um ${encounter.name} selvagem apareceu! ${stars}`)
      .setDescription(
        (flavor ? `${flavor}\n\n` : '') +
        `Nível: **${encounter.level}**\n` +
        `Tipos: ${Array.isArray(encounter.types) && encounter.types.length ? encounter.types.join(', ') : 'Desconhecido'}`
      )
      .setImage(imageUrl)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`spawnbattle_${channelId}`)
        .setLabel('⚔️ Batalhar')
        .setStyle(ButtonStyle.Primary),
    );

    await channel.send({ embeds: [embed], components: [row] });

    const spawn = {
      opponent: encounter,
      imageUrl,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.defaultExpireMs,
    };
    this.activeSpawnsByChannel.set(channelId, spawn);
    this.lastSpawnAtByChannel.set(channelId, Date.now());
    return spawn;
  }
  
  async buildEncounterFromData(forcedId, minLevel, maxLevel) {
    // Construir tabela de encontros sobre 1..151, ponderada por raridade (catchRate quando conhecido)
    const ids = Array.from({ length: 151 }, (_, i) => i + 1);
    const encounterTable = ids.map(id => {
      const p = pokemonData[id];
      const base = p && typeof p.catchRate === 'number' ? p.catchRate : 45;
      return { id, weight: Math.max(1, Math.round(base)) };
    });

    // Sortear ID por pesos
    function pickIdWeighted(entries) {
      const total = entries.reduce((s, e) => s + (e.weight || 1), 0);
      let r = Math.random() * total;
      for (const e of entries) {
        r -= (e.weight || 1);
        if (r <= 0) return e.id;
      }
      return entries[entries.length - 1].id;
    }

    const chosen = forcedId ? Number(forcedId) : pickIdWeighted(encounterTable);
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    const base = pokemonData[chosen];
    if (base) {
      return {
        ...base,
        level,
        currentHp: this.calc(base.baseStats.hp, level),
        maxHp: this.calc(base.baseStats.hp, level),
        attack: this.calc(base.baseStats.attack, level),
        defense: this.calc(base.baseStats.defense, level),
        speed: this.calc(base.baseStats.speed, level),
        special_attack: this.calc(base.baseStats.special_attack, level),
        special_defense: this.calc(base.baseStats.special_defense, level),
        status: 'normal',
        moves: Array.isArray(base.moves) ? base.moves.slice(0, 4) : this.pickMovesForTypes(base.types)
      };
    }

    // Fallback: buscar da PokeAPI quando não houver no dataset local
    const api = await getPokemonByIdOrName(chosen);
    const name = api?.name ? this.capitalize(api.name) : `Pokemon ${chosen}`;
    const types = Array.isArray(api?.types) ? api.types.map(t => this.capitalize(t.type?.name || 'Normal')) : ['Normal'];
    const statsMap = {};
    for (const st of (api?.stats || [])) {
      const key = st.stat?.name;
      const val = st.base_stat || 50;
      if (key === 'hp') statsMap.hp = val;
      else if (key === 'attack') statsMap.attack = val;
      else if (key === 'defense') statsMap.defense = val;
      else if (key === 'speed') statsMap.speed = val;
      else if (key === 'special-attack') statsMap.special_attack = val;
      else if (key === 'special-defense') statsMap.special_defense = val;
    }
    const baseStats = {
      hp: statsMap.hp || 50,
      attack: statsMap.attack || 50,
      defense: statsMap.defense || 50,
      speed: statsMap.speed || 50,
      special_attack: statsMap.special_attack || 50,
      special_defense: statsMap.special_defense || 50,
    };
    return {
      id: chosen,
      name,
      types,
      baseStats,
      catchRate: 45,
      level,
      currentHp: this.calc(baseStats.hp, level),
      maxHp: this.calc(baseStats.hp, level),
      attack: this.calc(baseStats.attack, level),
      defense: this.calc(baseStats.defense, level),
      speed: this.calc(baseStats.speed, level),
      special_attack: this.calc(baseStats.special_attack, level),
      special_defense: this.calc(baseStats.special_defense, level),
      status: 'normal',
      moves: this.pickMovesForTypes(types)
    };
  }

  pickMovesForTypes(types) {
    const candidatesByType = {
      Fire: ['Ember', 'Fire Fang', 'Flamethrower'],
      Water: ['Water Gun', 'Hydro Pump'],
      Grass: ['Vine Whip', 'Solar Beam'],
      Electric: ['Thunder Shock', 'Thunderbolt'],
      Flying: ['Air Slash'],
      Normal: ['Tackle', 'Quick Attack', 'Scratch'],
      Poison: ['Tackle'],
      Rock: ['Tackle'],
      Ground: ['Tackle'],
      Psychic: ['Tackle'],
      Ice: ['Tackle'],
      Bug: ['Tackle'],
      Ghost: ['Tackle'],
      Dragon: ['Tackle'],
      Dark: ['Tackle'],
      Steel: ['Tackle'],
      Fairy: ['Tackle'],
    };

    const moves = new Set(['Tackle']);
    for (const t of types) {
      const list = candidatesByType[t] || [];
      for (const m of list) {
        if (moveData[m]) moves.add(m);
      }
    }
    return Array.from(moves).slice(0, 4);
  }

  capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Agendador com verificação periódica e cooldown fixo de 5 minutos
  scheduleSpawns(client, channelId) {
    // limpar agendamento anterior se houver
    const existing = this.nextTimeoutByChannel.get(channelId);
    if (existing) {
      clearTimeout(existing);
      this.nextTimeoutByChannel.delete(channelId);
    }

    const spawnAndReschedule = async () => {
      try {
        const now = Date.now();
        const cooldownMs = config.spawn.cooldownMs; // cooldown configurável
        const last = this.lastSpawnAtByChannel.get(channelId) || 0;

        // Se ainda existe spawn ativo, não criar outro
        if (!this.getSpawn(channelId)) {
          // respeitar cooldown mínimo entre spawns
          if (now - last >= cooldownMs) {
            // chance aleatória de spawnar a cada verificação
            if (Math.random() < this.randomSpawnChance) {
              await this.spawnRandomEncounterInChannel(client, channelId);
            }
          }
        }
      } catch (_) {}
      // reagendar próxima verificação com intervalo curto e fixo
      const t = setTimeout(spawnAndReschedule, this.checkIntervalMs);
      this.nextTimeoutByChannel.set(channelId, t);
    };

    // primeira execução após pequena espera para dar tempo do bot iniciar
    const initialDelay = 30000;
    const t = setTimeout(spawnAndReschedule, initialDelay);
    this.nextTimeoutByChannel.set(channelId, t);
  }

  // Utilitário simples para stats quando necessário
  calc(base, level) { return Math.floor(((2 * base + 31) * level) / 100) + level + 10; }
}

module.exports = new SpawnSystem();


