const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
	...config.resolver.alias,
	'@': path.resolve(__dirname, './'),
	'react-native-reanimated/plugin': 'react-native-reanimated/plugin',
};

config.transformer = {
	...config.transformer,
	unstable_allowRequireContext: true,
};

module.exports = wrapWithReanimatedMetroConfig(
	withNativeWind(config, { input: './global.css' })
);
