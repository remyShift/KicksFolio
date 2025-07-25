import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import { useTranslation } from 'react-i18next';

interface EmptySneakersStateProps {
    onAddPress: () => void;
    showAddButton?: boolean;
}

export default function EmptySneakersState({ onAddPress, showAddButton = true }: EmptySneakersStateProps) {
    const { t } = useTranslation();
    return (
        <View className="flex-1 gap-8 items-center justify-center h-64">
            <Title content={t('collection.pages.empty.title')} isTextCenter={true} />
            {showAddButton && (
                <MainButton 
                    content={t('collection.actions.add')} 
                    backgroundColor='bg-primary' 
                    onPressAction={onAddPress} 
                />
            )}
        </View>
    );
} 