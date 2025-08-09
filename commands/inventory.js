const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, getInventory } = require('../systems/database');
const { getItem } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Mostra seu inventário de itens'),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;

        try {
            // Verificar se o jogador existe
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Obter inventário do jogador
            const inventory = await getInventory(userId);
            
            if (inventory.length === 0) {
                return await replyError(interaction, { description: 'Seu inventário está vazio. Use `/shop` para comprar itens!' });
            }

            // Organizar itens por categoria
            const pokeballs = inventory.filter(item => item.item_id.includes('ball'));
            const potions = inventory.filter(item => item.item_id.includes('potion'));
            const revives = inventory.filter(item => item.item_id.includes('revive'));
            const others = inventory.filter(item => 
                !item.item_id.includes('ball') && 
                !item.item_id.includes('potion') && 
                !item.item_id.includes('revive')
            );

            // Criar listas de itens
            let pokeballsList = '';
            let potionsList = '';
            let revivesList = '';
            let othersList = '';

            for (const item of pokeballs) {
                const itemData = getItem(item.item_id);
                pokeballsList += `• **${itemData.name}** x${item.quantity} - ${itemData.price} Pokécoins\n`;
            }

            for (const item of potions) {
                const itemData = getItem(item.item_id);
                potionsList += `• **${itemData.name}** x${item.quantity} - Restaura ${itemData.healAmount} HP\n`;
            }

            for (const item of revives) {
                const itemData = getItem(item.item_id);
                revivesList += `• **${itemData.name}** x${item.quantity} - ${itemData.price} Pokécoins\n`;
            }

            for (const item of others) {
                const itemData = getItem(item.item_id);
                othersList += `• **${itemData.name}** x${item.quantity} - ${itemData.price} Pokécoins\n`;
            }

            // Calcular estatísticas
            const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = inventory.reduce((sum, item) => {
                const itemData = getItem(item.item_id);
                return sum + (itemData.price * item.quantity);
            }, 0);

            // Criar embed
            const embed = new EmbedBuilder()
                .setColor('#4ecdc4')
                .setTitle(`🎒 Inventário de ${player.username}`)
                .setDescription(`Você tem **${totalItems}** itens no total, com valor de **${totalValue}** Pokécoins!`)
                .addFields(
                    { 
                        name: '💰 Dinheiro', 
                        value: `${player.money} Pokécoins`, 
                        inline: true 
                    },
                    { 
                        name: '📦 Total de itens', 
                        value: `${totalItems} itens`, 
                        inline: true 
                    },
                    { 
                        name: '💎 Valor total', 
                        value: `${totalValue} Pokécoins`, 
                        inline: true 
                    }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            // Adicionar categorias se houver itens
            if (pokeballsList) {
                embed.addFields({
                    name: '🎾 Pokébolas',
                    value: pokeballsList,
                    inline: false
                });
            }

            if (potionsList) {
                embed.addFields({
                    name: '💊 Poções',
                    value: potionsList,
                    inline: false
                });
            }

            if (revivesList) {
                embed.addFields({
                    name: '💉 Revives',
                    value: revivesList,
                    inline: false
                });
            }

            if (othersList) {
                embed.addFields({
                    name: '🔧 Outros itens',
                    value: othersList,
                    inline: false
                });
            }

            embed.addFields({
                name: '💡 Dicas',
                value: '• Use `/use <item>` para usar um item\n• Use `/shop` para comprar mais itens\n• Use `/battle` para usar itens em batalha',
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao mostrar inventário:', error);
            await replyError(interaction, { description: 'Houve um erro ao carregar seu inventário. Tente novamente!' });
        }
    },
};
