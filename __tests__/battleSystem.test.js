const battleSystem = require('../systems/battleSystem');
const dbModule = require('../systems/database');
const pd = require('../systems/pokemonData');

beforeAll(() => {
  process.env.DB_PATH = ':memory:';
  dbModule.init(':memory:');
});

afterAll(async () => {
  battleSystem.reset();
  await dbModule.close();
});

describe('battleSystem', () => {
  test('start battle and select player pokemon', async () => {
    await dbModule.createPlayer('u1', 'Ash');
    const base = pd.getPokemon(1);
    const pokemonData = {
      pokemon_id: base.id,
      nickname: base.name,
      hp: 20,
      max_hp: 20,
      attack: 10,
      defense: 10,
      speed: 10,
      special_attack: 10,
      special_defense: 10,
      moves: base.moves.slice(0, 2),
      is_shiny: false,
    };
    const pokeId = await dbModule.addPokemon('u1', pokemonData);
    const list = await dbModule.getPlayerPokemon('u1');
    const playerPokemon = list[0];

    const battleId = 'u1_1';
    const battle = await battleSystem.startBattle('u1', battleId);
    expect(battle).toBeDefined();

    const status = await battleSystem.selectPokemon(battleId, playerPokemon);
    expect(status).toBeDefined();
    expect(status.battle.playerPokemon).toBeDefined();
  });

  test('execute attack updates opponent HP', async () => {
    const battleId = 'u1_2';
    const base = pd.getPokemon(4);
    await dbModule.createPlayer('u2', 'Misty');
    await dbModule.addPokemon('u2', {
      pokemon_id: base.id,
      nickname: base.name,
      hp: 22,
      max_hp: 22,
      attack: 11,
      defense: 11,
      speed: 10,
      special_attack: 12,
      special_defense: 10,
      moves: base.moves.slice(0, 2),
      is_shiny: false,
    });

    const list = await dbModule.getPlayerPokemon('u2');
    const playerPokemon = list[0];

    await battleSystem.startBattle('u2', battleId);
    await battleSystem.selectPokemon(battleId, playerPokemon);
    const before = battleSystem.getBattle(battleId).opponent.currentHp;
    const result = await battleSystem.executeAttack(battleId, playerPokemon.moves[0]);
    expect(result).toBeDefined();
    const after = battleSystem.getBattle(battleId).opponent.currentHp;
    expect(after).toBeLessThanOrEqual(before);
  });
});
