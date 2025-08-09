const { SlashCommandBuilder } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const db = require('../systems/database');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Usa um item durante a batalha atual')
    .addStringOption(opt =>
      opt.setName('item')
        .setDescription('ID do item (ex: potion, superpotion, ultraball)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await defer(interaction, false);
      const itemId = interaction.options.getString('item');
      const battle = battleSystem.getActiveBattleForUser(interaction.user.id);
      if (!battle || battle.status !== 'active') {
        return await replyError(interaction, { description: 'Você não possui uma batalha ativa.' });
      }
      const inv = await db.getInventory(battle.userId);
      const hasItem = inv.find(x => x.item_id === itemId && x.quantity > 0);
      if (!hasItem) {
        return await replyError(interaction, { description: 'Você não possui este item.' });
      }
      const result = await battleSystem.useItem(battle.id, itemId, 'player');
      if (!result || result.error) {
        return await replyError(interaction, { description: result?.error || 'Não foi possível usar o item.' });
      }
      await replyInfo(interaction, { title: '💊 Item usado', description: result.message });
    } catch (e) {
      try { await replyError(interaction, { description: 'Erro ao usar item.' }); } catch (_) {}
    }
  },
};



