import AsyncStorage from '@react-native-async-storage/async-storage';

import { create } from 'zustand';

import { SizeUnit } from '@/types/sneaker';

import { useLanguageStore } from './useLanguageStore';

interface SizeUnitStore {
	currentUnit: SizeUnit;
	isInitialized: boolean;

	setUnit: (unit: SizeUnit) => Promise<void>;
	initializeUnit: () => Promise<void>;
	getCurrentUnit: () => SizeUnit;
}

const SIZE_UNIT_STORAGE_KEY = 'app_size_unit';

export const useSizeUnitStore = create<SizeUnitStore>((set, get) => ({
	currentUnit: 'EU',
	isInitialized: false,

	setUnit: async (unit: SizeUnit) => {
		return AsyncStorage.setItem(SIZE_UNIT_STORAGE_KEY, unit)
			.then(() => {
				set({ currentUnit: unit });
			})
			.catch((error) => {
				console.error('❌ Error saving size unit:', error);
			});
	},

	initializeUnit: async () => {
		const { currentLanguage } = useLanguageStore.getState();

		return AsyncStorage.getItem(SIZE_UNIT_STORAGE_KEY)
			.then((savedUnit) => {
				if (savedUnit && (savedUnit === 'US' || savedUnit === 'EU')) {
					return savedUnit as SizeUnit;
				}

				const defaultUnit = currentLanguage === 'fr' ? 'EU' : 'US';
				return AsyncStorage.setItem(
					SIZE_UNIT_STORAGE_KEY,
					defaultUnit
				).then(() => {
					return defaultUnit;
				});
			})
			.then((unitToUse) => {
				set({
					currentUnit: unitToUse,
					isInitialized: true,
				});
				console.log('✅ Size unit initialized to:', unitToUse);
			})
			.catch((error) => {
				console.error('❌ Error in initialization:', error);
				const defaultUnit = currentLanguage === 'fr' ? 'EU' : 'US';
				set({
					currentUnit: defaultUnit,
					isInitialized: true,
				});
			});
	},

	getCurrentUnit: () => get().currentUnit,
}));
