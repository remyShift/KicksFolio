import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { useSession } from '@/contexts/authContext';
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
	const { user } = useSession();
	const { currentLanguage, setLanguage } = useLanguageStore();
	const { currentUnit, setUnit } = useSizeUnitStore();
	const { currentCurrency, setCurrency } = useCurrencyStore();
	const { showSuccessToast, showErrorToast } = useToast();
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

	const handleContactSupport = async () => {
		const email = 'contact@kicksfolio.com';
		const username = user?.username || 'Unknown';
		const subject = `${username} - contact`;
		const body = 'Bonjour,\n\n';

		const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		try {
			const canOpen = await Linking.canOpenURL(mailtoUrl);
			if (canOpen) {
				await Linking.openURL(mailtoUrl);
			} else {
				Alert.alert(
					t('alert.titles.error'),
					"Impossible d'ouvrir l'application email"
				);
			}
		} catch (error) {
			showErrorToast(t('alert.titles.error'), 'Une erreur est survenue');
		}
	};

	return (
		<SettingsCategory title={t('settings.titles.app')}>
			<SettingsMenuItem
				icon="mail-outline"
				label={t('settings.titles.contactSupport')}
				onPress={handleContactSupport}
				testID="contact-support"
			/>

			<Spacer />

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
				testID="privacy-policy"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="document-text-outline"
				label={t('auth.data-privacy.termsOfUse')}
				onPress={() =>
					Linking.openURL(
						'https://remyshift.github.io/KicksFolio/terms-of-use'
					)
				}
				testID="terms-of-use"
			/>
		</SettingsCategory>
	);
}
