const { SlashCommandBuilder } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Usa um movimento específico na batalha atual')
    .addStringOption(opt =>
      opt.setName('movimento')
        .setDescription('Nome do movimento para usar')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await defer(interaction, false);
      const moveName = interaction.options.getString('movimento');
      const battle = battleSystem.getActiveBattleForUser(interaction.user.id);
      if (!battle || battle.status !== 'active') {
        return replyError(interaction, { description: 'Você não possui uma batalha ativa.' , ephemeral: false});
      }
      const result = await battleSystem.executeAttack(battle.id, moveName);
      if (!result || result.error) {
        return replyError(interaction, { description: result?.error || 'Não foi possível executar o ataque.', ephemeral: false });
      }
      return replyInfo(interaction, { title: '⚔️ Batalha Pokémon', description: result.message, ephemeral: false });
    } catch (e) {
      return replyError(interaction, { description: 'Erro ao atacar.', ephemeral: false });
    }
  },
};



