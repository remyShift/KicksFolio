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
		console.log('🔄 Attempting to save size unit:', unit);
		return AsyncStorage.setItem(SIZE_UNIT_STORAGE_KEY, unit)
			.then(() => {
				set({ currentUnit: unit });
				console.log(`✅ Size unit saved and state updated to: ${unit}`);
			})
			.catch((error) => {
				console.error('❌ Error saving size unit:', error);
			});
	},

	initializeUnit: async () => {
		const { currentLanguage } = useLanguageStore.getState();
		console.log(
			'🔄 Initializing size unit, current language:',
			currentLanguage
		);

		return AsyncStorage.getItem(SIZE_UNIT_STORAGE_KEY)
			.then((savedUnit) => {
				console.log('📦 Retrieved from storage:', savedUnit);

				if (savedUnit && (savedUnit === 'US' || savedUnit === 'EU')) {
					console.log('✅ Using saved unit:', savedUnit);
					return savedUnit as SizeUnit;
				}

				const defaultUnit = currentLanguage === 'fr' ? 'EU' : 'US';
				console.log('📝 Setting default unit:', defaultUnit);
				return AsyncStorage.setItem(
					SIZE_UNIT_STORAGE_KEY,
					defaultUnit
				).then(() => {
					console.log('✅ Default unit saved:', defaultUnit);
					return defaultUnit;
				});
			})
			.then((unitToUse) => {
				console.log('🔄 Updating store state to:', unitToUse);
				set({
					currentUnit: unitToUse,
					isInitialized: true,
				});
				console.log(`✅ Store state updated to: ${unitToUse}`);
			})
			.catch((error) => {
				console.error('❌ Error in initialization:', error);
				const defaultUnit = currentLanguage === 'fr' ? 'EU' : 'US';
				console.log('⚠️ Using fallback unit:', defaultUnit);
				set({
					currentUnit: defaultUnit,
					isInitialized: true,
				});
			});
	},

	getCurrentUnit: () => get().currentUnit,
}));
