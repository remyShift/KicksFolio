module.exports = function (api) {
	api.cache(true);

	return {
		presets: ['babel-preset-expo', 'nativewind/babel'],
		plugins: [
			[
				'module-resolver',
				{
					root: ['./'],
					alias: {
						'@': './',
					},
				},
			],
			// Doit être le dernier plugin pour éviter les conflits
			[
				'react-native-reanimated/plugin',
				{
					globals: ['__scanCodes'],
				},
			],
		],
	};
};
