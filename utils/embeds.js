const { EmbedBuilder } = require('discord.js');

const COLORS = {
  success: '#4ecdc4',
  error: '#ff6b6b',
  info: '#74c69d',
};

function embedSuccess(title, description, fields = []) {
  const e = new EmbedBuilder().setColor(COLORS.success);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(...fields);
  e.setTimestamp();
  return e;
}

function embedError(title, description, fields = []) {
  const e = new EmbedBuilder().setColor(COLORS.error);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(...fields);
  e.setTimestamp();
  return e;
}

function embedInfo(title, description, fields = []) {
  const e = new EmbedBuilder().setColor(COLORS.info);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(...fields);
  e.setTimestamp();
  return e;
}

module.exports = { COLORS, embedSuccess, embedError, embedInfo };
