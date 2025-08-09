# 🚀 Guia de Configuração - Bot Pokémon Discord

Este guia te ajudará a configurar o bot Pokémon do Discord passo a passo.

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 16.9.0 ou superior
- [Git](https://git-scm.com/) (opcional)
- Uma conta no Discord
- Acesso ao [Discord Developer Portal](https://discord.com/developers/applications)

## 🔧 Passo a Passo

### 1. Preparar o Ambiente

#### 1.1. Instalar Node.js
1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS (recomendada)
3. Execute o instalador e siga as instruções
4. Verifique a instalação: `node --version`

#### 1.2. Baixar o Projeto
```bash
# Se você tem Git:
git clone <url-do-repositorio>
cd discord-pokemon-bot

# Ou baixe o ZIP e extraia
```

#### 1.3. Instalar Dependências
```bash
npm install
```

### 2. Criar o Bot no Discord

#### 2.1. Acessar o Developer Portal
1. Vá para [Discord Developer Portal](https://discord.com/developers/applications)
2. Faça login com sua conta Discord
3. Clique em "New Application"

#### 2.2. Configurar o Aplicativo
1. **Nome**: Digite um nome para seu bot (ex: "Pokémon Bot")
2. **Descrição**: Opcional - descreva o que seu bot faz
3. Clique em "Create"

#### 2.3. Configurar o Bot
1. No menu lateral, clique em "Bot"
2. Clique em "Add Bot"
3. Confirme a ação
4. **IMPORTANTE**: Copie o **Token** (você precisará dele depois)
5. Em "Privileged Gateway Intents", ative:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

#### 2.4. Configurar Permissões
1. No menu lateral, clique em "OAuth2" > "URL Generator"
2. Em "Scopes", selecione:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Em "Bot Permissions", selecione:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Attach Files
4. Copie a URL gerada

#### 2.5. Convidar o Bot
1. Cole a URL copiada no navegador
2. Selecione o servidor onde quer adicionar o bot
3. Confirme as permissões
4. Clique em "Authorize"

### 3. Configurar Variáveis de Ambiente

#### 3.1. Criar Arquivo .env
```bash
# No diretório do projeto
cp config.env.example .env
```

#### 3.2. Editar o Arquivo .env
Abra o arquivo `.env` e preencha:

```env
# Token do seu bot (copiado do Developer Portal)
DISCORD_TOKEN=seu_token_aqui

# ID do seu bot (Client ID - encontrado na página "General Information")
CLIENT_ID=seu_client_id_aqui

# IDs opcionais (você pode deixar vazio por enquanto)
GUILD_ID=
COMMAND_CHANNEL_ID=
```

**Como encontrar o Client ID:**
1. No Developer Portal, vá para "General Information"
2. Copie o "Application ID"

### 4. Registrar Comandos

#### 4.1. Executar Deploy
```bash
node deploy-commands.js
```

Você deve ver uma mensagem como:
```
Iniciando deploy de X comandos de aplicação.
✅ Deploy de X comandos de aplicação concluído com sucesso.
```

### 5. Iniciar o Bot

#### 5.1. Executar o Bot
```bash
npm start
```

Você deve ver mensagens como:
```
✅ Banco de dados inicializado com sucesso!
✅ Dados dos Pokémon carregados com sucesso!
✅ Bot [nome] está online!
🎮 Servindo X servidores
👥 Total de X usuários
```

#### 5.2. Verificar se Funcionou
1. Vá para o Discord
2. No servidor onde adicionou o bot, digite `/help`
3. O bot deve responder com a lista de comandos

## 🎮 Testando o Bot

### Comandos para Testar

1. **Iniciar jogo**: `/start bulbasaur`
2. **Ver perfil**: `/profile`
3. **Ver Pokémon**: `/pokemon`
4. **Ver inventário**: `/inventory`
5. **Iniciar batalha**: `/battle`
6. **Abrir loja**: `/shop`

### Fluxo de Jogo Básico

1. Use `/start` para começar
2. Use `/battle` para encontrar Pokémon selvagens
3. Capture Pokémon com Pokébolas
4. Use `/shop` para comprar mais itens
5. Use `/heal` para curar Pokémon feridos

## 🔧 Solução de Problemas

### Bot não responde
- ✅ Verifique se o token está correto
- ✅ Confirme se o bot está online
- ✅ Verifique se o bot tem permissões no canal
- ✅ Confirme se os comandos foram registrados

### Comandos não aparecem
- ✅ Execute `node deploy-commands.js` novamente
- ✅ Aguarde alguns minutos (pode demorar para aparecer)
- ✅ Verifique se o CLIENT_ID está correto

### Erro de banco de dados
- ✅ Verifique se a pasta `data/` existe
- ✅ Confirme se o Node.js tem permissão de escrita
- ✅ Tente deletar o arquivo `data/pokemon.db` e reiniciar

### Bot não inicia
- ✅ Verifique se todas as dependências estão instaladas
- ✅ Confirme se o Node.js está na versão correta
- ✅ Verifique se o arquivo `.env` está configurado

## 📞 Suporte

Se você ainda tiver problemas:

1. **Verifique os logs** - O bot mostra mensagens de erro no console
2. **Confirme a configuração** - Verifique se todos os passos foram seguidos
3. **Teste em um servidor de teste** - Crie um servidor só para testar
4. **Reinicie o bot** - Pare o bot (Ctrl+C) e inicie novamente

## 🎉 Próximos Passos

Agora que seu bot está funcionando:

1. **Teste todos os comandos** para familiarizar-se
2. **Configure um canal específico** para o bot (opcional)
3. **Personalize o bot** editando os dados dos Pokémon
4. **Adicione mais funcionalidades** seguindo o README.md

---

**Divirta-se com seu bot Pokémon! 🌟**
