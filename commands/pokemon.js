const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getPlayer, getPlayerPokemon } = require('../systems/database');
const { getPokemon } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Mostra seus Pokémon capturados'),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;

        try {
            // Verificar se o jogador existe
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Obter Pokémon do jogador
            const pokemon = await getPlayerPokemon(userId);
            
            if (pokemon.length === 0) {
                return await replyError(interaction, { description: 'Você ainda não capturou nenhum Pokémon. Use `/battle` para encontrar Pokémon selvagens!' });
            }

            // Ordenar Pokémon por nível (mais alto primeiro)
            pokemon.sort((a, b) => b.level - a.level);

            // Criar lista de Pokémon
            let pokemonList = '';
            let totalStats = 0;

            for (let i = 0; i < Math.min(pokemon.length, 10); i++) {
                const p = pokemon[i];
                const basePokemon = getPokemon(p.pokemon_id) || { name: `Pokémon #${p.pokemon_id}`, types: [] };
                let movesArray;
                if (Array.isArray(p.moves)) movesArray = p.moves;
                else if (typeof p.moves === 'string') { try { const parsed = JSON.parse(p.moves); movesArray = Array.isArray(parsed) ? parsed : []; } catch (_) { movesArray = []; } }
                else movesArray = [];
                const stats = p.attack + p.defense + p.speed + p.special_attack + p.special_defense;
                totalStats += stats;
                
                const shinyIcon = p.is_shiny ? '✨ ' : '';
                const statusIcon = p.hp <= 0 ? '💀 ' : p.hp < p.max_hp / 2 ? '🟡 ' : '🟢 ';
                
                pokemonList += `${statusIcon}${shinyIcon}**${p.nickname || basePokemon.name}** (Nv.${p.level})\n`;
                const types = Array.isArray(basePokemon.types) && basePokemon.types.length ? basePokemon.types.join(', ') : 'Desconhecido';
                pokemonList += `   HP: ${p.hp}/${p.max_hp} | Tipos: ${types}\n`;
                pokemonList += `   Stats: ${stats} | Movimentos: ${movesArray.length}\n\n`;
            }

            // Criar embed
            const embed = new EmbedBuilder()
                .setColor('#4ecdc4')
                .setTitle(`🎒 Pokédex de ${player.username}`)
                .setDescription(`Você tem **${pokemon.length}** Pokémon capturados!`)
                .addFields(
                    { 
                        name: '📊 Estatísticas gerais', 
                        value: `**Total de Pokémon:** ${pokemon.length}\n**Nível médio:** ${Math.round(pokemon.reduce((sum, p) => sum + p.level, 0) / pokemon.length)}\n**Shinies:** ${pokemon.filter(p => p.is_shiny).length}\n**Pokémon desmaiados:** ${pokemon.filter(p => p.hp <= 0).length}`, 
                        inline: true 
                    },
                    { 
                        name: '🏆 Melhores Pokémon', 
                        value: (() => {
                          const strongest = pokemon[0];
                          const mostHp = pokemon.reduce((max, x) => x.max_hp > max.max_hp ? x : max, pokemon[0]);
                          const fastest = pokemon.reduce((max, x) => x.speed > max.speed ? x : max, pokemon[0]);
                          const n1 = strongest.nickname || (getPokemon(strongest.pokemon_id)?.name || `Pokémon #${strongest.pokemon_id}`);
                          const n2 = mostHp.nickname || (getPokemon(mostHp.pokemon_id)?.name || `Pokémon #${mostHp.pokemon_id}`);
                          const n3 = fastest.nickname || (getPokemon(fastest.pokemon_id)?.name || `Pokémon #${fastest.pokemon_id}`);
                          return `**Mais forte:** ${n1} (Nv.${strongest.level})\n**Mais HP:** ${n2}\n**Mais veloz:** ${n3}`;
                        })(), 
                        inline: true 
                    }
                )
                .addFields({
                    name: '📋 Seus Pokémon',
                    value: pokemonList || 'Nenhum Pokémon encontrado.',
                    inline: false
                })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `Mostrando ${Math.min(pokemon.length, 10)} de ${pokemon.length} Pokémon` });

            // Criar botões se houver mais de 10 Pokémon
            const components = [];
            if (pokemon.length > 10) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('pokemon_prev')
                            .setLabel('◀️ Anterior')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('pokemon_next')
                            .setLabel('Próximo ▶️')
                            .setStyle(ButtonStyle.Primary)
                    );
                components.push(row);
            }

            await interaction.editReply({ 
                embeds: [embed],
                components: components
            });

        } catch (error) {
            console.error('Erro ao mostrar Pokémon:', error);
            await replyError(interaction, { description: 'Houve um erro ao carregar seus Pokémon. Tente novamente!' });
        }
    },
};
