const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [/.*\.cxx.*/, /.*\.dir.*/, /.*\.obj.*/];

module.exports = config;
