const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, getPlayerPokemon, updatePokemon, removeItem } = require('../systems/database');
const { getPokemon, getItem } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heal')
        .setDescription('Cura um Pokémon desmaiado')
        .addStringOption(option =>
            option.setName('pokemon')
                .setDescription('Nome do Pokémon para curar')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Item para usar na cura')
                .setRequired(false)
                .addChoices(
                    { name: 'Potion', value: 'potion' },
                    { name: 'Super Potion', value: 'superpotion' },
                    { name: 'Hyper Potion', value: 'hyperpotion' },
                    { name: 'Max Potion', value: 'maxpotion' },
                    { name: 'Revive', value: 'revive' },
                    { name: 'Max Revive', value: 'maxrevive' }
                )),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;
        const pokemonName = interaction.options.getString('pokemon');
        const itemName = interaction.options.getString('item');

        try {
            // Verificar se o jogador existe
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Obter Pokémon do jogador
            const playerPokemon = await getPlayerPokemon(userId);
            
            if (playerPokemon.length === 0) {
                return await replyError(interaction, { description: 'Você não tem Pokémon para curar.' });
            }

            // Escolher Pokémon para curar
            let selectedPokemon;
            if (pokemonName) {
                selectedPokemon = playerPokemon.find(p => {
                    const basePokemon = getPokemon(p.pokemon_id);
                    return p.nickname?.toLowerCase() === pokemonName.toLowerCase() ||
                           basePokemon.name.toLowerCase() === pokemonName.toLowerCase();
                });

                if (!selectedPokemon) {
                    return await replyError(interaction, { description: `Você não tem um Pokémon chamado "${pokemonName}".` });
                }
            } else {
                // Encontrar primeiro Pokémon desmaiado ou com HP baixo
                selectedPokemon = playerPokemon.find(p => p.hp <= 0) || 
                                playerPokemon.find(p => p.hp < p.max_hp);
                
                if (!selectedPokemon) {
                    return await replyError(interaction, { description: 'Todos os seus Pokémon estão com HP máximo.' });
                }
            }

            // Escolher item para usar
            const selectedItemId = itemName || (selectedPokemon.hp <= 0 ? 'revive' : 'potion');
            const itemToUse = getItem(selectedItemId);
            if (!itemToUse) {
                return await replyError(interaction, { description: `O item "${itemName}" não existe.` });
            }

            // Verificar se o jogador tem o item
            const inventory = await require('../systems/database').getInventory(userId);
            const hasItem = inventory.find(item => item.item_id === selectedItemId && item.quantity > 0);
            
            if (!hasItem) {
                return await replyError(interaction, { description: `Você não tem ${itemToUse.name} no seu inventário. Use \`/shop\` para comprar.` });
            }

            // Aplicar cura
            const basePokemon = getPokemon(selectedPokemon.pokemon_id);
            const oldHp = selectedPokemon.hp;
            let newHp = selectedPokemon.hp;
            let healAmount = 0;

            if (itemToUse.healAmount === 'max') {
                newHp = selectedPokemon.max_hp;
                healAmount = newHp - oldHp;
            } else if (itemToUse.healAmount) {
                newHp = Math.min(selectedPokemon.max_hp, oldHp + itemToUse.healAmount);
                healAmount = newHp - oldHp;
            } else if (itemToUse.name.includes('Revive')) {
                // Revive restaura metade do HP máximo
                newHp = Math.floor(selectedPokemon.max_hp / 2);
                healAmount = newHp - oldHp;
            }

            // Atualizar Pokémon
            await updatePokemon(selectedPokemon.id, { hp: newHp });
            
            // Remover item usado
            await removeItem(userId, selectedItemId, 1);

            // Criar embed de resultado
            const embed = new EmbedBuilder()
                .setColor('#4ecdc4')
                .setTitle('💊 Cura aplicada com sucesso!')
                .setDescription(`**${selectedPokemon.nickname || basePokemon.name}** foi curado usando **${itemToUse.name}**!`)
                .addFields(
                    { 
                        name: '📊 Status do Pokémon', 
                        value: `**${selectedPokemon.nickname || basePokemon.name}** (Nv.${selectedPokemon.level})\nHP: ${oldHp} → ${newHp}/${selectedPokemon.max_hp}`, 
                        inline: true 
                    },
                    { 
                        name: '💊 Item usado', 
                        value: `${itemToUse.name}\nRestaurou ${healAmount} HP`, 
                        inline: true 
                    }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao curar Pokémon:', error);
            await replyError(interaction, { description: 'Houve um erro ao curar o Pokémon. Tente novamente!' });
        }
    },
};
