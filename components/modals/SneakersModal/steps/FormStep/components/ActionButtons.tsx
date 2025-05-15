import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import DeleteButton from '@/components/ui/buttons/DeleteButton';

interface ActionButtonsProps {
    isNewSneaker: boolean;
    onBack: () => void;
    onSubmit: () => void;
    onDelete?: () => void;
}

export const ActionButtons = ({ isNewSneaker, onBack, onDelete, onSubmit }: ActionButtonsProps) => {
    return (
        <View className="flex-1 justify-end pb-4">
            <View className="flex-row justify-between w-full">
                <View className="flex-row gap-3">
                    <BackButton onPressAction={onBack} />
                    {!isNewSneaker && onDelete && <DeleteButton onPressAction={onDelete} />}
                </View>
                <NextButton content="Add" onPressAction={onSubmit} />
            </View>
        </View>
    );
}; 