const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, createPlayer } = require('../systems/database');
const { getPokemon } = require('../systems/pokemonData');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Inicia sua jornada Pokémon!')
        .addStringOption(option =>
            option.setName('starter')
                .setDescription('Escolha seu Pokémon inicial')
                .setRequired(true)
                .addChoices(
                    { name: '🌱 Bulbasaur', value: '1' },
                    { name: '🔥 Charmander', value: '4' },
                    { name: '💧 Squirtle', value: '7' },
                )),

    async execute(interaction) {
        try {
            await defer(interaction, false);

            const userId = interaction.user.id;
            const username = interaction.user.username;
            const starterId = interaction.options.getString('starter');

            // Verificar se o jogador já existe
            let player = await getPlayer(userId);
            
            if (player) {
                return await replyError(interaction, { description: 'Você já tem um save ativo. Use `/profile` para ver seu progresso.' });
            }

            // Criar novo jogador
            await createPlayer(userId, username);

            // Obter dados do Pokémon inicial
            const starterPokemon = getPokemon(parseInt(starterId));
            
            // Adicionar Pokémon inicial ao jogador
            const pokemonData = {
                pokemon_id: starterPokemon.id,
                nickname: starterPokemon.name,
                hp: starterPokemon.baseStats.hp + 10,
                max_hp: starterPokemon.baseStats.hp + 10,
                attack: starterPokemon.baseStats.attack + 10,
                defense: starterPokemon.baseStats.defense + 10,
                speed: starterPokemon.baseStats.speed + 10,
                special_attack: starterPokemon.baseStats.special_attack + 10,
                special_defense: starterPokemon.baseStats.special_defense + 10,
                moves: starterPokemon.moves,
                is_shiny: false
            };

            await require('../systems/database').addPokemon(userId, pokemonData);
            try { await require('../systems/database').markPokedexCaptured(userId, starterPokemon.id); } catch (_) {}

            // Adicionar itens iniciais
            await require('../systems/database').addItem(userId, 'pokeball', 5);
            await require('../systems/database').addItem(userId, 'potion', 3);

            // Criar embed de boas-vindas
            const embed = new EmbedBuilder()
                .setColor('#4ecdc4')
                .setTitle('🎉 Bem-vindo ao mundo Pokémon!')
                .setDescription(`Parabéns, **${username}**! Sua jornada Pokémon começou!`)
                .addFields(
                    { 
                        name: '🌱 Seu Pokémon inicial', 
                        value: `**${starterPokemon.name}**\nNível: 1\nTipos: ${starterPokemon.types.join(', ')}\n\n${starterPokemon.description}`, 
                        inline: false 
                    },
                    { 
                        name: '🎒 Itens iniciais', 
                        value: '• 5x Poké Ball\n• 3x Potion', 
                        inline: true 
                    },
                    { 
                        name: '💰 Dinheiro inicial', 
                        value: '1000 Pokécoins', 
                        inline: true 
                    }
                )
                .addFields(
                    {
                        name: '📋 Comandos úteis',
                        value: '• `/profile` - Ver seu perfil\n• `/pokemon` - Ver seus Pokémon\n• `/inventory` - Ver inventário\n• `/battle` - Iniciar batalha\n• `/shop` - Comprar itens',
                        inline: false
                    }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Use /help para ver todos os comandos disponíveis!' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
            await replyError(interaction, { description: 'Houve um erro ao iniciar sua jornada Pokémon. Tente novamente!' });
        }
    },
};
