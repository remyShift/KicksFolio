import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import MainButton from '@/src/components/ui/buttons/MainButton';
import { useModalStore } from '@/src/store/useModalStore';

interface InitialStepProps {
	userSneakersLength?: number;
}

export const InitialStep = ({ userSneakersLength = 0 }: InitialStepProps) => {
	const { setModalStep } = useModalStore();
	const { t } = useTranslation();
	const indexTitle =
		userSneakersLength === 0
			? t('collection.modal.titles.add')
			: t('collection.modal.titles.add');

	return (
		<View className="flex-1 justify-center items-center gap-8">
			<Text className="font-actonia text-primary text-4xl text-center">
				{indexTitle}
			</Text>
			<Text className="font-open-sans-bold text-xl text-center">
				{t('collection.modal.descriptions.howProceed')}
			</Text>
			<View className="flex justify-center items-center gap-8">
				<View className="flex-col justify-center items-center gap-2 px-6">
					<MainButton
						backgroundColor="bg-primary"
						onPressAction={() => setModalStep('sku')}
						content={t('collection.modal.buttons.bySearch')}
					/>
					<Text className="font-open-sans-bold text-sm text-center">
						{t('collection.modal.descriptions.bySearch')}
					</Text>
				</View>
				<View className="flex-col justify-center items-center gap-2 px-6">
					<MainButton
						backgroundColor="bg-primary"
						onPressAction={() => setModalStep('barcode')}
						content={t('collection.modal.buttons.byBarcode')}
					/>
					<Text className="font-open-sans-bold text-sm text-center">
						{t('collection.modal.descriptions.byBarcode')}
					</Text>
				</View>
				<View className="flex-col justify-center items-center gap-2 px-6">
					<MainButton
						backgroundColor="bg-primary"
						onPressAction={() => setModalStep('addFormImages')}
						content={t('collection.modal.buttons.manually')}
					/>
					<Text className="font-open-sans-bold text-sm text-center">
						{t('collection.modal.descriptions.manually')}
					</Text>
				</View>
			</View>
		</View>
	);
};
