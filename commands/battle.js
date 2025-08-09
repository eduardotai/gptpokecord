const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getPlayer, getPlayerPokemon } = require('../systems/database');
const battleSystem = require('../systems/battleSystem');
const spawnSystem = require('../systems/spawnSystem');
const { getPokemon } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Inicia uma batalha Pokémon')
        .addStringOption(option =>
            option.setName('pokemon')
                .setDescription('Nome ou ID do Pokémon para usar na batalha')
                .setRequired(false)),

    async execute(interaction) {
        await defer(interaction, false);

        const userId = interaction.user.id;
        const pokemonName = interaction.options.getString('pokemon');

        try {
            // Verificar se o jogador existe
            const player = await getPlayer(userId);
            
            if (!player) {
                return await replyError(interaction, { description: 'Você ainda não começou sua jornada Pokémon. Use `/start` para começar!' });
            }

            // Obter Pokémon do jogador
            const playerPokemon = await getPlayerPokemon(userId);
            
            if (playerPokemon.length === 0) {
                return await replyError(interaction, { description: 'Você precisa ter pelo menos um Pokémon para batalhar. Use `/start` para começar!' });
            }

            // Escolher Pokémon para batalha
            let selectedPokemon;
            if (pokemonName) {
                // Buscar por nome ou ID
                selectedPokemon = playerPokemon.find(p => {
                    const basePokemon = getPokemon(p.pokemon_id);
                    return p.nickname?.toLowerCase() === pokemonName.toLowerCase() ||
                           basePokemon.name.toLowerCase() === pokemonName.toLowerCase() ||
                           p.pokemon_id.toString() === pokemonName;
                });

                if (!selectedPokemon) {
                    return await replyError(interaction, { description: `Você não tem um Pokémon chamado "${pokemonName}". Use \`/pokemon\` para ver seus Pokémon.` });
                }
            } else {
                // Usar o primeiro Pokémon disponível
                selectedPokemon = playerPokemon.find(p => p.hp > 0) || playerPokemon[0];
            }

            // Verificar se o Pokémon está desmaiado
            if (selectedPokemon.hp <= 0) {
                const fallbackName = selectedPokemon.nickname || (getPokemon(selectedPokemon.pokemon_id)?.name || 'Pokémon');
                return await replyError(interaction, { description: `${fallbackName} está desmaiado e não pode batalhar. Use \`/heal\` para curá-lo.` });
            }

            // Gerar ID único para a batalha
            const battleId = `${userId}_${Date.now()}`;

            // Verificar batalha ativa existente para o usuário
            let battle = battleSystem.getActiveBattleForUser(userId);
            if (!battle) {
                // Exigir spawn ativo no canal para iniciar nova batalha
                const channelId = interaction.channelId;
                const spawn = spawnSystem.getSpawn(channelId);
                if (!spawn) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('❌ Nenhum encontro disponível!')
                        .setDescription('Não há Pokémon spawnado neste canal no momento. Aguarde um spawn e use o botão "Batalhar" ou rode este comando logo após o spawn.')
                        .setTimestamp();
                    return await interaction.editReply({ embeds: [embed] });
                }
                const presetOpponent = spawn.opponent;
                spawnSystem.consumeSpawn(channelId);
                battle = await battleSystem.startBattle(userId, battleId, 'wild', presetOpponent);
            }
            // Se o Pokémon selecionado está desmaiado, impedir seleção
            if (selectedPokemon.hp <= 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('💀 Pokémon desmaiado!')
                    .setDescription('Este Pokémon está desmaiado. Use `/heal` com Revive para ressuscitá-lo.')
                    .setTimestamp();
                return await interaction.editReply({ embeds: [embed] });
            }

            // Selecionar Pokémon para a batalha ativa
            await battleSystem.selectPokemon(battle.id, selectedPokemon);

            // Obter status da batalha
            const current = battleSystem.getBattle(battle.id);
            const battleStatus = battleSystem.formatBattleStatus(current);
            const basePokemon = getPokemon(selectedPokemon.pokemon_id);
            const baseName = selectedPokemon.nickname || basePokemon?.name || 'Pokémon';
            const baseTypes = Array.isArray(basePokemon?.types) ? basePokemon.types : [];
            const oppTypes = Array.isArray(current?.opponent?.types) ? current.opponent.types : [];
            const activeBattleId = current?.id || battle.id;

            // Garantir que os movimentos do Pokémon selecionado sejam um array
            let selectedMoves;
            try {
                selectedMoves = Array.isArray(selectedPokemon.moves) ? selectedPokemon.moves : JSON.parse(selectedPokemon.moves);
            } catch (_) {
                selectedMoves = [];
            }
            if (!Array.isArray(selectedMoves)) selectedMoves = [];

            // Criar embed da batalha
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('⚔️ Batalha Pokémon iniciada!')
                .setDescription(`**${player.username}** vs **${current.opponent.name}**`)
                .addFields(
                    { 
                        name: '🎯 Seu Pokémon', 
                        value: `**${baseName}** (Nv.${selectedPokemon.level})\nHP: ${selectedPokemon.hp}/${selectedPokemon.max_hp}\nTipos: ${baseTypes.length ? baseTypes.join(', ') : 'Desconhecido'}`, 
                        inline: true 
                    },
                    { 
                        name: '👹 Oponente', 
                        value: `**${current.opponent.name}** (Nv.${current.opponent.level})\nHP: ${current.opponent.currentHp}/${current.opponent.maxHp}\nTipos: ${oppTypes.length ? oppTypes.join(', ') : 'Desconhecido'}`, 
                        inline: true 
                    }
                )
                .addFields({
                    name: '⚡ Movimentos disponíveis',
                    value: selectedMoves.length > 0 ? selectedMoves.map(move => `• **${move}**`).join('\n') : 'Nenhum movimento disponível',
                    inline: false
                })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Use os botões abaixo para batalhar!' });

            // Criar botões de ação
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`attack_${activeBattleId}`)
                        .setLabel('⚔️ Atacar')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`catch_${activeBattleId}`)
                        .setLabel('🎾 Capturar')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`item_${activeBattleId}`)
                        .setLabel('💊 Usar Item')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`flee_${activeBattleId}`)
                        .setLabel('🏃 Fugir')
                        .setStyle(ButtonStyle.Secondary)
                );

            const sent = await interaction.editReply({ 
                embeds: [embed],
                components: [actionRow]
            });

        } catch (error) {
            console.error('Erro ao iniciar batalha:', error);
            await replyError(interaction, { description: 'Houve um erro ao iniciar a batalha. Tente novamente!' });
        }
    },
};
