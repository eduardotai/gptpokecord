const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { defer, replyError } = require('../utils/replies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra todos os comandos disponíveis'),

    async execute(interaction) {
        try {
            await defer(interaction, false);

            const embed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('🎮 Pokémon Bot - Comandos')
            .setDescription('Bem-vindo ao mundo Pokémon! Aqui estão todos os comandos disponíveis:')
            .addFields(
                {
                    name: '🚀 Comandos básicos',
                    value: '• `/start <starter>` - Inicia sua jornada Pokémon\n• `/profile` - Mostra seu perfil de treinador\n• `/help` - Mostra esta lista de comandos\n• `/pokedex [pagina]` - Visualiza sua Pokédex',
                    inline: false
                },
                {
                    name: '🎒 Gerenciamento',
                    value: '• `/pokemon` - Mostra seus Pokémon capturados\n• `/team view|add|remove` - Gerencia seu time (até 6)\n• `/inventory` - Mostra seu inventário de itens\n• `/shop view|buy|sell` - Loja com estoque diário',
                    inline: false
                },
                {
                    name: '⚔️ Batalha',
                    value: '• Spawns automáticos: clique em “Batalhar” quando um Pokémon aparecer\n• `/battle [pokemon]` - Entra na batalha spawnada com o Pokémon selecionado\n• `/heal [pokemon] [item]` - Cura/Revive Pokémon\n• Dica: Os movimentos disponíveis são mostrados em cada turno',
                    inline: false
                },
                {
                    name: '🏆 Progressão',
                    value: '• Experiência: Pokémon usados ganham EXP; quem derrota o oponente ganha mais\n• `/daily` - Recompensa diária (exige 1 batalha no dia)',
                    inline: false
                },
                {
                    name: '🎯 Pokémon iniciais disponíveis',
                    value: '• 🌱 **Bulbasaur** - Tipo Grama/Veneno\n• 🔥 **Charmander** - Tipo Fogo\n• 💧 **Squirtle** - Tipo Água',
                    inline: false
                },
                {
                    name: '💡 Dicas de jogo',
                    value: '• Capture Pokémon selvagens para expandir sua equipe\n• Use itens em batalha para ter vantagem\n• Treine seus Pokémon para evoluírem\n• Desafie ginásios para ganhar badges\n• Mantenha seus Pokémon curados para batalhas',
                    inline: false
                },
                {
                    name: '🎮 Como jogar',
                    value: '1. Use `/start` para começar sua jornada\n2. Use `/battle` para encontrar Pokémon selvagens\n3. Capture Pokémon com Pokébolas\n4. Treine e evolua seus Pokémon\n5. Desafie ginásios para se tornar campeão!',
                    inline: false
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Divirta-se em sua jornada Pokémon!' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await replyError(interaction, { description: 'Houve um erro ao mostrar a ajuda.' });
        }
    },
};
