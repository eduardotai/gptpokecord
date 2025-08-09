# 🎮 Exemplos de Uso - Bot Pokémon Discord

Este arquivo mostra exemplos práticos de como usar o bot Pokémon.

## 🚀 Primeiros Passos

### 1. Iniciar o Jogo
```
/start bulbasaur
```
**Resposta esperada:**
```
🎉 Bem-vindo ao mundo Pokémon!
Parabéns, [seu_nome]! Sua jornada Pokémon começou!

🌱 Seu Pokémon inicial
Bulbasaur
Nível: 1
Tipos: Grass, Poison

A strange seed was planted on its back at birth...

🎒 Itens iniciais
• 5x Poké Ball
• 3x Potion

💰 Dinheiro inicial
1000 Pokécoins
```

### 2. Verificar Perfil
```
/profile
```
**Resposta esperada:**
```
👤 Perfil de [seu_nome]
Treinador Pokémon Nível 1

📊 Estatísticas
Nível: 1
Experiência: 0
Dinheiro: 1000 Pokécoins
Badges: 0/8

🎮 Progresso
Pokémon capturados: 1
Nível mais alto: 1
Total de EXP: 0
Shinies: 0

⚡ Pokémon mais forte
Bulbasaur (Nv.1)
```

## ⚔️ Sistema de Batalha

### 3. Iniciar Batalha
```
/battle
```
**Resposta esperada:**
```
⚔️ Batalha Pokémon iniciada!
[seu_nome] vs Charmander

🎯 Seu Pokémon
Bulbasaur (Nv.1)
HP: 55/55
Tipos: Grass, Poison

👹 Oponente
Charmander (Nv.8)
HP: 47/47
Tipos: Fire

⚡ Movimentos disponíveis
• Tackle
• Growl
• Vine Whip
• Poison Powder

[Botões de ação aparecem]
```

### 4. Ações em Batalha

#### Atacar
Clique no botão "⚔️ Atacar" ou use:
```
/attack tackle
```

#### Capturar
Clique no botão "🎾 Capturar" ou use:
```
/catch pokeball
```

#### Usar Item
Clique no botão "💊 Usar Item" ou use:
```
/use potion
```

#### Fugir
Clique no botão "🏃 Fugir" ou use:
```
/flee
```

## 🎒 Gerenciamento

### 5. Ver Pokémon
```
/pokemon
```
**Resposta esperada:**
```
🎒 Pokédex de [seu_nome]
Você tem 2 Pokémon capturados!

📊 Estatísticas gerais
Total de Pokémon: 2
Nível médio: 4
Shinies: 0
Pokémon desmaiados: 0

🏆 Melhores Pokémon
Mais forte: Charmander (Nv.8)
Mais HP: Bulbasaur (Nv.1)
Mais veloz: Charmander (Nv.8)

📋 Seus Pokémon
🟢 Bulbasaur (Nv.1)
   HP: 55/55 | Tipos: Grass, Poison
   Stats: 245 | Movimentos: 4

🟢 Charmander (Nv.8)
   HP: 47/47 | Tipos: Fire
   Stats: 267 | Movimentos: 4
```

### 6. Ver Inventário
```
/inventory
```
**Resposta esperada:**
```
🎒 Inventário de [seu_nome]
Você tem 8 itens no total, com valor de 1600 Pokécoins!

💰 Dinheiro
1000 Pokécoins

📦 Total de itens
8 itens

💎 Valor total
1600 Pokécoins

🎾 Pokébolas
• Poké Ball x3 - 200 Pokécoins

💊 Poções
• Potion x2 - Restaura 20 HP
• Super Potion x1 - Restaura 50 HP
```

### 7. Comprar Itens
```
/shop
```
**Resposta esperada:**
```
🏪 Loja Pokémon
Bem-vindo à loja! Você tem 1000 Pokécoins.

💰 Seu dinheiro
1000 Pokécoins

📦 Itens disponíveis
9 itens

🎾 Pokébolas
• Poké Ball - 200 Pokécoins
  A device for catching wild Pokémon...

• Great Ball - 600 Pokécoins
  A good, high-performance Ball...

💊 Poções
• Potion - 300 Pokécoins
  Restores the HP of a Pokémon by 20 points...

💡 Como comprar
Use /shop <nome_do_item> [quantidade] para comprar itens.
Exemplo: /shop pokeball 5
```

#### Comprar Item Específico
```
/shop greatball 2
```
**Resposta esperada:**
```
✅ Compra realizada com sucesso!
Você comprou 2x Great Ball por 1200 Pokécoins.

💰 Dinheiro restante
-200 Pokécoins

📦 Item comprado
2x Great Ball
```

### 8. Curar Pokémon
```
/heal
```
**Resposta esperada:**
```
💊 Cura aplicada com sucesso!
Bulbasaur foi curado usando Potion!

📊 Status do Pokémon
Bulbasaur (Nv.1)
HP: 35 → 55/55

💊 Item usado
Potion
Restaurou 20 HP
```

## 🎯 Exemplos de Batalha Completa

### Cenário 1: Captura Bem-sucedida
```
/battle
[Botão: ⚔️ Atacar] → "Bulbasaur usou Vine Whip! É super efetivo!"
[Botão: 🎾 Capturar] → "🎉 Charmander foi capturado com sucesso!"
```

### Cenário 2: Batalha Longa
```
/battle
[Botão: ⚔️ Atacar] → "Bulbasaur usou Tackle! Charmander perdeu 12 HP!"
[Botão: ⚔️ Atacar] → "Charmander usou Ember! Bulbasaur perdeu 15 HP!"
[Botão: 💊 Usar Item] → "Potion restaurou 20 HP de Bulbasaur!"
[Botão: ⚔️ Atacar] → "Bulbasaur usou Vine Whip! Charmander foi derrotado!"
```

### Cenário 3: Fuga
```
/battle
[Botão: 🏃 Fugir] → "Você fugiu com sucesso!"
```

## 💡 Dicas Práticas

### Estratégias de Captura
1. **Reduza o HP** do Pokémon selvagem primeiro
2. **Use Pokébolas melhores** para Pokémon raros
3. **Aguarde o momento certo** para capturar

### Gerenciamento de Recursos
1. **Economize dinheiro** para itens importantes
2. **Mantenha poções** para batalhas longas
3. **Use Pokébolas adequadas** para cada situação

### Progressão
1. **Capture diferentes tipos** para ter vantagem
2. **Treine seus Pokémon** regularmente
3. **Mantenha sua equipe curada**

## 🏆 Exemplos de Progressão

### Nível Iniciante (1-10)
- 1 Pokémon inicial
- 1000 Pokécoins
- 5 Poké Balls, 3 Potions

### Nível Intermediário (10-30)
- 5-10 Pokémon capturados
- 5000+ Pokécoins
- Diversos tipos de Pokébolas e Poções

### Nível Avançado (30+)
- 15+ Pokémon capturados
- 10000+ Pokécoins
- Equipe diversificada com diferentes tipos

## 🎮 Comandos Rápidos

### Sequência de Início
```
/start bulbasaur
/profile
/battle
```

### Sequência de Captura
```
/battle
[Reduzir HP]
/catch pokeball
/pokemon
```

### Sequência de Cura
```
/pokemon
/heal
/inventory
```

### Sequência de Compra
```
/shop
/shop greatball 3
/inventory
```

---

**Lembre-se: A diversão está na jornada! 🌟**
