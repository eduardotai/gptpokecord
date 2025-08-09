# 🎮 Bot Pokémon para Discord

Um bot completo do Discord que permite jogar Pokémon diretamente no chat! Capture Pokémon, batalhe, evolua seus companheiros e se torne o campeão Pokémon!

## ✨ Funcionalidades

### 🎯 Sistema Completo de Pokémon
- **151 Pokémon da primeira geração** com stats, tipos e movimentos
- **Sistema de evolução** baseado em nível e itens
- **Pokémon Shiny** com 1% de chance de aparecer
- **Sistema de tipos** com eficácias e resistências

### ⚔️ Sistema de Batalha
- **Batalhas por turnos** com sistema de precisão
- **Cálculo de dano** baseado em stats, tipos e STAB
- **Sistema de captura** com Pokébolas
- **Uso de itens** durante batalhas
- **Sistema de fuga** com chance de sucesso

### 🎒 Sistema de Inventário
- **Diversos tipos de Pokébolas** (Poké Ball, Great Ball, Ultra Ball, Master Ball)
- **Poções e Revives** para curar Pokémon
- **Sistema de compra** com Pokécoins
- **Gerenciamento de itens** automático

### 🏆 Sistema de Progressão
- **Níveis de treinador** com experiência
- **Sistema de badges** (8 ginásios)
- **Dinheiro virtual** (Pokécoins)
- **Estatísticas detalhadas** de progresso

## 🚀 Instalação

### Pré-requisitos
- Node.js 16.9.0 ou superior
- npm ou yarn
- Uma conta de desenvolvedor do Discord

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd discord-pokemon-bot
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o bot do Discord

#### 3.1. Crie um aplicativo no Discord
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome ao seu bot
4. Vá para a seção "Bot"
5. Clique em "Add Bot"
6. Copie o **Token** do bot

#### 3.2. Configure as permissões
1. Na seção "OAuth2" > "URL Generator"
2. Selecione os escopos: `bot` e `applications.commands`
3. Selecione as permissões:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History
   - Add Reactions
4. Use a URL gerada para convidar o bot para seu servidor

### 4. Configure as variáveis de ambiente

Copie o arquivo `config.env.example` para `.env`:
```bash
cp config.env.example .env
```

Edite o arquivo `.env`:
```env
# Token do seu bot do Discord
DISCORD_TOKEN=seu_token_aqui

# ID do seu bot (Client ID)
CLIENT_ID=seu_client_id_aqui

# ID do servidor (opcional)
GUILD_ID=seu_guild_id_aqui

# ID do canal de comandos (opcional)
COMMAND_CHANNEL_ID=seu_channel_id_aqui
```

### 5. Registre os comandos slash
```bash
node deploy-commands.js
```

### 6. Inicie o bot
```bash
npm start
```

### 7. Rode os testes automatizados
```bash
npm test
```

## 🎮 Como Jogar

### Comandos Básicos

#### `/start <starter>`
Inicia sua jornada Pokémon escolhendo um dos três iniciais:
- 🌱 **Bulbasaur** (Grama/Veneno)
- 🔥 **Charmander** (Fogo)
- 💧 **Squirtle** (Água)

#### `/profile`
Mostra seu perfil de treinador com estatísticas, badges e progresso.

#### `/pokemon`
Lista todos os seus Pokémon capturados com stats e status.

#### `/inventory`
Mostra seu inventário com todos os itens disponíveis.

### Comandos de Batalha

#### `/battle [pokemon]`
Inicia uma batalha contra um Pokémon selvagem. Você pode especificar qual Pokémon usar.

**Ações disponíveis em batalha:**
- ⚔️ **Atacar** - Use movimentos para derrotar o oponente
- 🎾 **Capturar** - Tente capturar o Pokémon selvagem
- 💊 **Usar Item** - Use poções ou outros itens
- 🏃 **Fugir** - Tente escapar da batalha

#### `/heal [pokemon] [item]`
Cura um Pokémon desmaiado ou ferido usando itens do inventário.

### Comandos de Progressão

#### `/shop [item] [quantidade]`
Abre a loja para comprar itens. Se especificar um item, compra diretamente.

**Itens disponíveis:**
- **Pokébolas**: Poké Ball (200), Great Ball (600), Ultra Ball (1200)
- **Poções**: Potion (300), Super Potion (700), Hyper Potion (1200), Max Potion (2500)
- **Revives**: Revive (1500), Max Revive (4000)

#### `/help`
Mostra todos os comandos disponíveis e dicas de jogo.

## 🎯 Sistema de Tipos

O bot implementa o sistema completo de tipos do Pokémon com eficácias:

- **Super efetivo** (2x dano): Fogo vs Grama, Água vs Fogo, etc.
- **Não muito efetivo** (0.5x dano): Fogo vs Água, Grama vs Fogo, etc.
- **Sem efeito** (0x dano): Normal vs Fantasma, Elétrico vs Terra, etc.

## 🏆 Sistema de Ginásios

Desafie 8 líderes de ginásio para ganhar badges:

1. **Ginásio Brock** (Pedra) - Nível 12-14
2. **Ginásio Misty** (Água) - Nível 18-21
3. **Ginásio Lt. Surge** (Elétrico) - Nível 24-26
4. **Ginásio Erika** (Grama) - Nível 29-31
5. **Ginásio Koga** (Veneno) - Nível 37-39
6. **Ginásio Sabrina** (Psíquico) - Nível 43-45
7. **Ginásio Blaine** (Fogo) - Nível 47-50
8. **Ginásio Giovanni** (Terra) - Nível 50-53

## 💡 Dicas de Jogo

### Captura de Pokémon
- **Pokémon com HP baixo** são mais fáceis de capturar
- **Pokébolas melhores** aumentam a chance de captura
- **Master Ball** captura qualquer Pokémon com 100% de sucesso

### Batalhas
- **Use tipos super efetivos** para causar mais dano
- **Mantenha seus Pokémon curados** para batalhas longas
- **Use itens estrategicamente** durante batalhas

### Progressão
- **Treine seus Pokémon** para evoluírem
- **Capture diferentes tipos** para ter vantagem em ginásios
- **Economize dinheiro** para comprar itens importantes

## 🔧 Estrutura do Projeto

```
discord-pokemon-bot/
├── commands/           # Comandos slash do Discord
│   ├── start.js       # Iniciar jogo
│   ├── profile.js     # Perfil do jogador
│   ├── pokemon.js     # Lista de Pokémon
│   ├── battle.js      # Sistema de batalha
│   ├── inventory.js   # Inventário
│   ├── shop.js        # Loja
│   ├── heal.js        # Cura de Pokémon
│   └── help.js        # Ajuda
├── systems/           # Sistemas do jogo
│   ├── database.js    # Banco de dados SQLite
│   ├── pokemonData.js # Dados dos Pokémon
│   └── battleSystem.js # Sistema de batalha
├── events/            # Eventos do Discord
│   ├── ready.js       # Bot online
│   └── interactionCreate.js # Interações
├── data/              # Dados do banco
├── index.js           # Arquivo principal
├── deploy-commands.js # Deploy de comandos
├── package.json       # Dependências
└── README.md          # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **Discord.js v14** - API do Discord
- **SQLite3** - Banco de dados
- **Node.js** - Runtime JavaScript
- **Canvas** - Geração de imagens (futuro)

## 🚀 Funcionalidades Futuras

- [ ] **Sistema de ginásios** completo
- [ ] **Evolução de Pokémon** por nível e itens
- [ ] **Sistema de treinamento** para ganhar experiência
- [ ] **Batalhas PvP** entre jogadores
- [ ] **Sistema de trades** de Pokémon
- [ ] **Geração de imagens** dos Pokémon
- [ ] **Sistema de eventos** especiais
- [ ] **Mais gerações** de Pokémon

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature
3. Fazer commit das mudanças
4. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o token do bot está correto
3. Verifique se o bot tem as permissões necessárias
4. Abra uma issue no GitHub

---

**Divirta-se em sua jornada Pokémon! 🌟**
