const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer } = require('../systems/database');
const { itemData } = require('../systems/pokemonData');
const db = require('../systems/database');
const { defer, replyError, replyInfo } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Loja de itens')
        .addSubcommand(sc => sc.setName('view').setDescription('Ver itens disponíveis hoje'))
        .addSubcommand(sc => sc.setName('buy').setDescription('Comprar item')
            .addStringOption(o => o.setName('item').setDescription('ID do item (ex: pokeball)').setRequired(true))
            .addIntegerOption(o => o.setName('quantity').setDescription('Quantidade').setMinValue(1).setMaxValue(100).setRequired(true)))
        .addSubcommand(sc => sc.setName('sell').setDescription('Vender item')
            .addStringOption(o => o.setName('item').setDescription('ID do item no inventário').setRequired(true))
            .addIntegerOption(o => o.setName('quantity').setDescription('Quantidade').setMinValue(1).setMaxValue(100).setRequired(true))),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;
        const sub = interaction.options.getSubcommand();

        try {
            // Verificar se o jogador existe
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Restock diário
            const generator = () => {
                // sortear 5 itens do catálogo
                const ids = Object.keys(itemData);
                const shuffled = ids.sort(() => Math.random() - 0.5).slice(0, Math.min(5, ids.length));
                return shuffled.map(id => ({ item_id: id, price: itemData[id].price, quantity: 50 }));
            };
            await db.restockShopIfNeeded(generator);

            if (sub === 'view') {
                const stock = await db.getShopStock();
                const embed = new EmbedBuilder()
                    .setColor('#4ecdc4')
                    .setTitle('🏪 Loja Pokémon (estoque do dia)')
                    .setDescription(`Bem-vindo! Você tem **${player.money}** Pokécoins.`)
                    .setTimestamp();

                if (stock.length === 0) {
                    embed.addFields({ name: 'Estoque', value: 'Sem itens disponíveis no momento.' });
                } else {
                    let list = '';
                    for (const s of stock) {
                        const it = itemData[s.item_id];
                        if (!it) continue;
                        list += `• ${it.name} (ID: ${s.item_id}) - ${s.price} Pokécoins | Qtd: ${s.quantity}\n`;
                    }
                    embed.addFields({ name: 'Itens disponíveis hoje', value: list });
                }

                embed.addFields({ name: 'Como comprar', value: 'Use `/shop buy item:<id> quantity:<qtd>`' });
                return await interaction.editReply({ embeds: [embed] });
            }

            if (sub === 'buy') {
                const itemId = interaction.options.getString('item');
                const quantity = interaction.options.getInteger('quantity');
                const it = itemData[itemId];
                if (!it) {
                    return await replyError(interaction, { description: 'Esse item não existe.' });
                }
                const result = await db.purchaseItem(userId, itemId, quantity);
                if (!result.ok) {
                    if (result.reason === 'stock') {
                        return await replyError(interaction, { description: 'Estoque insuficiente ou item não está no estoque de hoje.' });
                    }
                    if (result.reason === 'money') {
                        return await replyError(interaction, { description: `Custa ${result.need} e você tem ${result.have} Pokécoins.` });
                    }
                    return await replyError(interaction, { description: 'Não foi possível concluir a compra. Tente novamente.' });
                }
                return await replyInfo(interaction, { title: '✅ Compra realizada', description: `Comprou ${quantity}x ${it.name} por ${result.total} Pokécoins.` });
            }

            if (sub === 'sell') {
                const itemId = interaction.options.getString('item');
                const quantity = interaction.options.getInteger('quantity');
                const it = itemData[itemId];
                if (!it) {
                    return await replyError(interaction, { description: 'Esse item não existe.' });
                }
                const unit = Math.max(1, Math.floor(it.price * 0.4));
                const result = await db.sellItem(userId, itemId, quantity, unit);
                if (!result.ok) {
                    return await replyError(interaction, { description: 'Você não tem itens suficientes. Verifique seu inventário.' });
                }
                return await replyInfo(interaction, { title: '✅ Venda realizada', description: `Vendeu ${quantity}x ${it.name} por ${result.total} Pokécoins.` });
            }
            // fallback
            return;

        } catch (error) {
            console.error('Erro na loja:', error);
            await replyError(interaction, { description: 'Houve um erro na loja. Tente novamente!' });
        }
    },
};
