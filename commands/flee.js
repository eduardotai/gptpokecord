const { SlashCommandBuilder } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flee')
    .setDescription('Tenta fugir da batalha atual'),

  async execute(interaction) {
    try {
      await defer(interaction, false);
      const battle = battleSystem.getActiveBattleForUser(interaction.user.id);
      if (!battle || battle.status !== 'active') {
        return replyError(interaction, { description: 'Você não possui uma batalha ativa.', ephemeral: false });
      }
      const result = await battleSystem.flee(battle.id);
      if (!result) {
        return replyError(interaction, { description: 'Não foi possível fugir.', ephemeral: false });
      }
      return replyInfo(interaction, { title: '🏃 Fugir', description: result.message, ephemeral: false });
    } catch (e) {
      return replyError(interaction, { description: 'Erro ao fugir.', ephemeral: false });
    }
  },
};



