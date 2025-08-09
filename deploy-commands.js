const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
try { require('dotenv').config({ path: './config.env' }); } catch (_) {}

const commands = [];
// Pegar todos os arquivos de comando do diretório commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" obrigatória.`);
    }
}

// Instanciar REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy dos comandos
(async () => {
    try {
        if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
            throw new Error('Variáveis de ambiente ausentes: defina DISCORD_TOKEN e CLIENT_ID no arquivo .env');
        }
        console.log(`Iniciando deploy de ${commands.length} comandos.`);

        // Se GUILD_ID estiver definido, faça deploy no escopo do servidor (propaga quase instantaneamente)
        if (process.env.GUILD_ID) {
            // Para evitar duplicatas: limpar comandos GLOBAIS antes de publicar na guild
            try {
                console.log('🧹 Limpando comandos GLOBAL para evitar duplicação...');
                const cleared = await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: [] },
                );
                console.log(`✅ Global limpo (${Array.isArray(cleared) ? cleared.length : 0} comandos restantes).`);
            } catch (e) {
                console.warn('⚠️  Não foi possível limpar comandos GLOBAL (pode não haver nenhum ou falta de permissão). Prosseguindo...');
            }

            console.log(`➡️  Fazendo deploy GUILD para guild ${process.env.GUILD_ID}...`);
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Deploy GUILD concluído (${data.length} comandos).`);
        } else {
            // Caso contrário, deploy GLOBAL (pode demorar até 1h para propagar)
            console.log('➡️  GUILD_ID não definido. Fazendo deploy GLOBAL (pode demorar a propagar)...');
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Deploy GLOBAL concluído (${data.length} comandos).`);
            console.log('🛈 Observação: se você tiver comandos de GUILD antigos publicados, eles podem aparecer duplicados. Execute este script com GUILD_ID definido para limpar o GLOBAL e publicar somente na GUILD.');
        }
    } catch (error) {
        console.error('❌ Falha no deploy de comandos:', error.message || error);
    }
})();
