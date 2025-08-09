const dbModule = require('../systems/database');

beforeAll(() => {
  process.env.DB_PATH = ':memory:';
  dbModule.init(':memory:');
});

afterAll(async () => {
  await dbModule.close();
});

describe('database module', () => {
  test('create and get player', async () => {
    await dbModule.createPlayer('user1', 'Ash');
    const player = await dbModule.getPlayer('user1');
    expect(player).toBeDefined();
    expect(player.username).toBe('Ash');
    expect(player.money).toBe(1000);
  });

  test('add pokemon to player', async () => {
    const pokemonData = {
      pokemon_id: 1,
      nickname: 'Buddy',
      hp: 20,
      max_hp: 20,
      attack: 10,
      defense: 10,
      speed: 10,
      special_attack: 10,
      special_defense: 10,
      moves: ['Tackle'],
      is_shiny: false,
    };
    await dbModule.addPokemon('user1', pokemonData);
    const list = await dbModule.getPlayerPokemon('user1');
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].pokemon_id).toBe(1);
  });

  test('inventory add and remove', async () => {
    await dbModule.addItem('user1', 'pokeball', 3);
    const inv = await dbModule.getInventory('user1');
    const item = inv.find(i => i.item_id === 'pokeball');
    expect(item).toBeDefined();
    expect(item.quantity).toBe(3);

    await dbModule.removeItem('user1', 'pokeball', 1);
    const inv2 = await dbModule.getInventory('user1');
    const item2 = inv2.find(i => i.item_id === 'pokeball');
    expect(item2.quantity).toBe(2);
  });
});
