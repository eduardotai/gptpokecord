const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, getPlayerPokemon } = require('../systems/database');
const db = require('../systems/database');
const { getPokemon } = require('../systems/pokemonData');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Gerenciar time (até 6 Pokémon)')
    .addSubcommand(sc => sc.setName('view').setDescription('Ver seu time atual'))
    .addSubcommand(sc => sc.setName('add').setDescription('Adicionar Pokémon ao time')
      .addIntegerOption(o => o.setName('id').setDescription('ID interno do Pokémon (da lista /pokemon)').setRequired(true))
      .addIntegerOption(o => o.setName('slot').setDescription('Posição no time 1-6').setMinValue(1).setMaxValue(6).setRequired(true)))
    .addSubcommand(sc => sc.setName('remove').setDescription('Remover Pokémon do time')
      .addIntegerOption(o => o.setName('id').setDescription('ID interno do Pokémon').setRequired(true)))
  ,
  async execute(interaction) {
    await defer(interaction, false);
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    if (!player) {
      return replyError(interaction, { description: 'Use `/start` para começar.' });
    }

    const sub = interaction.options.getSubcommand();
    if (sub === 'view') {
      const team = await db.getPlayerTeam(userId);
      const embed = new EmbedBuilder().setColor('#4ecdc4').setTitle('👥 Seu time');
      if (team.length === 0) {
        embed.setDescription('Seu time está vazio. Use `/team add` para adicionar até 6 Pokémon.');
      } else {
        let lines = '';
        for (const t of team) {
          const base = getPokemon(t.pokemon_id);
          lines += `Slot ${t.team_slot || '?'}: ${t.nickname || base.name} (Nv.${t.level}) - HP ${t.hp}/${t.max_hp}\n`;
        }
        embed.setDescription(lines);
      }
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'add') {
      const pokemonId = interaction.options.getInteger('id');
      const slot = interaction.options.getInteger('slot');
      const all = await getPlayerPokemon(userId);
      const p = all.find(x => x.id === pokemonId);
      if (!p) {
        return replyError(interaction, { description: 'Pokémon não encontrado no seu box.' });
      }
      const result = await db.addToTeam(userId, pokemonId, slot);
      if (!result.ok) {
        if (result.reason === 'slot') {
          return replyError(interaction, { description: 'Slot inválido. Use um valor entre 1 e 6.' });
        }
        if (result.reason === 'ownership') {
          return replyError(interaction, { description: 'Você não possui esse Pokémon.' });
        }
        if (result.reason === 'limit') {
          return replyError(interaction, { description: 'Seu time já tem 6 Pokémon.' });
        }
        return replyError(interaction, { description: 'Não foi possível adicionar ao time. Tente novamente.' });
      }
      return replyInfo(interaction, { description: 'Adicionado ao time.' });
    }

    if (sub === 'remove') {
      const pokemonId = interaction.options.getInteger('id');
      const res = await db.removeFromTeam(userId, pokemonId);
      if (!res.ok) {
        return replyError(interaction, { description: 'Não foi possível remover do time. Verifique o ID informado.' });
      }
      return replyInfo(interaction, { description: 'Removido do time.' });
    }
  }
}


