import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import PrivacyPolicyLink from '../links/PrivacyPolicyLink';
import TermOfUseLink from '../links/TermOfUseLink';

export default function LegalData() {
	const { t } = useTranslation();

	return (
		<View className="pb-16 bg-background">
			<View className="flex-row gap-1 justify-center items-center text-center flex-wrap w-3/4 mx-auto">
				<Text className="font-open-sans-bold text-xs text-gray-900">
					{t('auth.data-privacy.title')}
				</Text>
				<TermOfUseLink />
				<Text className="text-gray-900 font-open-sans-bold text-xs">
					{t('auth.data-privacy.and')}
				</Text>
				<PrivacyPolicyLink />
			</View>
		</View>
	);
}
