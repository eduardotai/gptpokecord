const { SlashCommandBuilder } = require('discord.js');
const db = require('../systems/database');
const { addItem, updatePlayer, getPlayer } = require('../systems/database');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Recebe recompensas diárias (requer ter batalhado hoje)')
    ,
  async execute(interaction) {
    await defer(interaction, false);
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    if (!player) {
      return replyError(interaction, { description: 'Use `/start` para começar.' , ephemeral: false});
    }
    const prog = await db.getDailyProgress(userId);
    const today = new Date().toISOString().slice(0, 10);
    const battledToday = prog && prog.last_battle_at === today;
    if (!battledToday) {
      return replyError(interaction, { description: 'Você precisa concluir pelo menos 1 batalha hoje para resgatar a recompensa.' , ephemeral: false});
    }
    const alreadyClaimed = prog && prog.last_reward_at === today;
    if (alreadyClaimed) {
      return replyError(interaction, { description: 'Volte amanhã para uma nova recompensa.' , ephemeral: false});
    }

    // Recompensas diárias: Pokécoins + itens
    const coins = 300;
    await updatePlayer(userId, { money: player.money + coins });
    await addItem(userId, 'pokeball', 1);
    await db.setDailyRewardClaimed(userId);

    return replyInfo(interaction, { title: '🎁 Recompensa diária', description: `Parabéns! Você batalhou hoje e recebeu sua recompensa:\n• Pokécoins: ${coins}\n• Itens: 1x Poké Ball`, ephemeral: false });
  }
}


