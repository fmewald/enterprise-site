'use strict';

const BUILD_TIME_ZONE = 'America/Sao_Paulo';

function validateIsoDate(value, label = 'data') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} inválida: use YYYY-MM-DD`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const normalized = new Date(Date.UTC(year, month - 1, day));
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day
  ) {
    throw new Error(`${label} inválida: ${value}`);
  }
  return value;
}

function formatDateInTimeZone(date = new Date(), timeZone = BUILD_TIME_ZONE) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Instante de referência inválido');
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return validateIsoDate(`${byType.year}-${byType.month}-${byType.day}`, 'data calculada');
}

function getBuildDate(env = process.env, now = new Date()) {
  const configured = env.BUILD_DATE;
  if (configured !== undefined && configured !== '') {
    return validateIsoDate(configured, 'BUILD_DATE');
  }
  return formatDateInTimeZone(now, BUILD_TIME_ZONE);
}

module.exports = {
  BUILD_TIME_ZONE,
  validateIsoDate,
  formatDateInTimeZone,
  getBuildDate,
};
