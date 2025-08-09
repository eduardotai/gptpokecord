const { getPokemon, getMove, calculateDamage, calculateTypeEffectiveness } = require('./pokemonData');
const { getBattle, updateBattle, deleteBattle, updatePokemon } = require('./database');

class BattleSystem {
    constructor() {
        this.activeBattles = new Map();
    }
    reset() {
        this.activeBattles.clear();
    }

    // Iniciar uma nova batalha
    async startBattle(userId, battleId, opponentType = 'wild', presetOpponent = null) {
        const opponent = presetOpponent || this.generateOpponent(opponentType);
        
        const battle = {
            id: battleId,
            userId: userId,
            opponent: opponent,
            playerPokemon: null,
            turn: 1,
            status: 'active',
            messages: [],
            usedPokemonIds: [],
            lastHitPokemonId: null
        };

        this.activeBattles.set(battleId, battle);
        
        // Marcar como descoberto na Pokédex
        try { await require('./database').markPokedexDiscovered(userId, opponent.id); } catch (_) {}

        // Salvar no banco de dados
        await require('./database').createBattle(battleId, userId, opponentType, opponent);
        
        return battle;
    }

    // Gerar oponente baseado no tipo
    generateOpponent(type) {
        const pokemonIds = [1, 4, 7, 25, 133]; // Pokémon iniciais + Pikachu + Eevee
        const randomId = pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
        const basePokemon = getPokemon(randomId);
        
        const level = Math.floor(Math.random() * 20) + 5; // Nível 5-25
        
        // Garantir apenas movimentos válidos existentes no moveData
        const baseMoves = Array.isArray(basePokemon?.moves) ? basePokemon.moves : [];
        let validMoves = baseMoves.filter(m => !!getMove(m));
        if (validMoves.length === 0) {
            // Fallback seguro
            if (getMove('Tackle')) validMoves = ['Tackle'];
        }

        return {
            ...basePokemon,
            level: level,
            currentHp: this.calculateStats(basePokemon.baseStats.hp, level),
            maxHp: this.calculateStats(basePokemon.baseStats.hp, level),
            attack: this.calculateStats(basePokemon.baseStats.attack, level),
            defense: this.calculateStats(basePokemon.baseStats.defense, level),
            speed: this.calculateStats(basePokemon.baseStats.speed, level),
            special_attack: this.calculateStats(basePokemon.baseStats.special_attack, level),
            special_defense: this.calculateStats(basePokemon.baseStats.special_defense, level),
            status: 'normal',
            moves: validMoves.slice(0, 4) // Máximo 4 movimentos, apenas válidos
        };
    }

    // Calcular stats baseado no nível
    calculateStats(baseStat, level) {
        return Math.floor(((2 * baseStat + 31) * level) / 100) + level + 10;
    }

    // Obter batalha ativa
    getBattle(battleId) {
        return this.activeBattles.get(battleId);
    }

    // Obter batalha ativa por usuário
    getActiveBattleForUser(userId) {
        for (const battle of this.activeBattles.values()) {
            if (battle.userId === userId && battle.status === 'active') {
                return battle;
            }
        }
        return null;
    }

    // Escolher Pokémon para batalha
    async selectPokemon(battleId, playerPokemon) {
        const battle = this.getBattle(battleId);
        if (!battle) return null;

        const basePokemon = getPokemon(playerPokemon.pokemon_id);
        // Normalizar moves vindo do banco (string JSON) ou da base
        let normalizedMoves = [];
        if (Array.isArray(playerPokemon.moves)) {
            normalizedMoves = playerPokemon.moves;
        } else if (typeof playerPokemon.moves === 'string') {
            try {
                const parsed = JSON.parse(playerPokemon.moves);
                if (Array.isArray(parsed)) normalizedMoves = parsed;
            } catch (_) {}
        }
        if (!Array.isArray(normalizedMoves) || normalizedMoves.length === 0) {
            normalizedMoves = basePokemon?.moves?.slice(0, 4) || [];
        }
        // Filtrar apenas movimentos válidos existentes no moveData; fallback seguro
        normalizedMoves = normalizedMoves.filter(m => !!getMove(m));
        if (normalizedMoves.length === 0) {
            if (getMove('Tackle')) normalizedMoves = ['Tackle'];
        }

        battle.playerPokemon = {
            ...playerPokemon,
            name: playerPokemon.name || basePokemon?.name,
            types: playerPokemon.types || basePokemon?.types || [],
            level: playerPokemon.level || 1,
            currentHp: typeof playerPokemon.hp === 'number' ? playerPokemon.hp : playerPokemon.currentHp || 0,
            maxHp: typeof playerPokemon.max_hp === 'number' ? playerPokemon.max_hp : (typeof playerPokemon.hp === 'number' ? playerPokemon.hp : playerPokemon.maxHp || 0),
            moves: normalizedMoves
        };

        if (!battle.usedPokemonIds.includes(playerPokemon.id)) {
            battle.usedPokemonIds.push(playerPokemon.id);
        }

        await require('./database').updateBattle(battleId, { player_pokemon_id: playerPokemon.id });
        
        return this.formatBattleStatus(battle);
    }

    // Executar ataque
    async executeAttack(battleId, moveName) {
        const battle = this.getBattle(battleId);
        if (!battle || !battle.playerPokemon) return null;

        // Encontrar o movimento de forma case-insensitive e usar o nome canônico
        const available = Array.isArray(battle.playerPokemon.moves) ? battle.playerPokemon.moves : [];
        const canonical = available.find(m => (m || '').toLowerCase() === (moveName || '').toLowerCase());
        const chosenMoveName = canonical || moveName;
        const move = getMove(chosenMoveName);
        if (!move) {
            return { error: 'Movimento não encontrado!' };
        }

        // Verificar se o Pokémon conhece o movimento
        if (!available.some(m => (m || '').toLowerCase() === (moveName || '').toLowerCase())) {
            return { error: `${battle.playerPokemon.nickname || battle.playerPokemon.name} não conhece esse movimento!` };
        }

        // Verificar precisão
        if (Math.random() * 100 > move.accuracy) {
            battle.messages.push(`**${battle.playerPokemon.nickname || battle.playerPokemon.name}** errou o ataque!`);
            return this.formatBattleStatus(battle);
        }

        // Calcular dano
        const damage = calculateDamage(battle.playerPokemon, battle.opponent, chosenMoveName);
        battle.opponent.currentHp = Math.max(0, battle.opponent.currentHp - damage);

        // Verificar eficácia
        const effectiveness = calculateTypeEffectiveness(move.type, battle.opponent.types);
        let effectivenessText = '';
        if (effectiveness > 1) {
            effectivenessText = ' É super efetivo!';
        } else if (effectiveness < 1 && effectiveness > 0) {
            effectivenessText = ' Não é muito efetivo...';
        } else if (effectiveness === 0) {
            effectivenessText = ' Não afeta o oponente...';
        }

        battle.messages.push(`**${battle.playerPokemon.nickname || battle.playerPokemon.name}** usou **${chosenMoveName}**!${effectivenessText}`);
        battle.messages.push(`**${battle.opponent.name}** perdeu **${damage}** HP!`);

        // Verificar se o oponente foi derrotado
        if (battle.opponent.currentHp <= 0) {
            battle.status = 'player_won';
            battle.messages.push(`**${battle.opponent.name}** foi derrotado!`);
            battle.lastHitPokemonId = battle.playerPokemon.id;
            try { await require('./database').markDailyBattle(battle.userId); } catch (_) {}
            try { await this.awardExperience(battle); } catch (e) { battle.messages.push('Falha ao calcular EXP.'); }
            return this.formatBattleStatus(battle);
        }

        // Turno do oponente
        await this.opponentTurn(battle);

        battle.turn++;
        return this.formatBattleStatus(battle);
    }

    // Turno do oponente
    async opponentTurn(battle) {
        if (battle.opponent.currentHp <= 0) return;

        // Escolher movimento aleatório dentre os válidos
        const available = Array.isArray(battle.opponent.moves) ? battle.opponent.moves : [];
        const valid = available.filter(m => !!getMove(m));
        if (valid.length === 0) {
            // Sem movimentos válidos -> turno perdido
            battle.messages.push(`**${battle.opponent.name}** não pôde agir (sem movimentos válidos).`);
            return;
        }
        const randomMove = valid[Math.floor(Math.random() * valid.length)];
        const move = getMove(randomMove);

        // Verificar precisão
        const accuracy = typeof move?.accuracy === 'number' ? move.accuracy : 100;
        if (Math.random() * 100 > accuracy) {
            battle.messages.push(`**${battle.opponent.name}** errou o ataque!`);
            return;
        }

        // Calcular dano
        const damage = calculateDamage(battle.opponent, battle.playerPokemon, randomMove);
        battle.playerPokemon.currentHp = Math.max(0, battle.playerPokemon.currentHp - damage);

        // Verificar eficácia
        const effectiveness = calculateTypeEffectiveness(move?.type || 'Normal', battle.playerPokemon.types);
        let effectivenessText = '';
        if (effectiveness > 1) {
            effectivenessText = ' É super efetivo!';
        } else if (effectiveness < 1 && effectiveness > 0) {
            effectivenessText = ' Não é muito efetivo...';
        } else if (effectiveness === 0) {
            effectivenessText = ' Não afeta o oponente...';
        }

        battle.messages.push(`**${battle.opponent.name}** usou **${randomMove}**!${effectivenessText}`);
        battle.messages.push(`**${battle.playerPokemon.nickname || battle.playerPokemon.name}** perdeu **${damage}** HP!`);

        // Verificar se o jogador foi derrotado
        if (battle.playerPokemon.currentHp <= 0) {
            battle.messages.push(`**${battle.playerPokemon.nickname || battle.playerPokemon.name}** foi derrotado!`);
            // Persistir desmaio
            try { await require('./database').updatePokemon(battle.playerPokemon.id, { hp: 0 }); } catch (_) {}

            // Trocar automaticamente para outro Pokémon do time com HP > 0
            const team = await require('./database').getPlayerTeam(battle.userId);
            const next = team.find(p => p.id !== battle.playerPokemon.id && p.hp > 0);
            if (next) {
                const basePokemon = getPokemon(next.pokemon_id);
                battle.playerPokemon = {
                    ...next,
                    name: next.name || basePokemon?.name,
                    types: next.types || basePokemon?.types || [],
                    level: next.level || 1,
                    currentHp: typeof next.hp === 'number' ? next.hp : next.currentHp || 0,
                    maxHp: typeof next.max_hp === 'number' ? next.max_hp : (typeof next.hp === 'number' ? next.hp : next.maxHp || 0),
                    moves: Array.isArray(next.moves) ? next.moves : (basePokemon?.moves?.slice(0, 4) || []),
                };
                if (!battle.usedPokemonIds.includes(next.id)) {
                    battle.usedPokemonIds.push(next.id);
                }
                battle.messages.push(`Você enviou **${battle.playerPokemon.nickname || battle.playerPokemon.name}**!`);
            } else {
                battle.status = 'opponent_won';
                battle.messages.push('Você ficou sem Pokémon disponíveis!');
                try { await require('./database').markDailyBattle(battle.userId); } catch (_) {}
            }
        }
    }

    // Tentar capturar Pokémon
    async attemptCapture(battleId, ballType = 'pokeball') {
        const battle = this.getBattle(battleId);
        if (!battle || battle.status !== 'active') return null;

        const ballData = require('./pokemonData').getItem(ballType);
        if (!ballData) {
            return { error: 'Tipo de bola inválido!' };
        }

        // Calcular taxa de captura
        const maxHp = battle.opponent.maxHp;
        const currentHp = battle.opponent.currentHp;
        const catchRate = battle.opponent.catchRate;
        
        // Fórmula de captura baseada no jogo original
        const a = (3 * maxHp - 2 * currentHp) * catchRate * ballData.catchRate;
        const b = 3 * maxHp;
        const catchChance = Math.min(255, Math.floor(a / b));

        const random = Math.floor(Math.random() * 256);
        const success = random <= catchChance;

        if (success) {
            battle.status = 'captured';
            battle.messages.push(`🎉 **${battle.opponent.name}** foi capturado com sucesso!`);
            
            // Adicionar Pokémon ao jogador
            const pokemonData = {
                pokemon_id: battle.opponent.id,
                nickname: battle.opponent.name,
                hp: battle.opponent.maxHp,
                max_hp: battle.opponent.maxHp,
                attack: battle.opponent.attack,
                defense: battle.opponent.defense,
                speed: battle.opponent.speed,
                special_attack: battle.opponent.special_attack,
                special_defense: battle.opponent.special_defense,
                moves: battle.opponent.moves,
                is_shiny: Math.random() < 0.01 // 1% chance de ser shiny
            };

            await require('./database').addPokemon(battle.userId, pokemonData);
            try { await require('./database').markPokedexCaptured(battle.userId, battle.opponent.id); } catch (_) {}
            
            return this.formatBattleStatus(battle);
        } else {
            battle.messages.push(`**${battle.opponent.name}** quebrou a **${ballData.name}**!`);
            
            // Turno do oponente após tentativa de captura
            await this.opponentTurn(battle);
            
            return this.formatBattleStatus(battle);
        }
    }

    // Usar item
    async useItem(battleId, itemId, target = 'player') {
        const battle = this.getBattle(battleId);
        if (!battle) return null;

        const item = require('./pokemonData').getItem(itemId);
        if (!item) {
            return { error: 'Item não encontrado!' };
        }

        if (item.healAmount) {
            const pokemon = target === 'player' ? battle.playerPokemon : battle.opponent;
            const oldHp = pokemon.currentHp;
            
            if (item.healAmount === 'max') {
                pokemon.currentHp = pokemon.maxHp;
            } else {
                pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + item.healAmount);
            }
            
            const healed = pokemon.currentHp - oldHp;
            battle.messages.push(`**${item.name}** restaurou **${healed}** HP de **${pokemon.nickname || pokemon.name}**!`);
            
            // Remover item do inventário
            await require('./database').removeItem(battle.userId, itemId, 1);
        }

        return this.formatBattleStatus(battle);
    }

    // Fugir da batalha
    async flee(battleId) {
        const battle = this.getBattle(battleId);
        if (!battle) return null;

        // 50% de chance de fugir com sucesso
        if (Math.random() < 0.5) {
            battle.status = 'fled';
            battle.messages.push('Você fugiu com sucesso!');
        } else {
            battle.messages.push('Não conseguiu fugir!');
            await this.opponentTurn(battle);
        }

        return this.formatBattleStatus(battle);
    }

    // Formatar status da batalha para exibição
    formatBattleStatus(battle) {
        if (!battle) return null;

        const playerHpPercent = Math.floor((battle.playerPokemon?.currentHp || 0) / (battle.playerPokemon?.maxHp || 1) * 100);
        const opponentHpPercent = Math.floor((battle.opponent.currentHp / battle.opponent.maxHp) * 100);

        let status = `🎮 **Batalha Pokémon** - Turno ${battle.turn}\n\n`;
        
        if (battle.playerPokemon) {
            status += `**Seu Pokémon:** ${battle.playerPokemon.nickname || battle.playerPokemon.name} (Nv.${battle.playerPokemon.level})\n`;
            status += `**HP:** ${battle.playerPokemon.currentHp}/${battle.playerPokemon.maxHp} (${playerHpPercent}%)\n`;
            if (Array.isArray(battle.playerPokemon.types) && battle.playerPokemon.types.length > 0) {
                status += `**Tipos:** ${battle.playerPokemon.types.join(', ')}\n\n`;
            } else {
                status += `**Tipos:** Desconhecido\n\n`;
            }
        }
        
        status += `**Oponente:** ${battle.opponent.name} (Nv.${battle.opponent.level})\n`;
        status += `**HP:** ${battle.opponent.currentHp}/${battle.opponent.maxHp} (${opponentHpPercent}%)\n`;
        status += `**Tipos:** ${battle.opponent.types.join(', ')}\n\n`;

        if (battle.messages.length > 0) {
            status += `**Últimas ações:**\n${battle.messages.slice(-6).join('\n')}\n\n`;
        }

        if (battle.status === 'active' && battle.playerPokemon) {
            status += `**Comandos disponíveis:**\n`;
            status += `• \`/attack <movimento>\` - Atacar\n`;
            status += `• \`/catch <tipo_bola>\` - Tentar capturar\n`;
            status += `• \`/use <item>\` - Usar item\n`;
            status += `• \`/flee\` - Fugir\n`;
        }

        // Sempre mostrar os movimentos disponíveis do Pokémon do jogador
        if (battle.playerPokemon && Array.isArray(battle.playerPokemon.moves)) {
            const moves = battle.playerPokemon.moves.map(m => `• ${m}`).join('\n') || 'Nenhum movimento disponível';
            status += `**Movimentos disponíveis:**\n${moves}\n\n`;
        }

        return {
            status: battle.status,
            message: status,
            battle: battle
        };
    }

    // Finalizar batalha
    async endBattle(battleId) {
        const battle = this.getBattle(battleId);
        if (!battle) return;

        // Atualizar Pokémon do jogador se necessário
        if (battle.playerPokemon) {
            await updatePokemon(battle.playerPokemon.id, {
                hp: battle.playerPokemon.currentHp
            });
        }

        // Remover do banco de dados
        await deleteBattle(battleId);
        
        // Remover da memória
        this.activeBattles.delete(battleId);
    }

    // Recompensa de experiência aos Pokémon usados; quem deu o golpe final ganha mais
    async awardExperience(battle) {
        const db = require('./database');
        const participants = await db.getPlayerPokemon(battle.userId);
        const usedSet = new Set(battle.usedPokemonIds);
        const killerId = battle.lastHitPokemonId;

        // Estimar baseYield do oponente a partir dos baseStats
        const opponentBase = getPokemon(battle.opponent.id);
        let baseYield = 64;
        if (opponentBase && opponentBase.baseStats) {
            const sum = opponentBase.baseStats.hp + opponentBase.baseStats.attack + opponentBase.baseStats.defense + opponentBase.baseStats.special_attack + opponentBase.baseStats.special_defense + opponentBase.baseStats.speed;
            baseYield = Math.max(50, Math.floor(sum / 3));
        }
        const totalExp = Math.max(5, Math.floor((baseYield * battle.opponent.level) / 7));

        const usedList = participants.filter(p => usedSet.has(p.id));
        const n = Math.max(1, usedList.length);

        for (const p of usedList) {
            const playerLevel = Math.max(1, p.level || 1);
            const opponentLevel = Math.max(1, battle.opponent.level || 1);
            // Fator por diferença de nível (mais recompensa quando enfrenta oponentes mais fortes)
            const levelFactor = Math.max(0.5, Math.min(2.0, Math.sqrt(opponentLevel / playerLevel)));
            let share = Math.floor((totalExp * levelFactor) / n);
            if (p.id === killerId) {
                share = Math.floor(share * 1.5);
            }
            share = Math.max(1, share);

            const result = await this.applyExperienceGain(p, share);
            if (result) {
                const { before, after, leveledUp } = result;
                battle.messages.push(`📈 ${before.nickname || getPokemon(before.pokemon_id)?.name || 'Pokémon'} ganhou ${share} EXP (Nv.${before.level} → Nv.${after.level})`);
                if (leveledUp) {
                    battle.messages.push(`✨ Novos stats: HP ${after.max_hp}, Atk ${after.attack}, Def ${after.defense}, SpA ${after.special_attack}, SpD ${after.special_defense}, Spe ${after.speed}`);
                }
            }
        }
    }

    async applyExperienceGain(playerMonRow, expGain) {
        const db = require('./database');
        const { calculateStats } = require('./pokemonData');
        const baseData = getPokemon(playerMonRow.pokemon_id);
        const before = { ...playerMonRow };
        let newExp = (playerMonRow.experience || 0) + expGain;
        let newLevel = playerMonRow.level || 1;
        const maxLevel = 100;
        // Usa curva crescente para refletir jogos (aproximação): 50 * lvl^2
        const expThreshold = (lvl) => 50 * lvl * lvl;
        let leveledUp = false;
        while (newLevel < maxLevel && newExp >= expThreshold(newLevel)) {
            newExp -= expThreshold(newLevel);
            newLevel += 1;
            leveledUp = true;
        }

        const updates = { experience: newExp, level: newLevel };
        if (leveledUp && baseData) {
            updates.max_hp = calculateStats(baseData.baseStats.hp, newLevel);
            updates.attack = calculateStats(baseData.baseStats.attack, newLevel);
            updates.defense = calculateStats(baseData.baseStats.defense, newLevel);
            updates.speed = calculateStats(baseData.baseStats.speed, newLevel);
            updates.special_attack = calculateStats(baseData.baseStats.special_attack, newLevel);
            updates.special_defense = calculateStats(baseData.baseStats.special_defense, newLevel);
            updates.hp = updates.max_hp;
        }
        await db.updatePokemon(playerMonRow.id, updates);
        const after = { ...before, ...updates };
        return { before, after, leveledUp };
    }
}

module.exports = new BattleSystem();
