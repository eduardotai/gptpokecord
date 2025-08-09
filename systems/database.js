const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function init(customPath) {
    const resolvedPath = customPath || process.env.DB_PATH || path.join(__dirname, '../data/pokemon.db');
    if (resolvedPath !== ':memory:') {
        // garantir diretório data
        const dir = path.dirname(resolvedPath);
        try { require('fs').mkdirSync(dir, { recursive: true }); } catch (_) {}
    }
    db = new sqlite3.Database(resolvedPath);
    
    // Criar tabelas
    db.serialize(() => {
        // Tabela de jogadores
        db.run(`CREATE TABLE IF NOT EXISTS players (
            user_id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            money INTEGER DEFAULT 1000,
            badges TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabela de Pokémon dos jogadores
        db.run(`CREATE TABLE IF NOT EXISTS player_pokemon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            pokemon_id INTEGER NOT NULL,
            nickname TEXT,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            hp INTEGER NOT NULL,
            max_hp INTEGER NOT NULL,
            attack INTEGER NOT NULL,
            defense INTEGER NOT NULL,
            speed INTEGER NOT NULL,
            special_attack INTEGER NOT NULL,
            special_defense INTEGER NOT NULL,
            moves TEXT DEFAULT '[]',
            status TEXT DEFAULT 'normal',
            is_shiny BOOLEAN DEFAULT 0,
            in_team INTEGER DEFAULT 0,
            team_slot INTEGER,
            caught_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players (user_id)
        )`);

        // Tabela de inventário
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            user_id TEXT NOT NULL,
            item_id TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            PRIMARY KEY (user_id, item_id),
            FOREIGN KEY (user_id) REFERENCES players (user_id)
        )`);

        // Tabela de batalhas ativas
        db.run(`CREATE TABLE IF NOT EXISTS active_battles (
            battle_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            opponent_type TEXT NOT NULL,
            opponent_pokemon TEXT NOT NULL,
            player_pokemon_id INTEGER,
            turn INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players (user_id),
            FOREIGN KEY (player_pokemon_id) REFERENCES player_pokemon (id)
        )`);

        // Tabela de Pokédex por usuário
        db.run(`CREATE TABLE IF NOT EXISTS pokedex (
            user_id TEXT NOT NULL,
            pokemon_id INTEGER NOT NULL,
            discovered INTEGER DEFAULT 0,
            captured INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, pokemon_id)
        )`);

        // Tabela de estoque da loja (restock diário)
        db.run(`CREATE TABLE IF NOT EXISTS shop_stock (
            item_id TEXT PRIMARY KEY,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            restocked_at DATETIME NOT NULL
        )`);

        // Progresso diário (batalha do dia / recompensa)
        db.run(`CREATE TABLE IF NOT EXISTS daily_progress (
            user_id TEXT PRIMARY KEY,
            last_battle_at DATE,
            last_reward_at DATE
        )`);

        console.log('✅ Banco de dados inicializado com sucesso!');
        // Migrações leves para garantir colunas obrigatórias em bancos antigos
        try { migrateLegacySchemas(); } catch (e) { console.warn('Aviso: falha na migração leve:', e?.message || e); }
    });
}

// Funções para jogadores
function getPlayer(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM players WHERE user_id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getDb() {
    return db;
}

function close() {
    return new Promise((resolve, reject) => {
        if (!db) return resolve();
        db.close(err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Migrações: garantir colunas que podem faltar em bancos antigos
function migrateLegacySchemas() {
    // player_pokemon pode faltar colunas em bases antigas
    ensureColumns('player_pokemon', [
        { name: 'moves', def: "TEXT DEFAULT '[]'" },
        { name: 'status', def: "TEXT DEFAULT 'normal'" },
        { name: 'is_shiny', def: 'BOOLEAN DEFAULT 0' },
        { name: 'in_team', def: 'INTEGER DEFAULT 0' },
        { name: 'team_slot', def: 'INTEGER' },
        { name: 'special_attack', def: 'INTEGER DEFAULT 0' },
        { name: 'special_defense', def: 'INTEGER DEFAULT 0' },
    ]);
}

function ensureColumns(tableName, columns) {
    db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
        if (err) { console.warn(`PRAGMA table_info falhou para ${tableName}:`, err.message); return; }
        const existing = new Set((rows || []).map(r => r.name));
        columns.forEach(col => {
            if (!existing.has(col.name)) {
                const sql = `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.def}`;
                db.run(sql, [], err2 => {
                    if (err2) console.warn(`Falha ao adicionar coluna ${col.name} em ${tableName}:`, err2.message);
                    else console.log(`ℹ️ Coluna adicionada: ${tableName}.${col.name}`);
                });
            }
        });
    });
}

function createPlayer(userId, username) {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO players (user_id, username) VALUES (?, ?)', 
            [userId, username], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
}

function updatePlayer(userId, updates) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(userId);
    
    return new Promise((resolve, reject) => {
        db.run(`UPDATE players SET ${setClause} WHERE user_id = ?`, values, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Funções para Pokémon
function getPlayerPokemon(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM player_pokemon WHERE user_id = ? ORDER BY level DESC', 
            [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
    });
}

function getPlayerTeam(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM player_pokemon WHERE user_id = ? AND in_team = 1 ORDER BY COALESCE(team_slot, 999), id LIMIT 6', [userId], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
}

function setTeamMember(userId, pokemonId, inTeam, teamSlot = null) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE player_pokemon SET in_team = ?, team_slot = ? WHERE user_id = ? AND id = ?',
            [inTeam ? 1 : 0, teamSlot, userId, pokemonId], function(err) {
                if (err) reject(err); else resolve(this.changes);
            });
    });
}

function countTeamMembers(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as c FROM player_pokemon WHERE user_id = ? AND in_team = 1', [userId], (err, row) => {
            if (err) reject(err); else resolve(row?.c || 0);
        });
    });
}

function addPokemon(userId, pokemonData) {
    return new Promise((resolve, reject) => {
        const { pokemon_id, nickname, hp, max_hp, attack, defense, speed, special_attack, special_defense, moves, is_shiny } = pokemonData;
        
        db.run(`INSERT INTO player_pokemon 
            (user_id, pokemon_id, nickname, hp, max_hp, attack, defense, speed, special_attack, special_defense, moves, is_shiny)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, pokemon_id, nickname, hp, max_hp, attack, defense, speed, special_attack, special_defense, JSON.stringify(moves), is_shiny ? 1 : 0],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
}

function updatePokemon(pokemonId, updates) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(pokemonId);
    
    return new Promise((resolve, reject) => {
        db.run(`UPDATE player_pokemon SET ${setClause} WHERE id = ?`, values, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Funções para inventário
function getInventory(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM inventory WHERE user_id = ?', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function addItem(userId, itemId, quantity = 1) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)
                ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + ?`,
            [userId, itemId, quantity, quantity], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

function removeItem(userId, itemId, quantity = 1) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ? AND quantity >= ?`,
            [quantity, userId, itemId, quantity], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

// Loja: estoque e transações
function getShopStock() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM shop_stock', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function setShopStock(items) {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        const stmt = db.prepare('REPLACE INTO shop_stock (item_id, price, quantity, restocked_at) VALUES (?, ?, ?, ?)');
        db.serialize(() => {
            for (const it of items) {
                stmt.run([it.item_id, it.price, it.quantity, now]);
            }
            stmt.finalize(err => {
                if (err) reject(err); else resolve();
            });
        });
    });
}

function restockShopIfNeeded(generatorFn) {
    return new Promise((resolve, reject) => {
        db.get('SELECT MAX(restocked_at) as last FROM shop_stock', [], async (err, row) => {
            if (err) return reject(err);
            const last = row && row.last ? new Date(row.last) : null;
            const need = !last || (Date.now() - last.getTime() > 24 * 60 * 60 * 1000);
            if (!need) return resolve(false);
            try {
                const items = generatorFn();
                await setShopStock(items);
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    });
}

function decrementShopStock(itemId, quantity) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE shop_stock SET quantity = quantity - ? WHERE item_id = ? AND quantity >= ?',
            [quantity, itemId, quantity], function(err) {
                if (err) reject(err); else resolve(this.changes);
            });
    });
}

// Transação de compra: valida estoque e saldo, atualiza tudo de forma atômica
function purchaseItem(userId, itemId, quantity) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN IMMEDIATE');
            db.get('SELECT price, quantity FROM shop_stock WHERE item_id = ?', [itemId], (err, stock) => {
                if (err) { db.run('ROLLBACK'); return reject(err); }
                if (!stock || stock.quantity < quantity) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'stock' }); }
                const total = stock.price * quantity;
                db.get('SELECT money FROM players WHERE user_id = ?', [userId], (err2, player) => {
                    if (err2) { db.run('ROLLBACK'); return reject(err2); }
                    if (!player || player.money < total) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'money', need: total, have: player?.money || 0 }); }
                    db.run('UPDATE shop_stock SET quantity = quantity - ? WHERE item_id = ? AND quantity >= ?',
                        [quantity, itemId, quantity], function(err3) {
                            if (err3 || this.changes === 0) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'stock' }); }
                            db.run('UPDATE players SET money = money - ? WHERE user_id = ?', [total, userId], function(err4) {
                                if (err4) { db.run('ROLLBACK'); return reject(err4); }
                                db.run(`INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)
                                        ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + ?`,
                                    [userId, itemId, quantity, quantity], function(err5) {
                                        if (err5) { db.run('ROLLBACK'); return reject(err5); }
                                        db.run('COMMIT', (err6) => {
                                            if (err6) { db.run('ROLLBACK'); return reject(err6); }
                                            resolve({ ok: true, price: stock.price, total });
                                        });
                                    });
                            });
                        });
                });
            });
        });
    });
}

// Transação de venda: remove item do inventário e credita dinheiro
function sellItem(userId, itemId, quantity, unitPrice) {
    return new Promise((resolve, reject) => {
        const total = unitPrice * quantity;
        db.serialize(() => {
            db.run('BEGIN IMMEDIATE');
            db.run('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ? AND quantity >= ?',
                [quantity, userId, itemId, quantity], function(err) {
                    if (err) { db.run('ROLLBACK'); return reject(err); }
                    if (this.changes === 0) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'inventory' }); }
                    db.run('UPDATE players SET money = money + ? WHERE user_id = ?', [total, userId], function(err2) {
                        if (err2) { db.run('ROLLBACK'); return reject(err2); }
                        db.run('COMMIT', (err3) => {
                            if (err3) { db.run('ROLLBACK'); return reject(err3); }
                            resolve({ ok: true, total });
                        });
                    });
                });
        });
    });
}

// Adicionar ao time com validações de slot e limite
function addToTeam(userId, pokemonId, slot) {
    return new Promise((resolve, reject) => {
        if (!(slot >= 1 && slot <= 6)) return resolve({ ok: false, reason: 'slot' });
        db.serialize(() => {
            db.run('BEGIN IMMEDIATE');
            db.get('SELECT id FROM player_pokemon WHERE id = ? AND user_id = ?', [pokemonId, userId], (err, row) => {
                if (err) { db.run('ROLLBACK'); return reject(err); }
                if (!row) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'ownership' }); }
                db.get('SELECT COUNT(1) as c FROM player_pokemon WHERE user_id = ? AND in_team = 1', [userId], (err2, cnt) => {
                    if (err2) { db.run('ROLLBACK'); return reject(err2); }
                    if (cnt.c >= 6) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'limit' }); }
                    // Liberar slot, se ocupado
                    db.run('UPDATE player_pokemon SET in_team = 0, team_slot = NULL WHERE user_id = ? AND team_slot = ?', [userId, slot], function(err3) {
                        if (err3) { db.run('ROLLBACK'); return reject(err3); }
                        db.run('UPDATE player_pokemon SET in_team = 1, team_slot = ? WHERE id = ? AND user_id = ?', [slot, pokemonId, userId], function(err4) {
                            if (err4) { db.run('ROLLBACK'); return reject(err4); }
                            if (this.changes === 0) { db.run('ROLLBACK'); return resolve({ ok: false, reason: 'ownership' }); }
                            db.run('COMMIT', (err5) => {
                                if (err5) { db.run('ROLLBACK'); return reject(err5); }
                                resolve({ ok: true });
                            });
                        });
                    });
                });
            });
        });
    });
}

function removeFromTeam(userId, pokemonId) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE player_pokemon SET in_team = 0, team_slot = NULL WHERE id = ? AND user_id = ?', [pokemonId, userId], function(err) {
            if (err) return reject(err);
            resolve({ ok: this.changes > 0 });
        });
    });
}

// Progresso diário
function markDailyBattle(userId) {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO daily_progress (user_id, last_battle_at, last_reward_at)
                VALUES (?, ?, NULL)
                ON CONFLICT(user_id) DO UPDATE SET last_battle_at = ?`,
            [userId, today, today], function(err) {
                if (err) reject(err); else resolve(this.changes);
            });
    });
}

function getDailyProgress(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM daily_progress WHERE user_id = ?', [userId], (err, row) => {
            if (err) reject(err); else resolve(row);
        });
    });
}

function setDailyRewardClaimed(userId) {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO daily_progress (user_id, last_reward_at)
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET last_reward_at = ?`,
            [userId, today, today], function(err) {
                if (err) reject(err); else resolve(this.changes);
            });
    });
}

// Funções para batalhas
function createBattle(battleId, userId, opponentType, opponentPokemon) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO active_battles (battle_id, user_id, opponent_type, opponent_pokemon) VALUES (?, ?, ?, ?)',
            [battleId, userId, opponentType, JSON.stringify(opponentPokemon)], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
}

function getBattle(battleId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM active_battles WHERE battle_id = ?', [battleId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function updateBattle(battleId, updates) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(battleId);
    
    return new Promise((resolve, reject) => {
        db.run(`UPDATE active_battles SET ${setClause} WHERE battle_id = ?`, values, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

function deleteBattle(battleId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM active_battles WHERE battle_id = ?', [battleId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Funções de Pokédex
function getPokedex(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM pokedex WHERE user_id = ?', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function markPokedexDiscovered(userId, pokemonId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO pokedex (user_id, pokemon_id, discovered, captured)
                VALUES (?, ?, 1, 0)
                ON CONFLICT(user_id, pokemon_id) DO UPDATE SET discovered = 1`,
            [userId, pokemonId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

function markPokedexCaptured(userId, pokemonId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO pokedex (user_id, pokemon_id, discovered, captured)
                VALUES (?, ?, 1, 1)
                ON CONFLICT(user_id, pokemon_id) DO UPDATE SET discovered = 1, captured = 1`,
            [userId, pokemonId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

module.exports = {
    init,
    getDb,
    close,
    getPlayer,
    createPlayer,
    updatePlayer,
    getPlayerPokemon,
    getPlayerTeam,
    setTeamMember,
    countTeamMembers,
    addPokemon,
    updatePokemon,
    getInventory,
    addItem,
    removeItem,
    createBattle,
    getBattle,
    updateBattle,
    deleteBattle
    , getPokedex
    , markPokedexDiscovered
    , markPokedexCaptured
    , getShopStock
    , setShopStock
    , restockShopIfNeeded
    , decrementShopStock
    , markDailyBattle
    , getDailyProgress
    , setDailyRewardClaimed
    , purchaseItem
    , sellItem
    , addToTeam
    , removeFromTeam
};
