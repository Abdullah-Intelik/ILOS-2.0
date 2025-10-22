const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8082, // Changed from default 8081 to avoid conflict with FileZilla
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
