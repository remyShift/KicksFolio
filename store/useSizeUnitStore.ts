import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageStore } from './useLanguageStore';

export type SizeUnit = 'US' | 'EU';

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
		AsyncStorage.setItem(SIZE_UNIT_STORAGE_KEY, unit)
			.then(() => {
				set({ currentUnit: unit });
				console.log(`✅ Size unit changed to: ${unit}`);
			})
			.catch((error) => {
				console.error('❌ Error changing size unit:', error);
			});
	},

	initializeUnit: async () => {
		const { currentLanguage } = useLanguageStore.getState();

		AsyncStorage.getItem(SIZE_UNIT_STORAGE_KEY)
			.then((savedUnit) => {
				let unitToUse: SizeUnit;

				if (savedUnit && (savedUnit === 'US' || savedUnit === 'EU')) {
					unitToUse = savedUnit;
				} else {
					unitToUse = currentLanguage === 'fr' ? 'EU' : 'US';
				}

				return unitToUse;
			})
			.then((unitToUse) => {
				set({
					currentUnit: unitToUse,
					isInitialized: true,
				});
				console.log(`✅ Size unit initialized to: ${unitToUse}`);
			})
			.catch((error) => {
				console.error('❌ Error initializing size unit:', error);
				set({
					currentUnit: 'EU',
					isInitialized: true,
				});
			});
	},

	getCurrentUnit: () => get().currentUnit,
}));
