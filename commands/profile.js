const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, getPlayerPokemon } = require('../systems/database');
const { getPokemon } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Mostra seu perfil de treinador Pokémon'),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;

        try {
            // Obter dados do jogador
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Obter Pokémon do jogador
            const pokemon = await getPlayerPokemon(userId);
            const badges = JSON.parse(player.badges || '[]');

            // Calcular estatísticas
            const totalPokemon = pokemon.length;
            const highestLevel = pokemon.length > 0 ? Math.max(...pokemon.map(p => p.level)) : 0;
            const totalExperience = pokemon.reduce((sum, p) => sum + p.experience, 0);
            const shinyCount = pokemon.filter(p => p.is_shiny).length;

            // Criar embed do perfil
            const embed = new EmbedBuilder()
                .setColor('#4ecdc4')
                .setTitle(`👤 Perfil de ${player.username}`)
                .setDescription(`Treinador Pokémon Nível ${player.level}`)
                .addFields(
                    { 
                        name: '📊 Estatísticas', 
                        value: `**Nível:** ${player.level}\n**Experiência:** ${player.experience}\n**Dinheiro:** ${player.money} Pokécoins\n**Badges:** ${badges.length}/8`, 
                        inline: true 
                    },
                    { 
                        name: '🎮 Progresso', 
                        value: `**Pokémon capturados:** ${totalPokemon}\n**Nível mais alto:** ${highestLevel}\n**Total de EXP:** ${totalExperience}\n**Shinies:** ${shinyCount}`, 
                        inline: true 
                    }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            // Adicionar badges se houver
            if (badges.length > 0) {
                embed.addFields({
                    name: '🏆 Badges conquistadas',
                    value: badges.map(badge => `• ${badge}`).join('\n'),
                    inline: false
                });
            }

            // Adicionar Pokémon mais forte
            if (pokemon.length > 0) {
                const strongestPokemon = pokemon.reduce((strongest, current) => 
                    current.level > strongest.level ? current : strongest
                );
                
                embed.addFields({
                    name: '⚡ Pokémon mais forte',
                    value: `**${strongestPokemon.nickname || getPokemon(strongestPokemon.pokemon_id).name}** (Nv.${strongestPokemon.level})`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao mostrar perfil:', error);
            await replyError(interaction, { description: 'Houve um erro ao carregar seu perfil. Tente novamente!' });
        }
    },
};
