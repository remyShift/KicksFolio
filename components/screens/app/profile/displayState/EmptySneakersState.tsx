import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import { useTranslation } from 'react-i18next';

interface EmptySneakersStateProps {
    onAddPress: () => void;
}

export default function EmptySneakersState({ onAddPress }: EmptySneakersStateProps) {
    const { t } = useTranslation();
    return (
        <View className="flex-1 gap-8 items-center justify-center h-64">
            <Title content={t('common.titles.noSneakers')} isTextCenter={true} />
            <MainButton 
                content={t('common.buttons.add')} 
                backgroundColor='bg-primary' 
                onPressAction={onAddPress} 
            />
        </View>
    );
} 