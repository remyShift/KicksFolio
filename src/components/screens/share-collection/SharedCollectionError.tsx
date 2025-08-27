import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';

interface SharedCollectionErrorProps {
	error?: string;
	isAuthenticated?: boolean;
}

export default function SharedCollectionError({
	error,
	isAuthenticated = false,
}: SharedCollectionErrorProps) {
	const { t } = useTranslation();

	const handleBackPress = () => {
		if (isAuthenticated) {
			router.push('/search');
		} else {
			router.push('/(auth)/login');
		}
	};

	return (
		<View className="flex-1 gap-4 bg-background pt-32 items-center justify-center">
			<Text className="font-open-sans text-gray-500 text-center">
				{error || t('share.shared.error.notFound')}
			</Text>
			<MainButton
				content="Back"
				backgroundColor="bg-primary"
				onPressAction={handleBackPress}
			/>
		</View>
	);
}
