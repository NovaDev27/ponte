// Metro com o Sentry: gera IDs de depuração para os erros do app apontarem a linha certa do código.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
