const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
	...config.resolver.alias,
	'@': path.resolve(__dirname, './src'),
	'react-native-reanimated/plugin': 'react-native-reanimated/plugin',
};

config.transformer = {
	...config.transformer,
	unstable_allowRequireContext: true,
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

const nativeWindConfig = withNativeWind(config, {
	input: './src/styles/global.css',
});

module.exports = wrapWithReanimatedMetroConfig(nativeWindConfig);
