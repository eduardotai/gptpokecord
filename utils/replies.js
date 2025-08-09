const { embedSuccess, embedError, embedInfo } = require('./embeds');

function optsWithFlags(base = {}, ephemeral = false) {
  // 64 = MessageFlags.Ephemeral
  return ephemeral ? { ...base, flags: 64 } : base;
}

async function defer(interaction, ephemeral = false) {
  if (interaction.deferred || interaction.replied) return;
  try {
    await interaction.deferReply(optsWithFlags({}, ephemeral));
  } catch (_) {}
}

async function replySuccess(interaction, { title, description, fields = [], ephemeral = false } = {}) {
  const embed = embedSuccess(title, description, fields);
  if (!interaction.deferred && !interaction.replied) {
    return interaction.reply(optsWithFlags({ embeds: [embed] }, ephemeral));
  }
  return interaction.editReply({ embeds: [embed] });
}

async function replyError(interaction, { title = 'Erro', description, fields = [], ephemeral = true } = {}) {
  const embed = embedError(title, description, fields);
  if (!interaction.deferred && !interaction.replied) {
    return interaction.reply(optsWithFlags({ embeds: [embed] }, ephemeral));
  }
  return interaction.editReply({ embeds: [embed] });
}

async function replyInfo(interaction, { title, description, fields = [], ephemeral = false } = {}) {
  const embed = embedInfo(title, description, fields);
  if (!interaction.deferred && !interaction.replied) {
    return interaction.reply(optsWithFlags({ embeds: [embed] }, ephemeral));
  }
  return interaction.editReply({ embeds: [embed] });
}

module.exports = { defer, replySuccess, replyError, replyInfo };
