const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../systems/database');
const spawnSystem = require('../systems/spawnSystem');
const { itemData } = require('../systems/pokemonData');
const config = require('../config');
const { defer, replyError, replySuccess } = require('../utils/replies');

// Somente um usuário mestre pode usar
const MASTER_USER_ID = config.masterUserId;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Ferramentas de teste (somente master)')
    .addSubcommand(sc => sc.setName('spawn').setDescription('Spawnar um Pokémon agora (canal atual)')
      .addIntegerOption(o => o.setName('id').setDescription('ID do Pokédex (1-151)').setRequired(false))
      .addIntegerOption(o => o.setName('level').setDescription('Nivel').setRequired(false)))
    .addSubcommand(sc => sc.setName('coins').setDescription('Adicionar Pokécoins ao jogador')
      .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade').setRequired(true)))
    .addSubcommand(sc => sc.setName('item').setDescription('Adicionar item ao inventário')
      .addStringOption(o => o.setName('id').setDescription('ID do item (ex: pokeball)').setRequired(true))
      .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade').setRequired(true)))
    ,

  async execute(interaction) {
    if (!MASTER_USER_ID || interaction.user.id !== MASTER_USER_ID) {
      return replyError(interaction, { description: 'Permissão negada.' });
    }
    await defer(interaction, true);

    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === 'spawn') {
      const id = interaction.options.getInteger('id') || undefined;
      const level = interaction.options.getInteger('level') || undefined;
      try {
        await spawnSystem.spawnRandomEncounterInChannel(interaction.client, interaction.channelId, { id, level });
        return replySuccess(interaction, { description: 'Spawn solicitado.' });
      } catch (e) {
        const msg = (e && e.message) ? e.message : 'Falha ao criar o spawn.';
        return replyError(interaction, { description: msg });
      }
    }

    if (sub === 'coins') {
      const qtd = interaction.options.getInteger('quantidade');
      const player = await db.getPlayer(userId);
      if (!player) return replyError(interaction, { description: 'Crie um perfil com /start primeiro.' });
      await db.updatePlayer(userId, { money: player.money + qtd });
      return replySuccess(interaction, { description: `Adicionado ${qtd} Pokécoins.` });
    }

    if (sub === 'item') {
      const id = interaction.options.getString('id');
      const qtd = interaction.options.getInteger('quantidade');
      if (!itemData[id]) return replyError(interaction, { description: 'Item inválido.' });
      await db.addItem(userId, id, qtd);
      return replySuccess(interaction, { description: `Adicionado ${qtd}x ${itemData[id].name}.` });
    }
  }
}


