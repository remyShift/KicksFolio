import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Link } from 'expo-router';

export default function TermOfUse() {
	const { t } = useTranslation();
	return (
		<Link href="https://remyshift.github.io/KicksFolio/terms-of-use">
			<Text className="text-primary font-open-sans-bold text-xs">
				{t('auth.data-privacy.termsOfUse')}
			</Text>
		</Link>
	);
}
