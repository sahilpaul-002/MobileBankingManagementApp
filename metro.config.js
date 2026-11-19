const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto') {
    // when importing crypto, resolve to react-native-quick-crypto
    return context.resolveRequest(
      context,
      'react-native-quick-crypto',
      platform,
    );
  }

  if (moduleName === 'tslib' || moduleName.startsWith('tslib/')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
      type: 'sourceFile',
    };
  }
  
  // otherwise chain to the standard Metro resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config);