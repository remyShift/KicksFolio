import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import useToast from '@/hooks/ui/useToast';
import { useBugReportStore } from '@/store/useBugReportStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';
import CurrencyToggle from './CurrencyToggle';
import LanguageToggle from './LanguageToggle';
import SizeUnitToggle from './SizeUnitToggle';

export default function AppSettings() {
	const { t } = useTranslation();
	const { currentLanguage, setLanguage } = useLanguageStore();
	const { currentUnit, setUnit } = useSizeUnitStore();
	const { currentCurrency, setCurrency } = useCurrencyStore();
	const { showSuccessToast } = useToast();
	const { setIsVisible } = useBugReportStore();

	const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
		setLanguage(newLanguage);
		showSuccessToast(
			t('settings.language.title'),
			t('settings.language.description')
		);
	};

	const handleUnitChange = (newUnit: 'US' | 'EU') => {
		setUnit(newUnit);
		showSuccessToast(
			t('settings.sizeUnit.title'),
			t('settings.sizeUnit.description', {
				unit: newUnit,
			})
		);
	};

	const handleCurrencyChange = (newCurrency: 'USD' | 'EUR') => {
		setCurrency(newCurrency);
		showSuccessToast(
			t('settings.currency.title'),
			t('settings.currency.description')
		);
	};

	const handleBugReportPress = () => {
		setIsVisible(true);
	};

	return (
		<SettingsCategory title={t('settings.titles.app')}>
			<SettingsMenuItem
				icon="bug-outline"
				label={t('settings.titles.reportBug')}
				onPress={handleBugReportPress}
			/>

			<Spacer />

			<SettingsMenuItem
				icon="language-outline"
				label={t('settings.titles.language')}
				rightElement={
					<LanguageToggle
						currentLanguage={currentLanguage}
						onToggle={handleLanguageChange}
					/>
				}
				testID="language"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="resize-outline"
				label={t('settings.titles.sizeUnit')}
				rightElement={
					<SizeUnitToggle
						currentUnit={currentUnit}
						onToggle={handleUnitChange}
					/>
				}
				testID="size-unit"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="cash-outline"
				label={t('settings.titles.currency')}
				rightElement={
					<CurrencyToggle
						currentCurrency={currentCurrency}
						onToggle={handleCurrencyChange}
					/>
				}
				testID="currency"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="document-text-outline"
				label={t('auth.data-privacy.privacyPolicy')}
				onPress={() =>
					Linking.openURL('https://remyshift.github.io/KicksFolio/')
				}
			/>
		</SettingsCategory>
	);
}
