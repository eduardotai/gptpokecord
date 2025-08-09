const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const spawnSystem = require('../systems/spawnSystem');
const db = require('../systems/database');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Botões
        if (interaction.isButton()) {
            await interaction.deferReply({ flags: 64 });  // Defer ephemeral reply

            try {
                const id = interaction.customId;
                const idx = id.indexOf('_');
                if (idx === -1) return;
                const action = id.slice(0, idx);
                const battleId = id.slice(idx + 1);

                // Fluxo de aproveitar spawn do canal
                if (action === 'spawnbattle') {
                    const channelId = battleId; // aqui battleId carrega o channelId
                    const spawn = spawnSystem.consumeSpawn(channelId);
                    if (!spawn) {
                        await interaction.editReply({ content: 'O encontro expirou ou não está mais disponível.' });
                        return;
                    }
                    const userId = interaction.user.id;
                    const newBattleId = `${userId}_${Date.now()}`;
                    const battle = await battleSystem.startBattle(userId, newBattleId, 'wild', spawn.opponent);
                    await interaction.editReply({ content: `Batalha iniciada contra **${spawn.opponent.name}**! Use /battle para selecionar seu Pokémon.` });
                    return;
                }

                const battle = battleSystem.getBattle(battleId);
                if (!battle) {
                    await interaction.editReply({ content: 'A batalha não foi encontrada ou expirou.' });
                    return;
                }

                let result;
                if (action === 'attack') {
                    const moves = Array.isArray(battle.playerPokemon.moves) ? battle.playerPokemon.moves : [];
                    if (moves.length === 0) {
                        await interaction.editReply({ content: 'Seu Pokémon não tem movimentos disponíveis.' });
                        return;
                    }
                    const moveName = moves[Math.floor(Math.random() * moves.length)];
                    result = await battleSystem.executeAttack(battleId, moveName);
                } else if (action === 'catch') {
                    result = await battleSystem.attemptCapture(battleId, 'pokeball');
                } else if (action === 'item') {
                    // tentar usar uma poção automaticamente
                    const inventory = await db.getInventory(battle.userId);
                    const healItemsOrder = ['maxpotion', 'hyperpotion', 'superpotion', 'potion'];
                    const found = healItemsOrder.find(it => inventory.find(x => x.item_id === it && x.quantity > 0));
                    if (!found) {
                        await interaction.editReply({ content: 'Você não possui itens de cura.' });
                        return;
                    }
                    result = await battleSystem.useItem(battleId, found, 'player');
                } else if (action === 'flee') {
                    result = await battleSystem.flee(battleId);
                }

                if (!result) {
                    await interaction.editReply({ content: 'Ação inválida ou falhou.' });
                    return;
                }

                const color = result.status === 'player_won' ? 0x4ecdc4 : result.status === 'opponent_won' ? 0xff6b6b : 0xff6b6b;
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle('⚔️ Batalha Pokémon')
                    .setDescription(result.message || 'Atualização de status')
                    .setTimestamp();

                const components = [];
                if (result.status === 'active') {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`attack_${battleId}`).setLabel('⚔️ Atacar').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId(`catch_${battleId}`).setLabel('🎾 Capturar').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId(`item_${battleId}`).setLabel('💊 Usar Item').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`flee_${battleId}`).setLabel('🏃 Fugir').setStyle(ButtonStyle.Secondary)
                    );
                    components.push(row);
                }

                // Atualiza a mensagem da batalha
                await interaction.editReply({ embeds: [embed], components });
            } catch (error) {
                console.error(error);
                try {
                    await interaction.editReply({ content: 'Erro ao processar a interação.' });
                } catch (_) {}
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Comando ${interaction.commandName} não encontrado.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            try {
                if (interaction.replied) {
                    await interaction.followUp({ content: 'Houve um erro ao executar este comando!', flags: 64 });
                } else if (interaction.deferred) {
                    await interaction.editReply({ content: 'Houve um erro ao executar este comando!' });
                } else {
                    await interaction.reply({ content: 'Houve um erro ao executar este comando!', flags: 64 });
                }
            } catch (_) {
                // Evita crash por Unknown interaction (expirada ou já respondida)
            }
        }
    },
};
