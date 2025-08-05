import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import Title from '@/src/components/ui/text/Title';

export default function EmptyWishlistState() {
	const { t } = useTranslation();
	return (
		<View className="flex-1 gap-8 items-center justify-center h-96  w-full">
			<Title
				content={t('social.wishlist.empty.title')}
				isTextCenter={true}
			/>
			<Text className="font-open-sans text-base text-center px-8">
				{t('social.wishlist.empty.description')}
			</Text>
		</View>
	);
}
