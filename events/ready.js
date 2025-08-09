const { Events, ActivityType } = require('discord.js');
const battleSystem = require('../systems/battleSystem');
const spawnSystem = require('../systems/spawnSystem');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot ${client.user.tag} está online!`);
        console.log(`🎮 Servindo ${client.guilds.cache.size} servidores`);
        console.log(`👥 Total de ${client.users.cache.size} usuários`);
        
        // Definir status do bot
        client.user.setActivity('Pokémon | /start', { type: ActivityType.Playing });

        // Agendador com intervalos aleatórios e cooldown
        const CHANNEL_ID = process.env.SPAWN_CHANNEL_ID || process.env.COMMAND_CHANNEL_ID;
        if (CHANNEL_ID) {
            spawnSystem.scheduleSpawns(client, CHANNEL_ID);
        }
    },
};
