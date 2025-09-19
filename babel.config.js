export default function (api) {
	api.cache(true);

	return {
		presets: ['babel-preset-expo', 'nativewind/babel'],
		plugins: [
			[
				'module-resolver',
				{
					root: ['./'],
					alias: {
						'@': './src',
					},
				},
			],
			['react-native-worklets/plugin'],
		],
	};
}
