const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const {
    getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

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