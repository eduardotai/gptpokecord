const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPokemonByIdOrName, getSpeciesById, pickFlavor } = require('../utils/pokeapi');

function formatTypes(poke) {
  const types = poke.types?.map(t => t.type?.name).filter(Boolean) || [];
  return types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') || 'Desconhecido';
}

function formatAbilities(poke) {
  const abilities = poke.abilities?.map(a => a.ability?.name).filter(Boolean) || [];
  return abilities.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') || '—';
}

function formatStats(poke) {
  const map = new Map();
  for (const s of poke.stats || []) {
    map.set(s.stat?.name, s.base_stat);
  }
  const order = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  return order.map(n => `${n.replace('special-', 'Sp. ')}: ${map.get(n) ?? '?'}`).join(' | ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dex')
    .setDescription('Mostra detalhes de um Pokémon usando a PokeAPI')
    .addStringOption(opt => opt.setName('nome_ou_id').setDescription('Nome ou ID do Pokémon').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('nome_ou_id').trim().toLowerCase();

    try {
      const poke = await getPokemonByIdOrName(query);
      const species = await getSpeciesById(poke.id);
      const name = (species?.names?.find(n => n.language?.name === 'pt')?.name) || (poke.name?.charAt(0).toUpperCase() + poke.name?.slice(1)) || 'Pokémon';
      const flavor = pickFlavor(species);
      const types = formatTypes(poke);
      const abilities = formatAbilities(poke);
      const stats = formatStats(poke);
      const art = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`;

      const embed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle(`#${poke.id} — ${name}`)
        .setDescription(flavor || 'Sem descrição disponível.')
        .addFields(
          { name: 'Tipos', value: types, inline: true },
          { name: 'Habilidades', value: abilities, inline: true },
          { name: 'Stats Base', value: stats }
        )
        .setImage(art)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ content: 'Não encontrei esse Pokémon na PokeAPI. Tente outro nome/ID.' });
    }
  }
};
