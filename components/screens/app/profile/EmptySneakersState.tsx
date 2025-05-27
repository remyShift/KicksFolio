import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';

interface EmptySneakersStateProps {
    onAddPress: () => void;
}

export default function EmptySneakersState({ onAddPress }: EmptySneakersStateProps) {
    return (
        <View className="flex-1 gap-8 items-center">
            <Title content='Add Sneakers' isTextCenter={true} />
            <MainButton 
                content='Add' 
                backgroundColor='bg-primary' 
                onPressAction={onAddPress} 
            />
        </View>
    );
} 