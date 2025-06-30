import { View, Text, Pressable } from 'react-native';
import { useModalStore } from '@/store/useModalStore';
import { useTranslation } from 'react-i18next';

interface InitialStepProps {
    userSneakersLength?: number;
}

export const InitialStep = ({ userSneakersLength = 0 }: InitialStepProps) => {
    const { setModalStep } = useModalStore();
    const { t } = useTranslation();
    const indexTitle = userSneakersLength === 0 ? t('common.sneaker.modal.titles.add') : t('common.sneaker.modal.titles.add');

    return (
        <View className="flex-1 justify-center items-center gap-8">
            <Text className="font-actonia text-primary text-4xl text-center">{indexTitle}</Text>
            <Text className="font-spacemono-bold text-xl text-center">{t('common.sneaker.modal.descriptions.howProceed')}</Text>
            <View className="flex justify-center items-center gap-12">
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('sku')}
                        testID="search-by-sku-button"
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            {t('common.sneaker.modal.buttons.add')}
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        {t('common.sneaker.modal.descriptions.searching')}
                    </Text>
                </View>
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('addForm')}
                        testID="add-manually-button"
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            {t('common.sneaker.modal.buttons.edit')}
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        {t('common.sneaker.modal.descriptions.manually')}
                    </Text>
                </View>
            </View>
        </View>
    );
};
