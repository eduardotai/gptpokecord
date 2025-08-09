const { SlashCommandBuilder } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catch')
    .setDescription('Tenta capturar o Pokémon selvagem da batalha atual')
    .addStringOption(opt =>
      opt.setName('tipo_bola')
        .setDescription('Tipo de Pokébola (pokeball, greatball, ultraball, masterball)')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await defer(interaction, false);
      const ball = interaction.options.getString('tipo_bola') || 'pokeball';
      const battle = battleSystem.getActiveBattleForUser(interaction.user.id);
      if (!battle || battle.status !== 'active') {
        return replyError(interaction, { description: 'Você não possui uma batalha ativa.' , ephemeral: false});
      }
      const result = await battleSystem.attemptCapture(battle.id, ball);
      if (!result || result.error) {
        return replyError(interaction, { description: result?.error || 'Não foi possível capturar.', ephemeral: false });
      }
      return replyInfo(interaction, { title: '🎾 Captura', description: result.message, ephemeral: false });
    } catch (e) {
      return replyError(interaction, { description: 'Erro ao capturar.', ephemeral: false });
    }
  },
};



