import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],

	test: {
		environment: 'jsdom',

		setupFiles: ['./src/__tests__/vitest-setup.ts'],

		include: [
			'src/__tests__/interfaces/**/*.(test|spec).(js|jsx|ts|tsx)',
			'src/__tests__/hooks/**/*.(test|spec).(js|jsx|ts|tsx)',
			'src/__tests__/domain/**/*.(test|spec).(js|jsx|ts|tsx)',
			'src/__tests__/store/**/*.(test|spec).(js|jsx|ts|tsx)',
		],

		exclude: [
			'**/node_modules/**',
			'src/__tests__/screens/**',
			'src/__tests__/setup.ts',
			'src/__tests__/vitest-setup.ts',
		],

		globals: true,

		coverage: {
			reporter: ['text', 'html'],
			include: [
				'interfaces/**/*.ts',
				'hooks/**/*.ts',
				'domain/**/*.ts',
				'store/**/*.ts',
			],
			exclude: ['__tests__/**', 'node_modules/**'],
		},

		testTimeout: 5000,

		server: {
			deps: {
				external: ['react-native'],
			},
		},
	},

	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},

	define: {
		global: 'globalThis',
		__DEV__: true,
	},
});
