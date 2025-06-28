const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
	...config.resolver.alias,
	'@': path.resolve(__dirname, './'),
};

module.exports = wrapWithReanimatedMetroConfig(
	withNativeWind(config, { input: './global.css' })
);
