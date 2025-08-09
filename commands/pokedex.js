const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer } = require('../systems/database');
const { getPokedex } = require('../systems/database');
const { pokemonData } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pokedex')
    .setDescription('Visualiza sua Pokédex: descobertos, capturados e não descobertos')
    .addIntegerOption(opt => opt.setName('pagina').setDescription('Página para navegar').setMinValue(1).setRequired(false)),

  async execute(interaction) {
    await defer(interaction, false);

    const userId = interaction.user.id;
    const page = interaction.options.getInteger('pagina') || 1;
    const pageSize = 20;

    // validar jogador
    const player = await getPlayer(userId);
    if (!player) {
      return await replyError(interaction, { description: 'Use `/start` para começar sua jornada e habilitar a sua Pokédex.' });
    }

    const entries = await getPokedex(userId);
    const statusMap = new Map(entries.map(e => [Number(e.pokemon_id), { discovered: !!e.discovered, captured: !!e.captured }]));

    const total = 151; // primeira geração
    const items = [];
    for (let id = 1; id <= total; id++) {
      const base = pokemonData[id];
      const name = base ? base.name : `Pokemon ${id}`;
      const st = statusMap.get(id) || { discovered: false, captured: false };
      items.push({ id, name, ...st });
    }

    const totalDiscovered = items.filter(i => i.discovered).length;
    const totalCaptured = items.filter(i => i.captured).length;

    // paginação
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    let lines = '';
    for (const it of pageItems) {
      const statusIcon = it.captured ? '✅' : (it.discovered ? '👁️' : '❓');
      const displayName = it.discovered ? it.name : 'Desconhecido';
      lines += `#${String(it.id).padStart(3, '0')} ${statusIcon} ${displayName}` + (it.captured ? ' (Capturado)' : it.discovered ? ' (Visto)' : '') + '\n';
    }

    const embed = new EmbedBuilder()
      .setColor('#4ecdc4')
      .setTitle(`📗 Pokédex de ${interaction.user.username}`)
      .setDescription('Status: ✅ Capturado | 👁️ Descoberto | ❓ Não descoberto')
      .addFields(
        { name: 'Resumo', value: `Descobertos: ${totalDiscovered}/${total} | Capturados: ${totalCaptured}/${total}` },
        { name: `Entradas (página ${page})`, value: lines || 'Sem entradas nesta página.' }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};


