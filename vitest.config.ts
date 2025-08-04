import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],

	test: {
		environment: 'jsdom',

		setupFiles: ['./__tests__/vitest-setup.ts'],

		include: [
			'__tests__/interfaces/**/*.(test|spec).(js|jsx|ts|tsx)',
			'__tests__/hooks/**/*.(test|spec).(js|jsx|ts|tsx)',
			'__tests__/domain/**/*.(test|spec).(js|jsx|ts|tsx)',
			'__tests__/store/**/*.(test|spec).(js|jsx|ts|tsx)',
		],

		exclude: [
			'**/node_modules/**',
			'__tests__/screens/**',
			'__tests__/setup.ts',
			'__tests__/vitest-setup.ts',
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
			'@': resolve(__dirname, './'),
		},
	},

	define: {
		global: 'globalThis',
		__DEV__: true,
	},
});
